import type { Application } from "./applications";
import type { Assessment, AssessmentStatus } from "./assessments";
import { seedAiActions, seedDuplicateSignals, seedEmailThreads, seedInboxItems } from "./inbox";
import type { Interview } from "./interviews";
import type { Job } from "./jobs";

export type TaskSourceModule = "Applications" | "Assessments" | "Inbox" | "Jobs" | "Candidates" | "Settings";
export type TaskPriority = "Critical" | "High" | "Normal";
export type TaskStatus = "Open" | "Waiting on Others" | "Ready for Batch Review" | "Completed" | "Routed";
export type TaskView = "All Tasks" | "My Tasks" | "Critical" | "Today" | "Waiting on Others" | "Batch Review";
export type TaskActionKind = "complete" | "route";
export type AiAutomationLevel = "L1" | "L2" | "L3" | "L4";

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
  slaState: "Ready" | "Today" | "Overdue" | "Blocked" | "Waiting" | "Missing";
  relatedObjects: TaskRelatedObject[];
  allowedActions: TaskAllowedAction[];
  aiRecommendation?: string;
  aiAutomationLevel?: AiAutomationLevel;
  aiApprovalRequired?: boolean;
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
    ...input.applications.flatMap(applicationTasks),
    ...input.applications.flatMap(interviewTasks),
    founderOfferRiskTask(),
    ...input.assessments.map(assessmentTask),
    ...seedInboxItems.map(inboxTask),
    ...seedEmailThreads.filter((thread) => thread.status === "needs_review" || thread.confidence < 0.75).map(lowConfidenceInboxTask),
    ...seedDuplicateSignals.filter((signal) => signal.status === "review").map(duplicateReviewTask),
    ...seedAiActions.filter((action) => action.status === "pending_approval").map(aiActionApprovalTask),
    ...seedEmailThreads.filter((thread) => thread.detectedType === "Assessment").map(assessmentEmailTask),
    ...input.jobs.filter((job) => job.blockedCount > 0 || job.status === "draft").map(jobTask),
    settingsAlertTask(),
    sensitiveCandidateMergeTask(),
    sensitiveOfferDecisionTask()
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

export function filterFounderTasks(tasks: RecruitingTask[]): RecruitingTask[] {
  return tasks.filter((task) => task.ownerRole === "Founder" && (task.sourceModule === "Applications" || task.sourceModule === "Settings"));
}

export function filterSettingsGovernanceTasks(tasks: RecruitingTask[]): RecruitingTask[] {
  return tasks.filter((task) => task.sourceModule === "Settings" || (task.aiApprovalRequired && task.ownerRole === "HR Admin"));
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

function applicationTasks(application: Application): RecruitingTask[] {
  return [
    applicationTask(application),
    ...applicationRiskTasks(application)
  ];
}

function applicationTask(application: Application): RecruitingTask {
  const owner = application.currentOwner.trim();
  const nextAction = application.nextAction.trim();

  return {
    id: `task-application-${application.id}`,
    title: owner === "Founder" ? "Founder final interview approval" : `${application.candidateName} application next action`,
    sourceModule: "Applications",
    owner: owner && owner !== "Founder" ? owner : undefined,
    ownerRole: owner === "Founder" ? "Founder" : "HR",
    priority: application.slaStatus === "Today" || application.slaStatus === "Overdue" ? "Critical" : "High",
    status: application.slaStatus === "Blocked" ? "Waiting on Others" : "Open",
    nextAction: nextAction || "Define the next Application action",
    dueAt: application.dueAt || undefined,
    slaState: application.slaStatus,
    relatedObjects: applicationRelatedObjects(application),
    allowedActions: owner === "Founder" ? [
      { label: "Continue", kind: "complete", targetStatus: "Completed" },
      { label: "Request More Evidence", kind: "route", targetStatus: "Routed" },
      { label: "Final Interview", kind: "complete", targetStatus: "Completed" },
      { label: "Reject", kind: "complete", targetStatus: "Completed" },
      { label: "Offer Decision", kind: "complete", targetStatus: "Completed" }
    ] : [{ label: "Complete next action", kind: "complete", targetStatus: "Completed" }],
    aiRecommendation: "Approve the final interview path and avoid adding extra assessment work.",
    aiAutomationLevel: owner === "Founder" ? "L4" : "L2",
    aiApprovalRequired: owner === "Founder",
    risk: "Candidate has another offer timeline this week; delay may reduce close rate.",
    evidenceRefs: application.timeline.map((event) => event.title),
    batchReview: false
  };
}

function applicationRiskTasks(application: Application): RecruitingTask[] {
  const risks: RecruitingTask[] = [];
  const owner = application.currentOwner.trim();
  const nextAction = application.nextAction.trim();
  const dueAt = application.dueAt.trim();

  if (!owner) {
    risks.push(applicationRiskTask(application, "missing-owner", `Missing owner for ${application.candidateName}`, "Assign an Application owner", "Missing owner can leave the Application without accountable next movement.", undefined, "Missing"));
  }
  if (!nextAction) {
    risks.push(applicationRiskTask(application, "missing-next-action", `Missing next action for ${application.candidateName}`, "Define the next Application action", "Missing next action makes the Application hard to execute from Tasks or Applications.", owner || undefined, "Missing"));
  }
  if (!dueAt) {
    risks.push(applicationRiskTask(application, "missing-due-date", `Missing due date for ${application.candidateName}`, "Set a due date for the Application next action", "Missing due date prevents SLA filtering and overdue detection.", owner || undefined, "Missing"));
  }
  if (application.slaStatus === "Overdue") {
    risks.push(applicationRiskTask(application, "overdue", `Overdue application for ${application.candidateName}`, nextAction || "Recover the overdue Application workflow", "Overdue Application work should be visible in the central Task queue before it blocks the pipeline.", owner || undefined, "Overdue", dueAt || undefined));
  }

  return risks;
}

function applicationRiskTask(
  application: Application,
  riskId: string,
  title: string,
  nextAction: string,
  risk: string,
  owner: string | undefined,
  slaState: RecruitingTask["slaState"],
  dueAt?: string
): RecruitingTask {
  return {
    id: `task-application-risk-${riskId}-${application.id}`,
    title,
    sourceModule: "Applications",
    owner,
    ownerRole: owner ? "HR" : "Process Owner",
    priority: "Critical",
    status: application.slaStatus === "Blocked" ? "Waiting on Others" : "Open",
    nextAction,
    dueAt,
    slaState,
    relatedObjects: applicationRelatedObjects(application),
    allowedActions: [
      { label: "Resolve Application risk", kind: "complete", targetStatus: "Completed" },
      { label: "Route Application risk", kind: "route", targetStatus: "Routed" }
    ],
    aiRecommendation: "Repair owner, next action, and due date before the Application moves to the next stage.",
    risk,
    evidenceRefs: application.timeline.map((event) => event.title),
    batchReview: false
  };
}

function applicationRelatedObjects(application: Application): TaskRelatedObject[] {
  return [
    { module: "Candidates", id: application.candidateId, label: application.candidateName },
    { module: "Jobs", id: application.jobId, label: application.jobTitle },
    { module: "Applications", id: application.id, label: `${application.candidateName} · ${application.jobTitle}` }
  ];
}

function founderOfferRiskTask(): RecruitingTask {
  return {
    id: "task-founder-offer-risk",
    title: "Founder offer decision risk",
    sourceModule: "Applications",
    ownerRole: "Founder",
    priority: "Critical",
    status: "Open",
    nextAction: "Human-confirm offer decision",
    dueAt: "2026-07-28T18:00:00.000Z",
    slaState: "Today",
    relatedObjects: [{ module: "Applications", id: "application-trang-backend", label: "Trang Nguyen · Senior Backend Engineer" }],
    allowedActions: [
      { label: "Request More Evidence", kind: "route", targetStatus: "Routed" },
      { label: "Reject", kind: "complete", targetStatus: "Completed" },
      { label: "Offer Decision", kind: "complete", targetStatus: "Completed" }
    ],
    aiRecommendation: "Keep the offer decision with the Founder because the evidence packet includes sensitive decision and compensation context.",
    aiAutomationLevel: "L4",
    aiApprovalRequired: true,
    risk: "Offer decision, rejection, and compensation-sensitive writebacks must remain human-confirmed and auditable.",
    evidenceRefs: ["Moved to Founder Review", "Assessment evidence attached", "Offer decision approval required"],
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
      { module: "Inbox", id: item.threadId, label: item.object },
      { module: "Inbox", id: item.aiActionId, label: "AI Action review" }
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

function lowConfidenceInboxTask(thread: (typeof seedEmailThreads)[number]): RecruitingTask {
  return {
    id: `task-inbox-low-confidence-${thread.id}`,
    title: `Low-confidence inbox review: ${thread.subject}`,
    sourceModule: "Inbox",
    ownerRole: "HR",
    priority: "Critical",
    status: "Ready for Batch Review",
    nextAction: "Review ambiguous email intake before Candidate or Application write-back",
    slaState: "Today",
    relatedObjects: [{ module: "Inbox", id: thread.id, label: thread.subject }],
    allowedActions: [
      { label: "Complete inbox review", kind: "complete", targetStatus: "Completed" },
      { label: "Route inbox review", kind: "route", targetStatus: "Routed" }
    ],
    aiRecommendation: thread.aiAction,
    risk: "Low confidence intake should remain in Inbox while also appearing in Tasks for HR review.",
    evidenceRefs: [thread.sender, thread.detectedType, `${Math.round(thread.confidence * 100)}% confidence`, thread.jobMatch],
    batchReview: true
  };
}

function duplicateReviewTask(signal: (typeof seedDuplicateSignals)[number]): RecruitingTask {
  return {
    id: `task-inbox-duplicate-${signal.id}`,
    title: `Duplicate review: ${signal.candidateLabel}`,
    sourceModule: "Inbox",
    ownerRole: "HR",
    priority: "Critical",
    status: "Ready for Batch Review",
    nextAction: "Compare duplicate evidence before any Candidate merge or Application assignment",
    slaState: "Today",
    relatedObjects: [{ module: "Inbox", id: signal.id, label: signal.candidateLabel }],
    allowedActions: [
      { label: "Complete duplicate review", kind: "complete", targetStatus: "Completed" },
      { label: "Route duplicate review", kind: "route", targetStatus: "Routed" }
    ],
    aiRecommendation: signal.matchReason,
    risk: "Duplicate review must preserve Candidate identity separation until HR confirms the record.",
    evidenceRefs: signal.evidence,
    batchReview: true
  };
}

function aiActionApprovalTask(action: (typeof seedAiActions)[number]): RecruitingTask {
  return {
    id: `task-inbox-ai-action-${action.id}`,
    title: `AI Action approval: ${action.actionType}`,
    sourceModule: "Inbox",
    ownerRole: "HR Admin",
    priority: "Critical",
    status: "Ready for Batch Review",
    nextAction: "Approve or route the sensitive AI action before write-back",
    slaState: "Today",
    relatedObjects: [
      ...action.inputRefs.map((ref) => ({ module: "Inbox" as const, id: ref, label: ref })),
      { module: "Inbox", id: action.id, label: `${action.actionType} AI Action` }
    ],
    allowedActions: [
      { label: "Approve AI action", kind: "complete", targetStatus: "Completed" },
      { label: "Route AI action for review", kind: "route", targetStatus: "Routed" }
    ],
    aiRecommendation: action.outputSummary,
    aiAutomationLevel: "L3",
    aiApprovalRequired: true,
    risk: "Sensitive or medium-confidence AI write-back requires a human approval task.",
    evidenceRefs: [...action.evidenceRefs, `${Math.round(action.confidence * 100)}% confidence`],
    batchReview: true
  };
}

function settingsAlertTask(): RecruitingTask {
  return {
    id: "task-settings-governance-defaults",
    title: "Review SLA defaults and automation levels",
    sourceModule: "Settings",
    ownerRole: "HR Admin",
    priority: "Normal",
    status: "Open",
    nextAction: "Confirm SLA defaults and automation levels",
    slaState: "Ready",
    relatedObjects: [{ module: "Settings", id: "settings-governance", label: "Status, SLA, and AI governance" }],
    allowedActions: [{ label: "Confirm governance defaults", kind: "complete", targetStatus: "Completed" }],
    aiRecommendation: "Keep SLA defaults and L1-L4 approval levels visible where Settings owns governance.",
    aiAutomationLevel: "L2",
    aiApprovalRequired: false,
    risk: "Missing defaults make blocked detection and approval routing unreliable.",
    evidenceRefs: ["Founder decision 48h", "Pending approval 24h", "Automation L1-L4"],
    batchReview: false
  };
}

function sensitiveCandidateMergeTask(): RecruitingTask {
  return {
    id: "task-ai-candidate-merge",
    title: "Approve AI candidate merge writeback",
    sourceModule: "Inbox",
    ownerRole: "HR Admin",
    priority: "High",
    status: "Ready for Batch Review",
    nextAction: "Approve or reject candidate merge",
    slaState: "Today",
    relatedObjects: [
      { module: "Inbox", id: "ai-agency-match", label: "Candidate merge approval" },
      { module: "Inbox", id: "inbox-agency-forward", label: "Agency-forwarded profile" }
    ],
    allowedActions: [
      { label: "Approve AI writeback", kind: "complete", targetStatus: "Completed" },
      { label: "Reject AI writeback", kind: "complete", targetStatus: "Completed" }
    ],
    aiRecommendation: "Approve only after HR confirms candidate identity and job match.",
    aiAutomationLevel: "L3",
    aiApprovalRequired: true,
    risk: "Wrong merge could pollute two candidate histories.",
    evidenceRefs: ["Phone number matches an existing backend profile", "Identity confidence 72%", "Agency source differs"],
    batchReview: true
  };
}

function sensitiveOfferDecisionTask(): RecruitingTask {
  return {
    id: "task-ai-offer-decision",
    title: "Confirm offer decision writeback",
    sourceModule: "Settings",
    ownerRole: "HR Admin",
    priority: "Critical",
    status: "Open",
    nextAction: "Human-confirm offer decision",
    slaState: "Today",
    relatedObjects: [{ module: "Settings", id: "offer-decision-policy", label: "Offer decision writeback policy" }],
    allowedActions: [
      { label: "Reject AI writeback", kind: "complete", targetStatus: "Completed" },
      { label: "Offer Decision", kind: "complete", targetStatus: "Completed" }
    ],
    aiRecommendation: "Never auto-apply offer decisions; keep final writeback human-confirmed.",
    aiAutomationLevel: "L4",
    aiApprovalRequired: true,
    risk: "Offer decisions must stay human-confirmed and auditable.",
    evidenceRefs: ["Offer decision", "Sensitive candidate communication", "Human approval required"],
    batchReview: false
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
