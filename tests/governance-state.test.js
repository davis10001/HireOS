const assert = require("node:assert/strict");
const test = require("node:test");

const {
  defaultGovernanceState,
  evaluateAiAction,
  updateGovernanceState,
  GOVERNANCE_SEAM_VERSION,
} = require("../frontend-prototype/hireos-governance-state.js");

test("routes high-confidence safe writebacks to auto apply", () => {
  const decision = evaluateAiAction(defaultGovernanceState, {
    actionType: "extract_evidence",
    confidence: 0.93,
  });

  assert.equal(decision.status, "Auto Applied");
  assert.equal(decision.destination, "settings-governance-seam");
  assert.equal(decision.requiresHumanApproval, false);
});

test("routes low-confidence candidate and job matches to Inbox review", () => {
  const candidateDecision = evaluateAiAction(defaultGovernanceState, {
    actionType: "candidate_match",
    confidence: 0.74,
  });
  const jobDecision = evaluateAiAction(defaultGovernanceState, {
    actionType: "job_match",
    confidence: 0.71,
  });

  assert.equal(candidateDecision.status, "Pending Approval");
  assert.equal(candidateDecision.destination, "inbox-review");
  assert.equal(candidateDecision.reason, "Below Candidate match threshold");
  assert.equal(jobDecision.reason, "Below Job match threshold");
});

test("always sends sensitive and forbidden actions to human approval or blocks them", () => {
  const mergeDecision = evaluateAiAction(defaultGovernanceState, {
    actionType: "candidate_merge",
    confidence: 0.99,
  });
  const rejectDecision = evaluateAiAction(defaultGovernanceState, {
    actionType: "auto_reject",
    confidence: 0.99,
  });

  assert.equal(mergeDecision.status, "Pending Approval");
  assert.equal(mergeDecision.requiresHumanApproval, true);
  assert.equal(rejectDecision.status, "Rejected");
  assert.equal(rejectDecision.destination, "forbidden");
});

test("updates thresholds and appends audit events without touching business records", () => {
  const nextState = updateGovernanceState(
    defaultGovernanceState,
    {
      thresholds: {
        candidateMatch: 0.9,
        autoApply: 0.94,
      },
    },
    {
      actorId: "user-hr-admin",
      reason: "Tighten AI writeback boundaries",
    },
  );

  assert.equal(GOVERNANCE_SEAM_VERSION, "settings-governance-v1");
  assert.equal(nextState.thresholds.candidateMatch, 0.9);
  assert.equal(nextState.thresholds.autoApply, 0.94);
  assert.equal(defaultGovernanceState.thresholds.candidateMatch, 0.82);
  assert.equal(nextState.auditEvents.length, defaultGovernanceState.auditEvents.length + 1);
  assert.deepEqual(Object.keys(nextState).sort(), [
    "aiAutomationRules",
    "auditEvents",
    "auditPolicy",
    "evidencePolicy",
    "mailboxes",
    "permissionMatrix",
    "roles",
    "slaDefaults",
    "thresholds",
  ]);
});
