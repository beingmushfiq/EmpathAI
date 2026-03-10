import json
from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.user import User
from app.models.persona import Persona
from app.models.conversation import ConversationSession, Message, MessageRole
from app.schemas.schemas import ChatMessageRequest, ChatMessageResponse
from app.core.config import settings
from app.services.vector_service import vector_service
import asyncio
import uuid

router = APIRouter()


# ─── Connection Manager for WebSockets ──────────────────────────────────────
class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[str, WebSocket] = {}

    async def connect(self, session_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[session_id] = websocket

    def disconnect(self, session_id: str):
        self.active_connections.pop(session_id, None)

    async def send_json(self, session_id: str, data: dict):
        if ws := self.active_connections.get(session_id):
            await ws.send_json(data)


manager = ConnectionManager()


# ─── REST: Send a chat message ────────────────────────────────────────────────
@router.post("/message", summary="Send a chat message (REST fallback)")
async def send_message(
    user_id: str,
    request: ChatMessageRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    REST endpoint for sending a chat message.
    In production, use the WebSocket endpoint for real-time streaming.
    """
    # Get or create session
    if request.session_id:
        result = await db.execute(
            select(ConversationSession).where(ConversationSession.id == request.session_id)
        )
        session = result.scalar_one_or_none()
    else:
        session = ConversationSession(user_id=user_id)
        db.add(session)
        await db.flush()

    if not session:
        raise HTTPException(status_code=404, detail="Conversation session not found")

    # Save user message
    user_msg = Message(
        session_id=session.id,
        user_id=user_id,
        role=MessageRole.user,
        content=request.content,
    )
    db.add(user_msg)
    await db.flush()

    # Get persona for system prompt
    persona_result = await db.execute(
        select(Persona).where(Persona.user_id == user_id, Persona.is_active == True)
    )
    persona = persona_result.scalar_one_or_none()
    base_prompt = persona.system_prompt if persona else "You are a helpful, empathetic AI assistant."

    # Retrieve Pinecone Context
    rag_context = await vector_service.query_context(user_id, request.content)
    system_prompt = base_prompt + rag_context

    # ── Call OpenAI (when API key is configured) ──
    ai_content = await _call_llm(system_prompt, request.content)

    # Save to Pinecone Memory Asynchronously
    asyncio.create_task(
        vector_service.upsert_conversation(user_id, session.id, request.content, ai_content)
    )

    # Save AI response
    ai_msg = Message(
        session_id=session.id,
        user_id=user_id,
        role=MessageRole.assistant,
        content=ai_content,
    )
    db.add(ai_msg)
    await db.flush()

    return {
        "session_id": session.id,
        "user_message_id": user_msg.id,
        "ai_message": {
            "id": ai_msg.id,
            "role": "assistant",
            "content": ai_content,
            "created_at": ai_msg.created_at.isoformat(),
        },
    }


# ─── WebSocket: Real-time streaming chat ─────────────────────────────────────
@router.websocket("/ws/{session_id}")
async def websocket_chat(
    session_id: str,
    websocket: WebSocket,
    db: AsyncSession = Depends(get_db),
):
    """
    WebSocket endpoint for real-time bidirectional chat.
    Accepts: {"user_id": "...", "content": "..."}
    Emits:   {"type": "chunk"|"done"|"error", "content": "..."}
    """
    await manager.connect(session_id, websocket)
    try:
        while True:
            raw = await websocket.receive_text()
            data = json.loads(raw)
            user_id = data.get("user_id")
            content = data.get("content", "")

            await websocket.send_json({"type": "typing", "content": ""})

            # Get persona
            persona_result = await db.execute(
                select(Persona).where(Persona.user_id == user_id, Persona.is_active == True)
            )
            persona = persona_result.scalar_one_or_none()
            base_prompt = persona.system_prompt if persona else "You are an empathetic AI assistant."

            # Save user message to Postgres
            user_msg = Message(session_id=session_id, user_id=user_id, role=MessageRole.user, content=content)
            db.add(user_msg)
            await db.commit()

            # Retrieve Pinecone Context
            rag_context = await vector_service.query_context(user_id, content)
            system_prompt = base_prompt + rag_context

            # Stream response and accumulate
            full_ai_response = ""
            async for chunk in _stream_llm(system_prompt, content):
                full_ai_response += chunk
                await websocket.send_json({"type": "chunk", "content": chunk})

            await websocket.send_json({"type": "done", "content": ""})

            # Save AI response to DB
            ai_msg = Message(session_id=session_id, user_id=user_id, role=MessageRole.assistant, content=full_ai_response)
            db.add(ai_msg)
            await db.commit()

            # Upsert into Pinecone memory asynchronously
            asyncio.create_task(vector_service.upsert_conversation(user_id, session_id, content, full_ai_response))
            
            # Extract long-term facts asynchronously
            from app.services.memory_service import memory_service
            asyncio.create_task(memory_service.extract_and_save_facts(db, user_id, [user_msg, ai_msg]))

    except WebSocketDisconnect:
        manager.disconnect(session_id)
    except Exception as e:
        await websocket.send_json({"type": "error", "content": str(e)})
        manager.disconnect(session_id)


# ─── LLM Integration ─────────────────────────────────────────────────────────
async def _call_llm(system_prompt: str, user_message: str) -> str:
    """Call OpenAI API (or return placeholder if no key configured)."""
    if not settings.OPENAI_API_KEY:
        return (
            "I'm here and listening. 💙 (Configure your OPENAI_API_KEY in .env to enable real AI responses.) "
            "I can hear you want to share something important — please tell me more."
        )

    try:
        from openai import AsyncOpenAI
        client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        response = await client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
            max_tokens=800,
            temperature=0.85,
        )
        return response.choices[0].message.content or ""
    except Exception as e:
        return f"I'm experiencing a brief connection issue. Please try again in a moment. ({e})"


async def _stream_llm(system_prompt: str, user_message: str):
    """Stream tokens from OpenAI."""
    if not settings.OPENAI_API_KEY:
        placeholder = "I'm here and listening 💙 — add your OPENAI_API_KEY to enable live responses."
        for word in placeholder.split():
            yield word + " "
        return

    from openai import AsyncOpenAI
    client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    async with client.chat.completions.stream(
        model=settings.OPENAI_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message},
        ],
        max_tokens=800,
        temperature=0.85,
    ) as stream:
        async for chunk in stream:
            if chunk.choices and chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content
