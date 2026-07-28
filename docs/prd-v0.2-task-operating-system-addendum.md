# HireOS PRD v0.2 Task Operating System Addendum

日期：2026-07-28  
来源：`Vietnam AI Hiring OS 产品任务定义与说明` 补充需求  
状态：已纳入 PRD 需求索引，按 P0 / P1 / P2 / MVP 外分期执行

## 1. 增补目的

本增补文档用于回答一个问题：补充需求中的岗位创建、简历筛选、HR 初面、面试、Assessment、下一轮决策、Offer、候选人沟通和异常管理，是否都已经进入 HireOS 产品设计。

结论：所有需求都已进入产品需求索引，但不是全部进入当前 P0 开发。当前 P0 只实现 Task-first 产品骨架和高价值任务闭环；完整 Offer、实时面试 Agent、多渠道自动沟通和入职后反馈属于 P2 / Alpha 或 MVP 外。

## 2. 分期原则

| 分期 | 定义 | 本轮处理方式 |
|---|---|---|
| P0 | 当前 MVP 需要支撑的任务操作系统基础 | 进入 Task Center Spec 和 J-O 并行任务 |
| P1 | Task-first MVP 完成后下一轮增强 | 进入 PRD 索引，暂不阻塞当前实现 |
| P2 / Alpha | 可落地 Alpha 的完整招聘运营能力 | 保留为后续模块，不塞进 MVP |
| MVP 外 | 当前阶段技术或业务范围过大 | 明确排除，避免开发范围膨胀 |

## 3. T01-T33 需求覆盖矩阵

| 编号 | 场景 / 任务 | 产品落点 | 分期 | 当前状态 |
|---|---|---|---|---|
| T01 | 确认招聘需求 | Jobs / Job Create / Job Setup Task | P1 | PRD 已有 Job 创建，需补自然语言 intake 与追问 |
| T02 | 审核 AI 岗位包 | Jobs / Task / AI Action Approval | P1 | PRD 已有 JD、Scorecard、Workflow，需补完整 Job Package |
| T03 | 审核岗位调整 | Jobs / Settings Governance / Audit | P1 | PRD 已覆盖已发布 Job 受控字段审计，需补调整任务类型 |
| T04 | 审核 AI 推荐候选人 | Inbox / Applications / Candidate Review Task | P0 | 已进入 P0，属于 Inbox 与 Application 任务来源 |
| T05 | 处理 AI / HR 分歧 | Tasks / Founder Inbox / Evidence | P1 | PRD 有低置信度与证据差异，需显式建 Disagreement Task |
| T06 | 审核 HR 初面 | Interview / Application Timeline / Task | P1 | 已有面试反馈，需补 HR Screen 专属字段 |
| T07 | 确认补充问题 | Tasks / Candidate Communication / Evidence Gap | P1 | 已有 Request More Evidence，需补沟通问题任务 |
| T08 | 审核 AI 面试计划 | Interview / Founder Decision / Task | P0 / P1 | P0 支撑面试任务，P1 补完整 AI Interview Plan |
| T09 | 准备即将面试 | Dashboard / Tasks / Interview Brief | P0 | 已进入 Dashboard Upcoming Interviews 与 Interview Task |
| T10 | 执行结构化面试 | Interview / Feedback Task | P1 | P0 做结构化反馈任务，实时 Agent 属 MVP 外 |
| T11 | 审核 AI 面试总结 | Interview / Founder Inbox / Evidence | P1 | 需要补 AI summary review task |
| T12 | 决定面试下一轮 | Founder Inbox / Application Workflow / Task | P0 | 已进入 Founder Decision 与 Application Next Action |
| T13 | 审核 AI 笔试题 | Assessments / AI Action Approval Task | P0 / P1 | P0 支撑 Assessment Review，P1 补题目审核细则 |
| T14 | 审核批量笔试方案 | Assessments / Batch Review | P1 | 已有 Batch Review 骨架，需补批量题目方案 |
| T15 | 处理候选人问题 | Candidate Communication / Assessment Task | P1 | 需补候选人问题处理与消息线程 |
| T16 | 处理笔试超期 | Assessments / Blocked / Follow-up Task | P0 | 已进入 Assessment Task 与 Blocked 来源 |
| T17 | 审核 AI 笔试评分 | Assessments / Founder Inbox / Task | P0 / P1 | P0 支撑 review task，P1 补评分维度与锚点 |
| T18 | 比较笔试版本 | Assessments / Evidence / Decision Card | P1 | PRD 有 Version Comparison 方向，需扩成任务 |
| T19 | 审核 AI 下一轮建议 | Founder Inbox / Application Next Action Task | P0 | 已进入 Founder Decision Task |
| T20 | 审核终面 Brief | Founder Inbox / Interview Brief / Task | P1 | 需补完整 Final Interview Brief |
| T21 | 最终录用决定 | Founder Inbox / Decision / Offer Decision | P0 / P2 | P0 记录 Offer Decision，不做完整 Offer 管理 |
| T22 | 审核 Offer 建议 | Founder Inbox / Offer Decision | P2 | 当前只记录 Offer Decision，Offer 建议后置 |
| T23 | 处理 Offer 谈判 | Offer Management | P2 / Alpha | MVP 外，不进入当前开发 |
| T24 | 审核 AI 消息 | Inbox / AI Action Approval / Communication Task | P1 | 敏感消息审批已覆盖，需补 Communication 模块 |
| T25 | 处理 Agent 升级 | Tasks / AI Governance / Blocked | P1 | 需补 Agent Escalation Task |
| T26 | 确认自动跟进 | Communication Task / AI Automation Rules | P1 | 需补标准跟进规则与审批边界 |
| T27 | 确认 Offer 签署 | Offer Management / Onboarding | P2 / Alpha | MVP 外 |
| T28 | 处理入职前风险 | Onboarding / Risk Task | P2 / Alpha | MVP 外 |
| T29 | 30 / 60 / 90 天反馈 | Learning Loop / Analytics | P2 / Alpha | MVP 外 |
| T30 | 处理 Blocked Candidate | Blocked / Task | P0 | 已进入 P0 Blocked Resolution Task |
| T31 | 高价值流失风险 | Tasks / Founder Inbox / Critical | P0 / P1 | P0 支撑 Critical，P1 补流失风险规则 |
| T32 | 招聘漏斗异常 | Dashboard / Analytics / Task | P1 | Analytics 已有方向，需补异常任务 |
| T33 | AI 质量异常 | AI Governance / Analytics / Task | P1 | PRD 有 AI 采纳指标，需补质量异常规则 |

## 4. P0 必须落地的需求清单

P0 的目标不是实现所有业务模块，而是先让所有已开发模块能通过 Task 进入同一执行入口。

P0 必须包括：

- Tasks 独立栏目，包括 All Tasks、My Tasks、Critical、Today、Waiting on Others、Batch Review、Task Detail。
- Task 核心字段：type、title、source_module、owner、owner_role、priority、status、next_action、due_at、sla_status、related objects、evidence_refs、ai_recommendation、risk_summary、allowed_actions、completion record。
- Dashboard Daily Home 摘要，展示 Critical、Today Due、Waiting、Upcoming Interviews、Batch Review、Recruitment Health，并跳转到 Tasks 筛选视图。
- Founder Inbox 作为 Founder Decision Task 的角色化视图，不维护另一套任务模型。
- Inbox Item、Application、Interview、Assessment、Blocked、Settings Alert 均能生成或关联 Task。
- 敏感 AI Action 进入 AI Action Approval Task。
- Task 完成后写入相关 Timeline 或 Audit Log。

## 5. P1 需求清单

P1 负责把附件里“业务细节已经明确，但不阻塞 Task Center 骨架”的能力补齐：

- Job Package：External JD、渠道标题、招聘广告、Candidate FAQ、Role Brief、Must-have、淘汰标准、面试计划、Assessment Plan。
- Natural-language Job Intake：招聘原因、90 天目标、职责、预算、地点、硬条件、矛盾识别。
- AI / HR Disagreement Task：AI 推荐与 HR 判断冲突时生成可审核任务。
- HR Screen：当前薪资、期望薪资、Notice period、地点、出差、办公室工作、英语、创业动机、岗位理解、其他面试、主要风险。
- AI Interview Plan：本轮唯一目标、已验证能力、未验证能力、个性化问题、追问、好答案信号、风险信号、评分锚点、面试官分工、重复度检查。
- Independent Scoring：面试官先独立提交评分，再展示他人评分与 AI 综合建议。
- Assessment 扩展：批量方案、候选人问题、超期处理、AI 评分审核、版本比较。
- Communication Task：收到申请、补充信息、面试邀请、改期、笔试发送、提醒、修改要求、下一轮、Hold、拒绝、Offer 跟进、入职提醒。
- Agent Escalation：投诉、敏感反馈、法律、签证、薪资、Offer 条件进入人工任务。
- AI Quality Anomaly：AI 采纳率下降、AI 评分分歧、错误写入、消息投诉等异常生成治理任务。
- Founder / HR Daily Operating Checklist：把每日工作顺序写入 Dashboard、Tasks 过滤器和运营口径。

## 6. P2 / Alpha 需求清单

P2 / Alpha 负责完整招聘运营闭环：

- Offer 建议、谈判、版本、审批记录、接受概率和剩余风险。
- Offer 签署确认。
- 入职前风险管理。
- 30 / 60 / 90 天反馈。
- 入职表现反哺 JD、Scorecard、面试题、Assessment、AI 评分、HR 推荐和渠道质量。
- 多渠道候选人沟通扩展。

## 7. MVP 外需求

以下能力不进入当前 MVP，也不应阻塞 P0：

- 实时 Interview Agent。
- 视频面试转录。
- 面试中实时覆盖提醒、追问建议和时间提示。
- Zalo / DM 自动化。
- 完整 Candidate Portal。
- 完整合同管理与入职系统。

这些需求可以保留为 Alpha 设计方向，但当前实现只做可审计任务、结构化反馈、消息审批和人工执行边界。

## 8. 状态、优先级与自动化边界

### 8.1 Task 状态

统一状态：

- New
- In Progress
- Waiting
- Ready for Review
- Completed
- Blocked
- Overdue
- Cancelled

附件中的 `Waiting for AI / HR / Founder / Candidate` 在产品中落为 `status = Waiting` 加 `waiting_on = AI / HR / Founder / Candidate`。

附件中的 `Approved / Revision Requested / Rejected` 在产品中落为 `completed_action` 或审批结果，不作为所有任务的通用主状态。

### 8.2 Priority

统一优先级：

- Critical：候选人即将流失、Offer 将失效、投诉、法律 / 签证、关键面试未准备。
- High：等待 Founder、笔试待评估、终面待决定、薪资审批、SLA 超时。
- Normal：JD、问题、简历、笔试和日常下一轮审核。
- Low：人才池整理、题库优化、模板调整和历史数据维护。

### 8.3 AI 自动化等级

- L1 Suggest：AI 提建议，人做决定。适用于淘汰、录用、薪资、下一轮。
- L2 Draft：AI 生成内容，人审批。适用于 JD、问题、笔试、反馈、Offer。
- L3 Execute：按批准规则自动执行。适用于确认、排期、提醒、常规状态通知。
- L4 Execute + Escalate：自动处理标准流程，只升级异常。适用于多次未回复、超时、候选人风险。

敏感动作必须人工审批：拒绝、录用、薪资、Offer 条件、法律承诺、签证承诺、投诉处理、敏感反馈。

## 9. SLA 建议

| 场景 | 默认 SLA |
|---|---|
| 新简历到 HR 查看 | 1-2 个工作日 |
| Shortlist 到安排初面 | 2 个工作日 |
| 面试结束到提交反馈 | 当天 |
| 笔试提交到 AI 初评 | 30 分钟内 |
| AI 初评到 Founder 决定 | 2-3 个工作日 |
| 笔试通过到安排终面 | 2 个工作日 |
| 终面到录用决定 | 2 个工作日 |
| 录用决定到 Offer | 2 个工作日，P2 生效 |

P0 只需要在任务数据里支持 due_at 和 sla_status，并展示 Missing / Today / Due Soon / Overdue / Waiting。完整 SLA 模板编辑进入 P1。

## 10. 对当前开发任务的影响

J-O 的任务拆分保持不变，但需求边界更清楚：

- J — Task Core / Task Center：只做 Task 合同、列表、过滤、详情、完成动作和审计挂点。
- K — Dashboard Daily Task Summary：只做摘要和跳转，不做完整任务管理。
- L — Application / Inbox Task Emitters：只接入 P0 任务来源，不做完整 Job Package 或 Communication 模块。
- M — Interview / Assessment Task Emitters：只接入面试安排、反馈、Assessment Review、Stop Rule、超期任务，不做实时 Interview Agent。
- N — Founder Inbox / Governance Task Views：只做 Founder Decision、AI Action Approval、Settings Alert、Critical 任务视图，不做完整 Offer Management。
- O — P0 Task Center Integration：合并 J-N，验证从入口到任务完成再到 Timeline / Audit 的闭环。

P1 / P2 需求应开新 ticket，不应插入当前 P0 分支，除非用户明确升级当前 MVP 范围。
