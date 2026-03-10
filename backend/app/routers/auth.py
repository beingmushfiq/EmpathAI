from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.user import User
from app.models.persona import Persona
from app.schemas.schemas import AuthSyncRequest, PersonaCreate, PersonaResponse
from app.services.persona_service import generate_system_prompt

router = APIRouter()


@router.post("/sync", summary="Sync Clerk user to database")
async def sync_user(payload: AuthSyncRequest, db: AsyncSession = Depends(get_db)):
    """Called when a user signs in via Clerk — upserts their profile in Postgres."""
    result = await db.execute(select(User).where(User.clerk_id == payload.clerk_id))
    user = result.scalar_one_or_none()

    if user:
        user.email = payload.email
        if payload.display_name:
            user.display_name = payload.display_name
        if payload.avatar_url:
            user.avatar_url = payload.avatar_url
    else:
        user = User(
            clerk_id=payload.clerk_id,
            email=payload.email,
            display_name=payload.display_name,
            avatar_url=payload.avatar_url,
        )
        db.add(user)

    await db.flush()
    return {"id": user.id, "email": user.email, "is_onboarded": user.is_onboarded}
