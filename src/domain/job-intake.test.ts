import { describe, expect, it } from "vitest";
import {
  applyJobPackageEdits,
  approveJobPackage,
  createAiJobIntakeSession,
  generateJobPackage,
  intakeAnswer,
  requestJobPackageRevision,
  saveJobPackageDraft
} from "./job-intake";

describe("AI job intake domain", () => {
  it("asks for missing required fields across turns and generates an editable package only when complete", () => {
    const session = createAiJobIntakeSession("We need a Finance Director for Vietnam finance operations and fundraising support.");

    expect(session.status).toBe("in_progress");
    expect(session.completedFields).toEqual(["jobTitle"]);
    expect(session.missingFields).toEqual([
      "hiringReason",
      "ninetyDayGoal",
      "coreResponsibilities",
      "mustHave",
      "budgetRange",
      "locationWorkMode",
      "reportingLine",
      "englishRequirement",
      "notFitProfile"
    ]);
    expect(session.nextQuestion).toMatch(/why now/i);
    expect(() => generateJobPackage(session)).toThrow(/missing required intake fields/i);

    const ready = intakeAnswer(session, [
      "Hiring reason: fundraising controls need senior ownership now.",
      "90 day goal: close monthly reporting by day 5 and build investor-ready cash visibility.",
      "Responsibilities: lead FP&A, own Vietnam statutory finance, support fundraising model, manage controls.",
      "Must-have: Vietnam finance leadership, fundraising support, fluent English, team management.",
      "Budget: USD 6,000-8,000 monthly.",
      "Location: Ho Chi Minh hybrid, can travel to Hanoi monthly.",
      "Reports to: Founder.",
      "English: investor-facing working proficiency.",
      "Not fit: pure accountant without fundraising or leadership experience."
    ].join("\n"));

    expect(ready.status).toBe("ready_to_generate");
    expect(ready.missingFields).toEqual([]);

    const generated = generateJobPackage(ready);
    expect(generated.status).toBe("generated");
    expect(generated.package).not.toBeNull();
    expect(generated.package!.externalJd).toContain("Finance Director");
    expect(generated.package!.scorecard).toEqual(expect.arrayContaining([
      "Vietnam finance leadership",
      "90-day execution against monthly reporting and investor visibility"
    ]));
    expect(generated.aiActions).toEqual(expect.arrayContaining([
      expect.objectContaining({
        actionType: "generate_package",
        version: 1,
        status: "generated",
        confidence: 0.86
      })
    ]));
  });

  it("records user edits, saves drafts, approves only by humans, and produces a Job plus task feedback", () => {
    const generated = generateJobPackage(intakeAnswer(
      createAiJobIntakeSession("Finance Director"),
      [
        "Hiring reason: board reporting and fundraising.",
        "90 day goal: investor model live and reporting closed by day 5.",
        "Responsibilities: FP&A, finance operations, controls, fundraising support.",
        "Must-have: Vietnam finance leadership, English, fundraising support.",
        "Budget: USD 6,000-8,000 monthly.",
        "Location: Ho Chi Minh hybrid.",
        "Reports to: Founder.",
        "English: fluent for investor conversations.",
        "Not fit: bookkeeping-only profile."
      ].join("\n")
    ));

    const edited = applyJobPackageEdits(generated, {
      internalRoleBrief: "Edited brief: prioritize fundraising model ownership.",
      niceToHave: ["Fintech experience"]
    }, "Linh Tran", "2026-07-28T09:00:00.000Z");
    const saved = saveJobPackageDraft(edited, "Linh Tran", "2026-07-28T09:05:00.000Z");
    const revised = requestJobPackageRevision(saved, "Make the role more operational.", "2026-07-28T09:10:00.000Z");
    const approved = approveJobPackage(revised, "Linh Tran", "2026-07-28T09:15:00.000Z");

    expect(approved.session.status).toBe("approved");
    expect(approved.job).toMatchObject({
      title: "Finance Director",
      department: "Finance",
      location: "Ho Chi Minh hybrid",
      status: "draft",
      owner: "Linh Tran",
      salaryRange: "USD 6,000-8,000 monthly",
      blockedCount: 0
    });
    expect(approved.job.generatedSummary).toContain("Package approved by Linh Tran");
    expect(approved.auditTrail.map((event) => event.eventType)).toEqual([
      "generated",
      "edited",
      "saved_draft",
      "revision_requested",
      "approved"
    ]);
    expect(approved.followUpTask).toMatchObject({
      title: "Publish approved job: Finance Director",
      sourceModule: "Jobs",
      ownerRole: "HR",
      aiApprovalRequired: false,
      relatedObjects: [{ module: "Jobs", id: approved.job.id, label: "Finance Director" }]
    });
  });
});
