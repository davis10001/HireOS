import { Application, ApplicationTimelineEvent } from "./applications";
import { slugify } from "./ids";
import { Job } from "./jobs";

export type AssessmentStatus =
  | "Draft"
  | "Ready to Send"
  | "Sent"
  | "Candidate Question"
  | "Submitted"
  | "Parsed"
  | "In Review"
  | "Calibrate"
  | "Complete"
  | "Skipped by Stop Rule"
  | "Cancelled";

export type AssessmentSubmissionStatus = "Pending" | "Parsed" | "Failed";
export type EvidenceApprovalStatus = "Auto" | "Pending" | "Approved" | "Rejected";
export type EvidenceSourceType = "Email" | "Attachment" | "Form" | "AI" | "User" | "System";

export interface RubricCriterion {
  name: string;
  description: string;
  weight: number;
  passThreshold: string;
}

export interface AssessmentDraft {
  applicationId: string;
  candidateName: string;
  jobId: string;
  jobTitle: string;
  title: string;
  purpose: string;
  prompt: string;
  rubric: RubricCriterion[];
  owner: string;
  dueAt: string;
  createdBy: string;
}

export interface AssessmentSubmission {
  id: string;
  assessmentId: string;
  emailThreadId: string;
  submittedAt: string;
  attachments: string[];
  parsedStatus: AssessmentSubmissionStatus;
  version: string;
}

export interface AssessmentAiReview {
  rubricMatch: number;
  evidence: string;
  risk: string;
  confidence: "Low" | "Medium" | "High";
  stopRuleRecommendation: string;
}

export interface AssessmentEvidenceEvent {
  id: string;
  applicationId: string;
  assessmentId: string;
  eventType:
    | "assessment_sent"
    | "assessment_submission"
    | "ai_assessment_review"
    | "assessment_stop_rule"
    | "assessment_completed";
  sourceType: EvidenceSourceType;
  summary: string;
  confidence?: number;
  approvalStatus: EvidenceApprovalStatus;
  createdAt: string;
}

export interface Assessment {
  id: string;
  applicationId: string;
  candidateName: string;
  jobId: string;
  jobTitle: string;
  title: string;
  purpose: string;
  prompt: string;
  rubric: RubricCriterion[];
  owner: string;
  dueAt: string;
  status: AssessmentStatus;
  sentEmailThreadId?: string;
  submissions: AssessmentSubmission[];
  aiReview?: AssessmentAiReview;
  evidenceEvents: AssessmentEvidenceEvent[];
  timelineEvents: ApplicationTimelineEvent[];
  calibrationNote?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export const seedAssessments: Assessment[] = [
  createAssessment({
    applicationId: "application-minh-investment-associate",
    candidateName: "Minh Anh Vo",
    jobId: "job-investment-associate",
    jobTitle: "Strategic Investment Associate",
    title: "Minh Anh Vo · Investment memo case",
    purpose: "Close evidence gaps on market judgment, valuation quality, and English investment memo writing.",
    prompt: "Review a Vietnam fintech target, build a concise valuation view, and draft a founder-ready investment recommendation.",
    rubric: [
      { name: "Investment judgment", description: "Market size, competitive position, and downside risks", weight: 40, passThreshold: "Strong evidence" },
      { name: "Modeling discipline", description: "Assumptions, sensitivity checks, and valuation range", weight: 35, passThreshold: "Meets bar" },
      { name: "Memo clarity", description: "Concise English memo suitable for founder review", weight: 25, passThreshold: "Readable by HR and founder" }
    ],
    owner: "Linh Tran",
    dueAt: "2026-07-28T16:00:00.000Z",
    createdBy: "Linh Tran"
  }),
  {
    ...createAssessment({
      applicationId: "application-sophia-finance-director",
      candidateName: "Sophia Chen",
      jobId: "job-finance-director",
      jobTitle: "Finance Director",
      title: "Sophia Chen · Finance operating plan",
      purpose: "Stop additional assessment because interviews and board memo evidence already cover the scorecard.",
      prompt: "Summarize a 90-day finance operating plan for cash reporting, close cadence, and board materials.",
      rubric: [
        { name: "Cash planning", description: "Weekly cash visibility and controls", weight: 35, passThreshold: "Strong evidence" },
        { name: "Close cadence", description: "Month-end accountability and reporting hygiene", weight: 30, passThreshold: "Meets bar" },
        { name: "Board communication", description: "Clear executive narrative and risks", weight: 35, passThreshold: "Strong evidence" }
      ],
      owner: "Linh Tran",
      dueAt: "2026-07-28T11:00:00.000Z",
      createdBy: "Linh Tran"
	    }),
	    id: "assessment-sophia-stop-rule",
	    status: "Skipped by Stop Rule",
    aiReview: {
      rubricMatch: 91,
      evidence: "Founder interview, board memo sample, and reference call already cover the scorecard.",
      risk: "Additional assessment may weaken close rate while the candidate has a competing offer.",
      confidence: "High",
      stopRuleRecommendation: "Skip additional assessment"
    },
    evidenceEvents: [
      {
        id: "evidence-sophia-stop-rule",
        applicationId: "application-sophia-finance-director",
        assessmentId: "assessment-sophia-stop-rule",
        eventType: "assessment_stop_rule",
        sourceType: "User",
        summary: "Stop rule accepted after full finalist evidence packet.",
        confidence: 91,
        approvalStatus: "Approved",
        createdAt: "2026-07-28T06:00:00.000Z"
      }
    ]
  }
];

export function buildAssessmentDraft(application: Application, job: Job, owner: string): AssessmentDraft {
  const scorecard = job.scorecard.length ? job.scorecard : ["Scorecard criterion"];
  return {
    applicationId: application.id,
    candidateName: application.candidateName,
    jobId: job.id,
    jobTitle: job.title,
    title: `${application.candidateName} · ${job.title} assessment`,
    purpose: "Close scorecard evidence gaps with the smallest useful assignment.",
    prompt: `Use ${job.title} context to produce evidence for: ${scorecard.join(", ")}.`,
    rubric: scorecard.slice(0, 3).map((criterion, index) => ({
      name: criterion.replace(/^AI generated scorecard:\s*/i, ""),
      description: `Assess ${criterion.toLowerCase()} from the candidate submission.`,
      weight: index === 0 ? 40 : index === 1 ? 35 : 25,
      passThreshold: index === 0 ? "Strong evidence" : "Meets bar"
    })),
    owner,
    dueAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    createdBy: owner
  };
}

export function createAssessment(draft: AssessmentDraft): Assessment {
  const now = new Date().toISOString();
  const id = `assessment-${slugify(draft.title)}-${Math.random().toString(36).slice(2, 7)}`;
  return {
    ...draft,
    id,
    status: "Draft",
    submissions: [],
    evidenceEvents: [],
    timelineEvents: [
      timelineEvent(id, "assessment_draft_created", "Assessment draft created", `${draft.title} tied to ${draft.jobTitle} scorecard.`, draft.createdBy, now)
    ],
    createdAt: now,
    updatedAt: now
  };
}

export function markAssessmentReady(assessment: Assessment): Assessment {
  return appendTimeline({ ...assessment, status: "Ready to Send" }, "assessment_ready", "Assessment ready to send", "Rubric and prompt confirmed by HR.", assessment.owner);
}

export function sendAssessment(assessment: Assessment, emailThreadId: string): Assessment {
  const next = appendTimeline({ ...assessment, status: "Sent", sentEmailThreadId: emailThreadId }, "assessment_sent", "Assessment sent", `${assessment.title} sent by email.`, assessment.owner);
  return appendEvidence(next, "assessment_sent", "Email", "Assessment instructions sent to candidate.", "Auto", 92);
}

export function recordAssessmentSubmission(assessment: Assessment, submission: Omit<AssessmentSubmission, "id" | "assessmentId" | "parsedStatus">): Assessment {
  const nextSubmission: AssessmentSubmission = {
    ...submission,
    id: `submission-${assessment.id}-${assessment.submissions.length + 1}`,
    assessmentId: assessment.id,
    parsedStatus: "Pending"
  };
  const next = appendTimeline({ ...assessment, status: "Submitted", submissions: [nextSubmission, ...assessment.submissions] }, "assessment_submission", "Assessment submitted", `${submission.version} received with ${submission.attachments.length} attachments.`, assessment.candidateName);
  return appendEvidence(next, "assessment_submission", "Email", `Candidate submitted ${submission.attachments.join(", ")}.`, "Pending", 84);
}

export function parseAssessmentSubmission(assessment: Assessment): Assessment {
  const submissions = assessment.submissions.map((submission, index) => index === 0 ? { ...submission, parsedStatus: "Parsed" as const } : submission);
  const next = appendTimeline({ ...assessment, status: "Parsed", submissions }, "assessment_parsed", "Assessment parsed", "Submission body and attachments parsed into review evidence.", "HireOS AI");
  return next;
}

export function startAssessmentReview(assessment: Assessment): Assessment {
  const aiReview: AssessmentAiReview = {
    rubricMatch: 88,
    evidence: "Candidate identified failure modes, rollback plan, and observability gaps.",
    risk: "Another assignment may reduce candidate response rate.",
    confidence: "High",
    stopRuleRecommendation: "Skip additional assessment"
  };
  const next = appendTimeline({ ...assessment, status: "In Review", aiReview }, "assessment_review", "Assessment review started", "AI review generated rubric match, evidence, risk, and confidence.", "HireOS AI");
  return appendEvidence(next, "ai_assessment_review", "AI", `${aiReview.evidence} Rubric match ${aiReview.rubricMatch}%.`, "Auto", aiReview.rubricMatch);
}

export function requireCalibration(assessment: Assessment, note: string): Assessment {
  return appendTimeline({ ...assessment, status: "Calibrate", calibrationNote: note }, "assessment_review", "Assessment calibration requested", note, assessment.owner);
}

export function acceptStopRule(assessment: Assessment, note: string): Assessment {
  const next = appendTimeline({ ...assessment, status: "Skipped by Stop Rule", calibrationNote: note }, "assessment_stop_rule", "Stop Rule accepted", note, assessment.owner);
  return appendEvidence(next, "assessment_stop_rule", "User", note, "Approved", assessment.aiReview?.rubricMatch);
}

export function completeAssessment(assessment: Assessment, note: string): Assessment {
  const next = appendTimeline({ ...assessment, status: "Complete", calibrationNote: note }, "assessment_completed", "Assessment completed", note, assessment.owner);
  return appendEvidence(next, "assessment_completed", "User", note, "Approved", assessment.aiReview?.rubricMatch);
}

export function assessmentApplicationState(status: AssessmentStatus): Application["currentState"] {
  if (status === "Draft" || status === "Ready to Send") return "Assessment Draft";
  if (status === "Sent" || status === "Candidate Question") return "Assessment Sent";
  if (status === "Submitted" || status === "Parsed") return "Assessment Submitted";
  if (status === "In Review" || status === "Calibrate") return "Assessment Review";
  return "Founder Review";
}

function appendTimeline(assessment: Assessment, eventType: ApplicationTimelineEvent["eventType"], title: string, detail: string, actor: string): Assessment {
  const now = new Date().toISOString();
  return {
    ...assessment,
    timelineEvents: [...assessment.timelineEvents, timelineEvent(assessment.id, eventType, title, detail, actor, now)],
    updatedAt: now
  };
}

function appendEvidence(assessment: Assessment, eventType: AssessmentEvidenceEvent["eventType"], sourceType: EvidenceSourceType, summary: string, approvalStatus: EvidenceApprovalStatus, confidence?: number): Assessment {
  const now = new Date().toISOString();
  return {
    ...assessment,
    evidenceEvents: [
      ...assessment.evidenceEvents,
      {
        id: `evidence-${assessment.id}-${assessment.evidenceEvents.length + 1}`,
        applicationId: assessment.applicationId,
        assessmentId: assessment.id,
        eventType,
        sourceType,
        summary,
        confidence,
        approvalStatus,
        createdAt: now
      }
    ],
    updatedAt: now
  };
}

function timelineEvent(idSeed: string, eventType: ApplicationTimelineEvent["eventType"], title: string, detail: string, actor: string, occurredAt: string): ApplicationTimelineEvent {
  return {
    id: `timeline-${idSeed}-${slugify(title)}-${Math.random().toString(36).slice(2, 6)}`,
    eventType,
    title,
    detail,
    actor,
    occurredAt
  };
}
