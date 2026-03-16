"""Main agent entrypoint — provides a simple interface to invoke the workflow."""

from langchain_core.messages import HumanMessage, AIMessage
from dental_agent.workflows.graph import workflow


def run_agent(user_message: str, history: list[dict] | None = None) -> str:
    """
    Run the dental appointment agent with a user message and optional history.

    Args:
        user_message: The user's input message
        history: Optional list of previous messages as dicts with 'role' and 'content'

    Returns:
        The agent's response string
    """
    # Build message list from history
    messages = []
    if history:
        for msg in history:
            if msg["role"] == "user":
                messages.append(HumanMessage(content=msg["content"]))
            elif msg["role"] == "assistant":
                messages.append(AIMessage(content=msg["content"]))

    # Add current user message
    messages.append(HumanMessage(content=user_message))

    # Invoke the workflow
    result = workflow.invoke({"messages": messages})

    # Extract final response
    if result.get("final_response"):
        return result["final_response"]

    # Fallback: get the last AI message
    for msg in reversed(result.get("messages", [])):
        if hasattr(msg, "content") and msg.content and not hasattr(msg, "tool_call_id"):
            return msg.content

    return "I'm sorry, I couldn't process your request. Please try again."
