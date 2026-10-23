import Application from "../models/Application.js";
import InterviewSession from "../models/InterviewSession.js";
import CareerRoadmap from "../models/CareerRoadmap.js";
import Job from "../models/Job.js";
import User from "../models/User.js";
import ApplicationEvent from "../models/ApplicationEvent.js";

/**
 * Candidate analytics: application pipeline metrics + progress metrics.
 */
export async function getCandidateAnalytics(userId) {
  const [applications, interviewSessions, roadmaps] = await Promise.all([
    Application.find({ candidate: userId })
      .populate("job", "title company")
      .lean(),
    InterviewSession.find({ userId }).lean(),
    CareerRoadmap.find({ userId }).lean(),
  ]);

  const total = applications.length;
  const byStatus = applications.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {});

  const reviewed = (byStatus.reviewing || 0) + (byStatus.shortlisted || 0) +
    (byStatus.rejected || 0) + (byStatus.accepted || 0);

  const responseRate = total > 0 ? Math.round((reviewed / total) * 100) : 0;
  const interviewRate = total > 0
    ? Math.round(((byStatus.shortlisted || 0) + (byStatus.accepted || 0)) / total * 100)
    : 0;

  // Applications over time (last 90 days, bucketed by week)
  const now = new Date();
  const ninetyDaysAgo = new Date(now - 90 * 24 * 60 * 60 * 1000);
  const recentApps = applications.filter(a => new Date(a.createdAt) >= ninetyDaysAgo);

  // Interview practice metrics
  const completedInterviews = interviewSessions.filter(s => s.status === "completed").length;
  const avgInterviewScore = interviewSessions.length > 0
    ? Math.round(
        interviewSessions
          .filter(s => s.overallScore != null)
          .reduce((sum, s) => sum + (s.overallScore || 0), 0) /
          Math.max(1, interviewSessions.filter(s => s.overallScore != null).length)
      )
    : 0;

  // Roadmap progress
  const activeRoadmaps = roadmaps.filter(r => r.status === "active").length;
  const totalMilestones = roadmaps.reduce((s, r) => s + (r.milestones?.length || 0), 0);
  const completedMilestones = roadmaps.reduce(
    (s, r) => s + (r.milestones?.filter(m => m.status === "completed").length || 0),
    0
  );
  const roadmapProgress = totalMilestones > 0
    ? Math.round((completedMilestones / totalMilestones) * 100)
    : 0;

  return {
    applications: {
      total,
      byStatus,
      responseRate,
      interviewRate,
      recent: recentApps.length,
    },
    interviews: {
      total: interviewSessions.length,
      completed: completedInterviews,
      avgScore: avgInterviewScore,
    },
    roadmaps: {
      active: activeRoadmaps,
      totalMilestones,
      completedMilestones,
      progressPercent: roadmapProgress,
    },
    dataNote: `Analytics based on ${total} application(s) and ${interviewSessions.length} interview session(s) on this platform.`,
  };
}

/**
 * Recruiter analytics: funnel metrics for jobs owned by a recruiter.
 */
export async function getRecruiterAnalytics(recruiterId) {
  const jobs = await Job.find({ postedBy: recruiterId }).lean();
  const jobIds = jobs.map(j => j._id);

  if (!jobIds.length) {
    return {
      jobs: { total: 0, active: 0 },
      applications: { total: 0, byStatus: {} },
      conversionRate: 0,
      dataNote: "No jobs posted yet.",
    };
  }

  const applications = await Application.find({ job: { $in: jobIds } }).lean();
  const total = applications.length;
  const byStatus = applications.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {});

  const shortlisted = (byStatus.shortlisted || 0) + (byStatus.accepted || 0);
  const conversionRate = total > 0 ? Math.round((shortlisted / total) * 100) : 0;

  const activeJobs = jobs.filter(j => j.status === "published").length;

  return {
    jobs: { total: jobs.length, active: activeJobs },
    applications: { total, byStatus },
    conversionRate,
    topJobs: jobs
      .map(j => ({
        id: j._id,
        title: j.title,
        company: j.company,
        applicationCount: applications.filter(a => String(a.job) === String(j._id)).length,
      }))
      .sort((a, b) => b.applicationCount - a.applicationCount)
      .slice(0, 5),
    dataNote: `Analytics based on ${total} application(s) across ${jobs.length} job listing(s) on this platform.`,
  };
}

/**
 * Market analytics: aggregate skill demand from published job listings.
 * This is computed in real-time from current live postings.
 */
export async function getMarketAnalytics({ role, limit = 20 } = {}) {
  const query = { status: "published" };
  if (role) {
    query.$or = [
      { title: { $regex: role, $options: "i" } },
      { experienceLevel: role },
    ];
  }

  const jobs = await Job.find(query).select("title skills jobType location experienceLevel").lean();

  if (!jobs.length) {
    return {
      topSkills: [],
      totalJobsAnalyzed: 0,
      dataNote: "No published job listings available for analysis.",
    };
  }

  // Aggregate skill frequency
  const skillCounts = {};
  for (const job of jobs) {
    for (const skill of (job.skills || [])) {
      const normalized = skill.toLowerCase().trim();
      if (normalized) skillCounts[normalized] = (skillCounts[normalized] || 0) + 1;
    }
  }

  const topSkills = Object.entries(skillCounts)
    .map(([skill, count]) => ({
      skill,
      count,
      frequency: Math.round((count / jobs.length) * 100) / 100,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);

  // Job type breakdown
  const jobTypeBreakdown = jobs.reduce((acc, j) => {
    if (j.jobType) acc[j.jobType] = (acc[j.jobType] || 0) + 1;
    return acc;
  }, {});

  // Experience level breakdown
  const experienceBreakdown = jobs.reduce((acc, j) => {
    if (j.experienceLevel) acc[j.experienceLevel] = (acc[j.experienceLevel] || 0) + 1;
    return acc;
  }, {});

  return {
    topSkills,
    jobTypeBreakdown,
    experienceBreakdown,
    totalJobsAnalyzed: jobs.length,
    sampleSize: jobs.length,
    dataNote: `Based on ${jobs.length} currently published listing(s). Not representative of the broader labor market.`,
  };
}
