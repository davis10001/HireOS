import { describe, expect, it } from "vitest";
import {
  createCandidateFromDraft,
  createEmptyCandidateDraft,
  detectCandidateDuplicate,
  validateCandidateDraft
} from "./candidates";

describe("candidate domain", () => {
  it("requires a candidate full name", () => {
    const draft = createEmptyCandidateDraft();
    expect(validateCandidateDraft(draft)).toEqual({ fullName: "Full name is required" });
  });

  it("creates a candidate in the unassigned pool", () => {
    const candidate = createCandidateFromDraft({
      ...createEmptyCandidateDraft(),
      fullName: "Nora Le",
      primaryEmail: "nora@example.com",
      phone: "+84 900 111 222",
      source: "Manual",
      currentTitle: "Backend Engineer",
      currentCompany: "Fintech Co",
      location: "Ho Chi Minh",
      skillsSummary: "Node.js, PostgreSQL",
      cvNote: "Strong API ownership",
      allocationState: "unassigned_pool"
    });

    expect(candidate).toMatchObject({
      fullName: "Nora Le",
      allocationState: "unassigned_pool",
      currentJobId: null
    });
  });

  it("flags duplicates by email or phone", () => {
    const existing = createCandidateFromDraft({
      ...createEmptyCandidateDraft(),
      fullName: "Nora Le",
      primaryEmail: "nora@example.com",
      phone: "+84 900 111 222"
    });

    expect(detectCandidateDuplicate({ ...createEmptyCandidateDraft(), fullName: "Nora L", primaryEmail: "nora@example.com" }, [existing])).toMatchObject({
      candidateId: existing.id,
      field: "primaryEmail"
    });
    expect(detectCandidateDuplicate({ ...createEmptyCandidateDraft(), fullName: "Nora L", phone: "+84 900 111 222" }, [existing])).toMatchObject({
      candidateId: existing.id,
      field: "phone"
    });
  });
});
