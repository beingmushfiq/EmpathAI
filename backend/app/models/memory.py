import uuid
from datetime import datetime
from sqlalchemy import String, Text, ForeignKey, DateTime, Float, func
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base

class MemoryFact(Base):
    __tablename__ = "memory_facts"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    
    # E.g., 'preference', 'event', 'trait', 'relationship_milestone'
    fact_type: Mapped[str] = mapped_column(String(64), index=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    
    confidence_score: Mapped[float] = mapped_column(Float, default=1.0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
