import {
  getCandidateAnalytics,
  getRecruiterAnalytics,
  getMarketAnalytics,
} from "../services/analytics.service.js";

export async function candidateAnalytics(req, res, next) {
  try {
    const data = await getCandidateAnalytics(req.user._id);
    res.json({ success: true, analytics: data });
  } catch (error) {
    next(error);
  }
}

export async function recruiterAnalytics(req, res, next) {
  try {
    const data = await getRecruiterAnalytics(req.user._id);
    res.json({ success: true, analytics: data });
  } catch (error) {
    next(error);
  }
}

export async function marketAnalytics(req, res, next) {
  try {
    const { role, limit = 20 } = req.query;
    const data = await getMarketAnalytics({ role, limit: Math.min(parseInt(limit) || 20, 50) });
    res.json({ success: true, analytics: data });
  } catch (error) {
    next(error);
  }
}
