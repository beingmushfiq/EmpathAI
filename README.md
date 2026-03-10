# 🦋 EmpathAI

**EmpathAI** is a high-fidelity, empathetic AI companion and assistant platform designed to provide a supportive, long-term relationship for users. Built with a "Cyberpunk Elegance" aesthetic, it combines cutting-edge AI (GPT-4o), real-time communication (LiveKit), and a sophisticated memory system to create an AI that truly feels like a companion.

![Luna Hero](web/public/icon.png)

## ✨ Features

- **🧠 Neural Memory Registry**: Automatically extracts facts from conversations to build a persistent context of your life, preferences, and emotions.
- **🏆 Relationship Journey**: A gamified bond system where your connection with Luna levels up as you share more.
- **📞 Live Multimodal Talk**: Seamlessly switch between text, real-time voice calls, and live video calls with custom avatars.
- **🎨 Cyberpunk Elegance**: A premium UI/UX design featuring glassmorphism, dynamic animations, and perfect dark/light mode balance.
- **🔒 Secure & Private**: Full authentication integration via Clerk and local/vector database isolation.

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + Vanilla CSS (Custom tokens)
- **Animations**: Framer Motion
- **Management**: Lucide React + Clerk Auth
- **RTC**: LiveKit Client SDK

### Backend
- **Framework**: FastAPI (Python 3.11)
- **Database**: PostgreSQL (SQLAlchemy + AsyncPG)
- **Vector DB**: Pinecone (For RAG/Memory retrieval)
- **AI Engine**: OpenAI GPT-4o-mini (Chat & Fact Extraction)
- **Real-time**: LiveKit Server SDK

## 🚀 Getting Started

### Prerequisites
- Docker & Docker Compose
- API Keys for: OpenAI, Clerk, Pinecone, and LiveKit.

### Fast Setup (Docker)
1. Clone the repository.
2. Create a `.env` file in the root:
   ```env
   # Backend
   OPENAI_API_KEY=your_key
   PINECONE_API_KEY=your_key
   LIVEKIT_URL=your_url
   LIVEKIT_API_KEY=your_key
   LIVEKIT_API_SECRET=your_secret
   
   # Database
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=postgres
   
   # Frontend
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_pub_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   ```
3. Run the orchestration:
   ```bash
   docker-compose up --build
   ```
4. Access the apps:
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:8000/docs

## 📁 Repository Structure
```text
.
├── backend/            # FastAPI source code
│   ├── app/            # Main application logic
│   ├── Dockerfile      # Backend containerization
│   └── requirements.txt
├── web/                # Next.js frontend
│   ├── app/            # App router pages
│   ├── components/     # UI components & RTC logic
│   └── Dockerfile      # Frontend containerization
└── docker-compose.yml  # Multi-container orchestration
```

## 📜 Documentation
- [Architecture & Design Deep Dive](ARCHITECTURE.md)
- [API Reference](API_REFERENCE.md)

---
*Built with ❤️ by Antigravity for a more empathetic future.*
