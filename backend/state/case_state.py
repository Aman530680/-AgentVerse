from typing import TypedDict, Optional


class CaseState(TypedDict):
    # Citizen Complaint
    complaint: str

    # Intake Agent
    amount: Optional[float]
    bank_name: Optional[str]
    fraud_type: Optional[str]
    transaction_channel: Optional[str]
    transaction_date: Optional[str]

    # Classification Agent
    category: Optional[str]
    classification_confidence: Optional[float]

    # Duplicate Agent
    duplicate_score: Optional[float]
    is_duplicate: Optional[bool]
    similar_case: Optional[str]

    # Evidence Agent
    evidence_status: Optional[str]
    missing_items: list[str]

    # Risk Agent
    risk_score: Optional[int]
    priority: Optional[str]
    recommended_action: Optional[str]

    # Routing Agent
    assigned_department: Optional[str]

    # Workflow Agent
    workflow_status: Optional[str]
    next_action: Optional[str]
    sla: Optional[str]
    closure_status: Optional[str]

    # Explainability
    reasoning: dict

    # Timeline
    agent_logs: list[str]
