"""FastAPI server for the dental appointment management system."""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import os

from dental_agent.agent import run_agent
from dental_agent.config.settings import CSV_PATH

app = FastAPI(
    title="Dental Appointment API",
    description="AI-powered dental appointment management system",
    version="1.0.0",
)

# CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request/Response Models ──────────────────────────────────────────

class ChatRequest(BaseModel):
    message: str
    history: list[dict] = []


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


# ── Helper ───────────────────────────────────────────────────────────

def _load_csv() -> pd.DataFrame:
    df = pd.read_csv(CSV_PATH)
    df["date_slot"] = pd.to_datetime(df["date_slot"])
    df["is_available"] = df["is_available"].astype(str).str.upper() == "TRUE"
    return df


# ── Endpoints ────────────────────────────────────────────────────────

@app.get("/")
async def root():
    return {"status": "ok", "service": "Dental Appointment API"}


@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Chat with the AI dental assistant."""
    try:
        response = run_agent(request.message, request.history)
        return ChatResponse(response=response)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent error: {str(e)}")


@app.get("/api/slots")
async def get_slots(
    specialization: str = "",
    doctor_name: str = "",
    date: str = "",
    available_only: bool = True,
    limit: int = 50,
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
        patient = str(row["patient_to_attend"]) if pd.notna(row["patient_to_attend"]) and row["patient_to_attend"] != "" else None
        results.append({
            "date_slot": row["date_slot"].strftime("%Y-%m-%d %H:%M"),
            "specialization": row["specialization"],
            "doctor_name": row["doctor_name"].title(),
            "is_available": bool(row["is_available"]),
            "patient_to_attend": patient,
        })

    return results


@app.get("/api/doctors")
async def get_doctors():
    """Get all doctors and their specializations."""
    df = _load_csv()
    doctors = df[["doctor_name", "specialization"]].drop_duplicates()

    results = []
    for _, row in doctors.iterrows():
        results.append({
            "doctor_name": row["doctor_name"].title(),
            "specialization": row["specialization"],
        })

    return sorted(results, key=lambda x: (x["specialization"], x["doctor_name"]))


@app.get("/api/appointments/{patient_id}")
async def get_patient_appointments(patient_id: str):
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


@app.get("/api/specializations")
async def get_specializations():
    """Get all available specializations."""
    df = _load_csv()
    specs = sorted(df["specialization"].unique().tolist())
    return [{"name": s, "display_name": s.replace("_", " ").title()} for s in specs]
