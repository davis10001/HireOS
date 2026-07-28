# Candidates + Applications Baseline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the manual Candidate creation, candidate pool, Job assignment, and Application baseline so HR can create people, keep them in a pool, attach them to Jobs, and see Applications only after Candidate + Job are linked.

**Architecture:** Continue from `codex/login-jobs-prototype-parity`. Add focused domain modules for Candidates and Applications, then wire them into the existing prototype-preserving shell. Use localStorage-backed state and React components inside the existing Candidates, Job Detail, Applications, and Application Detail hierarchy.

**Tech Stack:** Vite, React, TypeScript, Vitest, Testing Library, lucide-react, localStorage-backed mock state.

## Global Constraints

- Treat `sources/` as read-only reference material.
- Follow `docs/prototype-parity-contract.md`.
- Follow updated `docs/hireos-prd-comprehensive.md`, `docs/hireos-mvp-spec.md`, `docs/hireos-mvp-spec.zh.md`, and GitHub issue #4.
- Candidate is the person record and can exist without an Application.
- Application is created only when Candidate + Job are linked.
- Keep Sidebar + Main + Right Agent + Agent Dock.
- Do not build a separate candidate assignment app.
- Do not implement Inbox, Email Agent, Assessment, Founder Inbox, or Analytics business logic in this slice.

---

## File Structure

- Modify `src/domain/jobs.ts`: keep current Job contracts stable.
- Create `src/domain/candidates.ts`: Candidate types, seed candidates, allocation state, validation, duplicate detection.
- Create `src/domain/applications.ts`: Application types, seed applications, create-from-candidate-job helper, timeline event helper.
- Modify `src/App.tsx`: route state, Candidates page, Applications page, Job Detail Candidates tab, Application Detail data wiring.
- Modify `src/styles.css`: candidate pool, assignment modal, pipeline, history, and responsive layout styles inside existing prototype classes.
- Modify `src/App.test.tsx`: smoke path for create Candidate, save to pool, attach to Job, open Application Detail.
- Create `src/domain/candidates.test.ts`.
- Create `src/domain/applications.test.ts`.

---

### Task 1: Candidate And Application Domain Model

**Files:**
- Create: `src/domain/candidates.ts`
- Create: `src/domain/applications.ts`
- Create: `src/domain/candidates.test.ts`
- Create: `src/domain/applications.test.ts`

**Interfaces:**
- Produces: `CandidateAllocationState = "unassigned_pool" | "assigned" | "not_fit_current_job" | "rejected_global" | "duplicate_review"`
- Produces: `Candidate`
- Produces: `CandidateDraft`
- Produces: `createEmptyCandidateDraft(): CandidateDraft`
- Produces: `validateCandidateDraft(draft: CandidateDraft): Record<string, string>`
- Produces: `createCandidateFromDraft(draft: CandidateDraft): Candidate`
- Produces: `detectCandidateDuplicate(draft: CandidateDraft, candidates: Candidate[]): DuplicateSignal | null`
- Produces: `Application`
- Produces: `ApplicationTimelineEvent`
- Produces: `createApplicationForCandidate(candidate: Candidate, job: Job): Application`

- [ ] **Step 1: Write failing domain tests**

Test cases:

- Candidate requires full name.
- Candidate can be created as `unassigned_pool`.
- Duplicate signal appears for same email or phone.
- Application creation requires Candidate + Active Job.
- Created Application has current owner, process owner, next action, due date, current state, and initial timeline event.

- [ ] **Step 2: Implement domain helpers**

Use deterministic field names:

- Candidate fields: `id`, `fullName`, `primaryEmail`, `phone`, `source`, `currentTitle`, `currentCompany`, `location`, `skillsSummary`, `cvNote`, `allocationState`, `currentJobId`, `recommendedJobIds`, `matchConfidence`, `notFitReason`, `poolReason`, `createdAt`, `updatedAt`.
- Application fields: `id`, `candidateId`, `jobId`, `candidateName`, `jobTitle`, `currentState`, `currentOwner`, `processOwner`, `nextAction`, `dueAt`, `slaStatus`, `timeline`.

- [ ] **Step 3: Run tests**

Run:

```bash
npm test -- src/domain/candidates.test.ts src/domain/applications.test.ts
```

Expected: PASS.

---

### Task 2: Candidates Page From Person Perspective

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/styles.css`
- Modify: `src/App.test.tsx`

**Interfaces:**
- Consumes: Candidate domain helpers.
- Produces: Candidates page with Candidate Registry, Assigned Candidates, Unassigned Pool, Rejected / Not Fit Pool, Duplicate Review, Candidate History.

- [ ] **Step 1: Add failing UI test**

Test that clicking Candidates route shows:

- `Candidate Registry`
- `Assigned Candidates`
- `Unassigned Pool`
- `Rejected / Not Fit Pool`
- `Duplicate Review`
- `New Candidate`

- [ ] **Step 2: Implement Candidates route**

Keep prototype hierarchy:

- topbar with `New Candidate`
- metric grid
- Candidate Registry table
- pool sections
- Duplicate Review
- Candidate History
- right Candidate Agent context
- Agent Dock

- [ ] **Step 3: Run tests**

Run:

```bash
npm test -- src/App.test.tsx
```

Expected: PASS.

---

### Task 3: New Candidate Modal And Pool Save

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/styles.css`
- Modify: `src/App.test.tsx`

**Interfaces:**
- Produces: modal flow from Candidates `New Candidate`.
- Produces: `onCreateCandidate(candidate: Candidate)`.

- [ ] **Step 1: Add failing test**

Test flow:

1. Open Candidates.
2. Click `New Candidate`.
3. Fill name, email, phone, source, current title, location, skills, CV note.
4. Choose `Save to Unassigned Pool`.
5. Candidate appears in Unassigned Pool.
6. Candidate does not appear in Applications Pipeline.

- [ ] **Step 2: Implement modal**

Modal fields:

- full name
- email
- phone
- source
- current title/company
- location
- skills summary
- CV/evidence note
- allocation choice: save to pool / attach to Job

- [ ] **Step 3: Implement localStorage persistence**

Use `hireos.candidates`.

- [ ] **Step 4: Run tests**

Run:

```bash
npm test
```

Expected: PASS.

---

### Task 4: Job Detail Candidates Tab Assignment

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/styles.css`
- Modify: `src/App.test.tsx`

**Interfaces:**
- Consumes: Candidate list and Job list.
- Consumes: `createApplicationForCandidate(candidate, job)`.
- Produces: `onAttachCandidateToJob(candidateId: string, jobId: string): Application`.

- [ ] **Step 1: Add failing test**

Test flow:

1. Create Candidate in Unassigned Pool.
2. Open Job Detail.
3. Open Candidates tab.
4. See Assigned Candidates, Unassigned Pool, Rejected / Not Fit Pool sections.
5. Attach pooled Candidate to current Job.
6. Application is created.
7. Candidate allocation state becomes `assigned`.

- [ ] **Step 2: Implement Job Detail Candidates tab**

Use existing Job Detail page hierarchy. Add:

- Assigned Candidates section
- Unassigned Pool section
- Rejected / Not Fit Pool section
- `Attach to this Job` action
- `Create and attach Candidate` action

- [ ] **Step 3: Run tests**

Run:

```bash
npm test
```

Expected: PASS.

---

### Task 5: Applications Pipeline And Application Detail Wiring

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/styles.css`
- Modify: `src/App.test.tsx`

**Interfaces:**
- Consumes: Application domain.
- Produces: Applications page from real local Application state.
- Produces: Application Detail reads selected Application.

- [ ] **Step 1: Add failing test**

Test flow:

1. Attach Candidate to Job.
2. Open Applications.
3. Candidate appears in Pipeline Workbench.
4. Open Application Detail.
5. Detail shows Candidate identity separately from Application workflow state.
6. Timeline includes initial creation event.

- [ ] **Step 2: Implement Applications page**

Preserve prototype:

- secondary tabs
- metric grid
- Pipeline Workbench table
- Application Timeline
- Owner Load
- right Application Agent

- [ ] **Step 3: Implement Application Detail wiring**

Keep existing Application Detail prototype flow, but populate identity and workflow sections from selected Candidate + Application.

- [ ] **Step 4: Run tests**

Run:

```bash
npm test
npm run build
```

Expected: PASS.

---

### Task 6: Not Fit Current Job And Duplicate Blocking

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/styles.css`
- Modify: `src/App.test.tsx`

**Interfaces:**
- Consumes: duplicate detection.
- Produces: Not Fit Current Job and Duplicate Review UI state.

- [ ] **Step 1: Add failing test**

Test:

- Candidate can be marked `Not Fit Current Job` from Job Detail and moves to Rejected / Not Fit Pool.
- Candidate with duplicate signal enters Duplicate Review.
- Duplicate Review Candidate cannot be attached to Job until HR resolves it.

- [ ] **Step 2: Implement state transitions**

Rules:

- `not_fit_current_job` does not delete Candidate.
- `rejected_global` is separate and should require explicit reason.
- `duplicate_review` blocks assignment.

- [ ] **Step 3: Run all checks**

Run:

```bash
npm test
npm run build
git diff --check
```

Expected: PASS.

---

## Delivery Criteria

- Candidates page works from the person perspective.
- HR can create Candidate into Unassigned Pool.
- HR can attach Candidate to Job from Job Detail.
- Application is created only after Candidate + Job are linked.
- Applications Pipeline shows real local Applications.
- Application Detail separates Candidate identity from Application process state.
- Not Fit Current Job and Duplicate Review are represented.
- Tests and build pass.
- Local preview remains available.
