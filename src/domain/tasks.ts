import type { Application } from "./applications";
import type { Assessment, AssessmentStatus } from "./assessments";
import { seedEmailThreads, seedInboxItems } from "./inbox";
import type { Interview } from "./interviews";
import type { Job } from "./jobs";

export type TaskSourceModule = "Applications" | "Assessments" | "Inbox" | "Jobs";
export type TaskPriority = "Critical" | "High" | "Normal";
export type TaskStatus = "Open" | "Waiting on Others" | "Ready for Batch Review" | "Completed" | "Routed";
export type TaskView = "All Tasks" | "My Tasks" | "Critical" | "Today" | "Waiting on Others" | "Batch Review";
export type TaskActionKind = "complete" | "route";

export interface TaskAllowedAction {
  label: string;
  kind: TaskActionKind;
  targetStatus: TaskStatus;
}

export interface TaskRelatedObject {
  module: TaskSourceModule;
  id: string;
  label: string;
}

export interface RecruitingTask {
  id: string;
  title: string;
  sourceModule: TaskSourceModule;
  owner?: string;
  ownerRole?: string;
  priority: TaskPriority;
  status: TaskStatus;
  nextAction: string;
  dueAt?: string;
  slaState: "Ready" | "Today" | "Overdue" | "Blocked" | "Waiting";
  relatedObjects: TaskRelatedObject[];
  allowedActions: TaskAllowedAction[];
  aiRecommendation?: string;
  risk?: string;
  evidenceRefs?: string[];
  batchReview: boolean;
  completedAction?: string;
  completedBy?: string;
  completedAt?: string;
}

export type TaskCompletion = Pick<RecruitingTask, "id" | "status" | "completedAction" | "completedBy" | "completedAt">;

export function buildRecruitingTasks(input: { applications: Application[]; assessments: Assessment[]; jobs: Job[]; completions?: TaskCompletion[] }): RecruitingTask[] {
  const completions = new Map((input.completions ?? []).map((completion) => [completion.id, completion]));
  const tasks: RecruitingTask[] = [
    ...input.applications.map(applicationTask),
    ...input.applications.flatMap(interviewTasks),
    ...input.assessments.map(assessmentTask),
    ...seedInboxItems.map(inboxTask),
    ...seedEmailThreads.filter((thread) => thread.detectedType === "Assessment").map(assessmentEmailTask),
    ...input.jobs.filter((job) => job.blockedCount > 0 || job.status === "draft").map(jobTask)
  ];

  return tasks.map((task) => {
    const completion = completions.get(task.id);
    return completion ? { ...task, ...completion } : task;
  });
}

export function filterTasks(tasks: RecruitingTask[], view: TaskView, actor: { name: string; role: string }): RecruitingTask[] {
  if (view === "All Tasks") return tasks;
  if (view === "My Tasks") return tasks.filter((task) => task.owner === actor.name || task.ownerRole === actor.role);
  if (view === "Critical") return tasks.filter((task) => task.priority === "Critical");
  if (view === "Today") return tasks.filter((task) => task.slaState === "Today");
  if (view === "Waiting on Others") return tasks.filter((task) => task.status === "Waiting on Others");
  return tasks.filter((task) => task.batchReview);
}

export function completeTask(task: RecruitingTask, actionLabel: string, completedBy: string, completedAt = new Date().toISOString()): TaskCompletion {
  const action = task.allowedActions.find((item) => item.label === actionLabel) ?? task.allowedActions[0];
  return {
    id: task.id,
    status: action?.targetStatus ?? "Completed",
    completedAction: actionLabel,
    completedBy,
    completedAt
  };
}

function applicationTask(application: Application): RecruitingTask {
  return {
    id: `task-application-${application.id}`,
    title: application.currentOwner === "Founder" ? "Founder final interview approval" : `${application.candidateName} application next action`,
    sourceModule: "Applications",
    owner: application.currentOwner === "Founder" ? undefined : application.currentOwner,
    ownerRole: application.currentOwner === "Founder" ? "Founder" : "HR",
    priority: application.slaStatus === "Today" || application.slaStatus === "Overdue" ? "Critical" : "High",
    status: application.slaStatus === "Blocked" ? "Waiting on Others" : "Open",
    nextAction: application.nextAction,
    dueAt: application.dueAt,
    slaState: application.slaStatus,
    relatedObjects: [{ module: "Applications", id: application.id, label: `${application.candidateName} · ${application.jobTitle}` }],
    allowedActions: [{ label: application.currentOwner === "Founder" ? "Approve final interview" : "Complete next action", kind: "complete", targetStatus: "Completed" }],
    aiRecommendation: "Approve the final interview path and avoid adding extra assessment work.",
    risk: "Candidate has another offer timeline this week; delay may reduce close rate.",
    evidenceRefs: application.timeline.map((event) => event.title),
    batchReview: false
  };
}

function assessmentTask(assessment: Assessment): RecruitingTask {
  const state = assessmentTaskState(assessment.status);
  return {
    id: `task-assessment-${state.idSuffix}-${assessment.id}`,
    title: state.title(assessment),
    sourceModule: "Assessments",
    owner: state.ownerRole ? undefined : assessment.owner,
    ownerRole: state.ownerRole,
    priority: state.priority,
    status: state.status,
    nextAction: state.nextAction(assessment),
    dueAt: assessment.dueAt,
    slaState: state.slaState,
    relatedObjects: [
      { module: "Assessments", id: assessment.id, label: assessment.title },
      { module: "Applications", id: assessment.applicationId, label: `${assessment.candidateName} · ${assessment.jobTitle}` }
    ],
    allowedActions: state.allowedActions,
    aiRecommendation: assessment.aiReview?.stopRuleRecommendation ?? "Keep the follow-up minimal and preserve assessment evidence on the Application timeline.",
    risk: assessment.aiReview?.risk ?? "Candidate response can stall if HR adds process without clear evidence value.",
    evidenceRefs: assessment.evidenceEvents.map((event) => event.summary),
    batchReview: state.batchReview
  };
}

function interviewTasks(application: Application): RecruitingTask[] {
  return (application.interviews ?? [])
    .filter((interview) => ["Scheduling", "Scheduled", "Feedback Pending"].includes(interview.status))
    .map((interview) => interviewTask(application, interview));
}

function interviewTask(application: Application, interview: Interview): RecruitingTask {
  const feedbackPending = interview.status === "Feedback Pending";
  const scheduling = interview.status === "Scheduling";

  return {
    id: feedbackPending ? `task-interview-feedback-${interview.id}` : `task-interview-schedule-${interview.id}`,
    title: feedbackPending ? `${application.candidateName} interview feedback overdue` : `${application.candidateName} ${interview.interviewType} interview ${scheduling ? "scheduling" : "scheduled"}`,
    sourceModule: "Applications",
    owner: feedbackPending || !scheduling ? interview.interviewer : "HR",
    ownerRole: scheduling ? "HR" : "Interviewer",
    priority: feedbackPending ? "Critical" : "High",
    status: "Open",
    nextAction: feedbackPending ? `Submit interview feedback for ${application.candidateName}` : scheduling ? `Confirm interview time with ${application.candidateName}` : `Conduct ${interview.interviewType} interview`,
    dueAt: interview.scheduledStartAt,
    slaState: feedbackPending ? "Overdue" : "Today",
    relatedObjects: [
      { module: "Applications", id: application.id, label: `${application.candidateName} · ${application.jobTitle}` }
    ],
    allowedActions: [
      { label: feedbackPending ? "Submit feedback" : scheduling ? "Confirm schedule" : "Mark interview completed", kind: "complete", targetStatus: "Completed" }
    ],
    aiRecommendation: feedbackPending ? "Collect feedback before founder review uses interview evidence." : "Keep scheduling and interviewer ownership visible in Application context.",
    risk: feedbackPending ? "Missing interview feedback blocks evidence quality and should stay visible as risk work." : "Interview progress can drift if scheduling work stays only on the Application detail page.",
    evidenceRefs: application.timeline.filter((event) => event.eventType.startsWith("interview")).map((event) => event.title),
    batchReview: false
  };
}

function assessmentTaskState(status: AssessmentStatus): {
  allowedActions: TaskAllowedAction[];
  batchReview: boolean;
  idSuffix: string;
  nextAction: (assessment: Assessment) => string;
  ownerRole?: string;
  priority: TaskPriority;
  slaState: RecruitingTask["slaState"];
  status: TaskStatus;
  title: (assessment: Assessment) => string;
} {
  if (status === "Draft") {
    return {
      allowedActions: [{ label: "Mark ready to send", kind: "complete", targetStatus: "Completed" }],
      batchReview: true,
      idSuffix: "draft",
      nextAction: () => "Review assessment draft and rubric",
      priority: "Normal",
      slaState: "Ready",
      status: "Ready for Batch Review",
      title: (assessment) => `${assessment.candidateName} assessment draft review`
    };
  }
  if (status === "Ready to Send") {
    return {
      allowedActions: [{ label: "Send assessment", kind: "complete", targetStatus: "Completed" }],
      batchReview: false,
      idSuffix: "ready",
      nextAction: (assessment) => `Send assessment instructions to ${assessment.candidateName}`,
      priority: "High",
      slaState: "Today",
      status: "Open",
      title: (assessment) => `${assessment.candidateName} assessment ready to send`
    };
  }
  if (status === "Sent" || status === "Candidate Question") {
    return {
      allowedActions: [{ label: "Send reminder", kind: "route", targetStatus: "Routed" }],
      batchReview: false,
      idSuffix: "sent",
      nextAction: () => "Follow up for assessment submission",
      ownerRole: "Candidate",
      priority: "High",
      slaState: "Waiting",
      status: "Waiting on Others",
      title: () => "Assessment submission follow-up"
    };
  }
  if (status === "Submitted") {
    return {
      allowedActions: [{ label: "Parse submission", kind: "complete", targetStatus: "Completed" }],
      batchReview: true,
      idSuffix: "submission",
      nextAction: () => "Parse candidate submission package",
      priority: "High",
      slaState: "Today",
      status: "Ready for Batch Review",
      title: (assessment) => `${assessment.candidateName} assessment submission review`
    };
  }
  if (status === "Parsed") {
    return {
      allowedActions: [{ label: "Start AI review", kind: "complete", targetStatus: "Completed" }],
      batchReview: true,
      idSuffix: "review",
      nextAction: () => "Start AI assessment review",
      priority: "Normal",
      slaState: "Ready",
      status: "Ready for Batch Review",
      title: (assessment) => `${assessment.candidateName} assessment AI review`
    };
  }
  if (status === "Skipped by Stop Rule") {
    return {
      allowedActions: [{ label: "Confirm Stop Rule", kind: "complete", targetStatus: "Completed" }],
      batchReview: false,
      idSuffix: "stop-rule",
      nextAction: () => "Confirm Stop Rule on the Application timeline",
      ownerRole: "Founder",
      priority: "High",
      slaState: "Ready",
      status: "Open",
      title: (assessment) => `${assessment.candidateName} assessment stop-rule confirmation`
    };
  }
  return {
    allowedActions: [{ label: "Mark reviewed", kind: "complete", targetStatus: "Completed" }],
    batchReview: true,
    idSuffix: "calibration",
    nextAction: () => "Calibrate assessment result and stop-rule recommendation",
    priority: "Normal",
    slaState: "Ready",
    status: "Ready for Batch Review",
    title: (assessment) => `${assessment.candidateName} assessment review`
  };
}

function inboxTask(item: (typeof seedInboxItems)[number]): RecruitingTask {
  return {
    id: `task-inbox-${item.id}`,
    title: "Agency-forwarded duplicate review",
    sourceModule: "Inbox",
    ownerRole: "HR",
    priority: "Critical",
    status: "Ready for Batch Review",
    nextAction: item.recommendation,
    slaState: "Today",
    relatedObjects: [
      { module: "Inbox", id: item.id, label: item.title },
      { module: "Inbox", id: item.threadId, label: item.object }
    ],
    allowedActions: [
      { label: "Route to HR review", kind: "route", targetStatus: "Routed" },
      { label: "Complete duplicate review", kind: "complete", targetStatus: "Completed" }
    ],
    aiRecommendation: item.recommendation,
    risk: "Do not merge or create an Application until HR confirms the identity.",
    evidenceRefs: item.rawEvidence,
    batchReview: true
  };
}

function assessmentEmailTask(thread: (typeof seedEmailThreads)[number]): RecruitingTask {
  return {
    id: `task-email-${thread.id}`,
    title: "Assessment submission follow-up",
    sourceModule: "Assessments",
    ownerRole: "Candidate",
    priority: "High",
    status: "Waiting on Others",
    nextAction: "Wait for candidate submission package and attach parsed evidence",
    dueAt: "2026-07-29T10:00:00.000Z",
    slaState: "Waiting",
    relatedObjects: [
      { module: "Inbox", id: thread.id, label: thread.subject },
      { module: "Assessments", id: "assessment-email-follow-up", label: thread.aiAction }
    ],
    allowedActions: [{ label: "Send reminder", kind: "route", targetStatus: "Routed" }],
    aiRecommendation: "Keep the thread linked as assessment evidence once the package is parsed.",
    risk: "Submission artifacts can remain detached from the Application timeline if HR does not route the follow-up.",
    evidenceRefs: [thread.subject, thread.sender, thread.aiAction],
    batchReview: false
  };
}

function jobTask(job: Job): RecruitingTask {
  return {
    id: `task-job-${job.id}`,
    title: `${job.title} workflow defaults`,
    sourceModule: "Jobs",
    owner: job.owner,
    ownerRole: "HR",
    priority: job.priority === "urgent" ? "Critical" : "High",
    status: job.status === "draft" ? "Open" : "Waiting on Others",
    nextAction: job.status === "draft" ? "Confirm owner, SLA, and scorecard defaults" : "Clear workflow blocker",
    dueAt: job.updatedAt,
    slaState: job.blockedCount > 0 ? "Blocked" : "Ready",
    relatedObjects: [{ module: "Jobs", id: job.id, label: job.title }],
    allowedActions: [{ label: "Route workflow setup", kind: "route", targetStatus: "Routed" }],
    aiRecommendation: "Resolve workflow defaults before this role receives more automated intake.",
    risk: `${job.blockedCount} workflow gaps can create downstream owner and SLA drift.`,
    evidenceRefs: job.scorecard,
    batchReview: false
  };
}
