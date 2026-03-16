"""Cancellation agent — handles appointment cancellation."""

from langchain_core.messages import SystemMessage, ToolMessage
from dental_agent.config.settings import get_llm
from dental_agent.models.state import AgentState
from dental_agent.tools.csv_reader import get_patient_appointments
from dental_agent.tools.csv_writer import cancel_appointment


CANCELLATION_PROMPT = """You are the Cancellation Agent of a dental appointment management system.
Your role is to help users cancel existing appointments.

To cancel an appointment, you need:
1. Patient ID (e.g., 1000082)
2. Date/time slot to cancel (in YYYY-MM-DD HH:MM format)

You have access to these tools:
- get_patient_appointments: Look up a patient's existing appointments
- cancel_appointment: Cancel an appointment

Process:
1. Extract the cancellation details from the user's message
2. If only patient ID is given, look up their appointments first
3. Cancel the specified appointment
4. Confirm the cancellation to the user

If any required information is missing, ask the user for it politely."""

CANCEL_TOOLS = [get_patient_appointments, cancel_appointment]


def cancellation_agent_node(state: AgentState) -> dict:
    """Handle appointment cancellation."""
    llm = get_llm()
    llm_with_tools = llm.bind_tools(CANCEL_TOOLS)

    messages = [SystemMessage(content=CANCELLATION_PROMPT)] + state.messages
    response = llm_with_tools.invoke(messages)

    all_new_messages = []
    current_response = response
    max_iterations = 5

    for _ in range(max_iterations):
        if not current_response.tool_calls:
            break

        tool_map = {t.name: t for t in CANCEL_TOOLS}
        all_new_messages.append(current_response)

        for tool_call in current_response.tool_calls:
            tool_fn = tool_map[tool_call["name"]]
            result = tool_fn.invoke(tool_call["args"])
            all_new_messages.append(
                ToolMessage(content=str(result), tool_call_id=tool_call["id"])
            )

        next_messages = [SystemMessage(content=CANCELLATION_PROMPT)] + state.messages + all_new_messages
        current_response = llm_with_tools.invoke(next_messages)

    all_new_messages.append(current_response)

    return {
        "messages": all_new_messages,
        "final_response": current_response.content,
    }
