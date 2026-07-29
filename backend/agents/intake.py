from prompts.intake_prompt import INTAKE_PROMPT
from state.case_state import CaseState

from core.agent_executor import run_agent
from utils.normalizer import normalize_amount
from utils.logger import (
    log_header,
    log_section,
    log_success,
    log_data,
)


def intake_agent(state: CaseState):

    log_header("Intake Agent")

    complaint = state["complaint"]

    log_section("Citizen Complaint")
    log_data(complaint)

    data, raw_response = run_agent(
        INTAKE_PROMPT,
        complaint
    )

    log_section("LLM Response")
    log_data(raw_response)

    state["amount"] = normalize_amount(
        data.get("amount")
    )
    state["bank_name"] = data.get("bank_name")
    state["fraud_type"] = data.get("fraud_type")
    state["transaction_channel"] = data.get("transaction_channel")
    state["transaction_date"] = data.get("transaction_date")
    state["reasoning"]["intake"] = data.get("reasoning")

    log_success("CaseState updated successfully.")

    state["agent_logs"].append(
        "✅ Intake Agent completed: Complaint converted into structured case."
    )

    return state