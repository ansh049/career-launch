import {
  startInterviewSession,
  getInterviewSession,
  submitInterviewAnswer,
  finishInterviewSession,
  listUserInterviewHistory,
} from "../services/interview.service.js";

export async function handleStartSession(req, res, next) {
  try {
    const { jobId, role, interviewType, difficulty } = req.body;
    if (!role && !jobId) {
      return res.status(400).json({
        success: false,
        message: "Target role or jobId is required to start mock interview",
      });
    }

    const session = await startInterviewSession({
      userId: req.user._id,
      jobId,
      role,
      interviewType,
      difficulty,
    });

    res.status(201).json({
      success: true,
      message: "AI mock interview session initiated",
      session,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleGetSession(req, res, next) {
  try {
    const session = await getInterviewSession(req.user._id, req.params.id);
    res.json({ success: true, session });
  } catch (error) {
    next(error);
  }
}

export async function handleSubmitAnswer(req, res, next) {
  try {
    const { questionId, answer } = req.body;
    if (!questionId || !answer) {
      return res.status(400).json({
        success: false,
        message: "questionId and answer text are required",
      });
    }

    const result = await submitInterviewAnswer({
      userId: req.user._id,
      sessionId: req.params.id,
      questionId,
      answer,
    });

    res.json({
      success: true,
      message: "Answer evaluated and saved",
      evaluation: result.evaluation,
      session: result.session,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleFinishSession(req, res, next) {
  try {
    const session = await finishInterviewSession(req.user._id, req.params.id);
    res.json({
      success: true,
      message: "Interview session concluded and rubrics finalized",
      session,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleGetHistory(req, res, next) {
  try {
    const history = await listUserInterviewHistory(req.user._id);
    res.json({ success: true, history });
  } catch (error) {
    next(error);
  }
}
