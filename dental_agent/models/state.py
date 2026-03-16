"""State schema definitions for the LangGraph workflow."""

from typing import Annotated, Literal, Optional
from pydantic import BaseModel, Field
from langgraph.graph.message import add_messages


class SupervisorDecision(BaseModel):
    """Structured output from the supervisor agent."""
    intent: Literal["get_info", "book", "cancel", "reschedule", "end"] = Field(
        description="The classified intent of the user's message"
    )
    next_agent: Literal["info_agent", "booking_agent", "cancellation_agent", "rescheduling_agent", "end"] = Field(
        description="Which agent should handle this request"
    )
    reasoning: str = Field(
        description="Brief explanation of why this intent was chosen"
    )


class AgentState(BaseModel):
    """Main state for the LangGraph workflow."""
    messages: Annotated[list, add_messages] = Field(default_factory=list)
    intent: Optional[str] = None
    next_agent: Optional[str] = None
    reasoning: Optional[str] = None
    patient_id: Optional[str] = None
    doctor_name: Optional[str] = None
    date_slot: Optional[str] = None
    new_date_slot: Optional[str] = None
    specialization: Optional[str] = None
    tool_result: Optional[str] = None
    final_response: Optional[str] = None
