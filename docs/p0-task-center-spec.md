# P0 Task Center / My Tasks Spec

## Problem Statement

HireOS 已经开始实现 Jobs、Candidates、Applications、Inbox、Interview、Assessment、Settings 等模块，但这些模块目前更像独立工作台。Founder 和 HR 仍然需要在多个页面之间切换，才能知道今天谁负责、下一步是什么、哪些事项超时、哪些 AI 动作需要审批、哪些候选人需要关键决策。

今天的补充需求把产品重心从单纯的 Email-first Application Workflow 推进为 Task-first Recruiting Operating System。Email 仍然是 MVP 的核心数据入口，Application 仍然是候选人针对岗位的流程对象，但用户每天真正工作的入口应该是 Task：任务把 Application、Inbox、Interview、Assessment、Blocked、Founder Decision、Settings Alert 和 AI Action Approval 串成可执行的招聘操作系统。

## Solution

新增独立的 Tasks / 任务栏目，作为 HireOS 的统一执行入口。Tasks 展示所有需要人、AI 或流程规则继续推进的招聘事项，并提供 My Tasks、Critical、Today、Waiting on Others、Batch Review 等视图。

Dashboard 调整为 Daily Home 摘要，不承载完整任务管理，只展示今日重点任务摘要和运营健康，并跳转到 Tasks 的对应过滤视图。

Founder Inbox 保留，但它成为 Founder 角色化任务视图，只展示 Founder 需要判断、审批或承担风险的 Task。

Inbox 保留，但它收窄为邮件摄取、低置信度解析、重复候选人和 AI Action 写回预览的审核入口。Inbox Item 可以生成或关联 Task，但 Inbox 不等于 Tasks。

现有模块不推翻：Applications、Inbox、Interview、Assessment、Blocked、Settings 都作为 Task 来源，向 Tasks 产生可处理任务。

## User Stories

1. As an HR Member, I want a Tasks module in the sidebar, so that I can see all recruiting work from one execution view.
2. As an HR Member, I want My Tasks, so that I can focus on work assigned to me.
3. As a Founder, I want Founder Inbox to show only Founder decision tasks, so that I am not distracted by HR operational work.
4. As an HR Admin, I want Settings alerts to appear as Tasks, so that mailbox, SLA and AI governance issues are not missed.
5. As an Interviewer, I want feedback tasks assigned to me, so that I know which interviews need structured feedback.
6. As an HR Member, I want Tasks grouped by Critical, Today, Waiting and Batch Review, so that I can choose the right work mode.
7. As a Founder, I want Critical tasks to include high-value candidate risk, Offer Decision, Final Interview and sensitive rejects, so that I handle only high-impact decisions.
8. As an HR Member, I want each Task to show owner, priority, status, next action, due date and SLA, so that every item is actionable.
9. As an HR Member, I want each Task to show its source module, so that I understand whether it came from Application, Inbox, Interview, Assessment, Blocked or Settings.
10. As an HR Member, I want a Task to link to the related Candidate, Job and Application, so that I can inspect context quickly.
11. As an HR Member, I want Tasks generated when active Applications miss owner, next action or due date, so that unhealthy workflows are visible.
12. As an HR Member, I want Inbox Items to generate Tasks when human review is required, so that email ambiguity enters the operating queue.
13. As an HR Member, I want low-confidence email parsing to remain in Inbox but also appear as a Task, so that the work is visible in both the source queue and the task queue.
14. As an HR Member, I want duplicate candidate review Tasks, so that duplicate records are resolved before job assignment.
15. As an HR Member, I want interview scheduling Tasks, so that interview setup is tracked with owner and due date.
16. As an Interviewer, I want interview feedback Tasks, so that feedback overdue risk is visible before it blocks the Application.
17. As an HR Member, I want Assessment review Tasks, so that draft, sent, submitted and review states become actionable.
18. As an HR Member, I want Assessment Stop Rule Tasks, so that low-value additional testing is surfaced for human decision.
19. As a Founder, I want Founder Decision Tasks with evidence, risk and confidence, so that I can approve, reject or ask for more evidence from the card.
20. As an HR Member, I want Blocked Resolution Tasks, so that root causes can be resolved from an actionable queue.
21. As an HR Admin, I want AI Action Approval Tasks for sensitive writebacks, so that AI cannot reject, hire, offer or send sensitive messages alone.
22. As an HR Admin, I want automation levels L1-L4 tied to task types, so that default approval rules are explicit.
23. As an HR Member, I want to complete a Task and see the related Application Timeline update, so that recruiting history stays auditable.
24. As an HR Member, I want completed Tasks to record completed action, completed by and completed at, so that accountability is clear.
25. As an HR Member, I want Overdue and Missing SLA Tasks to be highlighted, so that time-sensitive work is not hidden.
26. As a Founder, I want Dashboard to summarize my Critical and Today tasks, so that I can start each day from a compact home view.
27. As an HR Member, I want Dashboard task summary cards to jump into filtered Tasks, so that I can move from overview to execution.
28. As an HR Member, I want Task filters by owner, role, priority, status, SLA, source module, job and application, so that I can work precise queues.
29. As an HR Member, I want Batch Review to include task types that can be safely processed together, so that repetitive approvals are efficient.
30. As a Hiring Manager, I want only relevant task views, so that I see role and candidate decisions without HR admin noise.
31. As an AI Agent, I want to create Tasks from workflow rules and evidence gaps, so that humans review the correct next action.
32. As an auditor, I want Task decisions to connect to Evidence Event, AI Action, Timeline and Audit Log, so that sensitive decisions are traceable.
33. As a product team member, I want Inbox, Founder Inbox and Dashboard to consume the same Task model where appropriate, so that the product does not create duplicate queues.
34. As an engineer, I want a single Task Center acceptance flow, so that the feature can be tested from user behavior instead of internal implementation details.

## Implementation Decisions

- Tasks is a first-class module and gets its own sidebar entry.
- Dashboard becomes Daily Home summary. It shows task summaries and health, then links into filtered Tasks.
- Founder Inbox remains as a Founder decision view backed by Task. It does not introduce a separate task model.
- Inbox remains as the email and AI review boundary. Inbox Item can generate or link to Task, but Inbox is not the global task center.
- Application remains the workflow source of truth for Candidate plus Job process state. Task does not replace Application status.
- Candidate remains the reusable person record. Candidate status must not become Application workflow status.
- Priority vocabulary becomes Critical / High / Normal / Low. Urgent should be retired or mapped to Critical.
- Task status vocabulary is New / In Progress / Waiting / Ready for Review / Completed / Blocked / Overdue / Cancelled.
- SLA vocabulary remains Ready / Today / Due Soon / Overdue / Missing / Waiting.
- Task types include Job Setup, Candidate Review, Application Next Action, Inbox Review, Interview Scheduling, Interview Feedback, Assessment Review, Founder Decision, Blocked Resolution, AI Action Approval and Settings Alert.
- Each Task should have source module, owner or owner role, priority, status, next action, due date or explicit missing SLA state, allowed actions and related object references.
- Sensitive AI actions become AI Action Approval Tasks.
- Completing a Task must write the task completion record and update the relevant Timeline or Audit Log where the source module already supports it.
- P0 should be implemented after the MVP integration branch stabilizes, so existing module work is not interrupted by a moving product skeleton.
- Existing work should be preserved: Jobs, Candidates, Applications, Inbox, Interview, Assessment and Settings become Task sources rather than being rewritten.

## Testing Decisions

- The primary test seam is a high-level Task Center user flow: login, open Tasks, see tasks generated from existing module data, filter My Tasks / Critical / Today / Waiting, open a task, complete or route it, and verify the related module reflects the change.
- Dashboard tests should verify summary cards link to filtered Tasks, not that Dashboard owns the full task list.
- Founder Inbox tests should verify only Founder decision tasks appear and sensitive actions require human confirmation.
- Inbox tests should verify low-confidence email or AI review items can generate or link to Tasks while remaining visible in Inbox.
- Application tests should verify missing owner, missing next action, overdue due date and normal next action states create the expected Tasks.
- Interview and Assessment tests should verify scheduling, feedback, review and stop-rule states create tasks visible in Tasks.
- Settings / Governance tests should verify SLA defaults and automation levels affect generated task priority, SLA and approval requirements.
- Tests should assert external behavior and visible state, not component internals or implementation-only helpers.

## Out of Scope

- Real-time Interview Copilot.
- Video transcription.
- Full Offer drafting, negotiation, contract signing or onboarding.
- Zalo, Slack, Teams or DM automation.
- Candidate Portal.
- Full workflow builder.
- Backend persistence beyond the current MVP implementation layer.
- Replacing Application status with Task status.
- Replacing Inbox with Tasks.
- Replacing Founder Inbox with a generic unfiltered task list.

## Further Notes

This P0 changes product information architecture, not just a page. It should be implemented only after the current MVP integration branch has stabilized. The recommended implementation split is:

- J - Task Core / Task Center
- K - Dashboard Daily Summary
- L - Module Task Emitters
- M - Founder Inbox / SLA Governance Views

J should define the Task contract first. K, L and M can then work against that contract in parallel.
