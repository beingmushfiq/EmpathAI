import uuid
from datetime import datetime
from sqlalchemy import String, Text, ForeignKey, DateTime, Boolean, JSON, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class Persona(Base):
    __tablename__ = "personas"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(64), nullable=False, default="Luna")
    avatar_emoji: Mapped[str] = mapped_column(String(8), default="🦋")
    personality: Mapped[str] = mapped_column(String(32), default="empathetic")
    tone: Mapped[str] = mapped_column(String(32), default="warm")
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)
    traits: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    # The generated system prompt — the core of the AI persona
    system_prompt: Mapped[str] = mapped_column(Text, nullable=False, default="")

    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
