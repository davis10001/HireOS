import { Candidate } from "./candidates";
import { Job } from "./jobs";

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
}

export const seedApplications: Application[] = [
  {
    id: "application-trang-backend",
    candidateId: "candidate-trang-nguyen",
    jobId: "job-backend",
    candidateName: "Trang Nguyen",
    jobTitle: "Senior Backend Engineer",
    currentState: "Founder Review",
    currentOwner: "Founder",
    processOwner: "HR",
    nextAction: "批准终面",
    dueAt: "2026-07-28T10:00:00.000Z",
    slaStatus: "Today",
    timeline: [
      {
        id: "timeline-trang-created",
        eventType: "application_created",
        title: "Application created",
        detail: "Trang Nguyen attached to Senior Backend Engineer.",
        actor: "HireOS",
        occurredAt: "2026-07-28T03:24:00.000Z"
      },
      {
        id: "timeline-trang-founder",
        eventType: "state_changed",
        title: "Moved to Founder Review",
        detail: "Evidence packet completed; founder final interview recommended.",
        actor: "Linh Tran",
        occurredAt: "2026-07-28T05:10:00.000Z"
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
