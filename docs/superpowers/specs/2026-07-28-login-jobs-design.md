# Login + Jobs MVP Design

## Goal

Build the first runnable HireOS slice: a login gate plus the Jobs module, while preserving the interaction framework and hierarchy defined by `frontend-prototype/` and `docs/prototype-parity-contract.md`.

## Scope

This slice includes:

- Login screen.
- Authenticated HireOS shell.
- Dashboard route as the post-login landing route.
- Jobs route with real local state.
- Job Detail route.
- Job creation through the prototype's four-step modal.
- Sidebar, right Agent panel, Agent Dock, account menu, language switch, sidebar collapse, agent collapse, and dock expand.

This slice does not implement real backend auth, email ingestion, candidate workflows, applications, assessments, founder decisions, analytics aggregation, or settings persistence. Those pages may remain static or parity-preserving placeholders inside the same shell.

## Prototype Contract

The implementation must follow `docs/prototype-parity-contract.md`.

For Jobs specifically, preserve:

- Jobs page topbar.
- Filter strip.
- Metric grid.
- Jobs list/table.
- Job detail entry.
- Right Job Agent.
- Agent Dock.
- Four-step job creation modal:
  - Create job
  - Enter requirements
  - AI generate
  - Edit and confirm

The UI must not be replaced by a simplified form/card app. Functional state must enter the existing prototype containers.

## User Flow

1. Visitor opens the app and sees the Login screen.
2. Visitor enters email and password.
3. On success, the app shows the authenticated HireOS shell at Dashboard.
4. User opens Jobs from the sidebar.
5. User filters Jobs by status or active queue.
6. User opens the New Job action.
7. User completes the four modal steps.
8. New job appears in the Jobs list and updates job metrics.
9. User opens Job Detail from a job row.
10. Job Detail shows the selected job state, tabs, candidate/application/evidence sections, right Agent context, and Dock.

## Login Behavior

Use local-only mock authentication:

- Accepted email: any valid email-like string.
- Accepted password: any non-empty string with at least 6 characters.
- Failed validation stays on Login and shows inline errors.
- Login state persists in `localStorage`.
- Logout clears the auth state and returns to Login.

The login page is not in the original prototype, so it may be newly designed. It should still use HireOS typography, colors, spacing, and brand language.

## Jobs Data Model

Each job has:

- `id`
- `title`
- `department`
- `location`
- `employmentType`
- `status`: `draft`, `active`, `paused`, `closed`
- `priority`: `normal`, `high`, `urgent`
- `owner`
- `createdAt`
- `updatedAt`
- `headcount`
- `applicationsCount`
- `pendingReviewCount`
- `blockedCount`
- `requirements`
- `scorecard`
- `generatedSummary`

## Job Creation Logic

The four-step modal collects and transforms state:

- Step 1: title, department, location, employment type, headcount.
- Step 2: requirements, must-have skills, nice-to-have skills, salary range, owner.
- Step 3: mock AI generates job summary, scorecard, screening criteria.
- Step 4: user edits final summary and confirms status.

On submit:

- A job is added to local state.
- Metrics update.
- Modal closes.
- Jobs list shows the new row.
- The new job can be opened in Job Detail.

## Routing

Use client-side routing with stable route IDs:

- `/login`
- `/dashboard`
- `/jobs`
- `/jobs/:jobId`
- Static shell routes for other prototype pages as needed.

If the project starts as a Vite React app, direct browser fallback should work through the development server.

## Error Handling

- Login validates email and password before allowing access.
- Job creation validates required fields before moving from Step 1 and Step 2.
- If Job Detail receives an unknown job ID, show a parity-preserving empty state inside the Job Detail page container and provide a Back to Jobs action.
- localStorage parsing errors should fall back to seeded mock data.

## Testing

Minimum tests:

- Login validation and successful auth.
- Authenticated shell renders Sidebar, Main, Agent, and Dock.
- Jobs route renders filter strip, metric grid, Jobs list, and New Job modal trigger.
- Four-step modal creates a job and updates the list.
- Job Detail opens from a job row.
- Logout returns to Login.

## Delivery Criteria

The first slice is done when:

- The app can run locally.
- Login works with local validation and persistence.
- Jobs module is interactive.
- Job Detail is reachable.
- Prototype hierarchy is preserved for shell and Jobs.
- Automated tests pass.
- A short verification summary records what was checked.
