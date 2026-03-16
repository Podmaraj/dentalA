"""Supervisor agent — intent classification and routing."""

from langchain_core.messages import SystemMessage
from dental_agent.config.settings import get_llm
from dental_agent.models.state import AgentState, SupervisorDecision


SUPERVISOR_PROMPT = """You are the supervisor of a dental appointment management system.
Your job is to analyze the user's message and determine which specialized agent should handle it.

Classify the intent as one of:
- "get_info": User wants to check available slots, doctor information, or look up patient appointments
- "book": User wants to book/schedule a new appointment
- "cancel": User wants to cancel an existing appointment
- "reschedule": User wants to move an existing appointment to a different time
- "end": User wants to end the conversation or says goodbye

Route to the appropriate agent:
- "info_agent" for get_info
- "booking_agent" for book
- "cancellation_agent" for cancel
- "rescheduling_agent" for reschedule
- "end" for end

Respond with your classification in JSON format."""


def supervisor_node(state: AgentState) -> dict:
    """Classify intent and determine next agent."""
    llm = get_llm()
    structured_llm = llm.with_structured_output(SupervisorDecision)

    messages = [SystemMessage(content=SUPERVISOR_PROMPT)] + state.messages

    decision = structured_llm.invoke(messages)

    return {
        "intent": decision.intent,
        "next_agent": decision.next_agent,
        "reasoning": decision.reasoning,
    }


def route_to_agent(state: AgentState) -> str:
    """Conditional edge function: route based on supervisor decision."""
    return state.next_agent or "end"
