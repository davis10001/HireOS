import { slugify } from "./ids";

export type JobStatus = "draft" | "active" | "paused" | "closed";
export type JobPriority = "normal" | "high" | "urgent";

export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  employmentType: string;
  status: JobStatus;
  priority: JobPriority;
  owner: string;
  createdAt: string;
  updatedAt: string;
  headcount: number;
  applicationsCount: number;
  pendingReviewCount: number;
  blockedCount: number;
  requirements: string;
  mustHaveSkills: string;
  niceToHaveSkills: string;
  salaryRange: string;
  scorecard: string[];
  generatedSummary: string;
}

export interface JobDraft {
  title: string;
  department: string;
  location: string;
  employmentType: string;
  status: JobStatus;
  priority: JobPriority;
  owner: string;
  headcount: number;
  requirements: string;
  mustHaveSkills: string;
  niceToHaveSkills: string;
  salaryRange: string;
  generatedSummary: string;
  scorecard: string[];
}

export interface JobMetrics {
  total: number;
  active: number;
  draft: number;
  paused: number;
  closed: number;
  blocked: number;
}

export const seedJobs: Job[] = [
  {
    id: "job-finance-director",
    title: "Finance Director",
    department: "Finance",
    location: "Ho Chi Minh City · Hybrid",
    employmentType: "Full-time",
    status: "active",
    priority: "urgent",
    owner: "Linh Tran",
    createdAt: "2026-07-12T09:00:00.000Z",
    updatedAt: "2026-07-28T04:20:00.000Z",
    headcount: 1,
    applicationsCount: 42,
    pendingReviewCount: 6,
    blockedCount: 1,
    requirements: "Lead FP&A, controllership, board reporting, cash planning, and finance operating cadence for a Series B company.",
    mustHaveSkills: "FP&A leadership, controllership, board reporting, Vietnam tax and audit exposure",
    niceToHaveSkills: "SaaS revenue recognition, fundraising support, Big 4 foundation",
    salaryRange: "VND 160M-190M monthly base · approved budget",
    generatedSummary: "Finance Director search focused on a hands-on leader who can run finance operations while supporting founder-level planning and investor reporting.",
    scorecard: ["Finance leadership", "Board and investor reporting", "Controllership and audit discipline", "Cash planning", "Executive communication"]
  },
  {
    id: "job-investment-associate",
    title: "Strategic Investment Associate",
    department: "Strategy & Corporate Development",
    location: "Singapore / Ho Chi Minh City · Hybrid",
    employmentType: "Full-time",
    status: "paused",
    priority: "high",
    owner: "Mai Ho",
    createdAt: "2026-07-15T09:00:00.000Z",
    updatedAt: "2026-07-28T03:45:00.000Z",
    headcount: 1,
    applicationsCount: 31,
    pendingReviewCount: 8,
    blockedCount: 3,
    requirements: "Support investment pipeline, market mapping, target screening, valuation models, and founder-ready investment memos.",
    mustHaveSkills: "Investment banking or consulting, valuation, financial modeling, English investment memos",
    niceToHaveSkills: "Southeast Asia fintech or SaaS deal exposure, Vietnamese market network",
    salaryRange: "VND 70M-95M monthly base · budget under review",
    generatedSummary: "Strategic Investment Associate search is paused while compensation range and location expectations are recalibrated against finalist risk.",
    scorecard: ["Financial modeling", "Investment memo writing", "Market and competitor research", "Founder communication", "SEA sector judgment"]
  },
  {
    id: "job-finance-controller",
    title: "Finance Controller",
    department: "Finance",
    location: "Hanoi · Hybrid",
    employmentType: "Full-time",
    status: "draft",
    priority: "normal",
    owner: "Linh Tran",
    createdAt: "2026-07-24T09:00:00.000Z",
    updatedAt: "2026-07-27T12:10:00.000Z",
    headcount: 1,
    applicationsCount: 0,
    pendingReviewCount: 0,
    blockedCount: 0,
    requirements: "Draft backfill for controllership coverage if the Finance Director hire needs a longer ramp.",
    mustHaveSkills: "Month-end close, audit support, local statutory reporting",
    niceToHaveSkills: "NetSuite migration support",
    salaryRange: "Budget pending",
    generatedSummary: "Finance Controller draft role kept as a contingency requisition, not an active hiring lane.",
    scorecard: ["Close discipline", "Audit readiness", "Local reporting", "Systems migration"]
  }
];

export function createEmptyJobDraft(): JobDraft {
  return {
    title: "",
    department: "",
    location: "",
    employmentType: "Full-time",
    status: "draft",
    priority: "normal",
    owner: "Linh Tran",
    headcount: 1,
    requirements: "",
    mustHaveSkills: "",
    niceToHaveSkills: "",
    salaryRange: "",
    generatedSummary: "",
    scorecard: []
  };
}

export function buildJobMetrics(jobs: Job[]): JobMetrics {
  return {
    total: jobs.length,
    active: jobs.filter((job) => job.status === "active").length,
    draft: jobs.filter((job) => job.status === "draft").length,
    paused: jobs.filter((job) => job.status === "paused").length,
    closed: jobs.filter((job) => job.status === "closed").length,
    blocked: jobs.reduce((sum, job) => sum + job.blockedCount, 0)
  };
}

export function validateJobStep(step: 0 | 1 | 2 | 3, draft: JobDraft): Record<string, string> {
  const errors: Record<string, string> = {};
  if (step === 0) {
    if (!draft.title.trim()) errors.title = "Job title is required";
    if (!draft.department.trim()) errors.department = "Department is required";
    if (!draft.location.trim()) errors.location = "Location is required";
  }
  if (step === 1 && !draft.requirements.trim()) {
    errors.requirements = "Requirements are required";
  }
  return errors;
}

export function generateJobDraft(draft: JobDraft): JobDraft {
  return {
    ...draft,
    generatedSummary: `${draft.title} will own ${draft.requirements.trim()} for the ${draft.department} team.`,
    scorecard: [
      "AI generated scorecard: role-specific experience",
      "Workflow ownership and evidence quality",
      "Communication with HR and hiring manager"
    ]
  };
}

export function createJobFromDraft(draft: JobDraft): Job {
  const now = new Date().toISOString();
  const generated = draft.generatedSummary ? draft : generateJobDraft(draft);
  return {
    id: `job-${slugify(draft.title)}-${Math.random().toString(36).slice(2, 7)}`,
    title: draft.title.trim(),
    department: draft.department.trim(),
    location: draft.location.trim(),
    employmentType: draft.employmentType,
    status: draft.status,
    priority: draft.priority,
    owner: draft.owner.trim() || "Linh Tran",
    createdAt: now,
    updatedAt: now,
    headcount: Number(draft.headcount) || 1,
    applicationsCount: 0,
    pendingReviewCount: 0,
    blockedCount: 0,
    requirements: draft.requirements.trim(),
    mustHaveSkills: draft.mustHaveSkills,
    niceToHaveSkills: draft.niceToHaveSkills,
    salaryRange: draft.salaryRange,
    generatedSummary: generated.generatedSummary,
    scorecard: generated.scorecard
  };
}
