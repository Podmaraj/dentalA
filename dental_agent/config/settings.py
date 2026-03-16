"""Configuration and settings for the dental agent system."""

import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
MODEL_NAME = os.getenv("MODEL_NAME", "llama-3.3-70b-versatile")
TEMPERATURE = float(os.getenv("TEMPERATURE", "0"))

CSV_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "doctor_availability.csv")


def get_llm() -> ChatGroq:
    """Create and return a ChatGroq LLM instance."""
    return ChatGroq(
        api_key=GROQ_API_KEY,
        model_name=MODEL_NAME,
        temperature=TEMPERATURE,
    )
