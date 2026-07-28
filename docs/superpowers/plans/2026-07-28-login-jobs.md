# Login + Jobs MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first runnable HireOS slice with a local login gate and an interactive Jobs module that preserves the original prototype's shell, Jobs page hierarchy, four-step job creation modal, and Job Detail route.

**Architecture:** Create a Vite + React + TypeScript frontend in the project root. Reuse the prototype's layout language by porting `frontend-prototype/hireos-pages.css` into app styles and implementing React components that map to the original shell, page, table, modal, Agent, and Dock containers. Store auth and Jobs state locally through focused modules so later sessions can replace storage with APIs without changing page hierarchy.

**Tech Stack:** Vite, React, TypeScript, Vitest, Testing Library, lucide-react, localStorage-backed mock state.

## Global Constraints

- Treat `sources/` as read-only reference material.
- `frontend-prototype/` is the interaction framework and information architecture baseline, not a loose visual reference.
- Preserve Sidebar + Main + right Agent + Agent Dock after login.
- Login may be newly designed because the prototype does not include it.
- Jobs must preserve filter strip, metric grid, Jobs list/table, Job Detail entry, right Job Agent, Agent Dock, and four-step creation modal.
- Do not replace Jobs with a simplified inline form/card app.
- Other modules may remain static or parity-preserving placeholders inside the shell.

---

## File Structure

- Create `package.json`: npm scripts and dependencies.
- Create `index.html`: Vite app mount.
- Create `tsconfig.json`, `tsconfig.node.json`, `vite.config.ts`, `vitest.setup.ts`: build and test config.
- Create `src/main.tsx`: React entry.
- Create `src/App.tsx`: route/auth orchestration.
- Create `src/styles.css`: app styles ported from prototype containers plus login and responsive refinements.
- Create `src/domain/jobs.ts`: Job types, seed jobs, metrics, validation, creation helpers.
- Create `src/domain/auth.ts`: local auth validation and persistence helpers.
- Create `src/components/AppShell.tsx`: Sidebar, top shell, Agent, Dock, global interactions.
- Create `src/components/LoginPage.tsx`: login page.
- Create `src/pages/DashboardPage.tsx`: parity-preserving dashboard shell content.
- Create `src/pages/JobsPage.tsx`: interactive Jobs list, filters, metrics, create modal.
- Create `src/pages/JobDetailPage.tsx`: selected job detail page.
- Create `src/pages/PlaceholderPage.tsx`: parity-preserving placeholders for non-implemented routes.
- Create `src/test-utils/render.tsx`: test render helper.
- Create tests under `src/**/*.test.tsx`.

---

### Task 1: Project Scaffold And Test Harness

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `vite.config.ts`
- Create: `vitest.setup.ts`
- Create: `src/main.tsx`
- Create: `src/test-utils/render.tsx`

**Interfaces:**
- Produces: Vite app entry at `src/main.tsx`.
- Produces: Vitest setup with `@testing-library/jest-dom`.

- [ ] **Step 1: Create scaffold files**

Create the app as a root Vite React project.

`package.json` scripts:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

Dependencies:

```json
{
  "dependencies": {
    "@vitejs/plugin-react": "latest",
    "vite": "latest",
    "typescript": "latest",
    "react": "latest",
    "react-dom": "latest",
    "lucide-react": "latest"
  },
  "devDependencies": {
    "vitest": "latest",
    "jsdom": "latest",
    "@testing-library/react": "latest",
    "@testing-library/user-event": "latest",
    "@testing-library/jest-dom": "latest"
  }
}
```

- [ ] **Step 2: Add Vitest config**

Configure `vite.config.ts` with React plugin and `test.environment = "jsdom"`, `setupFiles = "./vitest.setup.ts"`.

- [ ] **Step 3: Add React entry**

`src/main.tsx` must mount `<App />` into `#root` and import `src/styles.css`.

- [ ] **Step 4: Install dependencies**

Run: `npm install`

- [ ] **Step 5: Verify empty scaffold**

Run: `npm test`

Expected: Vitest exits successfully with no tests or discovered setup.

---

### Task 2: Domain State For Auth And Jobs

**Files:**
- Create: `src/domain/auth.ts`
- Create: `src/domain/jobs.ts`
- Create: `src/domain/jobs.test.ts`

**Interfaces:**
- Produces: `validateLogin(email: string, password: string): { ok: true } | { ok: false; errors: { email?: string; password?: string } }`
- Produces: `loadAuthState(): AuthSession | null`
- Produces: `saveAuthState(session: AuthSession): void`
- Produces: `clearAuthState(): void`
- Produces: `seedJobs: Job[]`
- Produces: `buildJobMetrics(jobs: Job[]): JobMetrics`
- Produces: `createJobFromDraft(draft: JobDraft): Job`
- Produces: `validateJobStep(step: 0 | 1 | 2 | 3, draft: JobDraft): Record<string, string>`

- [ ] **Step 1: Write failing domain tests**

`src/domain/jobs.test.ts`:

```ts
import { buildJobMetrics, createEmptyJobDraft, createJobFromDraft, validateJobStep } from "./jobs";
import { validateLogin } from "./auth";

it("validates login input", () => {
  expect(validateLogin("bad", "123").ok).toBe(false);
  expect(validateLogin("linh@hireos.vn", "secret1").ok).toBe(true);
});

it("builds job metrics from job status", () => {
  const jobs = [
    { ...createJobFromDraft({ ...createEmptyJobDraft(), title: "Backend", department: "Engineering", location: "Ho Chi Minh", employmentType: "Full-time", owner: "Linh Tran", requirements: "APIs", headcount: 2, status: "active" }) },
    { ...createJobFromDraft({ ...createEmptyJobDraft(), title: "Designer", department: "Design", location: "Remote", employmentType: "Contract", owner: "Mai Ho", requirements: "Portfolio", headcount: 1, status: "draft" }) }
  ];

  expect(buildJobMetrics(jobs)).toMatchObject({
    total: 2,
    active: 1,
    draft: 1
  });
});

it("requires title before leaving job creation step one", () => {
  const errors = validateJobStep(0, createEmptyJobDraft());
  expect(errors.title).toBe("Job title is required");
});
```

- [ ] **Step 2: Run failing test**

Run: `npm test -- src/domain/jobs.test.ts`

Expected: FAIL because modules do not exist.

- [ ] **Step 3: Implement auth and job helpers**

Implement exact exported functions and types named above. `createJobFromDraft` must generate `id`, timestamps, `generatedSummary`, and `scorecard` from the draft.

- [ ] **Step 4: Run tests**

Run: `npm test -- src/domain/jobs.test.ts`

Expected: PASS.

---

### Task 3: Authenticated Shell Matching Prototype

**Files:**
- Create: `src/components/AppShell.tsx`
- Create: `src/pages/PlaceholderPage.tsx`
- Create: `src/App.tsx`
- Create: `src/App.test.tsx`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: auth helpers from `src/domain/auth.ts`.
- Produces: `AppShell` with props `{ routeTitle: string; routeDescription: string; agentTitle: string; agentSubtitle: string; children: React.ReactNode; topActions?: React.ReactNode; }`.
- Produces: route IDs: `dashboard`, `jobs`, `job-detail`, `inbox`, `applications`, `analytics`, `settings`.

- [ ] **Step 1: Write failing shell tests**

`src/App.test.tsx`:

```tsx
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderApp } from "./test-utils/render";

it("shows login before authentication", () => {
  renderApp();
  expect(screen.getByRole("heading", { name: /sign in to hireos/i })).toBeInTheDocument();
});

it("renders prototype shell after login", async () => {
  const user = userEvent.setup();
  renderApp();
  await user.type(screen.getByLabelText(/email/i), "linh@hireos.vn");
  await user.type(screen.getByLabelText(/password/i), "secret1");
  await user.click(screen.getByRole("button", { name: /sign in/i }));

  expect(screen.getByLabelText("主导航")).toBeInTheDocument();
  expect(screen.getByText("Operate")).toBeInTheDocument();
  expect(screen.getByText("Intelligence")).toBeInTheDocument();
  expect(screen.getByLabelText("Agent 对话区")).toBeInTheDocument();
  expect(screen.getByLabelText("Agent 快捷输入")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run failing shell tests**

Run: `npm test -- src/App.test.tsx`

Expected: FAIL because app components do not exist.

- [ ] **Step 3: Implement AppShell**

Implement Sidebar with Dashboard, Jobs, Inbox under Operate and Analytics, Settings under Intelligence. Preserve account menu, language switch, sidebar collapse, agent collapse, and dock expand state.

- [ ] **Step 4: Implement App route state**

Use in-memory route state instead of adding a router dependency. Login success sets authenticated state and shows Dashboard. Sidebar Jobs click sets route to Jobs.

- [ ] **Step 5: Add shell CSS**

Port the prototype layout classes into `src/styles.css`: `app-shell`, `sidebar`, `main`, `topbar`, `page-content`, `agent`, `agent-dock`, `metric-grid`, `panel`, `table`, `tabs`, `secondary-tabs`, `pill`, `chip`, `modal-backdrop`.

- [ ] **Step 6: Run shell tests**

Run: `npm test -- src/App.test.tsx`

Expected: PASS.

---

### Task 4: Login Page

**Files:**
- Create: `src/components/LoginPage.tsx`
- Create: `src/components/LoginPage.test.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: `validateLogin`, `saveAuthState`.
- Produces: Login page with props `{ onLogin(session: AuthSession): void }`.

- [ ] **Step 1: Write failing login tests**

`src/components/LoginPage.test.tsx`:

```tsx
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "@testing-library/react";
import { LoginPage } from "./LoginPage";

it("shows inline errors for invalid login", async () => {
  const user = userEvent.setup();
  render(<LoginPage onLogin={() => undefined} />);
  await user.click(screen.getByRole("button", { name: /sign in/i }));
  expect(screen.getByText("Enter a valid email")).toBeInTheDocument();
  expect(screen.getByText("Password must be at least 6 characters")).toBeInTheDocument();
});

it("calls onLogin for valid login", async () => {
  const user = userEvent.setup();
  const onLogin = vi.fn();
  render(<LoginPage onLogin={onLogin} />);
  await user.type(screen.getByLabelText(/email/i), "linh@hireos.vn");
  await user.type(screen.getByLabelText(/password/i), "secret1");
  await user.click(screen.getByRole("button", { name: /sign in/i }));
  expect(onLogin).toHaveBeenCalledWith(expect.objectContaining({ email: "linh@hireos.vn" }));
});
```

- [ ] **Step 2: Run failing login tests**

Run: `npm test -- src/components/LoginPage.test.tsx`

Expected: FAIL because `LoginPage` does not exist.

- [ ] **Step 3: Implement LoginPage**

Create a polished login page using HireOS brand, email input, password input, remember-local behavior through caller state, submit button, and inline validation messages.

- [ ] **Step 4: Run login tests**

Run: `npm test -- src/components/LoginPage.test.tsx`

Expected: PASS.

---

### Task 5: Jobs Page With Four-Step Modal

**Files:**
- Create: `src/pages/JobsPage.tsx`
- Create: `src/pages/JobsPage.test.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: `seedJobs`, `buildJobMetrics`, `createEmptyJobDraft`, `createJobFromDraft`, `validateJobStep`.
- Produces: `JobsPage` with props `{ jobs: Job[]; onCreateJob(job: Job): void; onOpenJob(jobId: string): void }`.

- [ ] **Step 1: Write failing Jobs tests**

`src/pages/JobsPage.test.tsx`:

```tsx
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "@testing-library/react";
import { JobsPage } from "./JobsPage";
import { seedJobs } from "../domain/jobs";

it("renders the prototype Jobs containers", () => {
  render(<JobsPage jobs={seedJobs} onCreateJob={() => undefined} onOpenJob={() => undefined} />);
  expect(screen.getByRole("heading", { name: "Jobs" })).toBeInTheDocument();
  expect(screen.getByText("Active Jobs")).toBeInTheDocument();
  expect(screen.getByText("Job Pipeline")).toBeInTheDocument();
  expect(screen.getByText("Open Roles")).toBeInTheDocument();
});

it("creates a job through the four-step modal", async () => {
  const user = userEvent.setup();
  const onCreateJob = vi.fn();
  render(<JobsPage jobs={seedJobs} onCreateJob={onCreateJob} onOpenJob={() => undefined} />);

  await user.click(screen.getByRole("button", { name: /new job/i }));
  expect(screen.getByText("1 Create job")).toBeInTheDocument();

  await user.type(screen.getByLabelText("Job title"), "Growth PM");
  await user.type(screen.getByLabelText("Department"), "Product");
  await user.type(screen.getByLabelText("Location"), "Ho Chi Minh");
  await user.click(screen.getByRole("button", { name: /next/i }));

  await user.type(screen.getByLabelText("Requirements"), "B2B SaaS and hiring workflow experience");
  await user.click(screen.getByRole("button", { name: /next/i }));

  await user.click(screen.getByRole("button", { name: /generate/i }));
  expect(screen.getByText(/AI generated scorecard/i)).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: /next/i }));

  await user.click(screen.getByRole("button", { name: /create job/i }));
  expect(onCreateJob).toHaveBeenCalledWith(expect.objectContaining({ title: "Growth PM" }));
});
```

- [ ] **Step 2: Run failing Jobs tests**

Run: `npm test -- src/pages/JobsPage.test.tsx`

Expected: FAIL because `JobsPage` does not exist.

- [ ] **Step 3: Implement JobsPage**

Build the page using prototype containers: top filters, metric grid, panel header, tabs, toolbar, table rows, job creation modal, right-compatible content copy. Keep form inputs inside the modal.

- [ ] **Step 4: Wire Jobs state in App**

Store jobs in App state initialized from localStorage or `seedJobs`. `onCreateJob` appends a job and persists the array.

- [ ] **Step 5: Run Jobs tests**

Run: `npm test -- src/pages/JobsPage.test.tsx`

Expected: PASS.

---

### Task 6: Job Detail Route

**Files:**
- Create: `src/pages/JobDetailPage.tsx`
- Create: `src/pages/JobDetailPage.test.tsx`
- Modify: `src/App.tsx`
- Modify: `src/pages/JobsPage.tsx`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: `Job`.
- Produces: `JobDetailPage` with props `{ job?: Job; onBack(): void }`.

- [ ] **Step 1: Write failing Job Detail tests**

`src/pages/JobDetailPage.test.tsx`:

```tsx
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "@testing-library/react";
import { JobDetailPage } from "./JobDetailPage";
import { seedJobs } from "../domain/jobs";

it("renders selected job detail with prototype sections", () => {
  render(<JobDetailPage job={seedJobs[0]} onBack={() => undefined} />);
  expect(screen.getByRole("heading", { name: seedJobs[0].title })).toBeInTheDocument();
  expect(screen.getByText("Job Overview")).toBeInTheDocument();
  expect(screen.getByText("Scorecard")).toBeInTheDocument();
  expect(screen.getByText("Application Flow")).toBeInTheDocument();
});

it("shows an empty state for missing jobs", async () => {
  const user = userEvent.setup();
  const onBack = vi.fn();
  render(<JobDetailPage onBack={onBack} />);
  expect(screen.getByText("Job not found")).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: /back to jobs/i }));
  expect(onBack).toHaveBeenCalled();
});
```

- [ ] **Step 2: Run failing Job Detail tests**

Run: `npm test -- src/pages/JobDetailPage.test.tsx`

Expected: FAIL because component does not exist.

- [ ] **Step 3: Implement JobDetailPage**

Use prototype detail hierarchy: top summary, job tabs, candidates/applications/evidence panels, timeline, Agent context supplied by `AppShell`.

- [ ] **Step 4: Wire row click from Jobs**

Job rows call `onOpenJob(job.id)`; App stores selected ID and renders Job Detail.

- [ ] **Step 5: Run Job Detail tests**

Run: `npm test -- src/pages/JobDetailPage.test.tsx`

Expected: PASS.

---

### Task 7: Logout, Persistence, And End-To-End Verification

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/AppShell.tsx`
- Create: `src/e2e-smoke.test.tsx`
- Modify: `README.md`

**Interfaces:**
- Consumes: auth helpers and Jobs state.
- Produces: logout action in account menu.

- [ ] **Step 1: Write failing smoke test**

`src/e2e-smoke.test.tsx`:

```tsx
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderApp } from "./test-utils/render";

it("logs in, opens jobs, creates a job, opens detail, and logs out", async () => {
  const user = userEvent.setup();
  renderApp();

  await user.type(screen.getByLabelText(/email/i), "linh@hireos.vn");
  await user.type(screen.getByLabelText(/password/i), "secret1");
  await user.click(screen.getByRole("button", { name: /sign in/i }));

  await user.click(screen.getByRole("button", { name: "Jobs" }));
  await user.click(screen.getByRole("button", { name: /new job/i }));
  await user.type(screen.getByLabelText("Job title"), "Revenue Analyst");
  await user.type(screen.getByLabelText("Department"), "Finance");
  await user.type(screen.getByLabelText("Location"), "Hanoi");
  await user.click(screen.getByRole("button", { name: /next/i }));
  await user.type(screen.getByLabelText("Requirements"), "Revenue reporting and hiring budget analysis");
  await user.click(screen.getByRole("button", { name: /next/i }));
  await user.click(screen.getByRole("button", { name: /generate/i }));
  await user.click(screen.getByRole("button", { name: /next/i }));
  await user.click(screen.getByRole("button", { name: /create job/i }));

  await user.click(screen.getByRole("button", { name: /open revenue analyst/i }));
  expect(screen.getByRole("heading", { name: "Revenue Analyst" })).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: /account menu/i }));
  await user.click(screen.getByRole("button", { name: /sign out/i }));
  expect(screen.getByRole("heading", { name: /sign in to hireos/i })).toBeInTheDocument();
});
```

- [ ] **Step 2: Run failing smoke test**

Run: `npm test -- src/e2e-smoke.test.tsx`

Expected: FAIL until all wiring is complete.

- [ ] **Step 3: Implement logout and persistence**

Account menu Sign out clears auth localStorage and returns to Login. Jobs localStorage survives logout/login.

- [ ] **Step 4: Update README**

Document:

```md
## Frontend

Run the app:

```bash
npm install
npm run dev
```

Run tests:

```bash
npm test
```

Login accepts any valid email-like address and any password with at least 6 characters.
```
```

- [ ] **Step 5: Run all checks**

Run:

```bash
npm test
npm run build
```

Expected: PASS.

- [ ] **Step 6: Start local dev server**

Run: `npm run dev -- --host 127.0.0.1`

Expected: local URL is printed for user testing.

---

## Self-Review

- Spec coverage: Login, shell, Jobs, Job Detail, modal flow, persistence, tests, and prototype parity are all covered.
- Placeholder scan: no TBD/TODO placeholders are present.
- Type consistency: exported auth and job helpers are named once and reused consistently across tasks.
- Scope check: This plan intentionally excludes Inbox, Applications, Candidates beyond Jobs-related static shell routes, Assessments, Founder Inbox, Analytics aggregation, and Settings persistence.
