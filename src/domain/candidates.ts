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
    id: "candidate-trang-nguyen",
    fullName: "Trang Nguyen",
    primaryEmail: "trang.nguyen@example.com",
    phone: "+84 900 110 220",
    source: "Recruiting email",
    currentTitle: "Backend Engineer",
    currentCompany: "Fintech Co",
    location: "Ho Chi Minh",
    skillsSummary: "Go, Node.js, PostgreSQL, Kafka",
    cvNote: "7 evidence events · 1 assessment",
    allocationState: "assigned",
    currentJobId: "job-backend",
    recommendedJobIds: ["job-backend"],
    matchConfidence: 94,
    notFitReason: "",
    poolReason: "",
    createdAt: "2026-07-28T03:24:00.000Z",
    updatedAt: "2026-07-28T03:24:00.000Z"
  },
  {
    id: "candidate-anh-le",
    fullName: "Anh Le",
    primaryEmail: "anh.le@example.com",
    phone: "+84 900 330 440",
    source: "Manual",
    currentTitle: "Product Engineer",
    currentCompany: "SaaS Studio",
    location: "Da Nang",
    skillsSummary: "React, Node.js, product systems",
    cvNote: "面试反馈混合 · 存在证据缺口",
    allocationState: "not_fit_current_job",
    currentJobId: "job-backend",
    recommendedJobIds: ["job-designer"],
    matchConfidence: 62,
    notFitReason: "Strong product skill, weaker backend platform depth for this job.",
    poolReason: "May fit product platform or internal tools roles.",
    createdAt: "2026-07-27T08:20:00.000Z",
    updatedAt: "2026-07-27T08:20:00.000Z"
  },
  {
    id: "candidate-minh-pham",
    fullName: "Minh Pham",
    primaryEmail: "minh.pham@example.com",
    phone: "+84 900 550 660",
    source: "Referral",
    currentTitle: "Platform Engineer",
    currentCompany: "Cloud VN",
    location: "Hanoi",
    skillsSummary: "Infrastructure, observability, Kubernetes",
    cvNote: "Offer 证据完整",
    allocationState: "unassigned_pool",
    currentJobId: null,
    recommendedJobIds: ["job-platform"],
    matchConfidence: 81,
    notFitReason: "",
    poolReason: "Good future fit, waiting for Platform Engineer activation.",
    createdAt: "2026-07-26T09:15:00.000Z",
    updatedAt: "2026-07-26T09:15:00.000Z"
  },
  {
    id: "candidate-duplicate-nora",
    fullName: "Nora Le",
    primaryEmail: "nora.le@example.com",
    phone: "+84 900 777 888",
    source: "Agency",
    currentTitle: "Backend Engineer",
    currentCompany: "Payment Hub",
    location: "Ho Chi Minh",
    skillsSummary: "Node.js, payment APIs",
    cvNote: "Potential duplicate from agency forward and direct apply.",
    allocationState: "duplicate_review",
    currentJobId: null,
    recommendedJobIds: ["job-backend"],
    matchConfidence: 88,
    notFitReason: "",
    poolReason: "Duplicate review required before assignment.",
    createdAt: "2026-07-25T09:00:00.000Z",
    updatedAt: "2026-07-25T09:00:00.000Z"
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
