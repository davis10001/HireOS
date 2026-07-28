import { describe, expect, it } from "vitest";
import {
  acceptStopRule,
  buildAssessmentDraft,
  completeAssessment,
  createAssessment,
  markAssessmentReady,
  parseAssessmentSubmission,
  recordAssessmentSubmission,
  sendAssessment,
  startAssessmentReview
} from "./assessments";
import { seedApplications } from "./applications";
import { seedJobs } from "./jobs";

describe("assessment domain", () => {
  it("moves an assessment from draft to review and writes evidence plus timeline events", () => {
    const application = seedApplications[0];
    const job = seedJobs.find((item) => item.id === application.jobId)!;
    const draft = buildAssessmentDraft(application, job, "Linh Tran");

    const created = createAssessment(draft);
    const ready = markAssessmentReady(created);
    const sent = sendAssessment(ready, "email-thread-assessment-send");
    const submitted = recordAssessmentSubmission(sent, {
      attachments: ["backend-case-v2.zip", "architecture-notes.pdf"],
      emailThreadId: "email-thread-assessment-submit",
      submittedAt: "2026-07-28T07:15:00.000Z",
      version: "v2"
    });
    const parsed = parseAssessmentSubmission(submitted);
    const inReview = startAssessmentReview(parsed);
    const skipped = acceptStopRule(inReview, "Evidence coverage is enough after v2.");
    const completed = completeAssessment(skipped, "HR calibrated rubric and accepted the stop rule.");

    expect(completed.status).toBe("Complete");
    expect(completed.submissions[0]).toMatchObject({
      attachments: ["backend-case-v2.zip", "architecture-notes.pdf"],
      parsedStatus: "Parsed",
      version: "v2"
    });
    expect(completed.aiReview).toMatchObject({
      rubricMatch: 88,
      confidence: "High",
      stopRuleRecommendation: "Skip additional assessment"
    });
    expect(completed.evidenceEvents).toEqual([
      expect.objectContaining({ eventType: "assessment_sent", approvalStatus: "Auto" }),
      expect.objectContaining({ eventType: "assessment_submission", sourceType: "Email" }),
      expect.objectContaining({ eventType: "ai_assessment_review", sourceType: "AI" }),
      expect.objectContaining({ eventType: "assessment_stop_rule", approvalStatus: "Approved" }),
      expect.objectContaining({ eventType: "assessment_completed", approvalStatus: "Approved" })
    ]);
    expect(completed.timelineEvents.map((event) => event.title)).toEqual([
      "Assessment draft created",
      "Assessment ready to send",
      "Assessment sent",
      "Assessment submitted",
      "Assessment parsed",
      "Assessment review started",
      "Stop Rule accepted",
      "Assessment completed"
    ]);
  });
});
