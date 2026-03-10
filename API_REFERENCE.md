# 📡 EmpathAI API Reference

All backend endpoints are prefixed with `/api`. Documentation is automatically generated at `/docs` (Swagger) and `/redoc`.

## 🧠 Memory & Relationships

### `GET /api/memory/relationship/{user_id}`
Retrieves the current bond level and score for a user.
- **Parameters**: `user_id` (string)
- **Response**:
  ```json
  {
    "level": 3,
    "score": 345,
    "status": "Close Companion"
  }
  ```

### `GET /api/memory/facts/{user_id}`
Retrieves all extracted facts about a user.
- **Parameters**: `user_id` (string)
- **Response**:
  ```json
  [
    {
      "id": 1,
      "fact": "User is a designer who loves minimal interfaces.",
      "category": "Interests",
      "timestamp": "2026-03-10T18:00:00Z"
    }
  ]
  ```

## 💬 Chat & Interaction

### `WS /api/chat/ws/{user_id}`
WebSocket endpoint for real-time chat.
- **Protocol**: JSON
- **Message Format**:
  ```json
  {
    "type": "text",
    "content": "Hello Luna"
  }
  ```

### `POST /api/chat/message`
Fallback REST endpoint for sending a message.

## 🎙️ LiveKit / RTC

### `POST /api/voice/token`
Generates a LiveKit JWT for joining a voice/video room.
- **Body**:
  ```json
  {
    "room_name": "room-123",
    "identity": "Luna"
  }
  ```
- **Response**:
  ```json
  {
    "token": "ey..."
  }
  ```

## 👤 User Management

### `GET /api/user/profile`
Retrieves the authenticated user's profile info (synchronized from Clerk).
