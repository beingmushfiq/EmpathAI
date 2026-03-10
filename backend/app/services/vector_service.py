import json
import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime
from openai import AsyncOpenAI
from app.core.config import settings
from app.core.pinecone import pinecone_service

class VectorService:
    def __init__(self):
        self.openai_client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY) if settings.OPENAI_API_KEY else None
        self.index = pinecone_service.get_index()

    async def get_embedding(self, text: str) -> List[float]:
        """Generate an embedding for the text using OpenAI."""
        if not self.openai_client:
            return []
            
        response = await self.openai_client.embeddings.create(
            input=text,
            model="text-embedding-3-small"
        )
        return response.data[0].embedding

    async def upsert_conversation(
        self, user_id: str, session_id: str, user_msg: str, ai_reply: str
    ):
        """Combine user message and AI reply into a memory chunk and store it in Pinecone."""
        if not self.index or not self.openai_client:
            return None

        # Create a compressed memory block representing this interaction
        memory_chunk = f"User: {user_msg}\nAI: {ai_reply}"
        
        embedding = await self.get_embedding(memory_chunk)
        
        record_id = f"mem_{session_id}_{uuid.uuid4().hex[:8]}"
        
        metadata = {
            "user_id": user_id,
            "session_id": session_id,
            "text": memory_chunk,
            "timestamp": datetime.utcnow().timestamp()
        }
        
        # Upsert to Pinecone
        # Running sync method in async wrapper is fine here for demo, but in production consider a concurrent executor
        self.index.upsert(
            vectors=[{
                "id": record_id,
                "values": embedding,
                "metadata": metadata
            }],
            namespace=user_id # Using user_id as namespace for strict memory isolation
        )
        return record_id

    async def query_context(self, user_id: str, current_message: str, top_k: int = 5) -> str:
        """Search Pinecone for relevant past memories and return them as a formatted string context."""
        if not self.index or not self.openai_client:
            return ""
            
        embedding = await self.get_embedding(current_message)
        
        search_results = self.index.query(
            namespace=user_id,
            vector=embedding,
            top_k=top_k,
            include_metadata=True
        )
        
        if not search_results.get("matches"):
            return ""
            
        # Format the retrieved memories into a block to inject into the LLM system prompt
        context_snippets = []
        for match in search_results["matches"]:
            # Optionally filter by score
            if match["score"] > 0.3: 
                snippet = match["metadata"].get("text", "")
                context_snippets.append(snippet)
                
        if not context_snippets:
            return ""
            
        memory_block = "\n---\n".join(context_snippets)
        return f"\n\n[RETRIEVED EXPERIENCES AND PAST CONVERSATIONS WITH THIS USER]:\n{memory_block}\n[END OF RETRIEVED MEMORIES]"

vector_service = VectorService()
