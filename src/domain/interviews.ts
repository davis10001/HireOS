import type { Application, EvidenceEvent } from "./applications";

export const INTERVIEW_STATUSES = [
  "Draft",
  "Scheduling",
  "Scheduled",
  "Rescheduled",
  "Completed",
  "No Show",
  "Cancelled",
  "Feedback Pending",
  "Feedback Complete"
] as const;

export type InterviewStatus = typeof INTERVIEW_STATUSES[number];

export interface InterviewDraft {
  candidateConfirmationStatus: "Pending" | "Confirmed" | "Declined";
  interviewType: "HR Screen" | "Technical" | "Product" | "Founder" | "Final";
  interviewer: string;
  locationOrLink: string;
  scheduledStartAt: string;
}

export interface Interview {
  id: string;
  applicationId: string;
  candidateConfirmationStatus: InterviewDraft["candidateConfirmationStatus"];
  interviewType: InterviewDraft["interviewType"];
  interviewer: string;
  locationOrLink: string;
  scheduledStartAt: string;
  status: InterviewStatus;
}

export interface InterviewFeedbackDraft {
  evidenceNotes: string;
  followUpQuestions: string[];
  recommendation: "Strong Yes" | "Yes" | "Mixed" | "No" | "Strong No";
  risks: string;
  scorecardScores: Record<string, number>;
  sourceType: "Form" | "Email";
  strengths: string;
}

export interface InterviewFeedback extends InterviewFeedbackDraft {
  id: string;
  applicationId: string;
  interviewId: string;
  status: "Draft" | "Submitted" | "Parsed" | "Needs Clarification" | "Approved";
  submittedAt: string;
}

export function createInterviewForApplication(application: Application, draft: InterviewDraft): { application: Application; interview: Interview } {
  const now = new Date().toISOString();
  const status: InterviewStatus = draft.candidateConfirmationStatus === "Confirmed" ? "Scheduled" : "Scheduling";
  const nextApplication = {
    ...application,
    currentOwner: status === "Scheduled" ? draft.interviewer : "HR",
    currentState: status === "Scheduled" ? "Interview Scheduled" as const : "Scheduling Interview" as const,
    nextAction: status === "Scheduled" ? `Conduct ${draft.interviewType} interview` : `Confirm interview time with ${application.candidateName}`,
    dueAt: draft.scheduledStartAt,
    slaStatus: "Today" as const,
    timeline: [
      ...application.timeline,
      {
        actor: "HR",
        detail: `${draft.interviewType} interview with ${draft.interviewer} at ${draft.locationOrLink}. Candidate confirmation: ${draft.candidateConfirmationStatus}.`,
        eventType: "interview_scheduled" as const,
        id: `timeline-${application.id}-interview-${Date.now()}`,
        occurredAt: now,
        title: status === "Scheduled" ? "Interview scheduled" : "Interview scheduling started"
      }
    ]
  };

  return {
    application: nextApplication,
    interview: {
      ...draft,
      applicationId: application.id,
      id: `interview-${application.id}-${Date.now()}`,
      status
    }
  };
}

export function completeInterview(application: Application, interview: Interview): { application: Application; interview: Interview } {
  const now = new Date().toISOString();
  return {
    application: {
      ...application,
      currentOwner: interview.interviewer,
      currentState: "Waiting Feedback",
      nextAction: `Submit interview feedback for ${application.candidateName}`,
      slaStatus: "Overdue",
      timeline: [
        ...application.timeline,
        {
          actor: interview.interviewer,
          detail: `${interview.interviewType} interview completed; feedback is required before evidence can be used.`,
          eventType: "interview_completed",
          id: `timeline-${application.id}-completed-${Date.now()}`,
          occurredAt: now,
          title: "Interview completed"
        }
      ]
    },
    interview: {
      ...interview,
      status: "Feedback Pending"
    }
  };
}

export function parseInterviewFeedback(application: Application, interview: Interview, draft: InterviewFeedbackDraft): { application: Application; interview: Interview; feedback: InterviewFeedback; evidenceEvent: EvidenceEvent } {
  const now = new Date().toISOString();
  const feedback: InterviewFeedback = {
    ...draft,
    applicationId: application.id,
    id: `feedback-${interview.id}-${Date.now()}`,
    interviewId: interview.id,
    status: draft.evidenceNotes.trim() && draft.strengths.trim() ? "Parsed" : "Needs Clarification",
    submittedAt: now
  };
  const evidenceEvent: EvidenceEvent = {
    applicationId: application.id,
    approvalStatus: "Approved",
    confidence: feedback.status === "Parsed" ? 0.91 : 0.58,
    createdAt: now,
    createdBy: interview.interviewer,
    eventType: "interview_feedback",
    facts: {
      evidenceNotes: draft.evidenceNotes,
      followUpQuestions: draft.followUpQuestions,
      recommendation: draft.recommendation,
      scorecardScores: draft.scorecardScores,
      strengths: draft.strengths
    },
    id: `evidence-${interview.id}-${Date.now()}`,
    riskSummary: draft.risks,
    sourceType: draft.sourceType,
    summary: `${draft.recommendation}: ${draft.strengths}`
  };

  return {
    application: {
      ...application,
      currentOwner: feedback.status === "Parsed" ? "Founder" : interview.interviewer,
      currentState: feedback.status === "Parsed" ? "Founder Review" : "Waiting Feedback",
      evidenceEvents: [...(application.evidenceEvents ?? []), evidenceEvent],
      nextAction: feedback.status === "Parsed" ? "Review interview evidence and decide next step" : `Clarify feedback with ${interview.interviewer}`,
      slaStatus: feedback.status === "Parsed" ? "Ready" : "Overdue",
      timeline: [
        ...application.timeline,
        {
          actor: "HireOS",
          detail: `${draft.sourceType} feedback parsed into Evidence Event: ${evidenceEvent.summary}. Risks: ${draft.risks}`,
          eventType: "evidence_event",
          id: `timeline-${application.id}-feedback-${Date.now()}`,
          occurredAt: now,
          title: "Interview feedback parsed"
        }
      ]
    },
    evidenceEvent,
    feedback,
    interview: {
      ...interview,
      status: feedback.status === "Parsed" ? "Feedback Complete" : "Feedback Pending"
    }
  };
}
