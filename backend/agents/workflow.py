import json

from core.agent_executor import run_agent

from prompts.workflow_prompt import WORKFLOW_PROMPT

from state.case_state import CaseState

from utils.logger import (
    log_header,
    log_section,
    log_success,
    log_data,
)


def workflow_agent(state: CaseState):

    log_header("Workflow & Resolution Agent")

    payload = {
        "assigned_department": state.get("assigned_department"),
        "risk_score": state.get("risk_score"),
        "priority": state.get("priority"),
        "duplicate_score": state.get("duplicate_score"),
        "evidence_status": state.get("evidence_status"),
        "category": state.get("category")
    }

    log_section("Workflow Payload")
    log_data(payload)

    data, raw_response = run_agent(
        WORKFLOW_PROMPT,
        json.dumps(payload, indent=2)
    )

    log_section("LLM Response")
    log_data(raw_response)

    state["workflow_status"] = data.get("workflow_status")
    state["next_action"] = data.get("next_action")
    state["sla"] = data.get("sla")
    state["closure_status"] = data.get("closure_status")

    state["reasoning"]["workflow"] = data.get("reasoning")

    state["agent_logs"].append(
        "✅ Workflow Agent completed: Case routed successfully."
    )

    log_success("Workflow completed.")

    return state