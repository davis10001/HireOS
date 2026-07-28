(function initGovernanceSeam(globalScope) {
  const GOVERNANCE_SEAM_VERSION = "settings-governance-v1";
  const STORAGE_KEY = "hireos-governance-state-v1";

  const sensitiveActions = [
    "candidate_merge",
    "application_reject",
    "application_closed",
    "offer_decision",
    "sensitive_candidate_reply",
    "founder_decision_writeback",
  ];

  const forbiddenActions = [
    "auto_reject",
    "auto_hire",
    "compensation_decision",
    "delete_evidence",
    "hide_counter_evidence",
    "make_offer_decision",
  ];

  const defaultGovernanceState = Object.freeze({
    roles: [
      { id: "founder", label: "Founder", canViewAudit: true, canEditGovernance: false },
      { id: "hr_admin", label: "HR Admin", canViewAudit: true, canEditGovernance: true },
      { id: "hr_member", label: "HR Member", canViewAudit: false, canEditGovernance: false },
      { id: "hiring_manager", label: "Hiring Manager", canViewAudit: false, canEditGovernance: false },
      { id: "interviewer", label: "Interviewer", canViewAudit: false, canEditGovernance: false },
    ],
    permissionMatrix: {
      connectMailbox: ["hr_admin"],
      configureAiAutomation: ["hr_admin"],
      viewAuditLog: ["founder", "hr_admin"],
      approveSensitiveAiAction: ["founder", "hr_admin", "hr_member"],
      makeFounderDecision: ["founder"],
    },
    thresholds: {
      candidateMatch: 0.82,
      jobMatch: 0.78,
      duplicateConfidence: 0.88,
      autoApply: 0.9,
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
      { actionType: "auto_hire", label: "Auto hire", mode: "forbidden" },
    ],
    auditPolicy: {
      requiredEvents: [
        "candidate_merge",
        "application_state_changed",
        "ai_writeback_applied",
        "founder_decision_recorded",
        "settings_changed",
        "permission_changed",
      ],
      humanApprovalRequired: [
        "candidate_merge",
        "low_confidence_match",
        "application_reject",
        "offer_decision",
        "sensitive_candidate_reply",
        "published_job_policy_change",
      ],
    },
    evidencePolicy: {
      approvalStatuses: ["Auto", "Pending", "Approved", "Rejected"],
      requiredDecisionEvidence: ["Scorecard", "CV", "Evidence Gap", "Interview", "Assessment", "Offer Decision"],
    },
    slaDefaults: {
      hrReviewHours: 24,
      founderDecisionHours: 48,
      interviewFeedbackHours: 24,
      pendingApprovalHours: 24,
    },
    mailboxes: [
      {
        id: "mailbox-recruiting",
        address: "recruiting@company.vn",
        status: "Connected",
        foldersWatched: ["Inbox", "CV", "Assessment", "Interview", "Agency", "Follow-up"],
        writebackMode: "safe",
        reviewPolicy: "low_confidence",
      },
      {
        id: "mailbox-agency",
        address: "agency-intake@company.vn",
        status: "Connected",
        foldersWatched: ["Inbox", "Agency"],
        writebackMode: "hold",
        reviewPolicy: "always",
      },
    ],
    auditEvents: [
      {
        id: "audit-seed-governance",
        actorType: "System",
        actorId: "system",
        action: "governance_policy_loaded",
        entityType: "GovernancePolicy",
        entityId: "settings-governance-v1",
        reason: "Default local mock governance seam initialized",
        createdAt: "2026-07-28T00:00:00.000Z",
      },
    ],
  });

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function findRule(state, actionType) {
    return state.aiAutomationRules.find((rule) => rule.actionType === actionType);
  }

  function thresholdFor(actionType, thresholds) {
    if (actionType === "candidate_match") return ["Candidate match threshold", thresholds.candidateMatch];
    if (actionType === "job_match") return ["Job match threshold", thresholds.jobMatch];
    if (actionType === "duplicate_detection") return ["Duplicate confidence threshold", thresholds.duplicateConfidence];
    return ["Auto-apply threshold", thresholds.autoApply];
  }

  function evaluateAiAction(state, action) {
    const actionType = action.actionType;
    const confidence = Number(action.confidence || 0);
    const rule = findRule(state, actionType);

    if (forbiddenActions.includes(actionType) || rule?.mode === "forbidden") {
      return {
        status: "Rejected",
        destination: "forbidden",
        requiresHumanApproval: false,
        reason: "Forbidden by AI safety boundaries",
      };
    }

    if (sensitiveActions.includes(actionType) || rule?.mode === "approval_required") {
      return {
        status: "Pending Approval",
        destination: "inbox-review",
        requiresHumanApproval: true,
        reason: "Sensitive action requires human approval",
      };
    }

    const [thresholdLabel, threshold] = thresholdFor(actionType, state.thresholds);
    if (confidence < threshold) {
      return {
        status: "Pending Approval",
        destination: "inbox-review",
        requiresHumanApproval: true,
        reason: `Below ${thresholdLabel}`,
      };
    }

    return {
      status: "Auto Applied",
      destination: "settings-governance-seam",
      requiresHumanApproval: false,
      reason: "High-confidence low-risk action",
    };
  }

  function updateGovernanceState(state, patch, auditContext = {}) {
    const nextState = clone(state);
    if (patch.thresholds) {
      Object.assign(nextState.thresholds, patch.thresholds);
    }
    if (patch.aiAutomationRules) {
      nextState.aiAutomationRules = patch.aiAutomationRules.map((rule) => ({ ...rule }));
    }
    if (patch.auditPolicy) {
      nextState.auditPolicy = {
        ...nextState.auditPolicy,
        ...patch.auditPolicy,
      };
    }
    if (patch.slaDefaults) {
      Object.assign(nextState.slaDefaults, patch.slaDefaults);
    }
    if (patch.mailboxes) {
      nextState.mailboxes = patch.mailboxes.map((mailbox) => ({ ...mailbox }));
    }
    nextState.auditEvents.push({
      id: `audit-${Date.now()}`,
      actorType: auditContext.actorType || "User",
      actorId: auditContext.actorId || "local-hr-admin",
      action: "settings_changed",
      entityType: "GovernancePolicy",
      entityId: GOVERNANCE_SEAM_VERSION,
      before: {
        thresholds: state.thresholds,
        slaDefaults: state.slaDefaults,
      },
      after: {
        thresholds: nextState.thresholds,
        slaDefaults: nextState.slaDefaults,
      },
      reason: auditContext.reason || "Governance settings updated",
      createdAt: new Date().toISOString(),
    });
    return nextState;
  }

  function loadGovernanceState() {
    if (!globalScope.localStorage) return clone(defaultGovernanceState);
    try {
      const stored = globalScope.localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : clone(defaultGovernanceState);
    } catch (_error) {
      return clone(defaultGovernanceState);
    }
  }

  function saveGovernanceState(state) {
    if (globalScope.localStorage) {
      globalScope.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
    return state;
  }

  const api = {
    GOVERNANCE_SEAM_VERSION,
    STORAGE_KEY,
    defaultGovernanceState,
    evaluateAiAction,
    updateGovernanceState,
    loadGovernanceState,
    saveGovernanceState,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  globalScope.HireOSGovernanceSeam = api;
})(typeof globalThis !== "undefined" ? globalThis : window);
