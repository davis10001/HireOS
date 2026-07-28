import type { Application } from "./applications";
import type { Assessment } from "./assessments";
import { seedEmailThreads, seedInboxItems } from "./inbox";
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
  return {
    id: `task-assessment-${assessment.id}`,
    title: assessment.status === "Sent" ? "Assessment submission follow-up" : `${assessment.candidateName} assessment review`,
    sourceModule: "Assessments",
    owner: assessment.status === "Sent" ? undefined : assessment.owner,
    ownerRole: assessment.status === "Sent" ? "Candidate" : "HR",
    priority: assessment.status === "Sent" ? "High" : "Normal",
    status: assessment.status === "Sent" ? "Waiting on Others" : "Ready for Batch Review",
    nextAction: assessment.status === "Sent" ? "Wait for candidate submission" : "Review rubric evidence",
    dueAt: assessment.dueAt,
    slaState: assessment.status === "Sent" ? "Waiting" : "Ready",
    relatedObjects: [
      { module: "Assessments", id: assessment.id, label: assessment.title },
      { module: "Applications", id: assessment.applicationId, label: `${assessment.candidateName} · ${assessment.jobTitle}` }
    ],
    allowedActions: [
      { label: "Send reminder", kind: "route", targetStatus: "Routed" },
      { label: "Mark reviewed", kind: "complete", targetStatus: "Completed" }
    ],
    aiRecommendation: assessment.aiReview?.stopRuleRecommendation ?? "Keep the follow-up minimal and preserve assessment evidence on the Application timeline.",
    risk: assessment.aiReview?.risk ?? "Candidate response can stall if HR adds process without clear evidence value.",
    evidenceRefs: assessment.evidenceEvents.map((event) => event.summary),
    batchReview: assessment.status !== "Sent"
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
