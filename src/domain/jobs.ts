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
    id: "job-backend",
    title: "Senior Backend Engineer",
    department: "Engineering",
    location: "Ho Chi Minh · Hybrid",
    employmentType: "Full-time",
    status: "active",
    priority: "high",
    owner: "Linh Tran",
    createdAt: "2026-07-20T09:00:00.000Z",
    updatedAt: "2026-07-27T10:30:00.000Z",
    headcount: 4,
    applicationsCount: 74,
    pendingReviewCount: 11,
    blockedCount: 1,
    requirements: "Own workflow services, API design, and timeline integrity.",
    mustHaveSkills: "Node.js, API design, queues",
    niceToHaveSkills: "Recruiting workflow systems",
    salaryRange: "Senior · Vietnam band",
    generatedSummary: "Senior Backend Engineer responsible for reliable HireOS workflow services.",
    scorecard: ["System design", "API reliability", "Workflow ownership", "Cross-functional communication"]
  },
  {
    id: "job-designer",
    title: "Product Designer",
    department: "Product",
    location: "Remote",
    employmentType: "Contract",
    status: "active",
    priority: "normal",
    owner: "Mai Ho",
    createdAt: "2026-07-18T09:00:00.000Z",
    updatedAt: "2026-07-26T08:30:00.000Z",
    headcount: 2,
    applicationsCount: 38,
    pendingReviewCount: 7,
    blockedCount: 0,
    requirements: "Design recruiter workbench flows and evidence review.",
    mustHaveSkills: "B2B product design, systems thinking",
    niceToHaveSkills: "AI workflow tooling",
    salaryRange: "Contract · Vietnam band",
    generatedSummary: "Product Designer for dense operational recruiting workflows.",
    scorecard: ["Interaction design", "Information hierarchy", "Design systems", "Research synthesis"]
  },
  {
    id: "job-platform",
    title: "Platform Engineer",
    department: "Engineering",
    location: "Hanoi",
    employmentType: "Full-time",
    status: "draft",
    priority: "urgent",
    owner: "Tech Lead",
    createdAt: "2026-07-22T09:00:00.000Z",
    updatedAt: "2026-07-27T12:10:00.000Z",
    headcount: 4,
    applicationsCount: 29,
    pendingReviewCount: 9,
    blockedCount: 6,
    requirements: "Build platform defaults for owner, SLA, and evidence governance.",
    mustHaveSkills: "Infrastructure, observability",
    niceToHaveSkills: "Hiring operations",
    salaryRange: "Budget pending",
    generatedSummary: "Platform Engineer role waiting for workflow defaults.",
    scorecard: ["Operational reliability", "Data model discipline", "Platform automation"]
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
