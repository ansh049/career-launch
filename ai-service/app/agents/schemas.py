from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class WorkflowStep(BaseModel):
    step_number: int
    tool: str
    input_payload: Dict[str, Any] = Field(default_factory=dict)
    output_payload: Dict[str, Any] = Field(default_factory=dict)
    status: str = "completed"  # completed, awaiting_approval, failed
    requires_approval: bool = False
    timestamp: Optional[str] = None

class PendingApproval(BaseModel):
    action_type: str
    title: str
    description: str
    payload: Dict[str, Any]

class AgentRunRequest(BaseModel):
    goal: str = Field(min_length=3, max_length=1000)
    candidate_profile: Dict[str, Any] = Field(default_factory=dict)
    available_jobs: List[Dict[str, Any]] = Field(default_factory=list)
    state: Dict[str, Any] = Field(default_factory=dict)
    step_index: int = 0

class AgentRunResponse(BaseModel):
    status: str  # running, awaiting_approval, completed, failed
    current_step: int
    steps: List[WorkflowStep]
    state: Dict[str, Any]
    approval_request: Optional[PendingApproval] = None
    output_summary: str
