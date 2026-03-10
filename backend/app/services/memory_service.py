import json
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.models.memory import MemoryFact
from app.models.user import User
from app.models.conversation import Message
from app.core.config import settings
from openai import AsyncOpenAI

class MemoryService:
    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY) if settings.OPENAI_API_KEY else None

    async def extract_and_save_facts(self, db: AsyncSession, user_id: str, messages: List[Message]):
        """
        Analyze the most recent message history to extract and persist key user facts.
        
        This method uses GPT-4o-mini to identify long-term information like preferences,
        life events, and traits. Extracted facts are stored in the MemoryFact table.
        
        Args:
            db (AsyncSession): The database session.
            user_id (str): The unique identifier of the user.
            messages (List[Message]): A list of recent messages to analyze.
        """
        if not self.client or not messages:
            return

        # Prepare conversation snippet for extraction
        conversation_text = "\n".join([f"{m.role}: {m.content}" for m in messages[-5:]])
        
        prompt = f"""
        Extract key long-term facts about the user from this conversation. 
        Focus on: preferences, names, life events, traits, or relationship progress.
        Return ONLY a JSON list of objects: [{{"type": "preference|event|trait", "fact": "..."}}]
        If no significant facts are found, return [].
        
        Conversation:
        {conversation_text}
        """

        try:
            response = await self.client.chat.completions.create(
                model="gpt-4o-mini", # Faster model for extraction
                messages=[{"role": "system", "content": "You are a specialized memory extraction engine."},
                          {"role": "user", "content": prompt}],
                response_format={"type": "json_object"}
            )
            
            data = json.loads(response.choices[0].message.content or "{}")
            facts = data.get("facts", []) # Assuming the LLM returns {"facts": [...]}

            for f in facts:
                new_fact = MemoryFact(
                    user_id=user_id,
                    fact_type=f.get("type", "trait"),
                    content=f.get("fact", ""),
                    confidence_score=0.9
                )
                db.add(new_fact)
            
            # Increment bond score slightly for the interaction
            await self.increment_bond(db, user_id, 2)
            
            await db.commit()
        except Exception as e:
            print(f"Memory extraction failed: {e}")

    async def increment_bond(self, db: AsyncSession, user_id: str, amount: int = 1) -> bool:
        """
        Increases the relationship bond score and evaluates level-up milestones.
        
        Args:
            db (AsyncSession): The database session.
            user_id (str): The unique identifier of the user.
            amount (int): The XP/Bond point increment. Defaults to 1.
            
        Returns:
            bool: True if the increment caused a level-up, False otherwise.
        """
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            return False

        old_level = (user.bond_score or 0) // 100 + 1
        new_score = (user.bond_score or 0) + amount
        new_level = new_score // 100 + 1

        await db.execute(
            update(User)
            .where(User.id == user_id)
            .values(bond_score=new_score)
        )
        
        return new_level > old_level

    async def get_user_facts(self, db: AsyncSession, user_id: str) -> List[MemoryFact]:
        """Retrieve all stored facts for a user."""
        result = await db.execute(
            select(MemoryFact).where(MemoryFact.user_id == user_id).order_by(MemoryFact.created_at.desc())
        )
        return list(result.scalars().all())

memory_service = MemoryService()
