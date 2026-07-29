import json

from core.agent_executor import run_agent

from prompts.risk_prompt import RISK_PROMPT

from state.case_state import CaseState

from utils.logger import (
    log_header,
    log_section,
    log_success,
    log_data,
)


def risk_agent(state: CaseState):

    log_header("Risk & Fraud Prioritization Agent")

    payload = {
        "amount": state.get("amount"),
        "fraud_type": state.get("fraud_type"),
        "category": state.get("category"),
        "duplicate_score": state.get("duplicate_score"),
        "is_duplicate": state.get("is_duplicate"),
        "evidence_status": state.get("evidence_status"),
        "transaction_channel": state.get("transaction_channel"),
        "assigned_department": state.get("assigned_department")
    }

    log_section("Risk Payload")
    log_data(payload)

    data, raw_response = run_agent(
        RISK_PROMPT,
        json.dumps(payload, indent=2)
    )

    log_section("LLM Response")
    log_data(raw_response)

    state["risk_score"] = data.get("risk_score")
    state["priority"] = data.get("priority")
    state["recommended_action"] = data.get("recommended_action")

    state["reasoning"]["risk"] = data.get("reasoning")

    state["agent_logs"].append(
        "✅ Risk Agent completed: Priority assigned successfully."
    )

    log_success("Risk assessment completed.")

    return state