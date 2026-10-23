from typing import TypedDict, List, Dict, Any, Optional

class AgentState(TypedDict, total=False):
    goal: str
    candidate_profile: Dict[str, Any]
    candidate_skills: List[str]
    available_jobs: List[Dict[str, Any]]
    recommended_jobs: List[Dict[str, Any]]
    target_job: Optional[Dict[str, Any]]
    target_role: str
    skill_gaps: Optional[Dict[str, Any]]
    roadmap_plan: Optional[Dict[str, Any]]
    tailored_resume: Optional[Dict[str, Any]]
    application_draft: Optional[Dict[str, Any]]
    requires_approval: bool
    pending_approval: Optional[Dict[str, Any]]
    step_history: List[Dict[str, Any]]
    is_completed: bool
    summary: str
