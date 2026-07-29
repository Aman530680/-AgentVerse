from langgraph.graph import StateGraph, START, END

from state.case_state import CaseState

from agents.intake import intake_agent
from agents.classification import classification_agent
from agents.duplicate import duplicate_agent
from agents.evidence import evidence_agent
from agents.risk import risk_agent
from agents.workflow import workflow_agent

builder = StateGraph(CaseState)

builder.add_node("intake", intake_agent)
builder.add_node("classification", classification_agent)
builder.add_node("duplicate", duplicate_agent)
builder.add_node("evidence", evidence_agent)
builder.add_node("risk", risk_agent)
builder.add_node("workflow", workflow_agent)

builder.add_edge(START, "intake")
builder.add_edge("intake", "classification")
builder.add_edge("classification", "duplicate")
builder.add_edge("duplicate", "evidence")
builder.add_edge("evidence", "risk")
builder.add_edge("risk", "workflow")
builder.add_edge("workflow", END)

graph = builder.compile()
