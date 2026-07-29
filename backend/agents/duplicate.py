import json

from core.agent_executor import run_agent

from prompts.duplicate_prompt import DUPLICATE_PROMPT

from data.sample_cases import EXISTING_CASES

from state.case_state import CaseState

from utils.logger import (
    log_header,
    log_section,
    log_success,
    log_data,
)


def duplicate_agent(state: CaseState):

    log_header("Duplicate Detection Agent")

    payload = {
        "new_case": {
            "complaint": state.get("complaint"),
            "amount": state.get("amount"),
            "bank_name": state.get("bank_name"),
            "fraud_type": state.get("fraud_type"),
            "transaction_channel": state.get("transaction_channel"),
            "transaction_date": state.get("transaction_date"),
            "category": state.get("category"),
        },
        "existing_cases": EXISTING_CASES
    }

    log_section("Comparison Payload")
    log_data(payload)

    data, raw_response = run_agent(
        DUPLICATE_PROMPT,
        json.dumps(payload, indent=2)
    )

    log_section("LLM Response")
    log_data(raw_response)

    state["is_duplicate"] = data.get("is_duplicate")
    state["duplicate_score"] = data.get("duplicate_score")
    state["similar_case"] = data.get("similar_case")

    state["reasoning"]["duplicate"] = data.get("reasoning")

    state["agent_logs"].append(
        "✅ Duplicate Agent completed: Similarity check finished."
    )

    log_success("Duplicate analysis completed.")

    return state