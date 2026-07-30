import json
import time
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from graph.workflow import graph
from agents.intake import intake_agent
from agents.classification import classification_agent
from agents.duplicate import duplicate_agent
from agents.evidence import evidence_agent
from agents.risk import risk_agent
from agents.workflow import workflow_agent
from tools.llm import llm
from langchain_core.messages import HumanMessage, SystemMessage

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


CHAT_SYSTEM_PROMPT = """You are AgentBot, a helpful AI assistant for CasePilot — an AI-powered fraud complaint intelligence platform.

CasePilot has 6 AI agents:
1. Intake Agent — extracts structured data (amount, bank, fraud type, channel, date) from complaints
2. Classification Agent — categorizes fraud type and routes to the right department
3. Duplicate Agent — checks if a similar complaint already exists
4. Evidence Agent — evaluates evidence completeness and lists missing documents
5. Risk Agent — scores risk level (0-100) and recommends priority action
6. Workflow Agent — assigns SLA, next steps, and closure status

Answer questions about how the system works, what each agent does, how to submit complaints, and general banking fraud topics. Be concise, friendly, and helpful. Use emojis occasionally. Keep answers under 100 words."""


class ChatRequest(BaseModel):
    messages: list


class ComplaintRequest(BaseModel):
    complaint: str


@app.post("/chat")
def chat(request: ChatRequest):
    history = [
        SystemMessage(content=CHAT_SYSTEM_PROMPT)
    ]
    for msg in request.messages:
        if msg["role"] == "user":
            history.append(HumanMessage(content=msg["content"]))
        elif msg["role"] == "assistant":
            from langchain_core.messages import AIMessage
            history.append(AIMessage(content=msg["content"]))

    response = llm.invoke(history)
    return {"reply": response.content}




@app.post("/analyze")
def analyze(request: ComplaintRequest):
    initial_state = {
        "complaint": request.complaint,
        "reasoning": {},
        "agent_logs": []
    }
    result = graph.invoke(initial_state)
    return result


@app.post("/analyze/stream")
def analyze_stream(request: ComplaintRequest):
    def event_stream():
        state = {
            "complaint": request.complaint,
            "reasoning": {},
            "agent_logs": []
        }

        agents = [
            ("intake",         intake_agent,         3.5, [
                "📥 Reading complaint text...",
                "🔍 Extracting key entities...",
                "💰 Identifying amount & bank...",
                "✅ Structuring case data...",
            ]),
            ("classification", classification_agent, 3.0, [
                "📂 Loading fraud taxonomy...",
                "🧠 Matching fraud patterns...",
                "🏷️ Assigning category & department...",
            ]),
            ("duplicate",      duplicate_agent,      3.5, [
                "🗄️ Scanning case database...",
                "📊 Computing semantic similarity...",
                "🔗 Cross-referencing case IDs...",
            ]),
            ("evidence",       evidence_agent,       3.0, [
                "📋 Checking submitted documents...",
                "🔎 Identifying missing evidence...",
                "📄 Generating evidence report...",
            ]),
            ("risk",           risk_agent,           3.5, [
                "⚖️ Calculating fraud risk score...",
                "🚨 Evaluating priority level...",
                "💡 Generating recommended action...",
            ]),
            ("workflow",       workflow_agent,       3.0, [
                "📌 Assigning to department...",
                "⏱️ Setting SLA deadline...",
                "🚦 Finalizing workflow status...",
            ]),
        ]

        for agent_key, agent_fn, total_delay, log_steps in agents:
            # Signal agent is starting
            yield f"data: {json.dumps({'event': 'agent_start', 'agent': agent_key})}\n\n"

            # Stream thinking logs with delays between them
            step_delay = total_delay / len(log_steps)
            for step in log_steps:
                time.sleep(step_delay)
                yield f"data: {json.dumps({'event': 'agent_log', 'agent': agent_key, 'log': step})}\n\n"

            # Run the actual agent
            state = agent_fn(state)

            # Build partial snapshot for this agent
            snapshots = {
                "intake": {
                    "amount":              state.get("amount"),
                    "bank_name":           state.get("bank_name"),
                    "fraud_type":          state.get("fraud_type"),
                    "transaction_channel": state.get("transaction_channel"),
                    "transaction_date":    state.get("transaction_date"),
                    "reasoning":           {"intake": state["reasoning"].get("intake")},
                },
                "classification": {
                    "category":                  state.get("category"),
                    "assigned_department":        state.get("assigned_department"),
                    "classification_confidence":  state.get("classification_confidence"),
                    "reasoning":                  {"classification": state["reasoning"].get("classification")},
                },
                "duplicate": {
                    "is_duplicate":   state.get("is_duplicate"),
                    "similar_case":   state.get("similar_case"),
                    "duplicate_score":state.get("duplicate_score"),
                    "reasoning":      {"duplicate": state["reasoning"].get("duplicate")},
                },
                "evidence": {
                    "evidence_status": state.get("evidence_status"),
                    "missing_items":   state.get("missing_items", []),
                    "reasoning":       {"evidence": state["reasoning"].get("evidence")},
                },
                "risk": {
                    "risk_score":         state.get("risk_score"),
                    "priority":           state.get("priority"),
                    "recommended_action": state.get("recommended_action"),
                    "reasoning":          {"risk": state["reasoning"].get("risk")},
                },
                "workflow": {
                    "workflow_status": state.get("workflow_status"),
                    "sla":             state.get("sla"),
                    "next_action":     state.get("next_action"),
                    "closure_status":  state.get("closure_status"),
                    "reasoning":       {"workflow": state["reasoning"].get("workflow")},
                },
            }

            payload = {
                "event": "agent_done",
                "agent": agent_key,
                "data":  snapshots[agent_key],
            }
            yield f"data: {json.dumps(payload)}\n\n"

        yield f"data: {json.dumps({'event': 'done'})}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")