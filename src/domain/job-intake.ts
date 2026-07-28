import { slugify } from "./ids";
import type { Job } from "./jobs";
import type { RecruitingTask } from "./tasks";

export type AiJobIntakeField =
  | "jobTitle"
  | "hiringReason"
  | "ninetyDayGoal"
  | "coreResponsibilities"
  | "mustHave"
  | "budgetRange"
  | "locationWorkMode"
  | "reportingLine"
  | "englishRequirement"
  | "notFitProfile";

export type AiJobIntakeStatus =
  | "in_progress"
  | "ready_to_generate"
  | "generated"
  | "edited"
  | "revision_requested"
  | "draft_saved"
  | "approved";

export interface AiJobPackage {
  externalJd: string;
  internalRoleBrief: string;
  mustHave: string[];
  niceToHave: string[];
  knockoutCriteria: string[];
  scorecard: string[];
  screeningQuestions: string[];
  interviewPlan: string[];
}

export interface AiJobAction {
  id: string;
  actionType: "intake_turn" | "generate_package" | "user_edit" | "save_draft" | "revision_request" | "approve_package";
  version: number;
  status: "captured" | "generated" | "edited" | "saved" | "requested" | "approved";
  actor: "AI" | "Human";
  summary: string;
  createdAt: string;
  confidence?: number;
}

export interface AiJobAuditEvent {
  id: string;
  eventType: "generated" | "edited" | "saved_draft" | "revision_requested" | "approved";
  actor: string;
  createdAt: string;
  summary: string;
  version: number;
}

export interface AiJobIntakeSession {
  id: string;
  status: AiJobIntakeStatus;
  fields: Record<AiJobIntakeField, string>;
  completedFields: AiJobIntakeField[];
  missingFields: AiJobIntakeField[];
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  nextQuestion: string;
  package: AiJobPackage | null;
  version: number;
  aiActions: AiJobAction[];
  auditTrail: AiJobAuditEvent[];
}

export interface ApprovedJobPackageResult {
  session: AiJobIntakeSession;
  job: Job;
  auditTrail: AiJobAuditEvent[];
  followUpTask: RecruitingTask;
}

export const requiredAiJobIntakeFields: AiJobIntakeField[] = [
  "jobTitle",
  "hiringReason",
  "ninetyDayGoal",
  "coreResponsibilities",
  "mustHave",
  "budgetRange",
  "locationWorkMode",
  "reportingLine",
  "englishRequirement",
  "notFitProfile"
];

export const aiJobIntakeFieldLabels: Record<AiJobIntakeField, string> = {
  jobTitle: "Job title",
  hiringReason: "Hiring reason",
  ninetyDayGoal: "90-day goal",
  coreResponsibilities: "Core responsibilities",
  mustHave: "Must-have",
  budgetRange: "Budget range",
  locationWorkMode: "Location / work mode",
  reportingLine: "Reporting line",
  englishRequirement: "English requirement",
  notFitProfile: "Not-fit profile"
};

const emptyFields: Record<AiJobIntakeField, string> = {
  jobTitle: "",
  hiringReason: "",
  ninetyDayGoal: "",
  coreResponsibilities: "",
  mustHave: "",
  budgetRange: "",
  locationWorkMode: "",
  reportingLine: "",
  englishRequirement: "",
  notFitProfile: ""
};

export function createAiJobIntakeSession(initialNeed: string, createdAt = new Date().toISOString()): AiJobIntakeSession {
  return normalizeSession({
    id: `ai-job-intake-${slugify(initialNeed || "new-role")}-${createdAt.slice(0, 10)}`,
    status: "in_progress",
    fields: extractFields(initialNeed, emptyFields),
    completedFields: [],
    missingFields: [],
    messages: [{ role: "user", content: initialNeed }],
    nextQuestion: "",
    package: null,
    version: 0,
    aiActions: [{
      id: `ai-job-action-intake-0`,
      actionType: "intake_turn",
      actor: "AI",
      createdAt,
      status: "captured",
      summary: "Captured initial natural-language hiring need.",
      version: 0
    }],
    auditTrail: []
  });
}

export function intakeAnswer(session: AiJobIntakeSession, answer: string, createdAt = new Date().toISOString()): AiJobIntakeSession {
  const next = normalizeSession({
    ...session,
    fields: extractFields(answer, session.fields),
    messages: [...session.messages, { role: "user", content: answer }],
    aiActions: [
      ...session.aiActions,
      {
        id: `ai-job-action-intake-${session.aiActions.length}`,
        actionType: "intake_turn",
        actor: "AI",
        createdAt,
        status: "captured",
        summary: "Captured additional intake details and updated missing required fields.",
        version: session.version
      }
    ]
  });
  return next;
}

export function generateJobPackage(session: AiJobIntakeSession, createdAt = new Date().toISOString()): AiJobIntakeSession {
  const normalized = normalizeSession(session);
  if (normalized.missingFields.length) {
    throw new Error(`Cannot generate package; missing required intake fields: ${normalized.missingFields.join(", ")}`);
  }
  const version = normalized.version + 1;
  const jobPackage = buildPackage(normalized.fields);
  const action: AiJobAction = {
    id: `ai-job-action-generate-${version}`,
    actionType: "generate_package",
    actor: "AI",
    createdAt,
    status: "generated",
    summary: `Generated v${version} Job Package from completed intake.`,
    version,
    confidence: 0.86
  };
  return {
    ...normalized,
    status: "generated",
    package: jobPackage,
    version,
    nextQuestion: "Review the package, edit any field, request a revision, save draft, or approve.",
    messages: [...normalized.messages, { role: "assistant", content: "I generated a structured Job Package for human review." }],
    aiActions: [...normalized.aiActions, action],
    auditTrail: [...normalized.auditTrail, audit("generated", "AI", createdAt, action.summary, version)]
  };
}

export function applyJobPackageEdits(session: AiJobIntakeSession, edits: Partial<AiJobPackage>, actor: string, createdAt = new Date().toISOString()): AiJobIntakeSession {
  if (!session.package) throw new Error("Cannot edit before a Job Package has been generated.");
  const version = session.version + 1;
  return {
    ...session,
    status: "edited",
    version,
    package: { ...session.package, ...edits },
    aiActions: [...session.aiActions, humanAction("user_edit", "edited", actor, createdAt, "User manually edited generated Job Package fields.", version)],
    auditTrail: [...session.auditTrail, audit("edited", actor, createdAt, "User manually edited generated Job Package fields.", version)]
  };
}

export function saveJobPackageDraft(session: AiJobIntakeSession, actor: string, createdAt = new Date().toISOString()): AiJobIntakeSession {
  if (!session.package) throw new Error("Cannot save draft before a Job Package has been generated.");
  const version = session.version + 1;
  return {
    ...session,
    status: "draft_saved",
    version,
    aiActions: [...session.aiActions, humanAction("save_draft", "saved", actor, createdAt, "Saved AI Job Package as a Draft.", version)],
    auditTrail: [...session.auditTrail, audit("saved_draft", actor, createdAt, "Saved AI Job Package as a Draft.", version)]
  };
}

export function requestJobPackageRevision(session: AiJobIntakeSession, instruction: string, createdAt = new Date().toISOString()): AiJobIntakeSession {
  if (!session.package) throw new Error("Cannot revise before a Job Package has been generated.");
  const version = session.version + 1;
  const packageRevision = revisePackage(session.package, instruction);
  return {
    ...session,
    status: "revision_requested",
    version,
    package: packageRevision,
    messages: [...session.messages, { role: "user", content: instruction }, { role: "assistant", content: "I revised the package and kept it in review for human approval." }],
    aiActions: [...session.aiActions, {
      id: `ai-job-action-revision-${version}`,
      actionType: "revision_request",
      actor: "AI",
      createdAt,
      status: "requested",
      summary: `Revision requested: ${instruction}`,
      version,
      confidence: 0.82
    }],
    auditTrail: [...session.auditTrail, audit("revision_requested", "AI", createdAt, `Revision requested: ${instruction}`, version)]
  };
}

export function approveJobPackage(session: AiJobIntakeSession, approver: string, approvedAt = new Date().toISOString()): ApprovedJobPackageResult {
  if (!session.package) throw new Error("Cannot approve before a Job Package has been generated.");
  const version = session.version + 1;
  const approvedSession: AiJobIntakeSession = {
    ...session,
    status: "approved",
    version,
    aiActions: [...session.aiActions, humanAction("approve_package", "approved", approver, approvedAt, `Package approved by ${approver}.`, version)],
    auditTrail: [...session.auditTrail, audit("approved", approver, approvedAt, `Package approved by ${approver}.`, version)]
  };
  const job = createApprovedJob(approvedSession, approver, approvedAt);
  return {
    session: approvedSession,
    job,
    auditTrail: approvedSession.auditTrail,
    followUpTask: buildApprovedPackageTask(job, approvedAt)
  };
}

function normalizeSession(session: AiJobIntakeSession): AiJobIntakeSession {
  const completedFields = requiredAiJobIntakeFields.filter((field) => session.fields[field].trim());
  const missingFields = requiredAiJobIntakeFields.filter((field) => !session.fields[field].trim());
  return {
    ...session,
    completedFields,
    missingFields,
    status: missingFields.length ? "in_progress" : session.status === "in_progress" ? "ready_to_generate" : session.status,
    nextQuestion: missingFields.length ? questionFor(missingFields[0]) : session.nextQuestion || "All required fields are complete. Generate the Job Package when ready."
  };
}

function extractFields(text: string, current: Record<AiJobIntakeField, string>): Record<AiJobIntakeField, string> {
  const next = { ...current };
  const lines = text.split(/\n+/).map((line) => line.trim()).filter(Boolean);
  const fullText = text.trim();

  if (!next.jobTitle) next.jobTitle = inferJobTitle(fullText);
  for (const line of lines) {
    assignLabeledField(next, line);
  }
  if (!next.budgetRange) next.budgetRange = fullText.match(/(?:USD|VND|\$)\s?[\d,]+(?:[-–]\s?[\d,]+)?(?:\s?\w+)?/i)?.[0] ?? "";
  if (!next.locationWorkMode) next.locationWorkMode = fullText.match(/(?:Ho Chi Minh|Hanoi|Da Nang|remote|hybrid|onsite)[^\n.]*/i)?.[0] ?? "";
  if (!next.reportingLine) next.reportingLine = fullText.match(/reports? to[:\s]+([^\n.]+)/i)?.[1]?.trim() ?? "";
  if (!next.englishRequirement && /english/i.test(fullText)) next.englishRequirement = sentenceContaining(fullText, /english/i);
  return next;
}

function assignLabeledField(fields: Record<AiJobIntakeField, string>, line: string) {
  const [rawLabel, ...rest] = line.split(":");
  if (!rest.length) return;
  const label = rawLabel.toLowerCase();
  const value = rest.join(":").trim().replace(/\.$/, "");
  if (!value) return;
  if (label.includes("hiring reason") || label.includes("why")) fields.hiringReason = value;
  else if (label.includes("90")) fields.ninetyDayGoal = value;
  else if (label.includes("responsib")) fields.coreResponsibilities = value;
  else if (label.includes("must")) fields.mustHave = value;
  else if (label.includes("budget") || label.includes("salary")) fields.budgetRange = value;
  else if (label.includes("location") || label.includes("work mode")) fields.locationWorkMode = value;
  else if (label.includes("reports") || label.includes("reporting")) fields.reportingLine = value;
  else if (label.includes("english")) fields.englishRequirement = value;
  else if (label.includes("not fit") || label.includes("not-fit")) fields.notFitProfile = value;
}

function inferJobTitle(text: string): string {
  const needMatch = text.match(/(?:need|hire|hiring|create)\s+(?:an?\s+)?([A-Z][A-Za-z/&\s-]{2,80}?)(?:\s+for|\s+to|\.|$)/);
  if (needMatch) return needMatch[1].trim();
  const titleMatch = text.match(/\b([A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+){1,5})\b/);
  return titleMatch?.[1]?.trim() ?? "";
}

function buildPackage(fields: Record<AiJobIntakeField, string>): AiJobPackage {
  const title = fields.jobTitle;
  const responsibilities = toList(fields.coreResponsibilities);
  const mustHave = toList(fields.mustHave);
  const notFit = toList(fields.notFitProfile);
  return {
    externalJd: `${title}\n\nWe are hiring a ${title} to ${fields.hiringReason}. In the first 90 days, success means ${fields.ninetyDayGoal}. The role is based in ${fields.locationWorkMode} and reports to ${fields.reportingLine}.`,
    internalRoleBrief: `${title} role brief: ${fields.hiringReason}. Budget: ${fields.budgetRange}. English requirement: ${fields.englishRequirement}.`,
    mustHave,
    niceToHave: ["Vietnam market context", "Experience in AI-native operating environments"],
    knockoutCriteria: notFit.map((item) => `Filter out ${item}`),
    scorecard: [
      ...mustHave.slice(0, 3),
      "90-day execution against monthly reporting and investor visibility",
      "Clear communication with Founder, HR, and cross-functional partners"
    ],
    screeningQuestions: [
      `Walk us through your closest experience to: ${responsibilities[0] ?? fields.coreResponsibilities}.`,
      `How would you deliver this 90-day goal: ${fields.ninetyDayGoal}?`,
      `What English-language stakeholder situations have you owned?`
    ],
    interviewPlan: [
      "HR screen: validate budget, location, English, and knockout criteria.",
      "Hiring Manager interview: probe must-have evidence and 90-day execution plan.",
      "Founder interview: confirm strategic fit, reporting line, and approval to publish."
    ]
  };
}

function revisePackage(jobPackage: AiJobPackage, instruction: string): AiJobPackage {
  return {
    ...jobPackage,
    internalRoleBrief: `${jobPackage.internalRoleBrief}\nRevision note: ${instruction}`,
    externalJd: `${jobPackage.externalJd}\n\nRevision note: ${instruction}`
  };
}

function createApprovedJob(session: AiJobIntakeSession, approver: string, approvedAt: string): Job {
  const fields = session.fields;
  const jobPackage = session.package!;
  return {
    id: `job-${slugify(fields.jobTitle)}-${slugify(approvedAt).slice(0, 10)}`,
    title: fields.jobTitle.trim(),
    department: inferDepartment(fields.jobTitle),
    location: fields.locationWorkMode.trim(),
    employmentType: "Full-time",
    status: "draft",
    priority: "high",
    owner: approver,
    createdAt: approvedAt,
    updatedAt: approvedAt,
    headcount: 1,
    applicationsCount: 0,
    pendingReviewCount: 0,
    blockedCount: 0,
    requirements: jobPackage.internalRoleBrief,
    mustHaveSkills: jobPackage.mustHave.join(", "),
    niceToHaveSkills: jobPackage.niceToHave.join(", "),
    salaryRange: fields.budgetRange.trim(),
    generatedSummary: `AI Job Package v${session.version}. Package approved by ${approver} at ${approvedAt}. ${jobPackage.externalJd}`,
    scorecard: jobPackage.scorecard,
    aiJobPackage: jobPackage,
    aiAuditTrail: session.auditTrail,
    packageApproval: { approver, approvedAt, version: session.version }
  };
}

function buildApprovedPackageTask(job: Job, createdAt: string): RecruitingTask {
  return {
    id: `task-job-approved-package-${job.id}`,
    title: `Publish approved job: ${job.title}`,
    sourceModule: "Jobs",
    owner: job.owner,
    ownerRole: "HR",
    priority: "High",
    status: "Open",
    nextAction: "Review approved AI Job Package, confirm workflow defaults, then publish manually.",
    dueAt: createdAt,
    slaState: "Ready",
    relatedObjects: [{ module: "Jobs", id: job.id, label: job.title }],
    allowedActions: [{ label: "Route workflow setup", kind: "route", targetStatus: "Routed" }],
    aiRecommendation: "Human approval is complete; publishing remains a manual HR action.",
    aiAutomationLevel: "L3",
    aiApprovalRequired: false,
    evidenceRefs: job.aiAuditTrail?.map((event) => `${event.eventType} v${event.version}`) ?? [],
    batchReview: false
  };
}

function questionFor(field: AiJobIntakeField): string {
  const questions: Record<AiJobIntakeField, string> = {
    jobTitle: "What job title should this role use?",
    hiringReason: "Why now? What business need makes this hire necessary?",
    ninetyDayGoal: "What should this person accomplish in the first 90 days?",
    coreResponsibilities: "What are the 3-6 core responsibilities?",
    mustHave: "What must-have criteria should hard-filter candidates?",
    budgetRange: "What budget or compensation range should constrain the search?",
    locationWorkMode: "Where is the role based, and is it onsite, hybrid, or remote?",
    reportingLine: "Who does this person report to?",
    englishRequirement: "What English proficiency or interview language is required?",
    notFitProfile: "What candidate profile is clearly not a fit?"
  };
  return questions[field];
}

function humanAction(actionType: AiJobAction["actionType"], status: AiJobAction["status"], actor: string, createdAt: string, summary: string, version: number): AiJobAction {
  return {
    id: `ai-job-action-${actionType}-${version}`,
    actionType,
    actor: "Human",
    createdAt,
    status,
    summary: `${summary} Actor: ${actor}.`,
    version
  };
}

function audit(eventType: AiJobAuditEvent["eventType"], actor: string, createdAt: string, summary: string, version: number): AiJobAuditEvent {
  return {
    id: `ai-job-audit-${eventType}-${version}`,
    eventType,
    actor,
    createdAt,
    summary,
    version
  };
}

function sentenceContaining(text: string, pattern: RegExp): string {
  return text.split(/[.\n]/).map((part) => part.trim()).find((part) => pattern.test(part)) ?? "";
}

function toList(value: string): string[] {
  return value
    .split(/,|;|\band\b/i)
    .map((item) => item.trim())
    .filter(Boolean);
}

function inferDepartment(title: string): string {
  if (/finance|accounting|fp&a|controller/i.test(title)) return "Finance";
  if (/engineer|developer|platform|data/i.test(title)) return "Engineering";
  if (/designer|product/i.test(title)) return "Product";
  return "Operations";
}
