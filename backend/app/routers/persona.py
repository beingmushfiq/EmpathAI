from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.user import User
from app.models.persona import Persona
from app.schemas.schemas import PersonaCreate, PersonaResponse
from app.services.persona_service import generate_system_prompt

router = APIRouter()


@router.post("/generate", response_model=PersonaResponse, summary="Generate AI persona from user preferences")
async def generate_persona(
    user_id: str,  # In production: extracted from JWT/Clerk token
    persona_data: PersonaCreate,
    db: AsyncSession = Depends(get_db),
):
    """
    Core Persona Engine: Takes user-submitted traits and generates a
    customized LLM system prompt. Saves the persona to the database.
    """
    # Verify user exists
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # Generate the system prompt via the persona service
    system_prompt = generate_system_prompt(persona_data, user_bio=persona_data.bio or "")

    # Upsert persona (one persona per user)
    result = await db.execute(select(Persona).where(Persona.user_id == user_id))
    persona = result.scalar_one_or_none()

    if persona:
        persona.name = persona_data.name
        persona.avatar_emoji = persona_data.avatar_emoji
        persona.personality = persona_data.personality
        persona.tone = persona_data.tone
        persona.bio = persona_data.bio
        persona.traits = persona_data.traits
        persona.system_prompt = system_prompt
    else:
        persona = Persona(
            user_id=user_id,
            name=persona_data.name,
            avatar_emoji=persona_data.avatar_emoji,
            personality=persona_data.personality,
            tone=persona_data.tone,
            bio=persona_data.bio,
            traits=persona_data.traits,
            system_prompt=system_prompt,
        )
        db.add(persona)

    # Mark user as onboarded
    user.is_onboarded = True
    await db.flush()

    return PersonaResponse(
        id=persona.id,
        user_id=persona.user_id,
        name=persona.name,
        avatar_emoji=persona.avatar_emoji,
        personality=persona.personality,
        tone=persona.tone,
        bio=persona.bio,
        traits=persona.traits,
        system_prompt=persona.system_prompt,
        is_active=persona.is_active,
        created_at=persona.created_at,
    )


@router.get("/{user_id}", response_model=PersonaResponse, summary="Get user's active persona")
async def get_persona(user_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Persona).where(Persona.user_id == user_id, Persona.is_active == True))
    persona = result.scalar_one_or_none()
    if not persona:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No active persona found")
    return persona
