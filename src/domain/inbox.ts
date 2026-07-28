export type EmailThreadStatus = "needs_review" | "auto_applied" | "draft" | "failed";
export type InboxItemStatus = "open" | "in_review" | "approved" | "modified" | "rejected" | "snoozed";
export type AiActionStatus = "generated" | "pending_approval" | "approved" | "auto_applied" | "applied" | "rejected";
export type DuplicateSignalStatus = "review" | "hold" | "ignored";

export interface EmailThreadSeam {
  id: string;
  subject: string;
  sender: string;
  detectedType: "CV Intake" | "Scheduling" | "Assessment" | "Agency Forward";
  jobMatch: string;
  aiAction: string;
  status: EmailThreadStatus;
  confidence: number;
}

export interface AiActionSeam {
  id: string;
  actionType: "Extract" | "Match" | "Recommend" | "Writeback Preview";
  status: AiActionStatus;
  confidence: number;
  inputRefs: string[];
  evidenceRefs: string[];
  outputSummary: string;
}

export interface InboxItemSeam {
  id: string;
  title: string;
  type: "Email Intake" | "Candidate Duplicate" | "Application Status Update";
  object: "Email Thread" | "Candidate Seam" | "Application Seam";
  status: InboxItemStatus;
  priority: "Normal" | "High" | "Urgent";
  threadId: string;
  aiActionId: string;
  rawEvidence: string[];
  recommendation: string;
  writebackPreview: string[];
}

export interface DuplicateSignalSeam {
  id: string;
  candidateLabel: string;
  matchReason: string;
  confidence: number;
  status: DuplicateSignalStatus;
  evidence: string[];
}

export interface InboxReviewState {
  itemId: string;
  status: InboxItemStatus;
  reviewerNote?: string;
  candidateApplicationWriteBlocked: true;
}

export const seedEmailThreads: EmailThreadSeam[] = [
  {
    id: "thread-sophia-cv",
    subject: "CV - Sophia Chen Finance Director",
    sender: "sophia.chen@mail.vn · CV + board memo sample",
    detectedType: "CV Intake",
    jobMatch: "Finance Director 94%",
    aiAction: "Prepare intake seam",
    status: "auto_applied",
    confidence: 0.94
  },
  {
    id: "thread-agency-forward",
    subject: "Forwarded finance associate profile from agency",
    sender: "agency-intake@company.vn · CV_Vivian_Investment.pdf",
    detectedType: "Agency Forward",
    jobMatch: "Strategic Investment Associate 62%",
    aiAction: "Ask HR",
    status: "needs_review",
    confidence: 0.62
  },
  {
    id: "thread-investment-assessment",
    subject: "Investment memo assessment submission",
    sender: "Minh Anh Vo · model.xlsx + memo.pdf",
    detectedType: "Assessment",
    jobMatch: "Strategic Investment Associate 86%",
    aiAction: "Attach evidence preview",
    status: "draft",
    confidence: 0.86
  }
];

export const seedAiActions: AiActionSeam[] = [
  {
    id: "ai-agency-match",
    actionType: "Match",
    status: "pending_approval",
    confidence: 0.72,
    inputRefs: ["thread-agency-forward", "attachment-cv-vivian"],
    evidenceRefs: ["evidence-phone-match", "evidence-investment-keywords"],
    outputSummary: "Possible duplicate identity with medium confidence; do not merge or assign automatically."
  }
];

export const seedInboxItems: InboxItemSeam[] = [
  {
    id: "inbox-agency-forward",
    title: "Agency-forwarded finance profile",
    type: "Email Intake",
    object: "Candidate Seam",
    status: "open",
    priority: "Urgent",
    threadId: "thread-agency-forward",
    aiActionId: "ai-agency-match",
    rawEvidence: [
      "Original agency email remains attached",
      "CV_Vivian_Investment.pdf parse status: Parsed",
      "Phone number matches an existing investment associate profile",
      "Industry keywords match, but English memo evidence is missing"
    ],
    recommendation: "Route to HR review before any Candidate merge or Application creation.",
    writebackPreview: [
      "Hold Candidate seam in Duplicate Review",
      "Do not create Application until Candidate/Job are confirmed by A-owned domain",
      "Create Evidence Event seam with raw email and AI confidence references"
    ]
  }
];

export const seedDuplicateSignals: DuplicateSignalSeam[] = [
  {
    id: "duplicate-vivian",
    candidateLabel: "Vivian Tran / V. Tran",
    matchReason: "Same phone number, different agency email, finance deal list 89% overlap.",
    confidence: 0.72,
    status: "review",
    evidence: ["Phone exact match", "Agency source differs", "Deal list overlap 89%"]
  },
  {
    id: "duplicate-ella",
    candidateLabel: "Ella Park / E. Park",
    matchReason: "Email alias match and same attachment hash.",
    confidence: 0.91,
    status: "hold",
    evidence: ["Email alias", "CV hash exact match"]
  }
];

export function reviewInboxItem(item: InboxItemSeam, status: InboxItemStatus, reviewerNote?: string): InboxReviewState {
  return {
    itemId: item.id,
    status,
    reviewerNote,
    candidateApplicationWriteBlocked: true
  };
}

export function countNeedsReviewThreads(threads: EmailThreadSeam[]): number {
  return threads.filter((thread) => thread.status === "needs_review").length;
}
