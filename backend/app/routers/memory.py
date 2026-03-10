from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.user import User
from app.services.memory_service import memory_service
from typing import List, Dict, Any

router = APIRouter(prefix="/api/memory", tags=["Memory & Relationship"])

@router.get("/relationship/{user_id}")
async def get_relationship_status(user_id: str, db: AsyncSession = Depends(get_db)):
    """Retrieve the current relationship bond score and level."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    bond_score = getattr(user, "bond_score", 0)
    level = bond_score // 100 + 1 # Simple level logic
    
    return {
        "bond_score": bond_score,
        "level": level,
        "next_level_at": (level) * 100,
        "status": "Acquaintance" if bond_score < 100 else "Friend" if bond_score < 500 else "Close Companion" 
    }

@router.get("/facts/{user_id}")
async def get_user_facts(user_id: str, db: AsyncSession = Depends(get_db)):
    """Retrieve all facts the AI has learned about the user."""
    facts = await memory_service.get_user_facts(db, user_id)
    return [
        {
            "id": f.id,
            "type": f.fact_type,
            "content": f.content,
            "timestamp": f.created_at.isoformat()
        } for f in facts
    ]
