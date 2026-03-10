from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    email: EmailStr
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None


class UserCreate(UserBase):
    clerk_id: str


class UserResponse(UserBase):
    id: str
    clerk_id: str
    is_active: bool
    is_onboarded: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ─── Persona Schemas ────────────────────────────────────────────────────────
class PersonaCreate(BaseModel):
    name: str = "Luna"
    avatar_emoji: str = "🦋"
    personality: str = "empathetic"
    tone: str = "warm"
    bio: Optional[str] = None
    traits: Optional[dict] = None


class PersonaResponse(PersonaCreate):
    id: str
    user_id: str
    system_prompt: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ─── Chat Schemas ────────────────────────────────────────────────────────────
class ChatMessageRequest(BaseModel):
    session_id: Optional[str] = None
    content: str


class ChatMessageResponse(BaseModel):
    id: str
    role: str
    content: str
    action_items: Optional[dict] = None
    session_id: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ─── Auth Schemas ─────────────────────────────────────────────────────────────
class AuthSyncRequest(BaseModel):
    clerk_id: str
    email: str
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None


class HealthResponse(BaseModel):
    status: str
    version: str
    environment: str
