# HireOS 产品需求文档

## 1. 产品定位

HireOS 是面向 Founder 与 HR 团队的 Email-first AI 原生端到端招聘操作系统。

MVP 的核心切入点是招聘邮箱。系统先读取真实招聘邮件、附件、候选人回复、面试安排和 Assessment 提交，再把这些信息结构化为 Candidate、Job、Application、Evidence Event 和 Founder Decision。

HireOS 的目标不是做一个传统 ATS 的 AI 插件，而是把招聘流程管理、候选人数据、证据沉淀、AI 辅助执行和 Founder 决策支持合成一个可追踪、可运营、可度量的闭环。

## 2. MVP 范围

### 2.1 MVP 包含

- 创建 Job 与 Hiring Request。
- 配置岗位招聘流程。
- 绑定招聘邮箱。
- AI Email Intake。
- Candidate 档案与去重。
- Application Pipeline。
- Interview Scheduling 记录。
- Interview Feedback 结构化。
- Assessment 出题、发送、提交、Review。
- Founder Decision Inbox。
- Offer Decision 记录。
- Blocked Application 监控。
- 基础 Analytics。
- AI 行为治理与审批。

### 2.2 MVP 不包含

- Candidate Portal。
- Candidate Task Link。
- 完整 DM 集成。
- VietnamWorks 浏览器抓取。
- AI 自动淘汰或自动录用。
- 实时面试 Copilot、转录或在线视频面试。
- Offer 起草、谈判、合同签署或入职执行。
- 完整 Workflow Builder。
- 完整多轮对话式 Job Creator。

## 3. 用户与权限

### 3.1 Founder

目标：用最少运营噪音完成高价值招聘判断。

核心任务：

- 查看招聘总体进展。
- 查看高价值候选人和关键风险。
- 确认 Job Scorecard。
- 复核 Assessment。
- 做终面、拒绝、继续推进或 Offer Decision。
- 查看所有 Blocked 和重大异常。

### 3.2 HR Admin

目标：配置招聘系统和治理规则。

核心任务：

- 管理成员、角色和权限。
- 连接招聘邮箱。
- 设置邮箱读取范围和 AI 写回边界。
- 创建 Job workflow 模板。
- 管理状态、SLA 和审批规则。
- 查看审计记录。

### 3.3 HR Member

目标：推进日常招聘流程。

核心任务：

- 处理邮件 intake 队列。
- 创建和维护 Candidate。
- 创建和推进 Application。
- 安排面试。
- 跟进 Assessment。
- 处理 Blocked。
- 给候选人发送或审批邮件草稿。

### 3.4 Interviewer

目标：围绕岗位标准提供面试证据。

核心任务：

- 查看 Interview Brief。
- 填写或邮件提交面试反馈。
- 查看候选人相关证据。
- 回答 Founder 或 HR 的补充问题。

### 3.5 Hiring Manager

目标：确认岗位需求和团队用人标准。

核心任务：

- 确认岗位目标、预算、级别和成功标准。
- 确认 Scorecard。
- 参与候选人评审。
- 做阶段性推进建议。

## 4. 核心领域模型

### 4.1 Candidate

Candidate 是“人”的记录。

关键字段：

- Candidate ID。
- 姓名。
- 邮箱。
- 电话。
- 地区。
- 当前公司。
- 当前职位。
- 来源列表。
- CV 列表。
- 技能摘要。
- 标签。
- 重复候选人关系。
- 跨岗位 Application 历史。
- 创建时间、更新时间。

关键状态：

- Active：可用于招聘流程。
- Duplicate Review：可能重复，等待人工确认。
- Merged：已合并到另一个 Candidate。
- Archived：不再使用。

### 4.2 Job

Job 是“岗位”的记录。

关键字段：

- Job ID。
- 岗位名称。
- 团队。
- 地点。
- 招聘人数。
- 预算与级别。
- 招聘经理。
- Process Owner 默认值。
- 岗位目标。
- JD。
- 硬性要求。
- 加分项。
- 成功标准。
- Scorecard。
- Screening Criteria。
- Assessment Plan。
- Hiring Workflow。
- 邮件自动匹配规则。
- SLA 默认值。
- 创建时间、更新时间。

关键状态：

- Draft：草稿，不允许自动匹配邮件。
- Active：活跃，可接收自动匹配。
- Paused：暂停，不接收新的自动匹配，但已有 Application 可继续处理。
- Closed：关闭，不再推进新的候选人。
- Archived：归档。

Active 条件：

- JD 已确认。
- Workflow stages 已确认。
- Owner defaults 已确认。
- SLA rules 已确认。
- Scorecard 达到最低覆盖要求。

### 4.3 Hiring Workflow

Hiring Workflow 是岗位级流程配置。

关键字段：

- Workflow ID。
- Job ID。
- 阶段列表。
- 每阶段负责人默认值。
- 每阶段 SLA。
- 面试官和参与人。
- 通过标准。
- Assessment 是否必需。
- Founder 决策点。

默认 MVP 阶段：

- Intake Review。
- HR Screen。
- Interview Scheduling。
- Interview。
- Feedback Review。
- Assessment。
- Assessment Review。
- Founder Review。
- Final Interview。
- Offer Decision。
- Rejected。
- Closed。

### 4.4 Application

Application 是 HireOS 的主运营对象，代表某个 Candidate 针对某个 Job 的招聘流程。

关键字段：

- Application ID。
- Candidate ID。
- Job ID。
- Source。
- Current State。
- Status Reason。
- Current Owner。
- Process Owner。
- Next Action。
- Due Date。
- SLA Status。
- Priority。
- Risk Level。
- Email Thread links。
- Evidence Event links。
- Interview links。
- Assessment links。
- Decision links。
- Timeline。
- 创建时间、更新时间、最后活动时间。

关键状态：

- New Intake：新进入，待确认。
- Needs HR Review：需要 HR 审核。
- HR Shortlisted：HR 通过初筛。
- Waiting Candidate：等待候选人回复或提交。
- Scheduling Interview：安排面试中。
- Interview Scheduled：面试已确认。
- Interview Completed：面试已完成，待反馈或结果。
- Waiting Feedback：等待面试反馈。
- Assessment Draft：Assessment 草稿中。
- Assessment Sent：Assessment 已发送。
- Assessment Submitted：候选人已提交。
- Assessment Review：Assessment 待评审。
- Founder Review：等待 Founder 决策。
- Final Interview：终面阶段。
- Offer Decision：等待或已记录 Offer 决策。
- Rejected：已拒绝。
- Withdrawn：候选人退出。
- Hired Outcome Recorded：已记录录用结果。
- Blocked：流程被阻塞。
- Closed：流程结束。

强规则：

- 活跃 Application 必须有 Current Owner。
- 活跃 Application 必须有 Process Owner。
- 活跃 Application 必须有 Next Action。
- 活跃 Application 必须有 Due Date 或 SLA。
- 敏感决策必须有人确认。

### 4.5 Email Thread

Email Thread 是招聘邮箱中的线程，是 MVP 主数据来源。

关键字段：

- Email Thread ID。
- Mailbox ID。
- Subject。
- Sender。
- Recipients。
- Timestamp。
- Raw body。
- Attachment list。
- Parsed entities。
- Suggested Candidate。
- Suggested Job。
- Suggested Application。
- Confidence。
- Classification。
- Processing status。
- Review status。

分类：

- CV Intake。
- Candidate Reply。
- Interview Scheduling。
- Interview Feedback。
- Assessment Submission。
- Candidate Question。
- Agency Forward。
- Internal Comment。
- Offer Related。
- Not Recruiting。
- Unknown。

### 4.6 Evidence Event

Evidence Event 是所有判断和状态变化的证据单元。

关键字段：

- Evidence Event ID。
- Source type。
- Source link。
- Candidate ID。
- Job ID。
- Application ID。
- Event type。
- Summary。
- Extracted facts。
- Risk。
- Confidence。
- Created by。
- Approved by。
- Created time。

事件类型：

- CV Parsed。
- Candidate Matched。
- Job Matched。
- Duplicate Candidate Found。
- Status Change Suggested。
- Status Change Applied。
- HR Screen Note。
- Interview Scheduled。
- Interview Feedback。
- Assessment Sent。
- Assessment Submitted。
- Assessment Reviewed。
- Founder Comment。
- Decision Made。
- Risk Escalated。
- Offer Decision Recorded。

### 4.7 Inbox Item

Inbox Item 是需要人或 AI 处理的工作项。

关键字段：

- Inbox Item ID。
- Type。
- Priority。
- Owner。
- Related Candidate / Job / Application。
- Raw evidence。
- AI recommendation。
- Confidence。
- Required action。
- Due Date。
- Status。

类型：

- Low-confidence email match。
- Candidate duplicate review。
- Status update approval。
- Email draft approval。
- Assessment review。
- Founder decision。
- Blocked resolution。
- Missing evidence。
- SLA overdue。

状态：

- Open。
- In Review。
- Approved。
- Applied。
- Rejected。
- Snoozed。
- Escalated。
- Closed。

### 4.8 Assessment

Assessment 是围绕岗位 Scorecard 的测试任务。

关键字段：

- Assessment ID。
- Job ID。
- Application ID。
- Rubric。
- Prompt。
- Due Date。
- Sender。
- Submission list。
- Review result。
- AI review。
- Human calibration。
- Status。

状态：

- Draft。
- Ready to Send。
- Sent。
- Candidate Question。
- Submitted。
- Parsed。
- In Review。
- Calibrate。
- Complete。
- Skipped by Stop Rule。
- Cancelled。

### 4.9 Decision

Decision 是 Founder 或授权人做出的招聘判断。

类型：

- Continue。
- Request More Evidence。
- Final Interview。
- Reject。
- Offer Decision。
- Hold。

关键字段：

- Decision ID。
- Application ID。
- Decision type。
- Decision maker。
- Reason。
- Evidence links。
- Risk accepted。
- Next Action。
- Created time。

## 5. 端到端主流程

### 5.1 创建岗位

入口：Jobs 页面或 Dashboard 快捷入口。

流程：

1. HR 或 Founder 创建 Job。
2. 输入岗位名称、团队、地点、招聘人数、预算与级别、招聘经理。
3. 输入岗位目标、核心要求、成功标准。
4. AI 生成 JD、筛选标准、Scorecard 初稿、流程模板。
5. 人工编辑并确认。
6. 系统检查 Active 条件。
7. 保存为 Draft 或发布为 Active。

输出：

- Job。
- Hiring Workflow。
- Scorecard。
- Screening Criteria。
- SLA defaults。

异常：

- Scorecard 未确认：只能保存 Draft。
- SLA 缺失：不能开启自动邮件匹配。
- 招聘经理缺失：不能发布 Active。

### 5.2 连接招聘邮箱

入口：Inbox、Email Agent、Settings。

流程：

1. HR Admin 发起连接。
2. 选择邮箱服务和账号。
3. 授权读取范围。
4. 设置招聘相关文件夹、发件域、历史同步范围。
5. 设置 AI 可自动写入和必须审批的边界。
6. 系统开始同步。

输出：

- Email Connection。
- Email Rules。
- Processing Rules。

异常：

- 授权失败。
- 邮箱断连。
- 权限不足。
- 历史同步过大。
- 附件读取失败。

### 5.3 AI Email Intake

触发：邮箱同步到新招聘邮件。

流程：

1. 系统读取 Email Thread 和附件。
2. AI 判断是否招聘相关。
3. AI 提取候选人身份、CV 信息、来源和岗位线索。
4. AI 查找重复 Candidate。
5. AI 推荐 Job 匹配和 Application 绑定。
6. 高置信度结果自动创建或更新。
7. 低置信度结果进入 Inbox 审核。
8. 所有写入生成 Evidence Event 和 Timeline 记录。

输出：

- Candidate。
- Application。
- Email Thread 绑定。
- Evidence Event。
- Inbox Item。

人工审批点：

- 候选人合并。
- 低置信度岗位匹配。
- 一个邮件匹配多个候选人。
- 一个候选人匹配多个岗位。
- 自动拒绝或 Offer 相关内容，MVP 禁止自动执行。

### 5.4 Application Pipeline

入口：Applications、Job Detail、Candidate Detail、Inbox。

流程：

1. HR 查看 Application 当前状态。
2. 系统展示 Current Owner、Process Owner、Next Action、Due Date、SLA Status。
3. AI 推荐下一步。
4. HR 应用、修改或拒绝建议。
5. 系统写入 Timeline 和 Evidence Event。
6. 若超时、无人负责、证据缺口或等待过久，进入 Blocked。

输出：

- 状态更新。
- Owner 更新。
- Next Action。
- Timeline。
- Blocked 标记。

### 5.5 Interview Scheduling

入口：Application Detail、Email Thread、Inbox。

流程：

1. 邮件中出现面试邀约、确认或改期。
2. AI 识别时间、参与人、岗位、候选人和确认状态。
3. 系统创建或更新 Interview。
4. HR 确认异常或冲突。
5. Application 状态更新为 Scheduling Interview 或 Interview Scheduled。

输出：

- Interview Schedule。
- Participants。
- Evidence Event。
- Timeline。

### 5.6 Interview Feedback

入口：邮件反馈或系统表单。

流程：

1. 面试官提交反馈。
2. AI 提取评分、证据、风险、建议和缺口。
3. 系统关联到 Scorecard。
4. HR 或 Founder 复核关键反馈。
5. Application 进入下一阶段。

输出：

- Interview Feedback。
- Evidence Event。
- Risk Record。
- Next-Step Recommendation。

### 5.7 Assessment

入口：Assessments、Application Detail、Founder Inbox。

流程：

1. 系统根据 Scorecard 和 Evidence Gap 推荐是否需要 Assessment。
2. AI 起草题目、Rubric 和提交要求。
3. HR 或 Founder 确认。
4. HR 通过邮件发送。
5. 候选人通过邮件提交附件或说明。
6. AI 解析提交内容并生成 Review。
7. 人工校准。
8. 系统决定继续、补充、跳过下一轮或进入 Founder Review。

输出：

- Assessment。
- Rubric。
- Submission。
- AI Review。
- Evidence Profile。
- Decision Recommendation。

### 5.8 Founder Decision

入口：Founder Inbox。

流程：

1. 系统聚合需要 Founder 处理的决策。
2. AI 生成 Decision Card：候选人摘要、岗位匹配、证据、风险、缺口、推荐动作。
3. Founder 查看证据引用。
4. Founder 做出 Continue、Request More Evidence、Final Interview、Reject、Offer Decision 或 Hold。
5. 系统记录 Decision 并更新 Application。

输出：

- Decision Record。
- Decision Timeline。
- Next Action。
- Evidence links。

### 5.9 Blocked 处理

入口：Blocked 页面、Inbox、Dashboard。

触发：

- Due Date 逾期。
- SLA 超时。
- Current Owner 缺失。
- Next Action 缺失。
- 等待候选人超时。
- 等待面试官反馈超时。
- Evidence Gap 阻止决策。
- 邮件或身份匹配不明确。
- 权限或审批卡住。

流程：

1. 系统识别 Blocked 根因。
2. 分配 Current Owner 和 Process Owner。
3. AI 推荐解决动作。
4. HR 或 Founder 处理。
5. 系统解除 Blocked 或升级。

输出：

- Blocked Record。
- Escalation。
- Resolution Event。
- Updated Next Action。

## 6. 一级模块需求

### 6.1 Dashboard

目标：让 Founder 和 HR 快速看到招聘运行状况。

核心功能：

- 招聘漏斗。
- 岗位进展。
- 待处理决策。
- Blocked 摘要。
- Evidence Timeline。
- AI 推荐下一步。
- 今日关键指标。

必要状态：

- 正常。
- 有风险。
- 逾期。
- 数据不足。
- 无数据。

### 6.2 Jobs

目标：管理岗位和岗位级流程默认值。

核心功能：

- 岗位列表。
- 按状态、岗位、负责人筛选。
- 新建岗位向导。
- 编辑 JD。
- 编辑 Scorecard。
- 配置 Hiring Workflow。
- 配置 Owner / SLA 默认值。
- 控制邮件自动匹配开关。
- 查看岗位级 Pipeline。
- 查看岗位详情。

必要状态：

- Draft。
- Active。
- Paused。
- Closed。
- Archived。
- Configuration Missing。

### 6.3 Inbox

目标：统一处理所有需要人确认的招聘工作。

核心功能：

- 统一队列。
- 二级队列：Email Intake、Founder Decisions、Blocked、Assessments、Candidate Duplicates、Draft Replies。
- 队列筛选。
- 优先级排序。
- 审核详情。
- 原始邮件证据。
- AI 结构化结果预览。
- 写回预览。
- 批准、修改、拒绝、升级、稍后处理。

必要状态：

- Open。
- In Review。
- Approved。
- Applied。
- Rejected。
- Snoozed。
- Escalated。
- Closed。

### 6.4 Email Agent

目标：把邮件和附件转化为可靠的招聘数据。

核心功能：

- 邮箱同步概览。
- 邮件线程分类。
- CV 附件提取。
- Candidate 识别。
- Job 匹配。
- Application 创建或更新。
- Evidence Event 提取。
- 低置信度审核。
- 邮件草稿。
- 自动写入边界。

必要状态：

- Synced。
- Syncing。
- Disconnected。
- Needs Review。
- Auto Applied。
- Failed。
- Ignored。

### 6.5 Applications

目标：管理候选人针对岗位的完整招聘流程。

核心功能：

- Application 列表。
- Pipeline 状态视图。
- Current Owner / Process Owner。
- Next Action。
- SLA / Due Date。
- Timeline。
- Evidence Event。
- 面试记录。
- Assessment 记录。
- 决策历史。
- AI 下一步建议。

必要状态：见 Application 状态机。

### 6.6 Application Detail

目标：让 HR、Founder 和面试官围绕单个流程实例做判断和推进。

核心功能：

- 候选人基本信息。
- 当前申请信息。
- 岗位匹配摘要。
- 相关邮件。
- 面试流程。
- Assessment 证据。
- Evidence Timeline。
- 风险和缺口。
- AI 建议。
- 决策操作。

必要状态：

- Ready for Review。
- Evidence Missing。
- Waiting Owner。
- Waiting Candidate。
- Blocked。
- Closed。

### 6.7 Candidates

目标：维护候选人身份和跨岗位历史。

核心功能：

- 候选人列表。
- Candidate Detail。
- CV 历史。
- 联系方式。
- 来源归因。
- Duplicate Review。
- Merge。
- 跨岗位 Application 历史。
- 手动导入 CV。

必要状态：

- Active。
- Duplicate Review。
- Merged。
- Archived。

### 6.8 Assessments

目标：用 Assessment 补齐证据缺口，而不是制造流程负担。

核心功能：

- Assessment Workspace。
- Rubric 创建和编辑。
- AI 题目草稿。
- 发送 Assessment。
- 提交解析。
- 版本比较。
- AI Review。
- 人工校准。
- Stop Rule。
- Follow-up Queue。

必要状态：见 Assessment 状态机。

### 6.9 Founder Inbox

目标：把 Founder 的时间集中在关键判断上。

核心功能：

- Decision Cards。
- 风险优先级。
- 证据完整度。
- 候选人竞争 offer 风险。
- Scorecard 确认。
- Assessment Review。
- Final Interview 决策。
- Offer Decision。
- 重大风险升级。

必要状态：

- Waiting Founder。
- Evidence Ready。
- Evidence Missing。
- Risk Escalated。
- Decision Made。

### 6.10 Blocked

目标：让所有卡住的流程可见、可归因、可推进。

核心功能：

- Blocked 列表。
- 根因分类。
- SLA 逾期。
- Owner 缺失。
- Evidence Gap。
- Candidate waiting。
- Interviewer waiting。
- AI 推荐解决动作。
- 升级。
- 解除阻塞。

必要状态：

- Blocked。
- Due Soon。
- Overdue。
- Escalated。
- Resolved。

### 6.11 Analytics

目标：衡量招聘进展、渠道质量、运营效率和 AI 采纳。

核心指标：

- Total CVs。
- Email Intake CVs。
- Pending HR Review。
- HR Shortlisted。
- HR Interviews。
- Assessments。
- Founder Decisions。
- Offer Decisions。
- Hired / Joined 结果记录。
- 渠道来源转化。
- 邮件到建档时间。
- 邮件到状态更新时间。
- 面试反馈及时率。
- Assessment 完成率。
- Blocked 数量和耗时。
- AI 草稿采纳率。
- AI 状态建议采纳率。
- AI 证据提取采纳率。

必要状态：

- 数据正常。
- 数据不足。
- 统计口径缺失。
- 同步延迟。

### 6.12 Settings

目标：集中配置 AI 能读什么、能建议什么、能写回什么。

核心功能：

- Workspace Configuration。
- Mailbox Connections。
- Roles & Permissions。
- Status & SLA Defaults。
- AI Automation Rules。
- Hiring Templates。
- Evidence Policy。
- Write-back Boundaries。
- Approval Gates。

必要状态：

- Enabled。
- Disabled。
- Requires Approval。
- Misconfigured。
- Needs Admin。

## 7. 状态机

### 7.1 Job 状态机

```text
Draft -> Active -> Paused -> Active
Active -> Closed -> Archived
Draft -> Archived
Paused -> Closed
```

规则：

- Draft 不能自动接收邮件匹配。
- Active 必须满足配置完整性。
- Paused 不接收新自动匹配。
- Closed 不允许新 Application，但保留历史。

### 7.2 Application 状态机

```text
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
```

旁路状态：

- Waiting Candidate。
- Blocked。
- Rejected。
- Withdrawn。
- Hold。

规则：

- 任何活跃状态都可以因 SLA、owner、next action、证据缺口进入 Blocked。
- Blocked 解除后回到进入前状态或新的 Next Action 状态。
- Rejected、Withdrawn、Closed 是终止状态。
- Offer Decision 是 MVP 的招聘判断终点。

### 7.3 Email Thread 状态机

```text
Received -> Parsed -> Classified -> Matched
Matched -> Auto Applied
Matched -> Needs Review -> Approved -> Applied
Needs Review -> Rejected
Parsed -> Ignored
Parsed -> Failed
```

规则：

- 高置信度可 Auto Applied，但必须保留 Evidence Event。
- 低置信度必须 Needs Review。
- 敏感动作不能 Auto Applied。

### 7.4 Inbox Item 状态机

```text
Open -> In Review -> Approved -> Applied -> Closed
Open -> Rejected -> Closed
Open -> Snoozed -> Open
Open -> Escalated -> In Review
```

### 7.5 Assessment 状态机

```text
Draft -> Ready to Send -> Sent -> Submitted -> Parsed -> In Review -> Complete
In Review -> Calibrate -> Complete
Draft -> Cancelled
Sent -> Candidate Question -> Sent
Any Active -> Skipped by Stop Rule
```

### 7.6 AI Action 状态机

```text
Generated -> Pending Approval -> Approved -> Applied
Generated -> Auto Applied
Generated -> Rejected
Applied -> Corrected
Applied -> Reverted
```

规则：

- AI Action 必须记录输入、输出、证据引用、置信度、操作者和时间。
- 自动写入只允许低风险、规则明确、可撤销的动作。

## 8. AI 治理规则

AI 可以：

- 读取招聘邮箱和附件。
- 解析 CV。
- 推荐 Candidate / Job / Application 匹配。
- 提取 Evidence Event。
- 推荐状态变化。
- 生成 JD、Scorecard、Interview Brief、Rubric、Assessment、Decision Card。
- 起草候选人邮件。
- 推荐下一步动作。

AI 不可以：

- 自动拒绝候选人。
- 自动录用候选人。
- 自动做 Offer Decision。
- 决定薪酬或 offer 条件。
- 未经批准发送敏感邮件。
- 用黑箱分数替代证据。

必须人工审批：

- 候选人合并。
- 低置信度岗位匹配。
- 拒绝、终面和 Offer Decision。
- 对候选人的敏感外发邮件。
- 修改 Job Active 条件。
- 覆盖人工评价。

## 9. 页面清单

当前原型页面与产品模块映射：

- `hireos-dashboard-design.html`：Dashboard。
- `hireos-jobs.html`：Jobs 列表和新建岗位。
- `hireos-job-detail.html`：Job Detail。
- `hireos-inbox.html`：统一 Inbox 和邮箱连接。
- `hireos-inbox-detail.html`：Inbox 审核详情。
- `hireos-email-agent.html`：Email Agent。
- `hireos-applications.html`：Applications。
- `hireos-application-detail.html`：Application Detail。
- `hireos-candidates.html`：Candidates。
- `hireos-assessments.html`：Assessments。
- `hireos-founder-inbox.html`：Founder Inbox。
- `hireos-blocked.html`：Blocked。
- `hireos-analytics.html`：Analytics。
- `hireos-settings.html`：Settings。
- `hireos-settings-mailbox.html`：Mailbox Settings。

## 10. MVP 数据对象关系

```text
Job
  -> Hiring Workflow
  -> Scorecard
  -> Assessment Plan

Candidate
  -> CV
  -> Candidate Source

Candidate + Job
  -> Application
  -> Timeline
  -> Evidence Event
  -> Interview
  -> Assessment
  -> Decision

Email Connection
  -> Email Thread
  -> Attachment
  -> Parsed Entity
  -> Inbox Item
  -> Evidence Event
```

## 11. MVP 验收标准

### 11.1 业务闭环验收

- 可以创建并发布一个 Active Job。
- 可以连接一个招聘邮箱。
- 可以从邮件和附件创建 Candidate。
- 可以把 Candidate 匹配到 Job 并创建 Application。
- 可以通过 Inbox 审核低置信度结果。
- 可以推进 Application 状态。
- 可以记录面试安排和面试反馈。
- 可以创建、发送、接收和 Review Assessment。
- 可以生成 Founder Decision Card。
- Founder 可以做下一步、终面、拒绝或 Offer Decision。
- Blocked 能被系统识别并展示。
- Analytics 能展示核心漏斗和运营指标。

### 11.2 数据质量验收

- 活跃 Application 不允许缺少 Current Owner。
- 活跃 Application 不允许缺少 Process Owner。
- 活跃 Application 不允许缺少 Next Action。
- 活跃 Application 不允许缺少 Due Date 或 SLA。
- AI 写入必须能追溯到 Email Thread、附件或人工输入。
- 关键决策必须能追溯到 Evidence Event。

### 11.3 AI 安全验收

- AI 不会自动拒绝或录用候选人。
- AI 不会自动做 Offer Decision。
- AI 推荐必须显示证据、风险和置信度。
- 人工可以修改、拒绝、撤销 AI 建议。
- 所有 AI 写入有审计记录。

## 12. 后续拆分建议

推荐先按以下 Epic 拆开发：

1. Frontend Productization：把静态原型组件化、路由化、数据化。
2. Core Hiring Data Model：Job、Candidate、Application、Evidence Event、Decision。
3. Application Workflow：状态机、owner、next action、SLA、timeline。
4. Mailbox Intake：邮箱连接、同步、解析、附件处理。
5. Review Inbox：低置信度审核、写回预览、审批动作。
6. AI Governance：AI Action、证据引用、置信度、审批边界。
7. Founder Decision：Decision Card、Founder Inbox、Offer Decision。
8. Assessment Workspace：Rubric、提交、Review、Stop Rule。
9. Blocked and Analytics：阻塞检测、漏斗、渠道、执行效率、AI 采纳。

