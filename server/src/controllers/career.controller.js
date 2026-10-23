import {
  performSkillGapAnalysis,
  generateRoadmap,
  getCandidateRoadmaps,
  getCandidateRoadmapById,
  updateMilestoneStatus,
} from "../services/career.service.js";

export async function handleGapAnalysis(req, res, next) {
  try {
    const { targetRole, targetJobId, targetSkills } = req.body;
    const analysis = await performSkillGapAnalysis({
      userId: req.user._id,
      targetRole,
      targetJobId,
      targetSkills,
    });
    res.json({ success: true, analysis });
  } catch (error) {
    next(error);
  }
}

export async function handleCreateRoadmap(req, res, next) {
  try {
    const { targetRole, targetJobId, targetSkills, currentLevel } = req.body;
    if (!targetRole && !targetJobId) {
      return res.status(400).json({
        success: false,
        message: "targetRole or targetJobId is required",
      });
    }

    const roadmap = await generateRoadmap({
      userId: req.user._id,
      targetRole,
      targetJobId,
      targetSkills,
      currentLevel,
    });

    res.status(201).json({
      success: true,
      message: "Career roadmap generated successfully",
      roadmap,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleGetRoadmaps(req, res, next) {
  try {
    const roadmaps = await getCandidateRoadmaps(req.user._id);
    res.json({ success: true, roadmaps });
  } catch (error) {
    next(error);
  }
}

export async function handleGetRoadmapById(req, res, next) {
  try {
    const roadmap = await getCandidateRoadmapById(req.user._id, req.params.id);
    res.json({ success: true, roadmap });
  } catch (error) {
    next(error);
  }
}

export async function handleUpdateMilestone(req, res, next) {
  try {
    const { status } = req.body;
    if (!["not_started", "in_progress", "completed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be 'not_started', 'in_progress', or 'completed'",
      });
    }

    const roadmap = await updateMilestoneStatus(
      req.user._id,
      req.params.id,
      req.params.milestoneId,
      status
    );

    res.json({
      success: true,
      message: "Milestone status updated successfully",
      roadmap,
    });
  } catch (error) {
    next(error);
  }
}
