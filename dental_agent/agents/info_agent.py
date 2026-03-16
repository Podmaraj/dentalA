"""Info agent — handles queries about available slots, doctor info, and patient lookups."""

from langchain_core.messages import SystemMessage, AIMessage
from dental_agent.config.settings import get_llm
from dental_agent.models.state import AgentState
from dental_agent.tools.csv_reader import READ_TOOLS


INFO_PROMPT = """You are the Information Agent of a dental appointment management system.
Your role is to help users find information about:
- Available appointment slots (by specialization, doctor, or date)
- Doctor information and specializations
- Patient appointment lookups

You have access to these tools:
- get_available_slots: Query available slots with optional filters (specialization, doctor_name, date)
- get_patient_appointments: Look up all appointments for a patient ID
- get_doctors_list: Get all available doctors and their specializations

Use the appropriate tool based on the user's request. Present the results in a clear, friendly format.
Always be helpful and suggest next steps (e.g., "Would you like to book one of these slots?").

IMPORTANT: When using tools, extract the parameters from the user's message. For dates, use YYYY-MM-DD format.
Doctor names should be lowercase (e.g., "john doe", "emily johnson")."""


def info_agent_node(state: AgentState) -> dict:
    """Handle information queries using read tools."""
    llm = get_llm()
    llm_with_tools = llm.bind_tools(READ_TOOLS)

    messages = [SystemMessage(content=INFO_PROMPT)] + state.messages
    response = llm_with_tools.invoke(messages)

    # If the LLM made tool calls, execute them
    if response.tool_calls:
        from langchain_core.messages import ToolMessage

        tool_map = {t.name: t for t in READ_TOOLS}
        tool_messages = [response]

        for tool_call in response.tool_calls:
            tool_fn = tool_map[tool_call["name"]]
            result = tool_fn.invoke(tool_call["args"])
            tool_messages.append(
                ToolMessage(content=str(result), tool_call_id=tool_call["id"])
            )

        # Get final response with tool results
        final_messages = [SystemMessage(content=INFO_PROMPT)] + state.messages + tool_messages
        final_response = llm.invoke(final_messages)

        return {
            "messages": tool_messages + [final_response],
            "final_response": final_response.content,
        }

    return {
        "messages": [response],
        "final_response": response.content,
    }
