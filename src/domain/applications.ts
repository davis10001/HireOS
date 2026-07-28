import { Candidate } from "./candidates";
import { Job } from "./jobs";
import type { Interview } from "./interviews";

export type ApplicationState =
  | "New Intake"
  | "Needs HR Review"
  | "HR Shortlisted"
  | "Scheduling Interview"
  | "Interview Scheduled"
  | "Interview Completed"
  | "Waiting Feedback"
  | "Assessment Draft"
  | "Assessment Sent"
  | "Assessment Submitted"
  | "Assessment Review"
  | "Founder Review"
  | "Final Interview"
  | "Offer Decision"
  | "Closed"
  | "Blocked"
  | "Hold"
  | "Rejected"
  | "Withdrawn";

export interface ApplicationTimelineEvent {
  id: string;
  eventType:
    | "application_created"
    | "state_changed"
    | "owner_changed"
    | "not_fit_current_job"
    | "interview_scheduled"
    | "interview_completed"
    | "evidence_event"
    | "assessment_draft_created"
    | "assessment_ready"
    | "assessment_sent"
    | "assessment_submission"
    | "assessment_parsed"
    | "assessment_review"
    | "assessment_stop_rule"
    | "assessment_completed";
  title: string;
  detail: string;
  actor: string;
  occurredAt: string;
}

export interface EvidenceEvent {
  id: string;
  applicationId: string;
  eventType: "interview_feedback";
  sourceType: "Form" | "Email";
  summary: string;
  facts: Record<string, unknown>;
  riskSummary?: string;
  confidence: number;
  approvalStatus: "Auto" | "Pending" | "Approved" | "Rejected";
  createdBy: string;
  createdAt: string;
}

export interface Application {
  id: string;
  candidateId: string;
  jobId: string;
  candidateName: string;
  jobTitle: string;
  currentState: ApplicationState;
  currentOwner: string;
  processOwner: string;
  nextAction: string;
  dueAt: string;
  slaStatus: "Ready" | "Today" | "Overdue" | "Blocked";
  timeline: ApplicationTimelineEvent[];
  evidenceEvents?: EvidenceEvent[];
  interviews?: Interview[];
}

export const seedApplications: Application[] = [
  {
    id: "application-sophia-finance-director",
    candidateId: "candidate-sophia-chen",
    jobId: "job-finance-director",
    candidateName: "Sophia Chen",
    jobTitle: "Finance Director",
    currentState: "Offer Decision",
    currentOwner: "Founder",
    processOwner: "HR",
    nextAction: "Approve offer package with compensation exception",
    dueAt: "2026-07-28T10:00:00.000Z",
    slaStatus: "Today",
    timeline: [
      {
        id: "timeline-sophia-created",
        eventType: "application_created",
        title: "Application created",
        detail: "Sophia Chen attached to Finance Director.",
        actor: "HireOS",
        occurredAt: "2026-07-19T03:24:00.000Z"
      },
      {
        id: "timeline-sophia-offer",
        eventType: "state_changed",
        title: "Moved to Offer Review",
        detail: "Finalist packet completed; requested base is 12% above approved range and needs founder approval.",
        actor: "Linh Tran",
        occurredAt: "2026-07-28T05:10:00.000Z"
      }
    ]
  },
  {
    id: "application-daniel-finance-director",
    candidateId: "candidate-daniel-wong",
    jobId: "job-finance-director",
    candidateName: "Daniel Wong",
    jobTitle: "Finance Director",
    currentState: "Waiting Feedback",
    currentOwner: "Nguyen Hoang",
    processOwner: "HR",
    nextAction: "Collect CFO panel feedback and confirm 90-day notice risk",
    dueAt: "2026-07-26T11:00:00.000Z",
    slaStatus: "Overdue",
    interviews: [
      {
        id: "interview-daniel-cfo-panel",
        applicationId: "application-daniel-finance-director",
        candidateConfirmationStatus: "Confirmed",
        interviewType: "Final",
        interviewer: "Nguyen Hoang",
        locationOrLink: "Google Meet · finance-panel",
        scheduledStartAt: "2026-07-25T08:00:00.000Z",
        status: "Feedback Pending"
      }
    ],
    timeline: [
      {
        id: "timeline-daniel-created",
        eventType: "application_created",
        title: "Application created",
        detail: "Daniel Wong attached to Finance Director from executive search.",
        actor: "HireOS",
        occurredAt: "2026-07-20T04:10:00.000Z"
      },
      {
        id: "timeline-daniel-interview-completed",
        eventType: "interview_completed",
        title: "Panel interview completed",
        detail: "CFO panel completed; feedback is overdue and notice period is 90 days.",
        actor: "Nguyen Hoang",
        occurredAt: "2026-07-25T09:30:00.000Z"
      }
    ]
  },
  {
    id: "application-minh-investment-associate",
    candidateId: "candidate-minh-anh-vo",
    jobId: "job-investment-associate",
    candidateName: "Minh Anh Vo",
    jobTitle: "Strategic Investment Associate",
    currentState: "Assessment Submitted",
    currentOwner: "Linh Tran",
    processOwner: "HR",
    nextAction: "Parse investment memo assessment and route founder decision",
    dueAt: "2026-07-28T16:00:00.000Z",
    slaStatus: "Today",
    timeline: [
      {
        id: "timeline-minh-created",
        eventType: "application_created",
        title: "Application created",
        detail: "Minh Anh Vo attached to Strategic Investment Associate.",
        actor: "HireOS",
        occurredAt: "2026-07-22T03:24:00.000Z"
      },
      {
        id: "timeline-minh-assessment-submitted",
        eventType: "assessment_submission",
        title: "Assessment submitted",
        detail: "Candidate submitted market map, valuation model, and investment memo draft.",
        actor: "Minh Anh Vo",
        occurredAt: "2026-07-28T04:45:00.000Z"
      }
    ]
  },
  {
    id: "application-vivian-investment-associate",
    candidateId: "candidate-duplicate-vivian",
    jobId: "job-investment-associate",
    candidateName: "Vivian Tran",
    jobTitle: "Strategic Investment Associate",
    currentState: "Needs HR Review",
    currentOwner: "HR",
    processOwner: "HR",
    nextAction: "Resolve agency duplicate before screening",
    dueAt: "2026-07-28T12:00:00.000Z",
    slaStatus: "Blocked",
    timeline: [
      {
        id: "timeline-vivian-created",
        eventType: "application_created",
        title: "Application created",
        detail: "Agency-forwarded finance profile held for duplicate and job-match review.",
        actor: "HireOS",
        occurredAt: "2026-07-27T07:00:00.000Z"
      }
    ]
  },
  {
    id: "application-ella-finance-director",
    candidateId: "candidate-ella-park",
    jobId: "job-finance-director",
    candidateName: "Ella Park",
    jobTitle: "Finance Director",
    currentState: "Rejected",
    currentOwner: "Linh Tran",
    processOwner: "HR",
    nextAction: "Move to finance talent pool",
    dueAt: "2026-07-27T08:00:00.000Z",
    slaStatus: "Ready",
    timeline: [
      {
        id: "timeline-ella-created",
        eventType: "application_created",
        title: "Application created",
        detail: "Ella Park screened for Finance Director.",
        actor: "HireOS",
        occurredAt: "2026-07-24T05:00:00.000Z"
      },
      {
        id: "timeline-ella-not-fit",
        eventType: "not_fit_current_job",
        title: "Moved to talent pool",
        detail: "Rejected for Finance Director due to limited board-facing FP&A leadership; retained for Controller search.",
        actor: "Linh Tran",
        occurredAt: "2026-07-27T08:00:00.000Z"
      }
    ]
  },
  {
    id: "application-rajiv-investment-associate",
    candidateId: "candidate-rajiv-menon",
    jobId: "job-investment-associate",
    candidateName: "Rajiv Menon",
    jobTitle: "Strategic Investment Associate",
    currentState: "HR Shortlisted",
    currentOwner: "Mai Ho",
    processOwner: "HR",
    nextAction: "Screen industry experience gap before founder packet",
    dueAt: "2026-07-29T09:00:00.000Z",
    slaStatus: "Ready",
    timeline: [
      {
        id: "timeline-rajiv-created",
        eventType: "application_created",
        title: "Application created",
        detail: "Rajiv Menon screened from referral pool for Strategic Investment Associate.",
        actor: "HireOS",
        occurredAt: "2026-07-26T07:30:00.000Z"
      }
    ]
  }
];

export function createApplicationForCandidate(candidate: Candidate, job: Job): Application {
  if (job.status !== "active") {
    throw new Error("Application requires an Active Job");
  }
  const now = new Date().toISOString();
  const dueAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  return {
    id: `application-${candidate.id}-${job.id}-${Math.random().toString(36).slice(2, 7)}`,
    candidateId: candidate.id,
    jobId: job.id,
    candidateName: candidate.fullName,
    jobTitle: job.title,
    currentState: "New Intake",
    currentOwner: job.owner,
    processOwner: "HR",
    nextAction: "Review candidate fit",
    dueAt,
    slaStatus: "Ready",
    timeline: [
      {
        id: `timeline-${candidate.id}-${job.id}`,
        eventType: "application_created",
        title: "Application created",
        detail: `${candidate.fullName} attached to ${job.title}.`,
        actor: "Linh Tran",
        occurredAt: now
      }
    ]
  };
}
