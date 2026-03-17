"""Configuration and settings for the dental agent system."""

import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from pathlib import Path

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
MODEL_NAME = os.getenv("MODEL_NAME", "llama-3.3-70b-versatile")
TEMPERATURE = float(os.getenv("TEMPERATURE", "0"))

# Correct base directory
BASE_DIR = Path(__file__).resolve().parent.parent

# Correct CSV path
CSV_PATH = BASE_DIR / "data" / "doctor_availability.csv"


def get_llm() -> ChatGroq:
    """Create and return a ChatGroq LLM instance."""
    return ChatGroq(
        api_key=GROQ_API_KEY,
        model_name=MODEL_NAME,
        temperature=TEMPERATURE,
    )