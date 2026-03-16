"""Booking agent — handles new appointment creation."""

from langchain_core.messages import SystemMessage, AIMessage, ToolMessage
from dental_agent.config.settings import get_llm
from dental_agent.models.state import AgentState
from dental_agent.tools.csv_reader import get_available_slots
from dental_agent.tools.csv_writer import book_appointment


BOOKING_PROMPT = """You are the Booking Agent of a dental appointment management system.
Your role is to help users book new appointments.

To book an appointment, you need:
1. Patient ID (e.g., 1000082)
2. Doctor name (e.g., "john doe", "emily johnson")
3. Date/time slot (in YYYY-MM-DD HH:MM format)

You have access to these tools:
- get_available_slots: Check if a slot is available before booking
- book_appointment: Book the appointment

Process:
1. Extract the booking details from the user's message
2. First check availability using get_available_slots
3. If available, book using book_appointment
4. Confirm the booking details to the user

If any required information is missing, ask the user for it politely.
IMPORTANT: Make sure to verify the slot is available before attempting to book."""

BOOKING_TOOLS = [get_available_slots, book_appointment]


def booking_agent_node(state: AgentState) -> dict:
    """Handle appointment booking."""
    llm = get_llm()
    llm_with_tools = llm.bind_tools(BOOKING_TOOLS)

    messages = [SystemMessage(content=BOOKING_PROMPT)] + state.messages
    response = llm_with_tools.invoke(messages)

    all_new_messages = []

    # Process tool calls iteratively
    current_response = response
    max_iterations = 5  # prevent infinite loops

    for _ in range(max_iterations):
        if not current_response.tool_calls:
            break

        tool_map = {t.name: t for t in BOOKING_TOOLS}
        all_new_messages.append(current_response)

        for tool_call in current_response.tool_calls:
            tool_fn = tool_map[tool_call["name"]]
            result = tool_fn.invoke(tool_call["args"])
            all_new_messages.append(
                ToolMessage(content=str(result), tool_call_id=tool_call["id"])
            )

        # Get next response
        next_messages = [SystemMessage(content=BOOKING_PROMPT)] + state.messages + all_new_messages
        current_response = llm_with_tools.invoke(next_messages)

    all_new_messages.append(current_response)

    return {
        "messages": all_new_messages,
        "final_response": current_response.content,
    }
