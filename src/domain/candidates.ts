import { slugify } from "./ids";

export type CandidateAllocationState =
  | "unassigned_pool"
  | "assigned"
  | "not_fit_current_job"
  | "rejected_global"
  | "duplicate_review";

export interface Candidate {
  id: string;
  fullName: string;
  primaryEmail: string;
  phone: string;
  source: string;
  currentTitle: string;
  currentCompany: string;
  location: string;
  skillsSummary: string;
  cvNote: string;
  allocationState: CandidateAllocationState;
  currentJobId: string | null;
  recommendedJobIds: string[];
  matchConfidence: number;
  notFitReason: string;
  poolReason: string;
  createdAt: string;
  updatedAt: string;
}

export type CandidateDraft = Omit<Candidate, "id" | "createdAt" | "updatedAt">;

export interface DuplicateSignal {
  candidateId: string;
  field: "primaryEmail" | "phone";
  value: string;
}

export const seedCandidates: Candidate[] = [
  {
    id: "candidate-sophia-chen",
    fullName: "Sophia Chen",
    primaryEmail: "sophia.chen@example.com",
    phone: "+84 900 110 220",
    source: "Founder referral",
    currentTitle: "Finance Director",
    currentCompany: "MekongPay",
    location: "Ho Chi Minh City",
    skillsSummary: "FP&A leadership, board reporting, audit, fundraising support",
    cvNote: "Offer review · finalist packet complete · compensation above band",
    allocationState: "assigned",
    currentJobId: "job-finance-director",
    recommendedJobIds: ["job-finance-director"],
    matchConfidence: 94,
    notFitReason: "",
    poolReason: "",
    createdAt: "2026-07-28T03:24:00.000Z",
    updatedAt: "2026-07-28T03:24:00.000Z"
  },
  {
    id: "candidate-daniel-wong",
    fullName: "Daniel Wong",
    primaryEmail: "daniel.wong@example.com",
    phone: "+65 8123 4400",
    source: "Executive search",
    currentTitle: "Regional FP&A Lead",
    currentCompany: "Northstar Retail Group",
    location: "Singapore",
    skillsSummary: "Regional FP&A, budget ownership, investor reporting, English presentation",
    cvNote: "Interview feedback pending · notice period 90 days",
    allocationState: "assigned",
    currentJobId: "job-finance-director",
    recommendedJobIds: ["job-finance-director"],
    matchConfidence: 87,
    notFitReason: "",
    poolReason: "",
    createdAt: "2026-07-27T08:20:00.000Z",
    updatedAt: "2026-07-27T08:20:00.000Z"
  },
  {
    id: "candidate-minh-anh-vo",
    fullName: "Minh Anh Vo",
    primaryEmail: "minh.anh.vo@example.com",
    phone: "+84 900 550 660",
    source: "LinkedIn outreach",
    currentTitle: "Investment Associate",
    currentCompany: "Lotus Capital",
    location: "Ho Chi Minh City",
    skillsSummary: "DCF, market maps, fintech pipeline, English memo drafting",
    cvNote: "Assessment submitted · founder decision next",
    allocationState: "assigned",
    currentJobId: "job-investment-associate",
    recommendedJobIds: ["job-investment-associate"],
    matchConfidence: 89,
    notFitReason: "",
    poolReason: "",
    createdAt: "2026-07-26T09:15:00.000Z",
    updatedAt: "2026-07-26T09:15:00.000Z"
  },
  {
    id: "candidate-duplicate-vivian",
    fullName: "Vivian Tran",
    primaryEmail: "vivian.tran@example.com",
    phone: "+84 900 777 888",
    source: "Agency",
    currentTitle: "Corporate Finance Associate",
    currentCompany: "BlueRiver Advisory",
    location: "Da Nang",
    skillsSummary: "Valuation, transaction support, Vietnamese market research",
    cvNote: "Potential duplicate from agency forward and direct application.",
    allocationState: "duplicate_review",
    currentJobId: null,
    recommendedJobIds: ["job-investment-associate"],
    matchConfidence: 88,
    notFitReason: "",
    poolReason: "Duplicate review required before assignment.",
    createdAt: "2026-07-25T09:00:00.000Z",
    updatedAt: "2026-07-25T09:00:00.000Z"
  },
  {
    id: "candidate-ella-park",
    fullName: "Ella Park",
    primaryEmail: "ella.park@example.com",
    phone: "+82 10 5512 9988",
    source: "Talent community",
    currentTitle: "Senior Accountant",
    currentCompany: "KoreaCloud",
    location: "Seoul",
    skillsSummary: "IFRS close, audit schedules, NetSuite, cost controls",
    cvNote: "Talent pool · strong controller fit, not Finance Director scope",
    allocationState: "not_fit_current_job",
    currentJobId: "job-finance-director",
    recommendedJobIds: ["job-finance-controller"],
    matchConfidence: 58,
    notFitReason: "Strong accounting execution, but limited FP&A leadership and board-facing experience for Finance Director.",
    poolReason: "Keep for Controller or Finance Manager roles after location expectations are confirmed.",
    createdAt: "2026-07-25T10:30:00.000Z",
    updatedAt: "2026-07-25T10:30:00.000Z"
  },
  {
    id: "candidate-rajiv-menon",
    fullName: "Rajiv Menon",
    primaryEmail: "rajiv.menon@example.com",
    phone: "+65 8123 7788",
    source: "Referral",
    currentTitle: "M&A Analyst",
    currentCompany: "Harbour Strategy",
    location: "Singapore",
    skillsSummary: "Investment memos, market sizing, SaaS comps, English writing",
    cvNote: "Talent pool · rejected for current associate role after industry depth review",
    allocationState: "unassigned_pool",
    currentJobId: null,
    recommendedJobIds: ["job-investment-associate"],
    matchConfidence: 71,
    notFitReason: "",
    poolReason: "Good future strategy bench; current search needs stronger fintech operating exposure.",
    createdAt: "2026-07-24T11:00:00.000Z",
    updatedAt: "2026-07-24T11:00:00.000Z"
  }
];

export function createEmptyCandidateDraft(): CandidateDraft {
  return {
    fullName: "",
    primaryEmail: "",
    phone: "",
    source: "Manual",
    currentTitle: "",
    currentCompany: "",
    location: "",
    skillsSummary: "",
    cvNote: "",
    allocationState: "unassigned_pool",
    currentJobId: null,
    recommendedJobIds: [],
    matchConfidence: 0,
    notFitReason: "",
    poolReason: ""
  };
}

export function validateCandidateDraft(draft: CandidateDraft): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!draft.fullName.trim()) errors.fullName = "Full name is required";
  return errors;
}

export function createCandidateFromDraft(draft: CandidateDraft): Candidate {
  const now = new Date().toISOString();
  return {
    ...draft,
    id: `candidate-${slugify(draft.fullName)}-${Math.random().toString(36).slice(2, 7)}`,
    fullName: draft.fullName.trim(),
    primaryEmail: draft.primaryEmail.trim(),
    phone: draft.phone.trim(),
    currentJobId: draft.currentJobId ?? null,
    createdAt: now,
    updatedAt: now
  };
}

export function detectCandidateDuplicate(draft: CandidateDraft, candidates: Candidate[]): DuplicateSignal | null {
  const email = draft.primaryEmail.trim().toLowerCase();
  const phone = normalizePhone(draft.phone);
  const emailMatch = email ? candidates.find((candidate) => candidate.primaryEmail.toLowerCase() === email) : undefined;
  if (emailMatch) return { candidateId: emailMatch.id, field: "primaryEmail", value: draft.primaryEmail };
  const phoneMatch = phone ? candidates.find((candidate) => normalizePhone(candidate.phone) === phone) : undefined;
  return phoneMatch ? { candidateId: phoneMatch.id, field: "phone", value: draft.phone } : null;
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}
