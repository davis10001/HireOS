# HireOS MVP Spec

## Problem Statement

Founder and HR teams are running recruiting work across email threads, CV attachments, spreadsheets, chat, memory, and ad hoc notes. They cannot reliably answer core operating questions: how many candidates entered each Job, where each Application is now, who owns the next action, what evidence supports a decision, which workflows are blocked, and whether AI recommendations can be trusted.

The current HireOS materials include a static front-end prototype and a comprehensive PRD. The next step is to turn that product definition into an executable MVP specification that agents and engineers can implement. The MVP must prove the Email-first recruiting loop: recruiting email becomes structured Candidate, Job, Application, Evidence Event, Timeline, Assessment, Decision, Blocked, and Analytics data without losing human approval and auditability.

## Solution

Build HireOS as an Email-first AI-native recruiting operating system centered on the Application. A Candidate is the reusable person record, a Job is the hiring need, and an Application is the operational unit for one Candidate applying to one Job.

The MVP should let HR create and activate Jobs, connect a recruiting mailbox, ingest Email Threads and CV attachments, extract and deduplicate Candidates, match Candidates to Jobs, create or update Applications, route low-confidence or sensitive AI Actions through Inbox Items, track status, Current Owner, Process Owner, Next Action, Due Date and SLA, capture Evidence Events and Timeline history, support Interview and Assessment workflows, present Founder Decision Cards, detect Blocked Applications, and expose operational Analytics.

The highest implementation and testing seam is the end-to-end hiring loop:

```text
Create Job
  -> Configure Workflow
  -> Connect Recruiting Mailbox
  -> AI Email Intake
  -> Candidate Extraction / Deduplication
  -> Job Matching
  -> Application Creation / Update
  -> Pipeline Progress
  -> Interview Scheduling / Feedback
  -> Assessment
  -> Founder Decision
  -> Blocked / Analytics Visibility
```

## User Stories

1. As an HR Admin, I want to create a Job with title, team, headcount, location, level, budget, hiring manager, goal, JD, must-have criteria and success criteria, so that the hiring need is structured before candidates enter the system.
2. As an HR Admin, I want a new Job to start as Draft, so that incomplete hiring needs do not accidentally receive automatic candidate matches.
3. As an HR Admin, I want the system to validate Job configuration before activation, so that Active Jobs always have JD, Scorecard, Hiring Workflow, owner defaults and SLA rules.
4. As a Founder, I want to review Job Scorecards before a Job becomes Active, so that candidate evaluation is tied to agreed standards.
5. As a Hiring Manager, I want to confirm the Job goal, budget, level and success criteria, so that the recruiting team evaluates candidates against the right need.
6. As an HR Member, I want to pause a Job, so that inbound Email Threads do not automatically create new Applications while the role is on hold.
7. As an HR Member, I want to close a Job, so that no new Applications can be created once the role is no longer hiring.
8. As an HR Admin, I want to connect a recruiting mailbox, so that HireOS can read recruiting Email Threads and CV attachments.
9. As an HR Admin, I want to configure mailbox sync scope, folders, sender domains and historical sync range, so that AI only processes appropriate recruiting data.
10. As an HR Admin, I want to see Email Connection status, so that I know whether mailbox sync is connected, syncing, disconnected, requiring action or in error.
11. As an HR Member, I want inbound Email Threads classified by AI, so that CV intake, scheduling, feedback, Assessment submissions and candidate questions are separated from non-recruiting email.
12. As an HR Member, I want CV attachments parsed and linked to Candidate records, so that candidate information is not trapped in files.
13. As an HR Member, I want the system to preserve raw Email Threads and attachments, so that every extracted fact can be traced back to source evidence.
14. As an HR Member, I want AI to extract Candidate identity, email, phone, current company, title, location, skills and source, so that candidate creation is faster.
15. As an HR Member, I want AI to detect duplicate Candidate records using email, phone, CV hash, aliases and overlapping CV content, so that candidate history is not split.
16. As an HR Member, I want duplicate Candidates to enter Duplicate Review, so that merges are confirmed by a human.
17. As an HR Member, I want merged Candidates to preserve all CVs, sources, Email Threads and Applications, so that no recruiting history is lost.
   Manual Candidate/Application baseline adds:
   - As an HR Member, I want to manually create a Candidate and either keep the person in an Unassigned Pool or attach the person to an Active Job, so that HR can collect people before deciding their best role fit.
   - As an HR Member, I want a Candidates tab from the person perspective, grouped into Assigned Candidates, Unassigned Pool and Rejected / Not Fit Pool, so that candidates are not hidden just because they are not yet attached to a Job.
   - As an HR Member, I want to attach an existing Candidate to a Job from Job Detail, so that the system creates the Application only when a real Candidate + Job relationship exists.
   - As an HR Member, I want to mark a Candidate as Not Fit Current Job without deleting the person, so that the candidate can remain available for other Jobs.
18. As an HR Member, I want AI to match inbound Candidates to Active Jobs, so that relevant Applications can be created automatically when confidence is high.
19. As an HR Member, I want low-confidence Candidate, Job or Application matches to become Inbox Items or Unassigned Pool records, so that ambiguous data does not silently pollute the pipeline.
20. As an HR Member, I want high-confidence, low-risk AI Actions to Auto Apply, so that routine intake can move quickly.
21. As an HR Member, I want sensitive AI Actions to require approval, so that AI cannot reject, hire, make an Offer Decision, merge candidates or send sensitive messages alone.
22. As an HR Member, I want an Inbox with all work requiring review, so that low-confidence matches, duplicates, status updates, draft replies, Assessment reviews, Founder decisions and Blocked resolutions are handled in one place.
23. As an HR Member, I want Inbox Items to show raw evidence, AI recommendation, confidence and writeback preview, so that I can approve or correct safely.
24. As an HR Member, I want to approve, modify, reject, snooze or escalate Inbox Items, so that ambiguous recruiting work has a clear outcome.
25. As an HR Member, I want rejected Inbox Items to require a reason, so that future audits explain why AI output was not used.
26. As an HR Member, I want the system to create Candidates and Applications from approved intake, so that reviewed email work becomes structured recruiting data.
27. As an HR Member, I want each active Application to require Current Owner, Process Owner, Next Action and Due Date, so that every candidate flow is actionable.
28. As an HR Member, I want Application status to follow a standard dictionary, so that all pages and reports speak the same language.
29. As an HR Member, I want Application status changes to write Timeline records, so that the full recruiting history is visible.
30. As a Founder, I want every key status change and decision to link to Evidence Events, so that I can trust the recommendation.
31. As an HR Member, I want Application lists to show State, Owner, Next Action and SLA together, so that I can scan work quickly.
32. As an HR Member, I want to filter Applications by Job, status, owner, priority, risk and SLA status, so that I can work the right queue.
33. As an HR Member, I want to batch update owner and due dates when appropriate, so that operational cleanup is efficient.
34. As a Process Owner, I want Blocked Applications to keep their previous state, so that resolving a block returns the flow to the right context.
35. As an HR Member, I want missing owner, missing next action, missing due date, overdue work, waiting candidate, waiting interviewer, waiting Founder, evidence gap, low-confidence match, pending approval and mailbox error to create Blocked signals, so that stuck work becomes visible.
36. As an HR Member, I want Blocked root causes to have recommended actions, so that I know how to unblock each Application.
37. As a Founder, I want to see high-risk Blocked Applications, so that valuable candidates do not disappear from the process.
38. As an HR Member, I want Interview scheduling emails parsed for time, participants, candidate and Job, so that interview state stays current.
39. As an HR Member, I want Interviews to move through Draft, Scheduling, Scheduled, Rescheduled, Completed, No Show, Cancelled, Feedback Pending and Feedback Complete, so that interview operations are explicit.
40. As an Interviewer, I want to submit Interview Feedback by form or email, so that evidence can enter the Application Timeline without extra ceremony.
41. As a Founder, I want Interview Feedback to include recommendation, scorecard scores, evidence notes, risks and follow-up questions, so that I can judge signal quality.
42. As an HR Member, I want incomplete or conflicting Interview Feedback to become Needs Clarification, so that weak evidence is not treated as final.
43. As an HR Member, I want Assessment drafts tied to Job Scorecard criteria, so that exercises close evidence gaps instead of adding process drag.
44. As a Founder, I want to review or calibrate Assessments, so that important hiring judgments reflect human standards.
45. As an HR Member, I want to send Assessment instructions by email, so that MVP does not require a Candidate Portal.
46. As an HR Member, I want candidate Assessment submissions parsed from email and attachments, so that submissions become structured evidence.
47. As a Founder, I want AI Assessment Review to show rubric match, evidence, risk and confidence, so that I can decide whether more evaluation is needed.
48. As a Founder, I want Stop Rule recommendations, so that candidates are not forced through unnecessary assignments when evidence coverage is already sufficient.
49. As an HR Member, I want overdue Assessments to create follow-up work, so that candidate submissions do not stall.
50. As a Founder, I want a Founder Inbox that removes operational noise, so that I focus on high-value decisions.
51. As a Founder, I want Decision Cards with candidate summary, Job match, supporting evidence, counter-evidence, risks, gaps, recommendation and confidence, so that I can make decisions quickly.
52. As a Founder, I want to make Continue, Request More Evidence, Final Interview, Reject, Offer Decision or Hold decisions, so that the Application progresses with a clear record.
53. As a Founder, I want Final Interview, Reject, Offer Decision and Hold treated as sensitive decisions, so that they always require human confirmation.
54. As an HR Member, I want Offer Decision recorded as an MVP endpoint without full Offer management, so that the product stays focused.
55. As an HR Member, I want candidate withdrawal reasons recorded, so that Analytics can explain drop-off.
56. As an HR Member, I want Candidate profiles to show cross-Job Application history, so that the team does not confuse a person record with a process state.
57. As an HR Member, I want one Candidate to support multiple Applications, so that the same person can be evaluated for multiple Jobs independently.
58. As an HR Admin, I want role permissions for Founder, HR Admin, HR Member, Hiring Manager and Interviewer, so that users only perform appropriate actions.
59. As an HR Admin, I want User status to include Invited, Active and Disabled, so that access control is explicit.
60. As an HR Admin, I want all sensitive settings changes audited, so that mailbox scope, AI automation and permission changes are accountable.
61. As an HR Admin, I want AI Automation Rules to define auto-allowed, approval-required and forbidden actions, so that AI behavior is governed centrally.
62. As an HR Admin, I want Evidence Policy to define what counts as recruiting evidence, so that Analytics and decisions are grounded in consistent data.
63. As an HR Admin, I want default SLA rules, due dates and blocked detection inherited by Jobs and Applications, so that operations stay disciplined.
64. As a Founder, I want Dashboard metrics for funnel, pending work, Job progress, Blocked Applications and recent Evidence Timeline, so that I can understand system health.
65. As an HR Member, I want Dashboard links to preserve context filters, so that I can move from metric to work queue directly.
66. As a Founder, I want Analytics to show recruiting funnel, channel quality, HR execution efficiency and AI adoption, so that I can measure whether HireOS improves hiring operations.
67. As an HR Member, I want Time to Candidate Creation and Time to Status Update metrics, so that I can see whether email intake is fast enough.
68. As an HR Admin, I want AI Action adoption rates, so that we can evaluate where AI is saving time and where humans reject it.
69. As an HR Member, I want source attribution across Email, Agency, Referral, VietnamWorks, Manual Upload and CSV, so that channel quality can be compared.
70. As a Founder, I want Analytics data to come from structured events rather than page counts, so that metrics are reliable.
71. As a user, I want loading, empty, error, disconnected, syncing and permission states on core pages, so that system state is never ambiguous.
72. As a user, I want the interface to support Chinese and English labels, so that the team can use HireOS in the preferred language.
73. As an auditor, I want all AI writes, user changes, decisions, merges and settings changes logged, so that important actions can be reconstructed later.
74. As an engineer, I want the PRD state dictionary implemented as canonical enums, so that pages, APIs and analytics do not invent inconsistent statuses.
75. As an engineer, I want a single end-to-end acceptance path for the MVP, so that implementation can be verified against business outcomes instead of isolated screens.

## Implementation Decisions

- The MVP centers on `Application` as the operational unit. `Candidate` stores reusable person identity and cross-Job history; `Job` stores the hiring need and workflow defaults; `Application` stores the specific Candidate plus Job workflow state.
- The primary data entry path is `Email Thread` ingestion from a connected recruiting mailbox. Manual upload and CSV can exist, but the MVP proof point is Email-first intake.
- Every structured extraction or recommendation produced by AI is recorded as an `AI Action` with input references, output, confidence, evidence references and status.
- Every fact that influences workflow, evaluation or decision-making is recorded as an `Evidence Event` with source references. Original Email Threads and attachments are preserved.
- Low-confidence or sensitive AI Actions produce `Inbox Items`. Inbox is the approval and correction seam for ambiguous data and writebacks.
- Active Applications must always have `Current Owner`, `Process Owner`, `Next Action` and `Due Date`. Missing values are not a cosmetic issue; they create operational exceptions.
- `Blocked` is an overlay state for Applications and must preserve `previous_state`. Resolving a Blocked root cause returns the Application to the prior or explicitly selected next state.
- The state dictionary is canonical. UI labels, filters, API enum values, Analytics dimensions and AI prompts should map to these statuses instead of inventing page-local synonyms.
- Founder decisions are explicit `Decision` records. `Offer Decision` is the MVP endpoint and does not include Offer drafting, negotiation, contract signing or onboarding.
- AI may classify, summarize, extract evidence, recommend next actions and draft messages. AI must not automatically reject, hire, make Offer Decisions, decide compensation, delete evidence or hide low-confidence/counter-evidence.
- Job activation requires configuration completeness: JD, Scorecard, Hiring Workflow, owner defaults and SLA rules.
- Candidate duplicate handling preserves history. Merged Candidate records keep sources, CVs, Email Threads and Applications linked to the surviving Candidate.
- Candidate is the person record and can exist without an Application. Candidate allocation states are `Unassigned Pool`, `Assigned`, `Not Fit Current Job`, `Rejected Global` and `Duplicate Review`.
- Applications are created only when a Candidate is attached to a Job. A Candidate in `Unassigned Pool` must not appear in the Applications Pipeline.
- `Not Fit Current Job` means the person does not fit one Job; it does not delete the Candidate or globally reject the person.
- Analytics are event-based. Funnel, channel quality, execution efficiency and AI adoption metrics must derive from structured records and events, not static UI counts.
- The prototype supplied the MVP information architecture and canonical surface areas: Dashboard, Jobs, Inbox, Email Agent, Applications, Candidates, Assessments, Founder Inbox, Blocked, Analytics and Settings.
- The prototype also encodes the high-value state machine decisions below. These should be treated as product decisions, not just UI copy:

```text
Job:
Draft -> Active
Draft -> Archived
Active -> Paused
Paused -> Active
Active -> Closed
Paused -> Closed
Closed -> Archived

Application:
New Intake
  -> Needs HR Review
  -> HR Shortlisted
  -> Scheduling Interview
  -> Interview Scheduled
  -> Interview Completed
  -> Waiting Feedback
  -> Assessment Draft
  -> Assessment Sent
  -> Assessment Submitted
  -> Assessment Review
  -> Founder Review
  -> Final Interview
  -> Offer Decision
  -> Closed

Any Active State -> Waiting Candidate
Any Active State -> Blocked
Any Active State -> Hold
Any Active State -> Rejected
Any Active State -> Withdrawn
Blocked -> Previous State
Hold -> Previous State

AI Action:
Generated -> Pending Approval -> Approved -> Applied
Generated -> Auto Applied
Generated -> Rejected
Applied -> Corrected
Applied -> Reverted
```

- The main modules to build or modify are the application shell, auth and roles, Job management, mailbox connection, email ingestion, Candidate registry, Application workflow, Inbox review, Evidence Timeline, Interview workflow, Assessment workspace, Founder Inbox, Blocked detection, Analytics, Settings, AI Action governance and Audit Log.
- API contracts should expose resources around Organization, User, Job, Scorecard, Hiring Workflow, Candidate, Candidate Source, CV/Attachment, Email Connection, Email Thread, Application, Evidence Event, Inbox Item, Interview, Interview Feedback, Assessment, Assessment Submission, Decision, AI Action and Audit Log.
- The front-end should preserve the current prototype's product structure while replacing static data with real API-backed state, loading states, empty states, error states and permission states.
- The implementation should prefer one highest-level acceptance seam: the end-to-end hiring loop from Job creation through mailbox intake to Founder Decision and Analytics visibility.

## Testing Decisions

- Good tests should verify external behavior and business outcomes rather than implementation details. The strongest tests are scenario-level checks that start with a user or system event and assert visible state, persisted records and downstream effects.
- The primary acceptance test seam is the HireOS MVP end-to-end hiring loop. A test fixture should create an Active Job, connect or simulate a recruiting mailbox, ingest a CV Email Thread, create or review a Candidate and Application, advance the Application through Interview or Assessment, generate a Founder Decision Card, record a Decision and verify Blocked/Analytics visibility.
- Test Job activation by attempting to activate incomplete Jobs and verifying that missing JD, Workflow, Owner, SLA or Scorecard blocks activation.
- Test Email Intake by feeding high-confidence CV intake, low-confidence job match, duplicate candidate, non-recruiting email and unsupported attachment scenarios.
- Test Inbox review by approving, modifying, rejecting, snoozing and escalating Inbox Items and asserting resulting writebacks or lack of writebacks.
- Test Application workflow by asserting required owner, process owner, next action and due date on active Applications.
- Test Application status transitions by verifying allowed transitions, terminal states and `previous_state` preservation for Blocked and Hold.
- Test Blocked detection by creating missing owner, missing next action, missing due date, overdue, waiting candidate, waiting interviewer, waiting Founder, evidence gap, low-confidence match, approval pending and mailbox error cases.
- Test Candidate deduplication through exact email, exact phone, CV hash and weak-match cases.
- Test Interview workflow by parsing scheduling messages, completing interviews, requiring feedback and resolving Feedback Pending.
- Test Assessment workflow by creating Draft, sending Ready to Send, ingesting Submitted, parsing submissions, reviewing, calibrating and applying Stop Rule decisions.
- Test Founder Inbox by ensuring only high-value decision items appear and that sensitive decisions require human confirmation.
- Test AI governance by checking Generated, Pending Approval, Approved, Auto Applied, Applied, Rejected, Corrected and Reverted AI Action paths.
- Test auditability by verifying that candidate merges, status changes, AI writebacks, decisions, settings changes and permission changes create Audit Log entries.
- Test Analytics by verifying that funnel, source attribution, time to candidate creation, time to status update, blocked count and AI adoption metrics derive from structured events.
- There is no existing application test suite in the repository yet. Initial tests should define high-level acceptance seams first, then add module-level tests where they support the end-to-end business loop.

## Out of Scope

- Candidate Portal.
- Candidate Task Link.
- Complete DM automation.
- VietnamWorks browser scraping.
- Real-time interview Copilot.
- Video interview transcription.
- AI automatic rejection.
- AI automatic hiring.
- Full Offer drafting, negotiation, contract signing or onboarding.
- Full Workflow Builder.
- Advanced multi-tenant enterprise permission model.
- Calendar integrations beyond future-ready scheduling hooks.
- Slack or Teams notifications.
- Offer Management beyond recording an Offer Decision.
- Recruitment forecasting and capacity planning.

## Further Notes

- The GitHub repository is public and contains the current comprehensive PRD, MVP gap analysis, domain glossary and front-end prototype.
- The current prototype is static HTML/CSS/JS. It should be treated as a product and visual reference, not as a production architecture constraint.
- The PRD contains a fuller state dictionary than this Spec. Implementation should use that dictionary as the detailed source of truth when defining enums and UI labels.
- The current issue tracker label vocabulary did not include `ready-for-agent`; this issue should receive that label once created.
- The issue tracker should split this Spec into smaller implementation issues after the first architectural pass. Good first slices are Core Data Model, Application Workflow, Mailbox Intake, Review Inbox, AI Governance, Founder Decision, Assessment Workspace, Blocked Detection and Analytics.
