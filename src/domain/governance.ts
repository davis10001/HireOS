export type AiActionMode = "auto_allowed" | "threshold_gated" | "approval_required" | "forbidden";
export type GovernanceDecisionStatus = "Auto Applied" | "Pending Approval" | "Rejected";

export interface GovernanceRole {
  id: string;
  label: string;
  canViewAudit: boolean;
  canEditGovernance: boolean;
}

export interface GovernanceRule {
  actionType: string;
  label: string;
  mode: AiActionMode;
}

export interface GovernanceMailbox {
  id: string;
  address: string;
  status: "Connected" | "Paused";
  foldersWatched: string[];
  writebackMode: "safe" | "hold";
  reviewPolicy: "low_confidence" | "always";
}

export interface GovernanceAuditEvent {
  id: string;
  actorType: "System" | "User";
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  reason: string;
  createdAt: string;
}

export interface GovernanceState {
  roles: GovernanceRole[];
  thresholds: {
    candidateMatch: number;
    jobMatch: number;
    duplicateConfidence: number;
    autoApply: number;
  };
  aiAutomationRules: GovernanceRule[];
  auditPolicy: {
    requiredEvents: string[];
    humanApprovalRequired: string[];
  };
  evidencePolicy: {
    approvalStatuses: string[];
    requiredDecisionEvidence: string[];
  };
  slaDefaults: {
    hrReviewHours: number;
    founderDecisionHours: number;
    interviewFeedbackHours: number;
    pendingApprovalHours: number;
  };
  mailboxes: GovernanceMailbox[];
  auditEvents: GovernanceAuditEvent[];
}

export const GOVERNANCE_STORAGE_KEY = "hireos.governance";
export const GOVERNANCE_SEAM_VERSION = "settings-governance-v1";

const sensitiveActions = new Set([
  "candidate_merge",
  "application_reject",
  "application_closed",
  "offer_decision",
  "sensitive_candidate_reply",
  "founder_decision_writeback"
]);

const forbiddenActions = new Set([
  "auto_reject",
  "auto_hire",
  "compensation_decision",
  "delete_evidence",
  "hide_counter_evidence",
  "make_offer_decision"
]);

export const defaultGovernanceState: GovernanceState = {
  roles: [
    { id: "founder", label: "Founder", canViewAudit: true, canEditGovernance: false },
    { id: "hr_admin", label: "HR Admin", canViewAudit: true, canEditGovernance: true },
    { id: "hr_member", label: "HR Member", canViewAudit: false, canEditGovernance: false },
    { id: "hiring_manager", label: "Hiring Manager", canViewAudit: false, canEditGovernance: false },
    { id: "interviewer", label: "Interviewer", canViewAudit: false, canEditGovernance: false }
  ],
  thresholds: {
    candidateMatch: 0.82,
    jobMatch: 0.78,
    duplicateConfidence: 0.88,
    autoApply: 0.9
  },
  aiAutomationRules: [
    { actionType: "extract_evidence", label: "Extract evidence", mode: "auto_allowed" },
    { actionType: "candidate_match", label: "Candidate match", mode: "threshold_gated" },
    { actionType: "job_match", label: "Job match", mode: "threshold_gated" },
    { actionType: "duplicate_detection", label: "Duplicate detection", mode: "threshold_gated" },
    { actionType: "candidate_merge", label: "Candidate merge", mode: "approval_required" },
    { actionType: "application_status_change", label: "Application status change", mode: "approval_required" },
    { actionType: "draft_candidate_reply", label: "Draft candidate reply", mode: "approval_required" },
    { actionType: "offer_decision", label: "Offer decision", mode: "approval_required" },
    { actionType: "auto_reject", label: "Auto reject", mode: "forbidden" },
    { actionType: "auto_hire", label: "Auto hire", mode: "forbidden" }
  ],
  auditPolicy: {
    requiredEvents: [
      "candidate_merge",
      "application_state_changed",
      "ai_writeback_applied",
      "founder_decision_recorded",
      "settings_changed",
      "permission_changed"
    ],
    humanApprovalRequired: [
      "candidate_merge",
      "low_confidence_match",
      "application_reject",
      "offer_decision",
      "sensitive_candidate_reply",
      "published_job_policy_change"
    ]
  },
  evidencePolicy: {
    approvalStatuses: ["Auto", "Pending", "Approved", "Rejected"],
    requiredDecisionEvidence: ["Scorecard", "CV", "Evidence Gap", "Interview", "Assessment", "Offer Decision"]
  },
  slaDefaults: {
    hrReviewHours: 24,
    founderDecisionHours: 48,
    interviewFeedbackHours: 24,
    pendingApprovalHours: 24
  },
  mailboxes: [
    {
      id: "mailbox-recruiting",
      address: "recruiting@company.vn",
      status: "Connected",
      foldersWatched: ["Inbox", "CV", "Assessment", "Interview", "Agency", "Follow-up"],
      writebackMode: "safe",
      reviewPolicy: "low_confidence"
    },
    {
      id: "mailbox-agency",
      address: "agency-intake@company.vn",
      status: "Connected",
      foldersWatched: ["Inbox", "Agency"],
      writebackMode: "hold",
      reviewPolicy: "always"
    }
  ],
  auditEvents: [
    {
      id: "audit-seed-governance",
      actorType: "System",
      actorId: "system",
      action: "governance_policy_loaded",
      entityType: "GovernancePolicy",
      entityId: GOVERNANCE_SEAM_VERSION,
      reason: "Default local mock governance seam initialized",
      createdAt: "2026-07-28T00:00:00.000Z"
    }
  ]
};

export function evaluateAiAction(state: GovernanceState, action: { actionType: string; confidence: number }): { status: GovernanceDecisionStatus; destination: string; requiresHumanApproval: boolean; reason: string } {
  const rule = state.aiAutomationRules.find((item) => item.actionType === action.actionType);
  if (forbiddenActions.has(action.actionType) || rule?.mode === "forbidden") {
    return { status: "Rejected", destination: "forbidden", requiresHumanApproval: false, reason: "Forbidden by AI safety boundaries" };
  }
  if (sensitiveActions.has(action.actionType) || rule?.mode === "approval_required") {
    return { status: "Pending Approval", destination: "inbox-review", requiresHumanApproval: true, reason: "Sensitive action requires human approval" };
  }
  const [label, threshold] = thresholdFor(action.actionType, state.thresholds);
  if (action.confidence < threshold) {
    return { status: "Pending Approval", destination: "inbox-review", requiresHumanApproval: true, reason: `Below ${label}` };
  }
  return { status: "Auto Applied", destination: "settings-governance-seam", requiresHumanApproval: false, reason: "High-confidence low-risk action" };
}

export function updateGovernanceState(state: GovernanceState, patch: Partial<Pick<GovernanceState, "thresholds" | "slaDefaults" | "aiAutomationRules" | "mailboxes">>, reason = "Governance settings updated"): GovernanceState {
  return {
    ...state,
    thresholds: { ...state.thresholds, ...patch.thresholds },
    slaDefaults: { ...state.slaDefaults, ...patch.slaDefaults },
    aiAutomationRules: patch.aiAutomationRules ?? state.aiAutomationRules,
    mailboxes: patch.mailboxes ?? state.mailboxes,
    auditEvents: [
      ...state.auditEvents,
      {
        id: `audit-${Date.now()}`,
        actorType: "User",
        actorId: "local-hr-admin",
        action: "settings_changed",
        entityType: "GovernancePolicy",
        entityId: GOVERNANCE_SEAM_VERSION,
        reason,
        createdAt: new Date().toISOString()
      }
    ]
  };
}

function thresholdFor(actionType: string, thresholds: GovernanceState["thresholds"]): [string, number] {
  if (actionType === "candidate_match") return ["Candidate match threshold", thresholds.candidateMatch];
  if (actionType === "job_match") return ["Job match threshold", thresholds.jobMatch];
  if (actionType === "duplicate_detection") return ["Duplicate confidence threshold", thresholds.duplicateConfidence];
  return ["Auto-apply threshold", thresholds.autoApply];
}
