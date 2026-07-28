import { describe, expect, it } from "vitest";
import { createCandidateFromDraft, createEmptyCandidateDraft } from "./candidates";
import { createApplicationForCandidate } from "./applications";
import { seedJobs } from "./jobs";

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
});
