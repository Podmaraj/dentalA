# 🦷 DentalA — AI-Powered Dental Appointment Management System

> A production-grade dental appointment management platform featuring multi-agent AI (LangGraph + Groq), real-time slot updates via SSE, and a modern Next.js frontend.

---

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [API Reference](#-api-reference)
- [Security](#-security)
- [Real-Time Updates](#-real-time-updates)
- [Frontend Pages](#-frontend-pages)
- [Configuration](#-configuration)
- [Contributing](#-contributing)

---

## ✨ Features

### Backend
- **Multi-Agent AI System** — Supervisor routes to specialized agents (Info, Booking, Cancellation, Rescheduling) via LangGraph workflow
- **Groq LLM Integration** — Uses `llama-3.3-70b-versatile` for fast, intelligent responses
- **Real-Time SSE** — Server-Sent Events push slot changes to all connected clients instantly
- **Rate Limiting** — `10 req/min` on AI chat, `30 req/min` on data endpoints (slowapi)
- **Security Hardened** — Security headers (X-Frame-Options, CSP, HSTS), CORS, Trusted Host middleware
- **Request Tracing** — Unique request IDs, structured logging, response time tracking
- **Health Monitoring** — `/api/health` endpoint with system status and SSE subscriber count

### Frontend
- **Dashboard** — Real-time stats cards, doctor listing, slot activity table
- **Doctors** — Search & filter by specialization, expandable availability cards
- **Booking** — 5-step wizard (Specialization → Doctor → Slot → Details → Confirm) with live updates
- **AI Chat** — Natural language assistant with typing indicators and suggestions
- **Responsive** — Mobile-first with collapsible sidebar navigation
- **Real-Time** — Live connection indicator, auto-reconnecting SSE

---

## 🏗 Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    Next.js Frontend (:3000)                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────┐  │
│  │Dashboard │ │ Doctors  │ │ Booking  │ │   AI Chat      │  │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └──────┬─────────┘  │
│       │             │            │               │            │
│       └─────────────┴────────────┴───────────────┘            │
│                        lib/api.ts                             │
│                   hooks/use-realtime-slots.ts (SSE)           │
└──────────────────────────┬───────────────────────────────────┘
                           │ HTTP + SSE
┌──────────────────────────▼───────────────────────────────────┐
│                    FastAPI Backend (:8000)                     │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Middleware: CORS │ Security Headers │ Rate Limiter       │  │
│  └─────────────────────────────────────────────────────────┘  │
│  ┌──────────┐ ┌────────────┐ ┌─────────┐ ┌──────────────┐   │
│  │ /api/chat│ │ /api/slots │ │/api/docs │ │/api/slots/   │   │
│  │  (POST)  │ │   (GET)    │ │  (GET)   │ │  stream(SSE) │   │
│  └────┬─────┘ └──────┬─────┘ └─────────┘ └──────┬───────┘   │
│       │               │                          │            │
│  ┌────▼───────────────▼──────────────────────────▼───────┐   │
│  │              LangGraph Multi-Agent Workflow              │  │
│  │  ┌────────────┐                                         │  │
│  │  │ Supervisor │──┬──► Info Agent                        │  │
│  │  │ (Router)   │  ├──► Booking Agent                     │  │
│  │  └────────────┘  ├──► Cancellation Agent                │  │
│  │                   └──► Rescheduling Agent                │  │
│  └─────────────────────────┬───────────────────────────────┘  │
│                            │                                   │
│  ┌─────────────────────────▼───────────────────────────────┐  │
│  │  CSV Tools (Reader/Writer) + Event Bus (SSE broadcast)  │  │
│  └─────────────────────────┬───────────────────────────────┘  │
│                            │                                   │
│                 dental_agent/data/doctor_availability.csv      │
└───────────────────────────────────────────────────────────────┘
```

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **AI / LLM** | Groq (llama-3.3-70b-versatile), LangChain, LangGraph |
| **Backend** | FastAPI, Pydantic, Pandas, uvicorn |
| **Security** | slowapi (rate limiting), TrustedHostMiddleware, security headers |
| **Real-Time** | SSE (sse-starlette) + asyncio event bus |
| **Frontend** | Next.js 16, React 19, TypeScript |
| **Styling** | Tailwind CSS v4, custom design tokens |
| **UI Components** | Lucide React icons, custom components with cn() utility |
| **Data** | CSV file (doctor_availability.csv) |

---

## 📂 Project Structure

```
dentalA/
├── server.py                      # FastAPI app (security, rate limiting, SSE)
├── main.py                        # CLI + server entrypoint
├── pyproject.toml                 # Python dependencies
├── .env                           # Environment variables (gitignored)
├── .env.example                   # Template env file
│
├── dental_agent/                  # AI Agent system
│   ├── agent.py                   # Main agent entrypoint
│   ├── events.py                  # SSE event bus (broadcast)
│   ├── config/
│   │   └── settings.py            # Groq LLM config, paths
│   ├── models/
│   │   └── state.py               # AgentState, SupervisorDecision
│   ├── agents/
│   │   ├── supervisor.py          # Intent classification & routing
│   │   ├── info_agent.py          # Slot/doctor/patient queries
│   │   ├── booking_agent.py       # Appointment booking
│   │   ├── cancellation_agent.py  # Appointment cancellation
│   │   └── rescheduling_agent.py  # Appointment rescheduling
│   ├── tools/
│   │   ├── csv_reader.py          # Read tools (get_slots, get_doctors, etc.)
│   │   └── csv_writer.py          # Write tools (book, cancel, reschedule) + locking
│   ├── workflows/
│   │   └── graph.py               # LangGraph workflow definition
│   └── data/
│       └── doctor_availability.csv # 4000+ appointment slots
│
└── frontend/dental_booking/       # Next.js Frontend
    ├── app/
    │   ├── layout.tsx             # Root layout with AppShell
    │   ├── page.tsx               # Landing page
    │   ├── globals.css            # Design system tokens & styles
    │   ├── dashboard/page.tsx     # Analytics dashboard
    │   ├── doctors/page.tsx       # Doctor directory
    │   ├── booking/page.tsx       # Multi-step booking wizard
    │   └── chat/page.tsx          # AI chatbot interface
    ├── components/
    │   └── app-shell.tsx          # Sidebar navigation shell
    ├── hooks/
    │   └── use-realtime-slots.ts  # SSE real-time hook
    ├── lib/
    │   ├── api.ts                 # Typed API client
    │   └── utils.ts               # cn() utility
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- **Python** ≥ 3.13
- **Node.js** ≥ 18
- **uv** (Python package manager) — or pip
- A **Groq API key** ([console.groq.com](https://console.groq.com))

### 1. Clone & Setup Backend

```bash
git clone <repo-url>
cd dentalA

# Create .env from template
cp .env.example .env
# Edit .env and add your GROQ_API_KEY

# Install Python dependencies
uv sync
# Or: pip install -e .
```

### 2. Start Backend Server

```bash
python main.py
# Or: uvicorn server:app --host 0.0.0.0 --port 8000 --reload

# API docs: http://localhost:8000/docs
# Health:   http://localhost:8000/api/health
```

### 3. Setup & Start Frontend

```bash
cd frontend/dental_booking
npm install
npm run dev

# Frontend: http://localhost:3000
```

### 4. CLI Mode (Optional)

```bash
python main.py --cli
# Interactive terminal chat with the dental AI
```

---

## 📡 API Reference

| Method | Endpoint | Rate Limit | Description |
|--------|----------|-----------|-------------|
| `GET` | `/` | — | Service info |
| `GET` | `/api/health` | — | Health check + SSE subscriber count |
| `POST` | `/api/chat` | 10/min | AI chat (message + history) |
| `GET` | `/api/slots` | 30/min | Query slots (filters: specialization, doctor, date) |
| `GET` | `/api/doctors` | 30/min | All doctors with specializations |
| `GET` | `/api/specializations` | 30/min | Available specializations |
| `GET` | `/api/stats` | 30/min | Dashboard statistics |
| `GET` | `/api/appointments/{id}` | 30/min | Patient's appointments |
| `GET` | `/api/slots/stream` | — | SSE stream for real-time updates |

### Chat Request Example
```json
POST /api/chat
{
  "message": "Book appointment with Dr. John Doe at 2026-08-14 09:00",
  "history": [
    {"role": "user", "content": "What slots are available?"},
    {"role": "assistant", "content": "Here are the available slots..."}
  ]
}
```

---

## 🔒 Security

| Feature | Implementation |
|---------|---------------|
| **CORS** | Configurable allowed origins via `ALLOWED_ORIGINS` env var |
| **Trusted Hosts** | `TrustedHostMiddleware` rejects unknown Host headers |
| **Rate Limiting** | slowapi with per-IP limits (10/min chat, 30/min APIs) |
| **Security Headers** | X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy, Permissions-Policy |
| **Input Validation** | Pydantic models with max lengths, field validators |
| **Error Handling** | Global exception handler — no stack traces leak to clients |
| **Request Tracing** | Unique X-Request-ID header on every response |
| **CSV Locking** | Thread-level `threading.Lock` prevents race conditions |

---

## 📡 Real-Time Updates

The system uses **Server-Sent Events (SSE)** for real-time slot updates:

1. **Backend**: When a booking/cancel/reschedule occurs, `csv_writer.py` calls `broadcast_event()` from `events.py`
2. **Event Bus**: The event is fanned out to all connected `asyncio.Queue` subscribers
3. **SSE Endpoint**: `/api/slots/stream` yields SSE-formatted messages
4. **Frontend Hook**: `useRealtimeSlots()` uses `EventSource` with auto-reconnect and exponential backoff

```typescript
// Frontend usage
const { connected, lastEvent } = useRealtimeSlots((event) => {
  console.log("Slot changed:", event.type, event.data);
  refetchData(); // Refresh UI
});
```

---

## 🖥 Frontend Pages

| Route | Page | Features |
|-------|------|----------|
| `/` | Landing | Hero, services, doctors, "How It Works", CTA banner, floating AI chat button, footer with quick links |
| `/dashboard` | Dashboard | Stats cards, doctor grid, specialization badges, slot table |
| `/doctors` | Doctors | Search, filter by spec, expandable cards with live slots |
| `/booking` | Booking | 5-step wizard with real-time slot picker, URL pre-fill |
| `/chat` | AI Chat | Message bubbles, typing indicator, suggestions, history |

---

## ⚙️ Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `GROQ_API_KEY` | — | Groq API key (required) |
| `MODEL_NAME` | `llama-3.3-70b-versatile` | LLM model name |
| `TEMPERATURE` | `0.6` | LLM temperature |
| `ALLOWED_ORIGINS` | `http://localhost:3000,...` | CORS allowed origins (comma-separated) |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing`)
5. Open a Pull Request

---

## 📄 License

This project is proprietary. All rights reserved.

---

<p align="center">
  Built with ❤️ by the DentalA Team<br/>
  <em>AI-powered dental care, made accessible.</em>
</p>
