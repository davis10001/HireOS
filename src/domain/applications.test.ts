import { describe, expect, it } from "vitest";
import { createCandidateFromDraft, createEmptyCandidateDraft } from "./candidates";
import { createApplicationForCandidate } from "./applications";
import { seedJobs } from "./jobs";
import {
  completeInterview,
  createInterviewForApplication,
  INTERVIEW_STATUSES,
  parseInterviewFeedback
} from "./interviews";

describe("application domain", () => {
  it("requires an active job when creating an application", () => {
    const candidate = createCandidateFromDraft({ ...createEmptyCandidateDraft(), fullName: "Nora Le" });
    const draftJob = seedJobs.find((job) => job.status === "draft");

    expect(() => createApplicationForCandidate(candidate, draftJob!)).toThrow("Application requires an Active Job");
  });

  it("creates an application with owner, next action, due date, state, and timeline", () => {
    const candidate = createCandidateFromDraft({ ...createEmptyCandidateDraft(), fullName: "Nora Le", primaryEmail: "nora@example.com" });
    const activeJob = seedJobs.find((job) => job.status === "active")!;

    const application = createApplicationForCandidate(candidate, activeJob);

    expect(application).toMatchObject({
      candidateId: candidate.id,
      candidateName: "Nora Le",
      jobId: activeJob.id,
      jobTitle: activeJob.title,
      currentOwner: activeJob.owner,
      processOwner: "HR",
      nextAction: "Review candidate fit",
      currentState: "New Intake",
      slaStatus: "Ready"
    });
    expect(application.dueAt).toMatch(/T/);
    expect(application.timeline).toEqual([
      expect.objectContaining({
        eventType: "application_created",
        title: "Application created"
      })
    ]);
  });

  it("schedules an interview from an application and updates next action and SLA", () => {
    const candidate = createCandidateFromDraft({ ...createEmptyCandidateDraft(), fullName: "Nora Le" });
    const activeJob = seedJobs.find((job) => job.status === "active")!;
    const application = createApplicationForCandidate(candidate, activeJob);

    const result = createInterviewForApplication(application, {
      candidateConfirmationStatus: "Pending",
      interviewType: "Technical",
      interviewer: "Mai Ho",
      locationOrLink: "https://meet.hireos.test/nora-technical",
      scheduledStartAt: "2026-07-29T03:00:00.000Z"
    });

    expect(INTERVIEW_STATUSES).toEqual([
      "Draft",
      "Scheduling",
      "Scheduled",
      "Rescheduled",
      "Completed",
      "No Show",
      "Cancelled",
      "Feedback Pending",
      "Feedback Complete"
    ]);
    expect(result.interview).toMatchObject({
      applicationId: application.id,
      candidateConfirmationStatus: "Pending",
      interviewType: "Technical",
      interviewer: "Mai Ho",
      locationOrLink: "https://meet.hireos.test/nora-technical",
      status: "Scheduling"
    });
    expect(result.application).toMatchObject({
      currentOwner: "HR",
      currentState: "Scheduling Interview",
      nextAction: "Confirm interview time with Nora Le",
      slaStatus: "Today"
    });
    expect(result.application.timeline).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          eventType: "interview_scheduled",
          title: "Interview scheduling started"
        })
      ])
    );
  });

  it("moves a completed interview into feedback pending and then parses feedback into evidence and timeline", () => {
    const candidate = createCandidateFromDraft({ ...createEmptyCandidateDraft(), fullName: "Nora Le" });
    const activeJob = seedJobs.find((job) => job.status === "active")!;
    const application = createApplicationForCandidate(candidate, activeJob);
    const scheduled = createInterviewForApplication(application, {
      candidateConfirmationStatus: "Confirmed",
      interviewType: "Technical",
      interviewer: "Mai Ho",
      locationOrLink: "Room 4A",
      scheduledStartAt: "2026-07-29T03:00:00.000Z"
    });

    const completed = completeInterview(scheduled.application, scheduled.interview);

    expect(completed.interview.status).toBe("Feedback Pending");
    expect(completed.application).toMatchObject({
      currentOwner: "Mai Ho",
      currentState: "Waiting Feedback",
      nextAction: "Submit interview feedback for Nora Le",
      slaStatus: "Overdue"
    });

    const parsed = parseInterviewFeedback(completed.application, completed.interview, {
      evidenceNotes: "Explained API rollback tradeoffs with clear ownership.",
      followUpQuestions: ["Ask about conflict resolution under release pressure."],
      recommendation: "Strong Yes",
      risks: "Leadership under pressure still needs one follow-up.",
      scorecardScores: {
        architecture: 5,
        debugging: 4,
        ownership: 5
      },
      sourceType: "Form",
      strengths: "Architecture tradeoffs, debugging depth, API ownership"
    });

    expect(parsed.interview.status).toBe("Feedback Complete");
    expect(parsed.feedback.status).toBe("Parsed");
    expect(parsed.evidenceEvent).toMatchObject({
      applicationId: application.id,
      eventType: "interview_feedback",
      sourceType: "Form",
      summary: "Strong Yes: Architecture tradeoffs, debugging depth, API ownership"
    });
    expect(parsed.application.evidenceEvents).toEqual([parsed.evidenceEvent]);
    expect(parsed.application.timeline).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          eventType: "evidence_event",
          title: "Interview feedback parsed"
        })
      ])
    );
  });
});
