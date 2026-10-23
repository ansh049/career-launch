import {
  createCopilotSession,
  getCopilotSessionById,
  listCandidateSessions,
  updateSuggestionStatus,
  exportTailoredResume,
} from "../services/resumeCopilot.service.js";

export async function handleCreateSession(req, res, next) {
  try {
    const { jobId } = req.body;
    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: "jobId is required to start a tailoring session",
      });
    }

    const session = await createCopilotSession(req.user._id, jobId);
    res.status(201).json({
      success: true,
      message: "Resume Copilot tailoring session initialized",
      session,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleGetSessionById(req, res, next) {
  try {
    const session = await getCopilotSessionById(req.user._id, req.params.id);
    res.json({ success: true, session });
  } catch (error) {
    next(error);
  }
}

export async function handleListSessions(req, res, next) {
  try {
    const sessions = await listCandidateSessions(req.user._id);
    res.json({ success: true, sessions });
  } catch (error) {
    next(error);
  }
}

export async function handleUpdateSuggestion(req, res, next) {
  try {
    const { status, editedText } = req.body;
    const session = await updateSuggestionStatus(
      req.user._id,
      req.params.id,
      req.params.suggestionId,
      { status, editedText }
    );

    res.json({
      success: true,
      message: "Suggestion status updated",
      session,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleExport(req, res, next) {
  try {
    const result = await exportTailoredResume(req.user._id, req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
}
