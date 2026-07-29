import json

from core.agent_executor import run_agent

from prompts.evidence_prompt import EVIDENCE_PROMPT

from state.case_state import CaseState

from utils.logger import (
    log_header,
    log_section,
    log_success,
    log_data,
)


def evidence_agent(state: CaseState):

    log_header("Evidence Completeness Agent")

    payload = {
        "complaint": state.get("complaint"),
        "amount": state.get("amount"),
        "bank_name": state.get("bank_name"),
        "fraud_type": state.get("fraud_type"),
        "transaction_channel": state.get("transaction_channel"),
        "transaction_date": state.get("transaction_date"),
        "category": state.get("category"),
        "is_duplicate": state.get("is_duplicate")
    }

    log_section("Evidence Payload")
    log_data(payload)

    data, raw_response = run_agent(
        EVIDENCE_PROMPT,
        json.dumps(payload, indent=2)
    )

    log_section("LLM Response")
    log_data(raw_response)

    state["evidence_status"] = data.get("evidence_status")
    state["missing_items"] = data.get("missing_items", [])

    state["reasoning"]["evidence"] = data.get("reasoning")

    state["agent_logs"].append(
        "✅ Evidence Agent completed: Evidence checked successfully."
    )

    log_success("Evidence verification completed.")

    return state