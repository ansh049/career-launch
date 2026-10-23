import datetime
from typing import Dict, Any, List
from app.agents.schemas import AgentRunRequest, AgentRunResponse, WorkflowStep, PendingApproval
from app.agents.tools import (
    execute_search_jobs,
    execute_skill_gap_analysis,
    execute_generate_roadmap,
    execute_tailor_resume,
    execute_prepare_application_draft,
    ALLOWED_TOOLS,
)

WORKFLOW_PIPELINE = [
    ("search_and_rank_jobs", execute_search_jobs),
    ("analyze_skill_gaps", execute_skill_gap_analysis),
    ("generate_career_roadmap", execute_generate_roadmap),
    ("tailor_resume", execute_tailor_resume),
    ("prepare_application_draft", execute_prepare_application_draft),
]

def run_agent_workflow(request: AgentRunRequest) -> AgentRunResponse:
    state: Dict[str, Any] = dict(request.state)
    state["goal"] = request.goal
    state["candidate_profile"] = request.candidate_profile
    state["available_jobs"] = request.available_jobs
    state["candidate_skills"] = request.candidate_profile.get("skills", [])

    existing_steps = [WorkflowStep(**step) for step in state.get("step_history", [])]
    current_step_idx = request.step_index

    # Check if we reached end or halted for approval
    if current_step_idx >= len(WORKFLOW_PIPELINE):
        return AgentRunResponse(
            status="completed",
            current_step=current_step_idx,
            steps=existing_steps,
            state=state,
            output_summary="Agent workflow successfully completed all stages."
        )

    tool_name, tool_fn = WORKFLOW_PIPELINE[current_step_idx]

    if tool_name not in ALLOWED_TOOLS:
        raise ValueError(f"Unauthorized tool requested: {tool_name}")

    # Execute step
    tool_output = tool_fn(state)
    state.update(tool_output)

    is_approval_step = tool_output.get("requires_approval", False)
    pending_approval_data = tool_output.get("pending_approval")

    step_record = WorkflowStep(
        step_number=current_step_idx + 1,
        tool=tool_name,
        input_payload={"goal": request.goal, "step": current_step_idx},
        output_payload={k: v for k, v in tool_output.items() if k != "pending_approval"},
        status="awaiting_approval" if is_approval_step else "completed",
        requires_approval=is_approval_step,
        timestamp=datetime.datetime.now(datetime.timezone.utc).isoformat()
    )

    existing_steps.append(step_record)
    state["step_history"] = [s.model_dump() for s in existing_steps]

    status = "awaiting_approval" if is_approval_step else (
        "completed" if (current_step_idx + 1) >= len(WORKFLOW_PIPELINE) else "running"
    )

    approval_obj = PendingApproval(**pending_approval_data) if pending_approval_data else None

    return AgentRunResponse(
        status=status,
        current_step=current_step_idx + 1,
        steps=existing_steps,
        state=state,
        approval_request=approval_obj,
        output_summary=(
            f"Step {current_step_idx + 1} ({tool_name.replace('_', ' ').title()}) executed. "
            + ("Human approval required before submitting application." if is_approval_step else "Proceeding with career preparation.")
        )
    )
