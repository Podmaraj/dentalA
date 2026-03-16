"""Rescheduling agent — handles moving appointments to different time slots."""

from langchain_core.messages import SystemMessage, ToolMessage
from dental_agent.config.settings import get_llm
from dental_agent.models.state import AgentState
from dental_agent.tools.csv_reader import get_patient_appointments, get_available_slots
from dental_agent.tools.csv_writer import reschedule_appointment


RESCHEDULE_PROMPT = """You are the Rescheduling Agent of a dental appointment management system.
Your role is to help users reschedule (move) existing appointments to different time slots.

To reschedule an appointment, you need:
1. Patient ID (e.g., 1000082)
2. Current date/time slot (in YYYY-MM-DD HH:MM format)
3. New desired date/time slot (in YYYY-MM-DD HH:MM format)
4. Doctor name (optional — defaults to same doctor)

You have access to these tools:
- get_patient_appointments: Look up a patient's existing appointments
- get_available_slots: Check if the new slot is available
- reschedule_appointment: Reschedule the appointment

Process:
1. Extract the rescheduling details from the user's message
2. Verify the patient has the original appointment
3. Check the new slot is available
4. Reschedule using the reschedule_appointment tool
5. Confirm the rescheduling to the user

If any required information is missing, ask the user for it politely."""

RESCHEDULE_TOOLS = [get_patient_appointments, get_available_slots, reschedule_appointment]


def rescheduling_agent_node(state: AgentState) -> dict:
    """Handle appointment rescheduling."""
    llm = get_llm()
    llm_with_tools = llm.bind_tools(RESCHEDULE_TOOLS)

    messages = [SystemMessage(content=RESCHEDULE_PROMPT)] + state.messages
    response = llm_with_tools.invoke(messages)

    all_new_messages = []
    current_response = response
    max_iterations = 6

    for _ in range(max_iterations):
        if not current_response.tool_calls:
            break

        tool_map = {t.name: t for t in RESCHEDULE_TOOLS}
        all_new_messages.append(current_response)

        for tool_call in current_response.tool_calls:
            tool_fn = tool_map[tool_call["name"]]
            result = tool_fn.invoke(tool_call["args"])
            all_new_messages.append(
                ToolMessage(content=str(result), tool_call_id=tool_call["id"])
            )

        next_messages = [SystemMessage(content=RESCHEDULE_PROMPT)] + state.messages + all_new_messages
        current_response = llm_with_tools.invoke(next_messages)

    all_new_messages.append(current_response)

    return {
        "messages": all_new_messages,
        "final_response": current_response.content,
    }
