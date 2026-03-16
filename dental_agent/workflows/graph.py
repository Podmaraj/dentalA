"""LangGraph workflow definition — wires all agents together."""

from langgraph.graph import StateGraph, END

from dental_agent.models.state import AgentState
from dental_agent.agents.supervisor import supervisor_node, route_to_agent
from dental_agent.agents.info_agent import info_agent_node
from dental_agent.agents.booking_agent import booking_agent_node
from dental_agent.agents.cancellation_agent import cancellation_agent_node
from dental_agent.agents.rescheduling_agent import rescheduling_agent_node


def build_graph() -> StateGraph:
    """Build and compile the multi-agent LangGraph workflow."""

    graph = StateGraph(AgentState)

    # Add nodes
    graph.add_node("supervisor", supervisor_node)
    graph.add_node("info_agent", info_agent_node)
    graph.add_node("booking_agent", booking_agent_node)
    graph.add_node("cancellation_agent", cancellation_agent_node)
    graph.add_node("rescheduling_agent", rescheduling_agent_node)

    # Set entry point
    graph.set_entry_point("supervisor")

    # Conditional routing from supervisor
    graph.add_conditional_edges(
        "supervisor",
        route_to_agent,
        {
            "info_agent": "info_agent",
            "booking_agent": "booking_agent",
            "cancellation_agent": "cancellation_agent",
            "rescheduling_agent": "rescheduling_agent",
            "end": END,
        },
    )

    # All agents go to END after processing
    graph.add_edge("info_agent", END)
    graph.add_edge("booking_agent", END)
    graph.add_edge("cancellation_agent", END)
    graph.add_edge("rescheduling_agent", END)

    return graph.compile()


# Pre-compiled graph instance
workflow = build_graph()
