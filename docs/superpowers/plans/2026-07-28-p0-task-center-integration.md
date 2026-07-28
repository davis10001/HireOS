# P0 Task Center Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate the completed P0 Task Center branches J/K/L/M/N into one branch and verify the end-to-end MVP task flow.

**Architecture:** Start from the Task Core branch so the shared `RecruitingTask` contract is the base. Merge Dashboard, Application/Inbox emitters, Interview/Assessment emitters, and Founder/Governance views in order, resolving conflicts around the shared task contract and existing app shell hierarchy.

**Tech Stack:** React 19, TypeScript, Vite, Vitest, Testing Library, localStorage-backed MVP state.

## Global Constraints

- Do not edit `sources/`.
- Keep `Tasks` as an independent sidebar entry.
- Preserve current prototype visual and interaction hierarchy.
- Keep MVP local-state/seed-data behavior; do not add a backend or real mailbox authentication.
- Verify with `npm test -- --run`, `npm run build`, `git diff --check`, desktop smoke, and 390px mobile smoke.

---

### Task 1: Create Integration Branch And Merge Slices

**Files:**
- Modify through git merge: repository working tree

**Interfaces:**
- Consumes: `codex/task-core-center`, `codex/dashboard-task-summary`, `codex/application-inbox-task-emitters`, `codex/interview-assessment-task-emitters`, `codex/founder-governance-task-views`
- Produces: `codex/p0-task-center-integration`

- [ ] Create or switch to `codex/p0-task-center-integration` from `codex/task-core-center`.
- [ ] Merge K/L/M/N branches.
- [ ] Resolve conflicts in favor of a single `RecruitingTask` contract and coherent app shell.

### Task 2: Inspect Integrated Behavior

**Files:**
- Inspect/modify as needed: `src/App.tsx`
- Inspect/modify as needed: `src/domain/tasks.ts`
- Inspect/modify as needed: tests under `src/`

**Interfaces:**
- Consumes: integrated app
- Produces: reachable Dashboard, Tasks, module emitters, Founder Inbox, and Settings Governance task flows

- [ ] Confirm sidebar has `Tasks`.
- [ ] Confirm Dashboard summary cards link to `/tasks?view=...`.
- [ ] Confirm `/tasks` includes All Tasks, My Tasks, Critical, Today, Waiting on Others, and Batch Review.
- [ ] Confirm Application, Inbox, Interview, Assessment, Founder Inbox, and Settings Governance use `RecruitingTask`.
- [ ] Patch only integration issues found during inspection or verification.

### Task 3: Verify And Publish

**Files:**
- Modify: none unless verification exposes bugs

**Interfaces:**
- Consumes: integrated branch
- Produces: pushed branch with commit

- [ ] Run `npm test -- --run`.
- [ ] Run `npm run build`.
- [ ] Run `git diff --check`.
- [ ] Run desktop smoke: login, Dashboard Critical summary, Tasks Critical, task detail/action, related context.
- [ ] Run 390px mobile smoke for Dashboard and Tasks overflow/overlap.
- [ ] Commit and push `codex/p0-task-center-integration`.
