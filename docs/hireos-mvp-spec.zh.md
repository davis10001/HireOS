# HireOS MVP 实施 Spec

## Problem Statement

Founder 和 HR 团队的招聘工作分散在邮件线程、CV 附件、表格、聊天、人工记忆和零散备注里。团队无法稳定回答几个最基本的问题：每个岗位进来了多少候选人、每个 Application 当前在哪一步、谁负责下一步、哪些证据支持决策、哪些流程已经卡住、AI 的推荐是否可信。

当前 HireOS 已经有静态前端原型和完整 PRD。下一步需要把产品定义转成可执行的 MVP Spec，让工程实现围绕一个真实业务闭环展开。MVP 必须证明 Email-first 招聘链路成立：招聘邮件可以转化为结构化的 Candidate、Job、Application、Evidence Event、Timeline、Assessment、Decision、Blocked 和 Analytics 数据，同时保留人工审批与可审计性。

## Solution

将 HireOS 构建为以 Application 为核心的 Email-first AI 原生招聘操作系统。Candidate 是可复用的人才身份记录，Job 是招聘需求，Application 是某个 Candidate 针对某个 Job 的流程运营单元。

MVP 需要支持 HR 创建并激活 Job、连接招聘邮箱、读取 Email Thread 和 CV 附件、提取并去重 Candidate、将 Candidate 匹配到 Job、创建或更新 Application、把低置信度或敏感 AI Action 路由到 Inbox Item、跟踪状态、Current Owner、Process Owner、Next Action、Due Date 和 SLA、沉淀 Evidence Event 和 Timeline、支持 Interview 与 Assessment 流程、呈现 Founder Decision Card、识别 Blocked Application，并展示运营 Analytics。

最高级别的实现与验收边界是端到端招聘闭环：

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

- MVP 以 `Application` 作为核心运营单元。`Candidate` 存储可复用的人才身份和跨岗位历史；`Job` 存储招聘需求和流程默认值；`Application` 存储某个 Candidate 针对某个 Job 的流程状态。
- 主要数据入口是连接招聘邮箱后的 `Email Thread`。手动上传和 CSV 可以存在，但 MVP 的关键证明点是 Email-first intake。
- AI 产生的每个结构化提取、匹配、总结、草稿、推荐或写回尝试都必须记录为 `AI Action`，包含输入引用、输出、置信度、证据引用和状态。
- 任何影响流程、评估或决策的事实都记录为 `Evidence Event`，并保留来源引用。原始 Email Thread 和附件必须保存。
- 低置信度或敏感 AI Action 生成 `Inbox Item`。Inbox 是模糊数据和写回动作的审批、修正边界。
- 活跃 Application 必须始终有 `Current Owner`、`Process Owner`、`Next Action` 和 `Due Date`。缺失这些字段是运营异常，不是展示瑕疵。
- `Blocked` 是 Application 的覆盖状态，必须保留 `previous_state`。解除 Blocked 后，Application 回到原状态或用户明确选择的新状态。
- 状态字典是规范来源。UI 标签、筛选器、API enum、Analytics 维度和 AI prompt 都必须映射到这些状态，不能临时创造同义状态。
- Founder 决策必须记录为 `Decision`。`Offer Decision` 是 MVP 终点，不包括 Offer 起草、谈判、合同签署或入职。
- AI 可以分类、摘要、提取证据、推荐下一步和起草消息。AI 不得自动拒绝、录用、做 Offer Decision、决定薪资、删除证据或隐藏低置信度/反向证据。
- Job 激活需要配置完整性：JD、Scorecard、Hiring Workflow、owner defaults 和 SLA rules。
- Candidate 去重必须保留历史。合并后的 Candidate 需要保留来源、CV、Email Thread 和 Application 关系。
- Candidate 是人的档案，可以没有 Application。Candidate allocation states 包括 `Unassigned Pool`、`Assigned`、`Not Fit Current Job`、`Rejected Global` 和 `Duplicate Review`。
- 只有 Candidate 绑定 Job 时才创建 Application。`Unassigned Pool` 中的 Candidate 不应出现在 Applications Pipeline。
- `Not Fit Current Job` 只表示不适合某个岗位，不删除 Candidate，也不等于全局拒绝。
- Analytics 必须基于事件。漏斗、渠道质量、执行效率和 AI 采纳指标必须来自结构化记录和事件，而不是静态页面数字。
- 当前原型提供 MVP 信息架构和核心界面：Dashboard、Jobs、Inbox、Email Agent、Applications、Candidates、Assessments、Founder Inbox、Blocked、Analytics 和 Settings。
- 原型和 PRD 中的关键状态机应视为产品决策，而不只是 UI 文案：

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

- 需要建设或改造的主要模块包括：应用壳、认证与角色、Job 管理、邮箱连接、邮件摄取、Candidate Registry、Application Workflow、Inbox Review、Evidence Timeline、Interview Workflow、Assessment Workspace、Founder Inbox、Blocked Detection、Analytics、Settings、AI Action Governance 和 Audit Log。
- API 资源应围绕 Organization、User、Job、Scorecard、Hiring Workflow、Candidate、Candidate Source、CV/Attachment、Email Connection、Email Thread、Application、Evidence Event、Inbox Item、Interview、Interview Feedback、Assessment、Assessment Submission、Decision、AI Action 和 Audit Log 设计。
- 前端应保留当前原型的产品结构，同时用真实 API 状态、加载态、空状态、错误态和权限态替换静态数据。
- 实现应优先围绕一个最高级验收边界展开：从 Job 创建到邮箱录入，再到 Founder Decision 和 Analytics 可见性的端到端招聘闭环。

## Testing Decisions

- 好的测试应该验证外部行为和业务结果，而不是内部实现细节。最强测试是场景级测试：从用户或系统事件开始，断言可见状态、持久化记录和下游影响。
- 主要验收测试边界是 HireOS MVP 端到端招聘闭环。测试夹具应创建一个 Active Job，连接或模拟招聘邮箱，摄取一封 CV Email Thread，创建或审核 Candidate 和 Application，推进 Application 经过 Interview 或 Assessment，生成 Founder Decision Card，记录 Decision，并验证 Blocked / Analytics 可见性。
- 测试 Job 激活：尝试激活不完整 Job，并确认缺少 JD、Workflow、Owner、SLA 或 Scorecard 会阻止激活。
- 测试 Email Intake：覆盖高置信度 CV intake、低置信度岗位匹配、重复候选人、非招聘邮件和不支持附件。
- 测试 Inbox Review：批准、修改、驳回、稍后处理和升级 Inbox Item，并确认对应写回或不写回。
- 测试 Application Workflow：确认活跃 Application 必须有 owner、process owner、next action 和 due date。
- 测试 Application 状态流转：确认允许的状态转换、终态，以及 Blocked / Hold 的 `previous_state` 保留。
- 测试 Blocked Detection：覆盖缺 owner、缺 next action、缺 due date、逾期、等待候选人、等待面试官、等待 Founder、证据缺口、低置信度匹配、审批待处理和邮箱异常。
- 测试 Candidate Deduplication：覆盖邮箱完全匹配、电话完全匹配、CV hash 匹配和弱匹配。
- 测试 Interview Workflow：解析排期邮件、完成面试、要求反馈、解决 Feedback Pending。
- 测试 Assessment Workflow：创建 Draft、发送 Ready to Send、摄取 Submitted、解析提交、评审、校准和应用 Stop Rule。
- 测试 Founder Inbox：确保只出现高价值决策项，并且敏感决策必须人工确认。
- 测试 AI Governance：覆盖 Generated、Pending Approval、Approved、Auto Applied、Applied、Rejected、Corrected 和 Reverted。
- 测试 Auditability：确认候选人合并、状态变化、AI 写回、决策、设置变更和权限变更都会创建 Audit Log。
- 测试 Analytics：确认漏斗、来源归因、邮件到建档时间、邮件到状态更新时间、Blocked 数和 AI 采纳指标来自结构化事件。
- 当前仓库还没有应用测试套件。初始测试应先定义高层验收边界，再在支持端到端业务闭环的地方补模块级测试。

## Out of Scope

- Candidate Portal。
- Candidate Task Link。
- 完整 DM 自动化。
- VietnamWorks 浏览器抓取。
- 实时面试 Copilot。
- 视频面试转录。
- AI 自动拒绝候选人。
- AI 自动录用候选人。
- 完整 Offer 起草、谈判、合同签署或入职。
- 完整 Workflow Builder。
- 高级多租户企业权限模型。
- 超出未来预留接口之外的 Calendar 集成。
- Slack 或 Teams 通知。
- 除记录 Offer Decision 之外的 Offer Management。
- 招聘预测和容量规划。

## Further Notes

- GitHub 仓库是公开仓库，包含当前全面 PRD、MVP gap analysis、领域词汇表和前端原型。
- 当前原型是静态 HTML/CSS/JS，应作为产品和视觉参考，不作为生产架构约束。
- PRD 中有比本 Spec 更完整的状态字典。实现 enum 和 UI 标签时，应以 PRD 状态字典为详细来源。
- 当前 GitHub issue 已创建英文 Spec，并带有 `ready-for-agent` 标签；这份中文版本用于中文审阅和团队讨论。
- 后续应把此 Spec 拆成更小的实现 issue。建议第一批拆分为 Core Data Model、Application Workflow、Mailbox Intake、Review Inbox、AI Governance、Founder Decision、Assessment Workspace、Blocked Detection 和 Analytics。
