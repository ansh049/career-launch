import ApplicationEvent from "../models/ApplicationEvent.js";
import Application from "../models/Application.js";
import Job from "../models/Job.js";

/**
 * Record an application timeline event with actor and timestamp.
 */
export async function recordApplicationEvent({
  applicationId,
  actorId,
  eventType,
  fromStatus = null,
  toStatus = null,
  note = "",
}) {
  return ApplicationEvent.create({
    applicationId,
    actorId,
    eventType,
    fromStatus,
    toStatus,
    note,
    timestamp: new Date(),
  });
}

/**
 * Retrieve timeline events for an application with authorization checks.
 */
export async function getApplicationTimeline(applicationId, user) {
  const application = await Application.findById(applicationId).lean();
  if (!application) {
    const error = new Error("Application not found");
    error.status = 404;
    error.statusCode = 404;
    throw error;
  }

  const userId = String(user._id || user.id);
  const candidateId = String(
    application.candidate?._id || application.candidate || application.candidateId || ""
  );
  const jobId = application.job?._id || application.job || application.jobId;

  // Authorization: Candidate can view their own application; Recruiter can view applications for their jobs; Admin can view all
  if (user.role === "candidate" && candidateId !== userId) {
    const error = new Error("Unauthorized to access this application timeline");
    error.status = 403;
    error.statusCode = 403;
    throw error;
  }

  if (user.role === "recruiter") {
    const job = await Job.findById(jobId).lean();
    const recruiterId = String(
      job?.recruiter?._id || job?.recruiter || job?.recruiterId || ""
    );
    if (!job || recruiterId !== userId) {
      const error = new Error("Unauthorized: Recruiter does not own the associated job listing");
      error.status = 403;
      error.statusCode = 403;
      throw error;
    }
  }

  let events = await ApplicationEvent.find({ applicationId })
    .populate("actorId", "name role")
    .sort({ timestamp: 1 })
    .lean();

  // If no explicit events yet, provide a baseline submitted event from application metadata
  if (!events || events.length === 0) {
    events = [
      {
        _id: `init-${application._id}`,
        applicationId: application._id,
        eventType: "applied",
        fromStatus: null,
        toStatus: application.status || "submitted",
        note: "Application successfully submitted.",
        timestamp: application.createdAt || application.statusUpdatedAt || new Date(),
      },
    ];
  }

  return {
    application,
    events,
  };
}
