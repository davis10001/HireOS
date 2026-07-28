import { describe, expect, it } from "vitest";
import {
  GOVERNANCE_SEAM_VERSION,
  defaultGovernanceState,
  evaluateAiAction,
  updateGovernanceState
} from "./governance";

describe("governance seam", () => {
  it("routes AI actions through auto, review, and forbidden boundaries", () => {
    expect(evaluateAiAction(defaultGovernanceState, { actionType: "extract_evidence", confidence: 0.93 })).toMatchObject({
      destination: "settings-governance-seam",
      requiresHumanApproval: false,
      status: "Auto Applied"
    });
    expect(evaluateAiAction(defaultGovernanceState, { actionType: "candidate_match", confidence: 0.74 })).toMatchObject({
      destination: "inbox-review",
      reason: "Below Candidate match threshold",
      status: "Pending Approval"
    });
    expect(evaluateAiAction(defaultGovernanceState, { actionType: "candidate_merge", confidence: 0.99 })).toMatchObject({
      requiresHumanApproval: true,
      status: "Pending Approval"
    });
    expect(evaluateAiAction(defaultGovernanceState, { actionType: "auto_hire", confidence: 0.99 })).toMatchObject({
      destination: "forbidden",
      status: "Rejected"
    });
  });

  it("updates thresholds and appends audit events without touching business records", () => {
    const nextState = updateGovernanceState(defaultGovernanceState, { thresholds: { ...defaultGovernanceState.thresholds, candidateMatch: 0.9 } }, "Tighten AI writeback boundaries");

    expect(GOVERNANCE_SEAM_VERSION).toBe("settings-governance-v1");
    expect(nextState.thresholds.candidateMatch).toBe(0.9);
    expect(defaultGovernanceState.thresholds.candidateMatch).toBe(0.82);
    expect(nextState.auditEvents).toHaveLength(defaultGovernanceState.auditEvents.length + 1);
  });
});
