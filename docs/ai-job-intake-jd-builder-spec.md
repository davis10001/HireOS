# R - AI Job Intake / JD Builder Spec

## 1. Scope

R is the first real AI capability for HireOS. It only covers AI-assisted job creation: a Founder, Hiring Manager or HR user describes a hiring need in natural language, AI asks only the necessary follow-up questions, then generates an editable and approvable Job Package.

This feature does not include resume parsing, candidate matching, email automation, assessment scoring, real-time interview support or autonomous recruiting actions.

## 2. Business Scenario

Founder / Hiring Manager often starts with an incomplete hiring idea:

> We need a Finance Director for Vietnam finance operations and fundraising support.

The system should guide the user until the role is clear enough to hire against. AI should convert the conversation into a structured Job Package that HR can use for screening, interview planning and downstream tasks.

## 3. Users

- Founder: starts strategic roles and approves final role standards.
- Hiring Manager: clarifies responsibilities, success measures and must-have criteria.
- HR: reviews the generated package, edits details and prepares the role for publication.
- AI Agent: asks missing questions, drafts the package and records an AI Action for review.

## 4. Entry Points

- Jobs page: `Create with AI`.
- Job create modal / wizard: AI intake mode.
- Existing Draft Job: continue AI refinement.

MVP only requires the Jobs page entry. Other entry points can reuse the same model later.

## 5. Required Intake Fields

AI should only keep asking until these fields are complete enough:

| Field | Required | Notes |
|---|---:|---|
| Job title | Yes | Example: Finance Director |
| Hiring reason | Yes | Why now |
| 90-day goal | Yes | What success looks like shortly after joining |
| Core responsibilities | Yes | 3-6 responsibilities |
| Must-have criteria | Yes | Hard screening requirements |
| Budget range | Yes | Salary or total compensation range |
| Location / work mode | Yes | City, onsite, hybrid, remote, travel |
| Reporting line | Yes | Founder, CFO, Head of Strategy, etc. |
| English requirement | Yes | Working proficiency or interview language |
| Not-fit profile | Yes | Candidates who should be filtered out |

Optional fields can be accepted but should not block MVP generation: nice-to-have criteria, company stage, team size, industry preference, assessment preference and channel notes.

## 6. Conversation Behavior

- The first user message can be incomplete.
- AI should ask one focused follow-up question at a time or a compact grouped question when fields are closely related.
- AI should show which required fields are still missing.
- AI should avoid over-questioning once the required fields are complete.
- AI should identify obvious contradictions, such as senior requirements with low budget, strategic title with purely operational responsibilities, or location constraints that conflict with market availability.
- User can ask AI to regenerate, shorten, make more senior, make more operational, or adjust for Vietnam market context.

## 7. Generated Job Package

MVP output must include:

- External JD.
- Internal Role Brief.
- Must-have criteria.
- Nice-to-have criteria.
- Knockout Criteria.
- Scorecard.
- Screening Questions.
- Interview Plan.

MVP output may include but does not require:

- Assessment Plan.
- Candidate FAQ.
- Channel title and sourcing ad.
- SLA suggestion.

## 8. States

### AI Intake Session

| State | Meaning | Next |
|---|---|---|
| Not Started | User has not opened AI intake | In Progress |
| In Progress | AI is collecting missing role details | Ready to Generate / Abandoned |
| Ready to Generate | Required fields are complete | Generated |
| Generated | Job Package draft exists | Edited / Approved / Revision Requested |
| Edited | User manually edited generated output | Approved / Revision Requested / Saved Draft |
| Revision Requested | User asks AI to revise | Generated |
| Approved | User approves package | Applied to Job |
| Abandoned | User exits without saving | Closed |

### Job Output

| State | Meaning |
|---|---|
| Draft | Job Package exists but is not approved for publishing |
| Package Approved | AI package has been approved and applied to Job |
| Ready to Publish | Required Job configuration is complete |

## 9. Business Rules

- AI cannot automatically publish a job.
- AI cannot automatically start candidate matching.
- AI cannot send outbound email from this flow.
- AI cannot create, reject or advance candidates from this flow.
- Every generated package must be editable before approval.
- Approval must record approver and timestamp.
- AI output must be stored as an AI Action with prompt/input summary, generated output, confidence and status.
- If the user edits the AI output, both generated and edited versions must be auditable.
- Approving the package creates or updates a Job record.
- Approval should generate a follow-up Task, such as `Publish approved job` or `Review AI Job Package`, depending on existing Task Center behavior.

## 10. Non-Goals

- Real resume parsing.
- Candidate matching.
- Email intake or email sending.
- Assessment scoring.
- Real-time interview assistant.
- Salary market benchmarking.
- Multi-language JD generation.
- Autonomous job publishing.
- Backend LLM provider abstraction beyond the local integration seam needed by the current app.

## 11. Acceptance Criteria

1. Jobs page has a visible `Create with AI` entry.
2. User can enter a natural-language hiring need.
3. AI intake tracks required fields and asks for missing information.
4. User can provide answers across multiple turns.
5. AI can generate a structured Job Package when required fields are complete.
6. User can manually edit generated package fields.
7. User can save the result as Draft.
8. User can approve the package.
9. Approved package appears in Jobs as a Job record.
10. Approval creates visible audit feedback and a related Task or Task Center signal.
11. AI does not publish the job without human approval.
12. Existing Jobs, Tasks and language-switching behavior are not broken.

## 12. Test Scenarios

- Create with AI from Jobs, answer missing questions, generate package, edit and approve.
- Try to generate before required fields are complete; UI shows missing fields.
- Save as Draft and return to Jobs.
- Approve package and verify Job appears in Jobs list/detail.
- Verify Task Center receives a follow-up task or visible task signal.
- Verify AI Action / audit text shows generated, edited and approved states.
- Verify mobile 390px layout for the conversation and generated package review.

## 13. Development Ticket

Title: `R — AI Job Intake / JD Builder`

Build the MVP AI-assisted job creation flow. Start from the completed P0 integration branch and preserve current Jobs / Tasks hierarchy. Implement only AI multi-turn JD creation, editable Job Package review, Draft save, human approval, Job write-in and audit/task feedback.

Blocked by:

- `O — P0 Task Center Integration`

Validation:

- `npm test -- --run`
- `npm run build`
- `git diff --check`
- Desktop smoke: Jobs -> Create with AI -> multi-turn intake -> generate package -> edit -> approve -> Jobs / Tasks feedback.
- Mobile smoke: same flow at 390px without overflow or overlapping buttons.
