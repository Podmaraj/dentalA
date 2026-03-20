"""FastAPI server for the dental appointment management system.

Production-grade with:
- Security headers middleware
- CORS with configurable origins
- Rate limiting via slowapi
- SSE endpoint for real-time slot updates
- Health check endpoint
- Structured logging
- Global exception handling
"""

import os
import uuid
import logging
import time
from contextlib import asynccontextmanager

import pandas as pd
from fastapi import FastAPI, HTTPException, Request, Response, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, field_validator
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from sse_starlette.sse import EventSourceResponse

from dental_agent.agent import run_agent
from dental_agent.config.settings import CSV_PATH
from dental_agent.events import subscribe, subscriber_count

# ── Logging ──────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("dentala.server")

# ── Rate Limiter ─────────────────────────────────────────────────────
limiter = Limiter(key_func=get_remote_address)

# ── Lifespan ─────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🦷 DentalA API starting up")
    logger.info("   CSV Path: %s", CSV_PATH)
    yield
    logger.info("🦷 DentalA API shutting down")

# ── App ──────────────────────────────────────────────────────────────
app = FastAPI(
    title="Dental Appointment API",
    description="AI-powered dental appointment management system with real-time updates",
    version="2.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Attach limiter state
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ── Middleware Stack (order matters — last added = first executed) ────

# 1. CORS
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in ALLOWED_ORIGINS],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-Request-ID"],
    expose_headers=["X-Request-ID", "X-RateLimit-Remaining"],
    max_age=600,
)

# 2. Trusted Host (blocks requests with unknown Host headers)
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["localhost", "127.0.0.1", "*.localhost", "*"],
)


# 3. Security Headers & Request ID
@app.middleware("http")
async def security_headers_middleware(request: Request, call_next):
    """Add security response headers and request tracing."""
    request_id = request.headers.get("X-Request-ID", str(uuid.uuid4())[:8])
    start = time.perf_counter()

    response: Response = await call_next(request)
    elapsed = time.perf_counter() - start

    # Security headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Response-Time"] = f"{elapsed:.3f}s"

    logger.info(
        "%s %s → %s (%.3fs) [%s]",
        request.method,
        request.url.path,
        response.status_code,
        elapsed,
        request_id,
    )
    return response


# ── Global Exception Handler ─────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled exception on %s %s", request.method, request.url.path)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error. Please try again later."},
    )


# ── Request/Response Models ──────────────────────────────────────────

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000, description="User message")
    history: list[dict] = Field(default_factory=list, max_length=50)

    @field_validator("message")
    @classmethod
    def strip_message(cls, v: str) -> str:
        return v.strip()


class ChatResponse(BaseModel):
    response: str
    intent: str | None = None


class SlotResponse(BaseModel):
    date_slot: str
    specialization: str
    doctor_name: str
    is_available: bool
    patient_to_attend: str | None = None


class DoctorResponse(BaseModel):
    doctor_name: str
    specialization: str


class HealthResponse(BaseModel):
    status: str
    version: str
    csv_exists: bool
    sse_subscribers: int


# ── Helper ───────────────────────────────────────────────────────────

def _load_csv() -> pd.DataFrame:
    df = pd.read_csv(CSV_PATH)
    df["date_slot"] = pd.to_datetime(df["date_slot"])
    df["is_available"] = df["is_available"].astype(str).str.upper() == "TRUE"
    return df


# ── Endpoints ────────────────────────────────────────────────────────

@app.get("/", tags=["Root"])
async def root():
    return {"status": "ok", "service": "Dental Appointment API", "version": "2.0.0"}


@app.get("/api/health", response_model=HealthResponse, tags=["System"])
async def health_check():
    """Health check endpoint for monitoring."""
    return HealthResponse(
        status="healthy",
        version="2.0.0",
        csv_exists=CSV_PATH.exists(),
        sse_subscribers=subscriber_count(),
    )


@app.post("/api/chat", response_model=ChatResponse, tags=["AI Chat"])
@limiter.limit("10/minute")
async def chat(request: Request, body: ChatRequest):
    """Chat with the AI dental assistant. Rate limited to 10 req/min per IP."""
    try:
        response = run_agent(body.message, body.history)
        return ChatResponse(response=response)
    except Exception as e:
        logger.error("Agent error: %s", str(e))
        raise HTTPException(
            status_code=500,
            detail="The AI assistant encountered an error. Please try again.",
        )


@app.get("/api/slots", response_model=list[SlotResponse], tags=["Appointments"])
@limiter.limit("30/minute")
async def get_slots(
    request: Request,
    specialization: str = "",
    doctor_name: str = "",
    date: str = "",
    available_only: bool = True,
    limit: int = Query(default=50, ge=1, le=200),
):
    """Get appointment slots with optional filters."""
    df = _load_csv()

    if available_only:
        df = df[df["is_available"] == True]

    if specialization:
        df = df[df["specialization"].str.lower() == specialization.lower()]
    if doctor_name:
        df = df[df["doctor_name"].str.lower() == doctor_name.lower()]
    if date:
        df = df[df["date_slot"].dt.strftime("%Y-%m-%d") == date]

    df = df.head(limit)

    results = []
    for _, row in df.iterrows():
        patient = (
            str(row["patient_to_attend"])
            if pd.notna(row["patient_to_attend"]) and row["patient_to_attend"] != ""
            else None
        )
        results.append(SlotResponse(
            date_slot=row["date_slot"].strftime("%Y-%m-%d %H:%M"),
            specialization=row["specialization"],
            doctor_name=row["doctor_name"].title(),
            is_available=bool(row["is_available"]),
            patient_to_attend=patient,
        ))

    return results


@app.get("/api/doctors", response_model=list[DoctorResponse], tags=["Doctors"])
@limiter.limit("30/minute")
async def get_doctors(request: Request):
    """Get all doctors and their specializations."""
    df = _load_csv()
    doctors = df[["doctor_name", "specialization"]].drop_duplicates()

    results = []
    for _, row in doctors.iterrows():
        results.append(DoctorResponse(
            doctor_name=row["doctor_name"].title(),
            specialization=row["specialization"],
        ))

    return sorted(results, key=lambda x: (x.specialization, x.doctor_name))


@app.get("/api/appointments/{patient_id}", tags=["Appointments"])
@limiter.limit("30/minute")
async def get_patient_appointments(request: Request, patient_id: str):
    """Get all appointments for a specific patient."""
    df = _load_csv()
    df["patient_to_attend"] = df["patient_to_attend"].astype(str).str.strip()

    patient_df = df[df["patient_to_attend"] == patient_id]

    if patient_df.empty:
        return []

    results = []
    for _, row in patient_df.iterrows():
        results.append({
            "date_slot": row["date_slot"].strftime("%Y-%m-%d %H:%M"),
            "specialization": row["specialization"],
            "doctor_name": row["doctor_name"].title(),
        })

    return results


@app.get("/api/specializations", tags=["Doctors"])
@limiter.limit("30/minute")
async def get_specializations(request: Request):
    """Get all available specializations."""
    df = _load_csv()
    specs = sorted(df["specialization"].unique().tolist())
    return [{"name": s, "display_name": s.replace("_", " ").title()} for s in specs]


@app.get("/api/stats", tags=["Dashboard"])
@limiter.limit("30/minute")
async def get_stats(request: Request):
    """Get dashboard statistics."""
    df = _load_csv()
    total_slots = len(df)
    available = int(df["is_available"].sum())
    booked = total_slots - available
    doctors = df["doctor_name"].nunique()
    specializations = df["specialization"].nunique()
    patients = df.loc[df["patient_to_attend"].notna() & (df["patient_to_attend"] != ""), "patient_to_attend"].nunique()

    return {
        "total_slots": total_slots,
        "available_slots": available,
        "booked_slots": booked,
        "total_doctors": doctors,
        "total_specializations": specializations,
        "unique_patients": patients,
        "occupancy_rate": round(booked / total_slots * 100, 1) if total_slots > 0 else 0,
    }


# ── SSE Endpoint ─────────────────────────────────────────────────────

@app.get("/api/slots/stream", tags=["Real-Time"])
async def slot_stream(request: Request):
    """
    Server-Sent Events endpoint for real-time slot updates.
    Connect via EventSource to receive live booking/cancel/reschedule notifications.
    """
    return EventSourceResponse(
        subscribe(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
