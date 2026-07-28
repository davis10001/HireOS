# HireOS 全面产品需求文档 PRD

版本：v0.1  
日期：2026-07-28  
范围：MVP 到可落地 Alpha  
依据：当前 `frontend-prototype/` 交互原型、`sources/` 参考文档、已整理领域词汇表

## 1. 产品概述

### 1.1 产品定位

HireOS 是面向 Founder、HR、Hiring Manager 与 Interviewer 的 Task-first AI 原生端到端招聘操作系统。

它以招聘邮箱为 MVP 的核心数据入口，通过 AI 读取邮件线程、CV 附件、候选人回复、面试安排、面试反馈和 Assessment 提交，将分散在邮箱与人工记忆里的招聘信息结构化为 Candidate、Job、Application、Evidence Event、Assessment、Decision、Task 和 Analytics。

HireOS 的核心目标不是“筛简历”，而是把招聘流程变成一个以 Task 为执行入口、以 Application 为业务流程、以 Evidence 为判断依据的可追踪、可判断、可推进、可度量的运营系统。

### 1.2 产品核心承诺

- 每个候选人针对每个岗位的招聘进展都有明确状态。
- 每个活跃 Application 都必须有负责人、下一步和截止时间。
- 每个需要人或 AI 继续推进的招聘事项都必须形成 Task，并出现在 Tasks、Dashboard 摘要或角色化任务视图中。
- 每次状态变化、推荐、决策都能回到原始邮件、附件、面试反馈或人工记录。
- AI 可以提取、推荐、总结、起草和低风险写入，但不能自动拒绝、录用或做 Offer Decision。
- Founder 只处理高价值决策，不被日常招聘运营噪音淹没。
- HR 能看见所有卡住、逾期、低置信度、缺证据的流程。

### 1.3 MVP 成功标准

MVP 成立的最低闭环：

1. HR 创建一个岗位，确认 JD、Scorecard、招聘流程、负责人默认值和 SLA。
2. HR 连接招聘邮箱。
3. 系统读取含 CV 的邮件并解析候选人。
4. 高置信度邮件自动创建或更新 Candidate / Application。
5. 低置信度邮件进入 Inbox 由 HR 审核。
6. Application 自动拥有 Current State、Current Owner、Process Owner、Next Action、Due Date。
7. Tasks 能展示来自 Application、Inbox、Interview、Assessment、Blocked、Settings 的待办、审批、风险和下一步。
8. Dashboard 能汇总今日 Critical、Today Due、Waiting、Upcoming Interviews 和 Recruitment Health，并跳转到 Tasks 过滤视图。
9. 面试安排、反馈、Assessment 提交能进入 Application Timeline 并生成对应 Task。
10. AI 能生成带证据引用的 Founder Decision Task / Card。
11. Founder 能在 Founder Inbox 处理 Continue、Request More Evidence、Final Interview、Reject、Offer Decision。
12. Blocked 页面能显示逾期、无人负责、证据缺口、等待候选人或等待面试官导致的阻塞，并生成可处理 Task。
13. Analytics 能展示招聘漏斗、渠道质量、执行效率、Task aging 和 AI 采纳。

## 2. 用户、角色与权限

### 2.1 角色定义

| 角色 | 定位 | 核心目标 |
|---|---|---|
| Founder | 高价值招聘判断者 | 快速看见关键候选人、风险、证据和决策建议 |
| HR Admin | 系统与治理配置者 | 管理邮箱、权限、模板、SLA、AI 自动化边界 |
| HR Member | 日常招聘运营者 | 处理邮件、候选人、流程、面试、Assessment、Blocked |
| Hiring Manager | 用人标准确认者 | 确认岗位需求、Scorecard、候选人阶段性判断 |
| Interviewer | 面试证据提供者 | 查看面试准备材料，提交结构化反馈 |

### 2.2 权限矩阵

| 功能/动作 | Founder | HR Admin | HR Member | Hiring Manager | Interviewer |
|---|---:|---:|---:|---:|---:|
| 查看 Dashboard | 是 | 是 | 是 | 受限 | 否 |
| 创建 Job | 是 | 是 | 可配置 | 可配置 | 否 |
| 发布 Active Job | 是 | 是 | 可配置 | 可配置 | 否 |
| 暂停/关闭 Job | 是 | 是 | 可配置 | 可配置 | 否 |
| 连接邮箱 | 否 | 是 | 否 | 否 | 否 |
| 查看所有邮件线程 | 否 | 是 | 是 | 否 | 否 |
| 审核低置信度邮件 | 否 | 是 | 是 | 否 | 否 |
| 创建/编辑 Candidate | 否 | 是 | 是 | 只读 | 只读 |
| 合并 Candidate | 否 | 是 | 可配置 | 否 | 否 |
| 创建/推进 Application | 否 | 是 | 是 | 可配置 | 否 |
| 修改 Current Owner | 是 | 是 | 是 | 可配置 | 否 |
| 填写面试反馈 | 可配置 | 是 | 是 | 是 | 是 |
| 创建 Assessment | 是 | 是 | 是 | 可配置 | 否 |
| 发送 Assessment | 否 | 是 | 是 | 否 | 否 |
| Review Assessment | 是 | 是 | 可配置 | 可配置 | 否 |
| Founder Decision | 是 | 否 | 否 | 可配置 | 否 |
| Offer Decision | 是 | 可配置 | 否 | 可配置 | 否 |
| 配置 AI 自动化规则 | 否 | 是 | 否 | 否 | 否 |
| 查看审计日志 | 是 | 是 | 否 | 否 | 否 |

### 2.3 敏感动作审批

以下动作必须人工确认：

- 自动创建 Application 且候选人/岗位匹配置信度低于阈值。
- 候选人合并。
- 变更 Application 到 Rejected、Withdrawn、Offer Decision、Closed。
- 向候选人发送拒绝、薪酬、Offer、敏感反馈类邮件。
- 覆盖已有人工面试反馈或 Founder 决策。
- 修改已发布 Job 的 Scorecard、SLA 或自动匹配规则。

## 3. 产品范围

### 3.1 MVP 范围内

- Dashboard。
- Tasks。
- Jobs。
- Job Detail。
- Inbox。
- Inbox Detail。
- Email Agent。
- Applications。
- Application Detail。
- Candidates。
- Assessments。
- Founder Inbox。
- Blocked。
- Analytics。
- Settings。
- Mailbox Settings。
- AI Action 审批与审计。

### 3.2 MVP 范围外

- Candidate Portal。
- Candidate Task Link。
- 完整 DM 自动化。
- VietnamWorks 浏览器抓取。
- 实时面试 Copilot。
- 视频面试转录。
- 自动拒绝候选人。
- 自动录用候选人。
- 完整 Offer 起草、谈判、合同、入职。
- 完整 Workflow Builder。
- 多租户企业权限高级版。

### 3.3 MVP 后续增强

- Google Calendar / Outlook Calendar 面试排期。
- Slack / Teams 通知。
- Candidate Portal。
- 高级 Workflow Builder。
- Offer Management。
- 多渠道候选人来源集成。
- AI 评估校准工作台。
- 招聘预测与容量规划。

## 4. 总体信息架构

```text
HireOS
├── Dashboard
├── Tasks
│   ├── All Tasks
│   ├── My Tasks
│   ├── Critical
│   ├── Today
│   ├── Waiting on Others
│   ├── Batch Review
│   └── Task Detail
├── Jobs
│   ├── Job List
│   ├── Job Create Wizard
│   └── Job Detail
├── Inbox
│   ├── Email Intake Queue
│   ├── AI Action Review
│   ├── Candidate Duplicate Review
│   └── Inbox Detail
├── Email Agent
├── Applications
│   ├── Application Pipeline
│   └── Application Detail
├── Candidates
├── Assessments
├── Founder Inbox
├── Blocked
├── Analytics
└── Settings
    ├── Mailbox Connections
    ├── Roles & Permissions
    ├── Status & SLA Defaults
    ├── AI Automation Rules
    ├── Hiring Templates
    └── Evidence Policy
```

## 5. 核心业务流程

### 5.1 端到端招聘主流程

```text
Create Job
  -> Configure Workflow
  -> Connect Recruiting Mailbox
  -> AI Email Intake
  -> Candidate Extraction / Deduplication
  -> Job Matching
  -> Application Creation / Update
  -> Pipeline Progress
  -> Interview Scheduling
  -> Interview Feedback
  -> Assessment
  -> Founder Decision
  -> Offer Decision
```

### 5.2 邮件进入系统流程

1. 邮箱同步任务拉取新邮件线程。
2. 系统判断是否为招聘相关邮件。
3. AI 提取邮件类型、候选人信息、附件、来源、岗位线索。
4. 系统查找是否已有 Candidate。
5. 系统查找是否已有 Application。
6. AI 推荐岗位匹配并给出置信度。
7. 系统按规则决定 Auto Apply 或进入 Inbox Review。
8. 写入 Candidate、Application、Email Thread、Evidence Event、Timeline。
9. 若无法判断，创建 Inbox Item。

### 5.3 Application 推进流程

1. Application 被创建或更新。
2. 系统设置 Current State。
3. 系统根据 Job Workflow 继承 Current Owner、Process Owner、Next Action、Due Date。
4. HR 查看并确认。
5. AI 根据邮件、反馈、Assessment、SLA 推荐下一步。
6. 人工批准或修改。
7. 系统更新状态并写入 Timeline。
8. 若超时、无人负责、证据缺口、候选人等待过久，进入 Blocked。

### 5.4 Founder 决策流程

1. 系统识别需要 Founder 处理的 Application。
2. AI 聚合 Evidence Event、Assessment、Interview Feedback、Timeline。
3. AI 生成 Decision Card。
4. Founder 查看证据、风险、缺口和建议。
5. Founder 做出决策。
6. 系统记录 Decision，更新 Application 状态和 Next Action。

## 6. 核心数据模型

### 6.1 Organization

| 字段 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| id | string | 是 | 组织 ID |
| name | string | 是 | 组织名称 |
| timezone | string | 是 | 默认时区 |
| default_language | enum | 是 | en / zh |
| created_at | datetime | 是 | 创建时间 |
| updated_at | datetime | 是 | 更新时间 |

### 6.2 User

| 字段 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| id | string | 是 | 用户 ID |
| org_id | string | 是 | 所属组织 |
| name | string | 是 | 姓名 |
| email | string | 是 | 邮箱 |
| role | enum | 是 | Founder / HR Admin / HR Member / Hiring Manager / Interviewer |
| status | enum | 是 | Active / Invited / Disabled |
| avatar_initials | string | 否 | 头像缩写 |
| last_seen_at | datetime | 否 | 最近在线时间 |

### 6.3 Candidate

| 字段 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| id | string | 是 | 候选人 ID |
| org_id | string | 是 | 组织 ID |
| full_name | string | 是 | 姓名 |
| primary_email | string | 否 | 主邮箱 |
| emails | array | 否 | 所有邮箱 |
| phone | string | 否 | 电话 |
| location | string | 否 | 所在地 |
| current_company | string | 否 | 当前公司 |
| current_title | string | 否 | 当前职位 |
| seniority | string | 否 | 级别 |
| skills_summary | text | 否 | 技能摘要 |
| tags | array | 否 | 标签 |
| source_summary | string | 否 | 来源摘要 |
| duplicate_group_id | string | 否 | 重复候选人组 |
| status | enum | 是 | Active / Duplicate Review / Merged / Archived |
| allocation_state | enum | 是 | Unassigned Pool / Assigned / Not Fit Current Job / Rejected Global / Duplicate Review |
| current_job_id | string | 否 | 当前主要分配岗位；未分配时为空 |
| recommended_job_ids | array | 否 | AI 或 HR 推荐可匹配岗位 |
| match_confidence | number | 否 | 当前推荐岗位匹配置信度 |
| not_fit_reason | string | 否 | 不适合当前岗位原因 |
| pool_reason | string | 否 | 进入公共池原因，如岗位不明确、低置信度、暂不匹配 |
| cooldown_until | datetime | 否 | 暂不考虑或冷却到期时间 |
| merged_into_candidate_id | string | 否 | 合并目标 |
| created_by | string | 是 | 创建人或 AI |
| created_at | datetime | 是 | 创建时间 |
| updated_at | datetime | 是 | 更新时间 |

### 6.4 Candidate Source

| 字段 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| id | string | 是 | 来源 ID |
| candidate_id | string | 是 | 候选人 |
| source_type | enum | 是 | Email / Agency / Referral / VietnamWorks / Manual Upload / CSV |
| source_name | string | 否 | 来源名称 |
| source_email | string | 否 | 来源邮箱 |
| first_seen_at | datetime | 是 | 首次发现时间 |
| evidence_event_id | string | 否 | 来源证据 |

### 6.5 CV / Attachment

| 字段 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| id | string | 是 | 文件 ID |
| candidate_id | string | 否 | 候选人 |
| email_thread_id | string | 否 | 来源邮件 |
| file_name | string | 是 | 文件名 |
| file_type | string | 是 | 文件类型 |
| file_size | number | 否 | 文件大小 |
| storage_url | string | 是 | 文件存储地址 |
| text_extract_status | enum | 是 | Pending / Parsed / Failed / Unsupported |
| extracted_text | text | 否 | 解析文本 |
| parsed_profile_json | json | 否 | AI 解析结果 |
| hash | string | 否 | 去重 hash |
| created_at | datetime | 是 | 创建时间 |

### 6.6 Job

| 字段 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| id | string | 是 | 岗位 ID |
| org_id | string | 是 | 组织 ID |
| title | string | 是 | 岗位名称 |
| team | string | 是 | 团队 |
| location | string | 否 | 地点 |
| work_mode | enum | 否 | Remote / Hybrid / Onsite |
| headcount_target | number | 是 | 招聘人数 |
| headcount_filled | number | 是 | 已完成人数 |
| level | string | 否 | 级别 |
| budget_range | string | 否 | 预算 |
| hiring_manager_id | string | 是 | 招聘经理 |
| process_owner_default_id | string | 是 | 默认流程负责人 |
| goal | text | 是 | 岗位目标 |
| jd | text | 是 | JD |
| must_have | array | 是 | 硬性条件 |
| nice_to_have | array | 否 | 加分项 |
| success_criteria | text | 是 | 成功标准 |
| status | enum | 是 | Draft / Active / Paused / Closed / Archived |
| auto_match_enabled | boolean | 是 | 是否开启邮件自动匹配 |
| configuration_status | enum | 是 | Complete / Missing JD / Missing Workflow / Missing Owner / Missing SLA / Missing Scorecard |
| created_by | string | 是 | 创建人 |
| created_at | datetime | 是 | 创建时间 |
| updated_at | datetime | 是 | 更新时间 |

### 6.7 Scorecard

| 字段 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| id | string | 是 | Scorecard ID |
| job_id | string | 是 | 岗位 |
| criteria | array | 是 | 评分项 |
| minimum_coverage | number | 是 | 最低覆盖率 |
| status | enum | 是 | Draft / Needs Review / Approved |
| approved_by | string | 否 | 确认人 |
| approved_at | datetime | 否 | 确认时间 |

Scorecard Criterion 字段：

| 字段 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| name | string | 是 | 能力项名称 |
| description | text | 是 | 说明 |
| weight | number | 是 | 权重 |
| evidence_required | boolean | 是 | 是否必须有证据 |
| evaluation_method | enum | 是 | CV / Interview / Assessment / Founder Review |
| pass_threshold | string | 否 | 通过标准 |

### 6.8 Hiring Workflow

| 字段 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| id | string | 是 | 流程 ID |
| job_id | string | 是 | 岗位 |
| template_name | string | 否 | 模板名称 |
| status | enum | 是 | Draft / Active / Archived |
| stages | array | 是 | 阶段列表 |
| created_at | datetime | 是 | 创建时间 |
| updated_at | datetime | 是 | 更新时间 |

Workflow Stage 字段：

| 字段 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| stage_key | enum | 是 | 阶段 |
| display_name | string | 是 | 展示名称 |
| order | number | 是 | 顺序 |
| default_owner_role | enum | 是 | 默认当前负责人角色 |
| default_sla_hours | number | 是 | 默认 SLA |
| required_evidence_types | array | 否 | 必要证据 |
| exit_conditions | array | 是 | 出口条件 |
| allows_skip | boolean | 是 | 是否可跳过 |

### 6.9 Application

| 字段 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| id | string | 是 | Application ID |
| org_id | string | 是 | 组织 |
| candidate_id | string | 是 | 候选人 |
| job_id | string | 是 | 岗位 |
| source_id | string | 否 | 来源 |
| current_state | enum | 是 | 当前状态 |
| previous_state | enum | 否 | 进入 Blocked 前状态等 |
| status_reason | string | 否 | 状态原因 |
| current_owner_id | string | 是 | 当前负责人 |
| current_owner_type | enum | 是 | HR / Founder / Candidate / Interviewer / Hiring Manager / AI / Unassigned |
| process_owner_id | string | 是 | HR 流程负责人 |
| next_action | string | 是 | 下一步 |
| due_at | datetime | 是 | 截止时间 |
| sla_status | enum | 是 | On Track / Due Soon / Overdue / Missing |
| priority | enum | 是 | Critical / High / Normal / Low |
| risk_level | enum | 是 | None / Low / Medium / High |
| evidence_coverage | number | 否 | Scorecard 证据覆盖率 |
| last_activity_at | datetime | 是 | 最近活动 |
| closed_at | datetime | 否 | 关闭时间 |
| created_at | datetime | 是 | 创建时间 |
| updated_at | datetime | 是 | 更新时间 |

### 6.10 Email Connection

| 字段 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| id | string | 是 | 邮箱连接 ID |
| org_id | string | 是 | 组织 |
| provider | enum | 是 | Gmail / Outlook / IMAP |
| mailbox_email | string | 是 | 邮箱地址 |
| connected_by | string | 是 | 授权人 |
| sync_scope | json | 是 | 同步范围 |
| historical_sync_from | datetime | 否 | 历史同步起点 |
| status | enum | 是 | Connected / Syncing / Action Required / Disconnected / Error |
| last_sync_at | datetime | 否 | 最近同步时间 |
| error_code | string | 否 | 错误码 |

### 6.11 Email Thread

| 字段 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| id | string | 是 | 邮件线程 ID |
| connection_id | string | 是 | 邮箱连接 |
| provider_thread_id | string | 是 | 邮件服务商线程 ID |
| subject | string | 是 | 主题 |
| sender_email | string | 是 | 发件人 |
| sender_name | string | 否 | 发件人姓名 |
| recipients | array | 是 | 收件人 |
| cc | array | 否 | 抄送 |
| latest_message_at | datetime | 是 | 最新邮件时间 |
| raw_body_storage_url | string | 否 | 原文存储 |
| classification | enum | 是 | 邮件类型 |
| parse_status | enum | 是 | Pending / Parsed / Needs Review / Auto Applied / Ignored / Failed |
| suggested_candidate_id | string | 否 | 推荐候选人 |
| suggested_job_id | string | 否 | 推荐岗位 |
| suggested_application_id | string | 否 | 推荐 Application |
| confidence | number | 否 | 综合置信度 |
| reviewed_by | string | 否 | 审核人 |
| reviewed_at | datetime | 否 | 审核时间 |

### 6.12 Evidence Event

| 字段 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| id | string | 是 | 证据事件 ID |
| org_id | string | 是 | 组织 |
| candidate_id | string | 否 | 候选人 |
| job_id | string | 否 | 岗位 |
| application_id | string | 否 | Application |
| event_type | enum | 是 | 事件类型 |
| source_type | enum | 是 | Email / Attachment / Form / AI / User / System |
| source_id | string | 否 | 来源 ID |
| summary | text | 是 | 摘要 |
| facts | json | 否 | 结构化事实 |
| risk_summary | text | 否 | 风险 |
| confidence | number | 否 | 置信度 |
| ai_action_id | string | 否 | 来源 AI 动作 |
| approval_status | enum | 是 | Auto / Pending / Approved / Rejected |
| created_by | string | 是 | 创建者 |
| created_at | datetime | 是 | 创建时间 |

### 6.13 Task

Task 是 HireOS 的执行入口，表示一个需要人、AI 或流程规则继续推进的招聘事项。Task 不替代 Candidate、Job、Application、Interview、Assessment、Decision 等业务对象，而是引用它们并承载 Owner、Priority、Status、Next Action、Due Date、SLA、证据、风险、审批动作和审计。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| id | string | 是 | Task ID |
| org_id | string | 是 | 组织 |
| type | enum | 是 | Job Setup / Candidate Review / Application Next Action / Inbox Review / Interview Scheduling / Interview Feedback / Assessment Review / Founder Decision / Blocked Resolution / AI Action Approval / Settings Alert |
| title | string | 是 | 任务标题 |
| description | text | 否 | 任务说明 |
| source_module | enum | 是 | Dashboard / Jobs / Candidates / Applications / Inbox / Interview / Assessment / Founder Inbox / Blocked / Settings / System |
| current_owner_id | string | 否 | 当前负责人 |
| owner_role | enum | 是 | Founder / HR Admin / HR Member / Hiring Manager / Interviewer / AI |
| priority | enum | 是 | Critical / High / Normal / Low |
| status | enum | 是 | New / In Progress / Waiting / Ready for Review / Completed / Blocked / Overdue / Cancelled |
| next_action | string | 是 | 下一步动作 |
| due_at | datetime | 否 | 截止时间 |
| sla_status | enum | 是 | Ready / Today / Due Soon / Overdue / Missing / Waiting |
| related_candidate_id | string | 否 | 关联 Candidate |
| related_job_id | string | 否 | 关联 Job |
| related_application_id | string | 否 | 关联 Application |
| related_inbox_item_id | string | 否 | 关联 Inbox Item |
| related_ai_action_id | string | 否 | 关联 AI Action |
| evidence_refs | array | 否 | 证据引用 |
| ai_recommendation | json | 否 | AI 建议 |
| risk_summary | text | 否 | 风险摘要 |
| allowed_actions | array | 是 | 当前可执行动作 |
| completed_action | string | 否 | 完成时采取的动作 |
| completed_by | string | 否 | 完成人 |
| completed_at | datetime | 否 | 完成时间 |
| created_at | datetime | 是 | 创建时间 |
| updated_at | datetime | 是 | 更新时间 |

### 6.14 Inbox Item

| 字段 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| id | string | 是 | 待办项 ID |
| org_id | string | 是 | 组织 |
| type | enum | 是 | 待办类型 |
| title | string | 是 | 标题 |
| description | text | 否 | 描述 |
| priority | enum | 是 | Critical / High / Normal / Low |
| status | enum | 是 | Open / In Review / Approved / Applied / Rejected / Snoozed / Escalated / Closed |
| owner_id | string | 否 | 负责人 |
| due_at | datetime | 否 | 截止时间 |
| related_candidate_id | string | 否 | 关联候选人 |
| related_job_id | string | 否 | 关联岗位 |
| related_application_id | string | 否 | 关联 Application |
| raw_evidence_id | string | 否 | 原始证据 |
| ai_recommendation | json | 否 | AI 建议 |
| confidence | number | 否 | 置信度 |
| writeback_preview | json | 否 | 写回预览 |
| created_at | datetime | 是 | 创建时间 |
| updated_at | datetime | 是 | 更新时间 |

### 6.14 Interview

| 字段 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| id | string | 是 | 面试 ID |
| application_id | string | 是 | Application |
| stage_name | string | 是 | 阶段 |
| interview_type | enum | 是 | HR Screen / Technical / Product / Founder / Final |
| scheduled_start_at | datetime | 否 | 开始时间 |
| scheduled_end_at | datetime | 否 | 结束时间 |
| timezone | string | 否 | 时区 |
| participants | array | 是 | 参与者 |
| status | enum | 是 | Draft / Scheduling / Scheduled / Rescheduled / Completed / No Show / Cancelled / Feedback Pending / Feedback Complete |
| feedback_due_at | datetime | 否 | 反馈截止 |
| created_at | datetime | 是 | 创建时间 |

### 6.15 Interview Feedback

| 字段 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| id | string | 是 | 反馈 ID |
| interview_id | string | 是 | 面试 |
| application_id | string | 是 | Application |
| interviewer_id | string | 是 | 面试官 |
| recommendation | enum | 是 | Strong Yes / Yes / Mixed / No / Strong No |
| scorecard_scores | json | 否 | 按 Scorecard 评分 |
| evidence_notes | text | 是 | 证据说明 |
| risks | text | 否 | 风险 |
| follow_up_questions | array | 否 | 补充问题 |
| source_type | enum | 是 | Form / Email |
| status | enum | 是 | Draft / Submitted / Parsed / Needs Clarification / Approved |
| submitted_at | datetime | 否 | 提交时间 |

### 6.16 Assessment

| 字段 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| id | string | 是 | Assessment ID |
| application_id | string | 是 | Application |
| job_id | string | 是 | 岗位 |
| title | string | 是 | 标题 |
| purpose | text | 是 | 测试目标 |
| prompt | text | 是 | 题目 |
| rubric | json | 是 | Rubric |
| due_at | datetime | 是 | 截止时间 |
| status | enum | 是 | Draft / Ready to Send / Sent / Candidate Question / Submitted / Parsed / In Review / Calibrate / Complete / Skipped by Stop Rule / Cancelled |
| sent_email_thread_id | string | 否 | 发题邮件 |
| created_by | string | 是 | 创建人 |
| created_at | datetime | 是 | 创建时间 |

### 6.17 Assessment Submission

| 字段 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| id | string | 是 | 提交 ID |
| assessment_id | string | 是 | Assessment |
| email_thread_id | string | 否 | 提交邮件 |
| submitted_at | datetime | 是 | 提交时间 |
| attachments | array | 否 | 附件 |
| parsed_status | enum | 是 | Pending / Parsed / Failed |
| version | string | 否 | 版本 |
| ai_review_id | string | 否 | AI Review |

### 6.18 Decision

| 字段 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| id | string | 是 | 决策 ID |
| application_id | string | 是 | Application |
| decision_type | enum | 是 | Continue / Request More Evidence / Final Interview / Reject / Offer Decision / Hold |
| decision_maker_id | string | 是 | 决策人 |
| reason | text | 是 | 原因 |
| evidence_event_ids | array | 是 | 证据 |
| risk_accepted | text | 否 | 接受的风险 |
| next_action | string | 否 | 后续动作 |
| created_at | datetime | 是 | 创建时间 |

### 6.19 AI Action

| 字段 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| id | string | 是 | AI 动作 ID |
| action_type | enum | 是 | Extract / Match / Summarize / Draft / Recommend / Writeback |
| input_refs | array | 是 | 输入来源 |
| output | json | 是 | 输出 |
| confidence | number | 否 | 置信度 |
| evidence_refs | array | 是 | 证据引用 |
| status | enum | 是 | Generated / Pending Approval / Approved / Auto Applied / Applied / Rejected / Corrected / Reverted |
| approved_by | string | 否 | 审批人 |
| applied_at | datetime | 否 | 应用时间 |
| created_at | datetime | 是 | 创建时间 |

### 6.20 Audit Log

| 字段 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| id | string | 是 | 日志 ID |
| org_id | string | 是 | 组织 |
| actor_type | enum | 是 | User / AI / System |
| actor_id | string | 是 | 操作者 |
| action | string | 是 | 动作 |
| entity_type | string | 是 | 对象类型 |
| entity_id | string | 是 | 对象 ID |
| before | json | 否 | 变更前 |
| after | json | 否 | 变更后 |
| reason | text | 否 | 原因 |
| created_at | datetime | 是 | 时间 |

## 7. 状态机与业务规则

### 7.0 状态字典总览

本节集中定义 HireOS MVP 中所有核心对象的状态。后续页面、接口、筛选器、统计口径和 AI 判断都必须使用这些状态，不允许页面临时创造同义状态。

#### 7.0.1 Job Status

Job Status 描述岗位是否可以接收候选人和邮件自动匹配。

| 状态 | 中文名 | 业务含义 | 进入条件 | 可执行动作 | 终态 |
|---|---|---|---|---|---|
| Draft | 草稿 | 岗位尚未完成配置，不能自动接收邮件匹配 | 新建岗位，或配置缺失 | 编辑、补齐配置、发布、归档 | 否 |
| Active | 活跃 | 岗位开放招聘，可接收邮件自动匹配 | JD、Scorecard、Workflow、Owner、SLA 均确认 | 暂停、关闭、编辑受控字段、查看 Pipeline | 否 |
| Paused | 暂停 | 暂停新候选人自动流入，已有 Application 可继续推进 | HR / Founder 暂停岗位 | 恢复、关闭、编辑 | 否 |
| Closed | 已关闭 | 岗位停止招聘，不允许新增 Application | 招聘完成、取消岗位、业务决定关闭 | 查看历史、归档 | 是 |
| Archived | 已归档 | 岗位不在默认运营视图展示 | 从 Draft 或 Closed 归档 | 查看历史、恢复需管理员操作 | 是 |

Job Status 页面使用位置：

- Jobs 列表筛选。
- Job Detail 顶部状态。
- Dashboard Job Progress。
- Email Agent 判断是否允许自动匹配。
- Analytics 按岗位状态统计。

#### 7.0.2 Job Configuration Status

Job Configuration Status 描述岗位发布前的配置完整性。

| 状态 | 中文名 | 业务含义 | 阻塞结果 |
|---|---|---|---|
| Complete | 配置完整 | 满足 Active 条件 | 可发布为 Active |
| Missing JD | 缺少 JD | 岗位描述未确认 | 不能发布 Active |
| Missing Workflow | 缺少流程 | 招聘阶段未配置 | 不能发布 Active |
| Missing Owner | 缺少负责人 | 默认负责人或 Process Owner 缺失 | 不能发布 Active |
| Missing SLA | 缺少 SLA | 阶段截止规则缺失 | 不能开启自动匹配 |
| Missing Scorecard | 缺少 Scorecard | 评分标准未确认 | 不能进入结构化评估 |

#### 7.0.3 Candidate Status

Candidate Status 描述候选人主档案是否可用。候选人的招聘进展不放在 Candidate Status，而放在 Application Status。

| 状态 | 中文名 | 业务含义 | 进入条件 | 可执行动作 | 终态 |
|---|---|---|---|---|---|
| Active | 活跃 | 候选人档案可被用于一个或多个 Application | 手动创建、邮件解析创建、合并后保留主档案 | 编辑、创建 Application、标记重复、归档 | 否 |
| Duplicate Review | 重复待审 | 可能与已有候选人重复，需要人工确认 | AI 或人工检测到强/弱重复信号 | 合并、拆分、忽略重复、编辑 | 否 |
| Merged | 已合并 | 当前记录已并入另一个 Candidate | 人工确认合并 | 查看跳转到主 Candidate | 是 |
| Archived | 已归档 | 候选人不在默认列表中展示 | 人工归档 | 查看历史、恢复 | 是 |

Candidate Status 页面使用位置：

- Candidates 列表。
- Duplicate Review。
- Candidate Detail。
- Email Agent 候选人匹配。

#### 7.0.3.1 Candidate Allocation State

Candidate Allocation State 描述“这个人当前是否被分配到岗位”。它是人的运营池状态，不等于招聘流程状态。招聘流程状态仍然只存在于 Application。

| 状态 | 中文名 | 业务含义 | 进入条件 | 可执行动作 | 是否创建 Application |
|---|---|---|---|---|---|
| Unassigned Pool | 公共池 | 有候选人档案，但尚未绑定岗位 | 手动创建未选岗位、邮件解析岗位低置信度、猎头转发岗位不清晰 | 分配岗位、标记不适合、标记重复、归档 | 否 |
| Assigned | 已分配 | Candidate 已绑定至少一个 Job，并产生 Application | HR 手动绑定 Active Job，或 AI 高置信度匹配经规则允许 | 打开 Application、推进流程、分配其它岗位 | 是 |
| Not Fit Current Job | 不适合当前岗位 | 不适合当前岗位，但可保留到公共池或其它岗位 | HR 拒绝当前岗位匹配、AI 推荐不通过 | 移入公共池、推荐其它岗位、全局拒绝 | 否，或关闭当前 Application |
| Rejected Global | 全局拒绝 | 该候选人不再进入后续招聘考虑 | 明确黑名单、长期不适合、合规原因 | 查看历史、恢复 | 否 |
| Duplicate Review | 重复待审 | 分配前需要确认是否与已有 Candidate 重复 | 邮箱、电话、CV hash、姓名相似等重复信号 | 合并、保留新档案、忽略重复 | 否，直到人工确认 |

页面使用位置：

- Candidates 主页面：按 Assigned Candidates、Unassigned Pool、Rejected / Not Fit Pool 分组。
- Job Detail 的 Candidates tab：以人的角度查看已分配到当前岗位的人、公共池推荐人、当前岗位不合适但可复用的人。
- Inbox / Email Agent：低置信度岗位匹配先进入公共池或 Duplicate Review，不得静默创建 Application。
- Application 创建：只有 Candidate 绑定 Job 时才创建 Application。

#### 7.0.4 Application Status

Application Status 描述某个 Candidate 针对某个 Job 的招聘流程阶段，是 HireOS 的主运营状态。

| 状态 | 中文名 | 业务含义 | 默认 Current Owner | 典型 Next Action | 是否活跃 | 是否终态 |
|---|---|---|---|---|---:|---:|
| New Intake | 新进入 | 系统刚从邮件、上传或人工创建申请，尚未完成初步判断 | HR | Review candidate profile | 是 | 否 |
| Needs HR Review | 需 HR 审核 | 候选人、岗位、来源或附件存在不确定性 | HR | Confirm match or edit extraction | 是 | 否 |
| HR Shortlisted | HR 初筛通过 | HR 认为可进入后续流程 | HR | Schedule interview or request info | 是 | 否 |
| Waiting Candidate | 等候候选人 | 等待候选人回复、补资料、确认时间或提交作业 | Candidate | Wait for candidate response | 是 | 否 |
| Scheduling Interview | 安排面试中 | 正在协调候选人和面试官时间 | HR | Confirm interview time | 是 | 否 |
| Interview Scheduled | 面试已确认 | 面试时间和参与人已确认 | Interviewer / HR | Conduct interview | 是 | 否 |
| Interview Completed | 面试已完成 | 面试发生，等待反馈或结果整理 | Interviewer | Submit feedback | 是 | 否 |
| Waiting Feedback | 等待反馈 | 面试反馈未按时提交或未完整提交 | Interviewer | Submit interview feedback | 是 | 否 |
| Assessment Draft | 测评草稿 | Assessment 题目或 Rubric 正在准备 | HR / Founder | Review assessment draft | 是 | 否 |
| Assessment Sent | 测评已发送 | 测评已发给候选人 | Candidate | Submit assessment | 是 | 否 |
| Assessment Submitted | 测评已提交 | 候选人已提交测评 | HR / AI | Parse and review submission | 是 | 否 |
| Assessment Review | 测评待评审 | 测评需要 AI Review 或人工校准 | Founder / HR | Calibrate assessment result | 是 | 否 |
| Founder Review | 创始人审核 | 需要 Founder 做关键判断 | Founder | Make decision | 是 | 否 |
| Final Interview | 终面 | 进入终面安排或终面决策阶段 | Founder / HR | Schedule or complete final interview | 是 | 否 |
| Offer Decision | Offer 决策 | MVP 中判断是否进入 Offer 的终点阶段 | Founder | Record offer decision | 是 | 否 |
| Hold | 暂缓 | 暂时不推进，但未拒绝或关闭 | HR / Founder | Revisit on due date | 是 | 否 |
| Blocked | 已阻塞 | 因逾期、缺 owner、缺证据、低置信度等无法推进 | Process Owner | Resolve root cause | 是 | 否 |
| Rejected | 已拒绝 | 当前岗位流程被拒绝 | HR / Founder | Send or log rejection | 否 | 是 |
| Withdrawn | 候选人退出 | 候选人主动退出或不再继续 | HR | Record withdrawal reason | 否 | 是 |
| Hired Outcome Recorded | 已记录录用结果 | 已记录招聘结果，用于统计 | HR / Founder | Close application | 否 | 是 |
| Closed | 已结束 | Application 流程结束 | System / HR | View history | 否 | 是 |

Application Status 强规则：

- 所有活跃 Application 必须有 Current Owner、Process Owner、Next Action、Due Date。
- `Blocked` 是阻塞覆盖状态，必须保留 `previous_state`。
- `Rejected`、`Withdrawn`、`Hired Outcome Recorded`、`Closed` 是终态。
- `Offer Decision` 是 MVP 的判断终点，不包含 Offer 谈判、合同和入职。

#### 7.0.5 Application SLA Status

SLA Status 描述当前 Application 下一步动作的时间风险。

| 状态 | 中文名 | 条件 | 页面表现 | 系统动作 |
|---|---|---|---|---|
| On Track | 正常 | 当前时间未进入提醒窗口 | 正常标签 | 不创建额外待办 |
| Due Soon | 即将到期 | 进入提醒窗口但未超过 due_at | 黄色提醒 | 可创建提醒 |
| Overdue | 已逾期 | 当前时间超过 due_at | 红色警告 | 创建或更新 Blocked / SLA overdue |
| Missing | 缺失 | 活跃 Application 没有 due_at | 红色缺失 | 创建配置异常并阻塞 |

#### 7.0.6 Blocked Root Cause

Blocked Root Cause 描述 Application 为什么卡住。一个 Blocked Application 可以有多个 root cause，但必须有一个 primary root cause。

| 根因 | 中文名 | 触发条件 | 默认负责人 | 推荐动作 |
|---|---|---|---|---|
| Missing Owner | 缺负责人 | Current Owner 或 Process Owner 为空 | HR | Assign owner |
| Missing Next Action | 缺下一步 | Next Action 为空 | HR | Define next action |
| Missing Due Date | 缺截止时间 | 活跃 Application 没有 due_at | HR | Set due date |
| Waiting Candidate | 等候候选人 | 候选人未回复或未提交且超过 SLA | HR | Send follow-up |
| Waiting Interviewer | 等候面试官 | 面试反馈未提交且超过 SLA | Interviewer / HR | Request feedback |
| Waiting Founder | 等候创始人 | Founder 决策超过 SLA | Founder | Review decision card |
| Evidence Gap | 证据缺口 | 当前阶段所需证据不足 | HR / Founder | Request more evidence or assessment |
| Low Confidence Match | 低置信度匹配 | 邮件、候选人、岗位或 Application 匹配低于阈值 | HR | Review match |
| Approval Pending | 审批待处理 | AI Action 或敏感写回等待审批 | Approver | Approve or reject |
| Mailbox Error | 邮箱异常 | 邮箱断连、同步失败、附件解析失败 | HR Admin | Reconnect or retry sync |

#### 7.0.7 Email Connection Status

| 状态 | 中文名 | 业务含义 | 用户动作 |
|---|---|---|---|
| Connected | 已连接 | 邮箱授权有效，可同步 | 查看规则、断开连接 |
| Syncing | 同步中 | 正在同步历史或新邮件 | 等待、查看进度 |
| Action Required | 需要处理 | 权限、范围或安全检查需要用户确认 | 补授权、确认范围 |
| Disconnected | 已断开 | 邮箱不可读取 | 重新连接 |
| Error | 异常 | 同步或授权失败 | 查看错误、重试 |

#### 7.0.8 Email Thread Status

| 状态 | 中文名 | 业务含义 | 下一步 |
|---|---|---|---|
| Received | 已接收 | 邮件已同步到系统 | Pending Parse |
| Pending Parse | 待解析 | 等待 AI 或解析任务处理 | Parsed / Failed |
| Parsed | 已解析 | 原文和附件已完成基础解析 | Classified |
| Classified | 已分类 | 已识别邮件类型 | Matched / Ignored |
| Matched | 已匹配 | 已推荐 Candidate / Job / Application | Auto Applied / Needs Review |
| Needs Review | 需审核 | 低置信度或敏感写回 | HR 审核 |
| Auto Applied | 已自动应用 | 安全结果已写入业务对象 | 查看证据 |
| Approved | 已批准 | 人工批准 AI 结果 | Applied |
| Applied | 已应用 | 结果已写入业务对象 | Closed |
| Rejected | 已驳回 | 人工拒绝 AI 结果 | Closed |
| Ignored | 已忽略 | 非招聘邮件或无需处理 | 无 |
| Failed | 解析失败 | 邮件或附件处理失败 | 重试或人工处理 |
| Closed | 已关闭 | 线程处理结束 | 查看历史 |

#### 7.0.9 Inbox Item Status

| 状态 | 中文名 | 业务含义 | 可执行动作 |
|---|---|---|---|
| Open | 待处理 | 新创建或重新打开的待办 | 开始审核、转派、关闭 |
| In Review | 审核中 | 有人正在处理 | 批准、修改、驳回、升级 |
| Approved | 已批准 | 审核通过但尚未写回 | 应用写回 |
| Applied | 已应用 | 写回已完成 | 关闭 |
| Rejected | 已驳回 | 审核不通过 | 关闭、重新打开 |
| Snoozed | 稍后处理 | 延后到指定时间 | 到期重开 |
| Escalated | 已升级 | 转给更高权限或负责人 | 审核、处理 |
| Closed | 已关闭 | 待办结束 | 查看历史 |

#### 7.0.10 Interview Status

| 状态 | 中文名 | 业务含义 | 下一步 |
|---|---|---|---|
| Draft | 草稿 | 面试计划尚未发出或未确认 | 发起安排 |
| Scheduling | 安排中 | 正在协调时间 | 确认时间 |
| Scheduled | 已安排 | 时间、参与人已确认 | 进行面试 |
| Rescheduled | 已改期 | 面试时间发生变化 | 通知参与人 |
| Completed | 已完成 | 面试已发生 | 等待反馈 |
| No Show | 未出席 | 候选人或面试官未出席 | 重约或关闭 |
| Cancelled | 已取消 | 面试取消 | 重新安排或结束 |
| Feedback Pending | 反馈待提交 | 面试后缺反馈 | 提醒面试官 |
| Feedback Complete | 反馈完成 | 反馈已提交并结构化 | 推进下一阶段 |

#### 7.0.11 Interview Feedback Status

| 状态 | 中文名 | 业务含义 | 下一步 |
|---|---|---|---|
| Draft | 草稿 | 反馈未提交 | 提交反馈 |
| Submitted | 已提交 | 面试官已提交反馈 | AI 解析或人工查看 |
| Parsed | 已解析 | AI 已提取评分、证据、风险 | 关联 Evidence Event |
| Needs Clarification | 需澄清 | 反馈不足或冲突 | 请求补充 |
| Approved | 已确认 | 反馈已被 HR / Founder 确认 | 推进流程 |

#### 7.0.12 Assessment Status

| 状态 | 中文名 | 业务含义 | 默认负责人 | 下一步 |
|---|---|---|---|---|
| Draft | 草稿 | 题目或 Rubric 正在准备 | HR / Founder | 编辑 |
| Ready to Send | 待发送 | 内容已确认，尚未发送 | HR | 发送给候选人 |
| Sent | 已发送 | 候选人已收到测评 | Candidate | 提交 |
| Candidate Question | 候选人提问 | 候选人对测评有问题 | HR | 回复问题 |
| Submitted | 已提交 | 候选人已提交结果 | AI / HR | 解析 |
| Parsed | 已解析 | 提交内容已解析 | AI / HR | Review |
| In Review | 评审中 | AI 或人工正在评审 | HR / Founder | 完成或校准 |
| Calibrate | 待校准 | Rubric、评分或判断存在分歧 | Founder / Hiring Manager | 校准 |
| Complete | 已完成 | 测评结果确认 | HR / Founder | 推进 Application |
| Skipped by Stop Rule | 按停止规则跳过 | 证据足够，不再追加测评 | Founder / HR | 进入下一阶段 |
| Cancelled | 已取消 | 测评不再执行 | HR | 关闭 |

#### 7.0.13 Assessment Submission Status

| 状态 | 中文名 | 业务含义 | 下一步 |
|---|---|---|---|
| Pending | 待处理 | 提交已收到，等待解析 | Parsed / Failed |
| Parsed | 已解析 | 附件和正文已解析 | AI Review |
| Failed | 解析失败 | 无法解析附件或内容 | 人工查看或要求重发 |

#### 7.0.14 Decision Status

Decision 本身是事件型记录，通常创建即生效；页面上需要区分的是 Decision Queue Status 和 Decision Type。

Decision Queue Status：

| 状态 | 中文名 | 业务含义 | 下一步 |
|---|---|---|---|
| Waiting Founder | 等待 Founder | 需要 Founder 判断 | 查看 Decision Card |
| Evidence Ready | 证据已齐 | AI 判断证据足够进入决策 | Founder 决策 |
| Evidence Missing | 证据不足 | 当前证据不足以支持决策 | Request More Evidence |
| Risk Escalated | 风险升级 | 存在候选人流失、薪酬、竞争 offer 等高风险 | Founder 优先处理 |
| Decision Made | 已决策 | Founder 或授权人已记录决策 | 更新 Application |

Decision Type：

| 类型 | 中文名 | 业务含义 | 是否敏感 |
|---|---|---|---:|
| Continue | 继续推进 | 进入下一招聘阶段 | 否 |
| Request More Evidence | 要求补证据 | 暂不决策，要求补充信息 | 否 |
| Final Interview | 进入终面 | 安排或批准终面 | 是 |
| Reject | 拒绝 | 当前岗位流程拒绝候选人 | 是 |
| Offer Decision | Offer 决策 | 决定进入 Offer | 是 |
| Hold | 暂缓 | 暂时不推进也不拒绝 | 是 |

#### 7.0.15 AI Action Status

| 状态 | 中文名 | 业务含义 | 下一步 |
|---|---|---|---|
| Generated | 已生成 | AI 产出建议、摘要、草稿或结构化结果 | 自动应用或进入审批 |
| Pending Approval | 待审批 | 需要人工确认 | Approve / Reject |
| Approved | 已批准 | 人工批准但可能尚未写回 | Apply |
| Auto Applied | 已自动应用 | 低风险动作已自动写入 | 查看或撤销 |
| Applied | 已应用 | 已写入业务对象 | 审计留痕 |
| Rejected | 已驳回 | 人工拒绝 AI 输出 | 记录原因 |
| Corrected | 已纠正 | AI 输出被人工修改后应用 | 保存修改版 |
| Reverted | 已撤销 | 已应用结果被撤销 | 恢复前状态 |

#### 7.0.16 Evidence Event Approval Status

| 状态 | 中文名 | 业务含义 |
|---|---|---|
| Auto | 自动记录 | 低风险证据事件自动写入 |
| Pending | 待审批 | 证据事件影响关键判断，需要人确认 |
| Approved | 已确认 | 证据事件已被人工确认 |
| Rejected | 已驳回 | 证据事件不采纳，但保留审计 |

#### 7.0.17 Attachment Parse Status

| 状态 | 中文名 | 业务含义 | 下一步 |
|---|---|---|---|
| Pending | 待解析 | 文件已保存，等待解析 | Parsed / Failed / Unsupported |
| Parsed | 已解析 | 文本或结构化信息已提取 | 进入 AI 分析 |
| Failed | 解析失败 | 文件损坏、超时或解析错误 | 重试或人工查看 |
| Unsupported | 不支持 | 文件类型不支持自动解析 | 人工处理 |

#### 7.0.18 User Status

| 状态 | 中文名 | 业务含义 |
|---|---|---|
| Invited | 已邀请 | 用户已被邀请但未激活 |
| Active | 活跃 | 用户可登录并按权限操作 |
| Disabled | 已禁用 | 用户不能登录，历史记录保留 |

### 7.1 Job 状态机

```text
Draft -> Active
Draft -> Archived
Active -> Paused
Paused -> Active
Active -> Closed
Paused -> Closed
Closed -> Archived
```

业务规则：

- Draft Job 可以编辑所有字段。
- Draft Job 不允许邮件自动匹配。
- Job 发布 Active 前必须完成 JD、Scorecard、Workflow、Owner、SLA。
- Active Job 可以接收邮件自动匹配。
- Paused Job 不接收新的自动匹配，但已有 Application 可继续推进。
- Closed Job 不允许创建新 Application。
- Archived Job 不在默认列表显示。

### 7.2 Application 状态机

主路径：

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

```text
Any Active State -> Waiting Candidate
Any Active State -> Blocked
Any Active State -> Hold
Any Active State -> Rejected
Any Active State -> Withdrawn
Blocked -> Previous State
Hold -> Previous State
```

业务规则：

- 活跃 Application 必须有 Current Owner。
- 活跃 Application 必须有 Process Owner。
- 活跃 Application 必须有 Next Action。
- 活跃 Application 必须有 Due Date。
- 状态变化必须写入 Timeline。
- 状态变化若由 AI 推荐，必须保留 AI Action。
- Rejected、Withdrawn、Closed 为终止状态。
- Offer Decision 是 MVP 决策终点，不代表合同或入职完成。

### 7.3 SLA 状态

| 状态 | 条件 | 系统动作 |
|---|---|---|
| On Track | 距 due_at 大于提醒窗口 | 正常展示 |
| Due Soon | 进入提醒窗口但未逾期 | 标记提醒 |
| Overdue | 当前时间超过 due_at | 创建或更新 Blocked / SLA overdue |
| Missing | 活跃 Application 缺少 due_at | 创建配置异常 |

默认提醒窗口：

- 24 小时内到期：Due Soon。
- 超过截止时间：Overdue。
- 超过截止 48 小时且无活动：Escalate。

### 7.4 Blocked 判定规则

系统自动标记 Blocked 的条件：

- 当前状态逾期。
- Current Owner 为空。
- Process Owner 为空。
- Next Action 为空。
- Due Date 为空。
- 等待候选人超过岗位规则。
- 等待面试官反馈超过反馈 SLA。
- Founder 决策等待超过 SLA。
- Evidence Coverage 低于当前阶段所需。
- 邮件匹配或候选人身份冲突无法自动判断。
- 需要审批的 AI Action 超过 SLA。

Blocked 解除条件：

- 缺失字段被补齐。
- 负责人完成当前 Next Action。
- HR 修改状态并给出原因。
- Founder 做出决策。
- 冲突被人工审核并应用。

### 7.5 Email Thread 状态机

```text
Received -> Pending Parse -> Parsed -> Classified
Classified -> Matched
Matched -> Auto Applied
Matched -> Needs Review
Needs Review -> Approved -> Applied
Needs Review -> Rejected -> Closed
Parsed -> Ignored
Parsed -> Failed
```

业务规则：

- Not Recruiting 邮件进入 Ignored。
- Unknown 邮件进入 Needs Review。
- 低置信度 Candidate / Job / Application 匹配进入 Needs Review。
- 任何敏感写回都必须进入 Needs Review。
- Auto Applied 必须保留原始邮件和 Evidence Event。

### 7.6 Candidate 去重规则

强匹配：

- 主邮箱完全相同。
- 电话完全相同。
- CV hash 完全相同。

弱匹配：

- 姓名相同且公司/职位高度相似。
- 猎头转发邮箱不同但 CV 内容高度重合。
- 邮箱 alias 相似。
- 技能和经历片段高度重合。

动作规则：

- 强匹配可自动推荐合并，但默认仍需人工确认。
- 弱匹配必须进入 Duplicate Review。
- 合并后保留所有来源、CV、Email Thread 和 Application 关系。
- 已合并 Candidate 不能再创建新 Application，只能跳转到主 Candidate。

### 7.7 AI Action 状态机

```text
Generated -> Pending Approval -> Approved -> Applied
Generated -> Auto Applied
Generated -> Rejected
Applied -> Corrected
Applied -> Reverted
```

业务规则：

- AI Action 必须有 input_refs、output、evidence_refs。
- 低风险动作可 Auto Applied，例如非敏感分类、摘要、证据提取。
- 高风险动作必须 Pending Approval。
- Reverted 必须写 Audit Log，并保留原始 AI 输出。

## 8. 模块级需求

### 8.1 Dashboard

目标：作为 Daily Home 展示招聘系统健康度和今日任务摘要，让 Founder 与 HR 快速识别需要处理的事项，并跳转到 Tasks 的对应过滤视图。

核心场景：

- Founder 早上打开系统，查看今日必须决策的候选人。
- HR 查看哪些岗位漏斗异常。
- HR 查看哪些 Application 已逾期或即将逾期。
- 团队查看本周邮件 intake、面试、Assessment 和 Offer Decision 进展。

功能需求：

- 展示招聘漏斗：CV、HR Review、Shortlist、Interview、Assessment、Founder Review、Offer Decision。
- 展示 Job Progress：按 Job 展示活跃 Application 数、阶段分布、Blocked 数。
- 展示 Task Summary：Critical、Today Due、Waiting on Others、Upcoming Interviews、Batch Review。
- 展示 Evidence Timeline：最近关键证据事件。
- 展示 Recommended Next Move：AI 推荐下一步。
- 支持点击进入 Tasks、Jobs、Inbox、Application Detail、Founder Inbox、Blocked。
- Dashboard 不承载完整任务列表、批量处理和复杂筛选；这些能力属于 Tasks 模块。

页面状态：

- 正常有数据。
- 空数据。
- 邮箱未连接。
- 数据同步中。
- 同步失败。
- 权限不足。

验收标准：

- 用户能在 30 秒内看到今日最紧急事项。
- 每个可点击任务摘要都能进入 Tasks 或对应模块，且筛选条件正确。
- Dashboard 指标与 Analytics 口径一致。

### 8.2 Tasks

目标：提供独立的任务中心，让 Founder、HR、Hiring Manager、Interviewer 能从任务角度处理所有招聘待办、审批、风险和下一步。

核心场景：

- HR 打开 Tasks 查看自己今天必须推进的候选人、面试反馈、Assessment Review 和 Blocked Resolution。
- Founder 打开 Tasks 或 Founder Inbox 只处理高价值决策和风险升级。
- HR Admin 查看 Settings Alert、SLA 缺失、AI Action Approval 和邮箱异常。
- 面试官只看分配给自己的 Interview Feedback Task。

功能需求：

- 左侧 Sidebar 独立入口：Tasks / 任务。
- All Tasks：全部任务列表。
- My Tasks：当前用户负责的任务。
- Critical：最高优先级任务。
- Today：今天到期任务。
- Waiting on Others：等待 HR、Founder、Interviewer、Candidate 或 AI 的任务。
- Batch Review：可批量处理的审核类任务。
- 按 Owner、Owner Role、Priority、Status、SLA、Source Module、Job、Candidate、Application 筛选。
- 展示 Task title、source module、related object、priority、status、owner、next action、due date、SLA、risk、AI recommendation。
- 支持打开 Task Detail。
- 支持在 Task 卡片或详情内执行 allowed actions。
- 执行动作后写入 Task completion、Timeline、Audit Log，并按规则生成下一步 Task。

业务规则：

- Task 是执行入口，不替代 Application 状态机。
- Founder Inbox 是 Founder 决策任务视图，本质上消费 Task，不独立创造另一套任务模型。
- Inbox Item 可以生成或关联 Task，但 Inbox 不等于 Tasks。
- 活跃 Application 缺 Owner、Next Action 或 Due Date 时必须生成 Task，并可能进入 Blocked。
- Critical / High / Normal / Low 是统一优先级词汇，不再使用 Urgent。
- AI Action 的敏感写回必须进入 AI Action Approval Task。

验收标准：

- 用户能从 Sidebar 进入 Tasks。
- 用户能在 Tasks 中看到来自 Applications、Inbox、Interview、Assessment、Blocked、Settings 的任务。
- 用户能按 Owner、Priority、Status、SLA 和 Source Module 筛选。
- 用户完成一个 Task 后，相关 Application / Timeline / Audit 状态同步更新。
- Founder 只看到自己需要处理的 Founder Decision / Risk Escalation 类任务。

### 8.3 Jobs

目标：管理岗位、岗位标准和岗位级招聘流程。

核心场景：

- HR 新建岗位并让 AI 生成 JD 与 Scorecard。
- Founder 审核岗位标准。
- HR 查看所有活跃、暂停、草稿、关闭岗位。
- HR 暂停某个岗位的邮件自动匹配。

功能需求：

- 岗位列表。
- 按状态、岗位、负责人、团队筛选。
- 新建岗位向导。
- AI 生成 JD 草稿。
- AI 推荐招聘流程模板。
- AI 生成 Scorecard 初稿。
- 编辑岗位详情。
- 设置岗位状态。
- 设置自动邮件匹配规则。
- 查看岗位级候选人列表。

新建岗位向导步骤：

1. 创建岗位：岗位名称、招聘经理、岗位状态、招聘人数、团队、工作地点。
2. 输入需求：岗位目标、核心要求、预算与级别、成功标准。
3. AI 生成：JD、流程模板、Scorecard、Assessment 建议。
4. 编辑确认：确认 JD、流程、Owner、SLA、Scorecard、邮件自动匹配。

业务规则：

- 新建岗位默认 Draft。
- Active Job 必须完成配置完整性检查。
- 暂停岗位后，新邮件不能自动创建 Application。
- 关闭岗位后，不允许新增 Application。

验收标准：

- 用户能完成从空白到 Draft Job 的创建。
- 用户能发布满足条件的 Active Job。
- 不满足条件的 Job 发布时必须显示缺失项。

### 8.4 Job Detail

目标：展示和编辑单个岗位的招聘标准、流程、候选人和邮件匹配规则。

核心场景：

- Hiring Manager 查看岗位目标、预算、级别和成功标准。
- HR 查看岗位下所有 Application。
- HR 从人的角度查看当前岗位相关 Candidates：已分配、公共池推荐、不适合当前岗位但可复用。
- HR 将公共池 Candidate 绑定到当前 Job，并生成 Application。
- HR 调整岗位流程或 SLA。
- Founder 查看岗位是否准备好继续接收 CV。

功能需求：

- 岗位概要。
- 岗位状态与配置完整性。
- Candidates tab。
- Assigned Candidates：已分配到当前岗位或其它岗位的人。
- Unassigned Pool：已建档但未绑定岗位的人。
- Rejected / Not Fit Pool：不适合当前岗位但可保留或推荐其它岗位的人。
- 从公共池添加 Candidate 到当前 Job。
- 创建新 Candidate 并绑定当前 Job。
- Search existing Candidate 并绑定当前 Job。
- 招聘需求。
- 岗位目标。
- 预算与级别。
- 已配置流程。
- 邮件匹配规则。
- AI 推荐动作。
- 保存岗位。
- 暂停岗位。

业务规则：

- 修改 Active Job 的 Scorecard、SLA、Workflow 需要记录审计。
- 若修改影响已有 Application，系统必须提示是否应用到已有流程。
- 邮件匹配规则变化只影响后续邮件，除非用户手动重新匹配历史邮件。
- Candidate 绑定到 Active Job 时才创建 Application。
- Candidate 未绑定 Job 时留在 Unassigned Pool，不进入 Applications Pipeline。
- Candidate 标记为 Not Fit Current Job 时，不应删除 Candidate；可保留到公共池、推荐其它岗位，或在明确原因下全局拒绝。
- 疑似重复 Candidate 必须先进入 Duplicate Review，人工确认前不能绑定岗位创建 Application。

### 8.5 Inbox

目标：处理邮件摄取、低置信度解析、候选人去重、AI Action 写回预览等来自邮箱和 AI 解析边界的审核工作。

核心场景：

- HR 审核低置信度邮件匹配。
- HR 批准来自邮件或 AI 解析的推荐状态更新。
- HR 处理候选人重复。
- HR 将 Inbox 审核结果写入 Candidate、Application、Evidence Event 或 Task。

功能需求：

- Email Intake Queue。
- AI Action Review。
- Candidate Duplicate Review。
- 按类型、优先级、负责人、状态筛选。
- 展示已连接邮箱。
- 展示 Highest-risk item。
- 支持进入 Inbox Detail。
- 支持连接招聘邮箱。
- 支持 AI Workspace 提问。

队列类型：

- Email Intake。
- Candidate Duplicate。
- Application Status Update。
- Email Draft Approval。
- Assessment Review。
- Founder Decision。
- Blocked Resolution。
- Missing Evidence。
- SLA Overdue。

业务规则：

- 每个 Inbox Item 必须有 type、status、priority。
- 需要人处理的 Inbox Item 必须有 owner 或 owner role。
- 审核通过后必须产生 Applied 结果或明确无写回。
- 驳回必须记录原因。
- Inbox Item 若需要人继续处理，必须关联或生成 Task。
- Founder 决策、Blocked 处理、Assessment Review 可以从 Inbox 产生，但主执行视图应进入 Tasks 或对应业务模块。

### 8.6 Inbox Detail

目标：在人工审批前展示原始证据、AI 解析、写回预览和审核清单。

核心场景：

- HR 查看一封猎头转发简历是否与已有候选人重复。
- HR 判断一个邮件应绑定到哪个岗位。
- HR 修改 AI 结构化结果后写入系统。

功能需求：

- 原始邮件证据。
- 附件列表。
- AI 提取结果。
- 候选人匹配候选项。
- 岗位匹配候选项。
- Application 写回预览。
- Human Review Checklist。
- Approve / Modify / Reject / Escalate。

业务规则：

- 原始证据不可被 AI 摘要替代。
- 写回前必须显示目标对象和字段变化。
- 用户修改 AI 输出后，修改版本也要进入 Audit Log。
- Do not auto-apply 类型只能人工处理。

### 8.7 Email Agent

目标：把招聘邮件转化成候选人、流程和证据。

核心场景：

- 系统每天读取招聘邮箱。
- HR 查看需要结构化判断的邮件线程。
- HR 查看 AI 自动应用了哪些结果。
- HR 审核邮件草稿。

功能需求：

- Threads Parsed 指标。
- CV Attachments 指标。
- Auto Matched 指标。
- Needs Review 指标。
- Intake Queue。
- Tabs：Needs Review / Auto Applied / Drafts。
- 搜索 sender、job、attachment。
- 展示证据提取开关。
- Agent 推荐审核动作。

业务规则：

- 邮件必须先分类再写入业务对象。
- 附件解析失败不能阻塞邮件线程入队，但必须标记 Failed。
- 低置信度匹配不得静默创建 Application。
- Auto Applied 仅限安全动作。

### 8.8 Applications

目标：作为招聘流程主工作台，管理候选人对岗位的完整流程。

核心场景：

- HR 按状态查看所有申请。
- HR 查看今天到期的 Application。
- HR 处理 Blocked Application。
- Founder 查看处于 Founder Review 或 Offer Decision 的候选人。

功能需求：

- Pipeline Workbench。
- 按状态、owner、job、SLA、priority 筛选。
- 展示 Application、State、Owner、Next Action、SLA。
- 支持进入 Application Detail。
- 展示 Application Timeline。
- 展示 Owner Load。
- 支持 Resolve now。
- Agent 推荐下一步。

业务规则：

- State、Owner、Next Action、SLA 必须同时展示。
- 缺失 Owner 或 Next Action 的 Application 不能被视为正常。
- 用户可批量调整 Owner 和 Due Date。
- 任何状态更新都写入 Timeline。

### 8.9 Application Detail

目标：围绕单个 Application 展示所有决策上下文。

核心场景：

- Founder 判断是否进入终面。
- HR 查看候选人所有邮件和证据。
- Interviewer 查看候选人背景和面试重点。

功能需求：

- 候选人基本信息。
- 当前申请。
- 联系方式。
- 岗位匹配。
- 面试流程与状态。
- Evidence Timeline。
- Assessment Evidence。
- AI 建议。
- 基于上下文提问。
- 决策操作。

业务规则：

- Candidate 身份信息与 Application 流程信息必须分离。
- 同一 Candidate 可有多个 Application。
- Application Detail 必须展示 Evidence 与原始来源链接。
- Founder 决策必须基于当前 Application，不影响候选人其他岗位流程。

### 8.10 Candidates

目标：从“人”的角度维护可复用候选人档案、分配状态、CV 历史和跨岗位历史。

核心场景：

- HR 手动建立 Candidate 档案，先保存到公共池，或立即绑定 Job。
- HR 查看已分配 Candidates 与未分配公共池 Candidates。
- HR 将 Candidate 分配到一个 Active Job 并创建 Application。
- HR 判断 Candidate 不适合当前岗位，但保留到公共池以便未来匹配。
- HR 查看候选人是否重复。
- HR 合并猎头转发和候选人自投产生的重复记录。
- HR 查看候选人曾经申请过哪些岗位。

功能需求：

- Candidate Registry。
- Assigned Candidates。
- Unassigned Pool。
- Rejected / Not Fit Pool。
- Duplicate Review。
- Candidate History。
- CV History。
- Source Attribution。
- Merge Recommendation。
- 手动导入 CV。
- 新建 Candidate。
- 创建 Candidate 时选择：仅保存到公共池 / 绑定到已有 Job。
- 从 Candidate 创建 Application。
- 从 Job Detail 添加已有 Candidate。
- Candidate 分配状态筛选。

业务规则：

- Candidate 不应直接承载招聘流程状态。
- 流程状态必须在 Application 上。
- Candidate 可以没有 Application，此时属于公共池。
- 只有 Candidate 绑定 Job 时才创建 Application。
- 同一 Candidate 可以绑定多个 Job，并产生多个互相独立的 Application。
- Not Fit Current Job 只表示不适合某个岗位，不等于全局拒绝。
- Rejected Global 才表示该 Candidate 不再进入后续招聘考虑。
- 合并 Candidate 时保留所有 Email Thread、CV、Source、Application。
- 合并操作必须人工确认和审计。

### 8.11 Assessments

目标：用 Assessment 补齐证据缺口，辅助决策，而不是增加无效流程。

核心场景：

- AI 根据 Evidence Gap 推荐是否需要 Assessment。
- HR 起草并发送 Assessment。
- 候选人通过邮件提交。
- AI 解析提交并按 Rubric Review。
- Founder 校准是否继续推进。

功能需求：

- Assessment Workspace。
- Tabs：Review / Sent / Draft。
- Search candidate、job、rubric。
- Open Assessments 指标。
- Submitted 指标。
- Avg Review Time 指标。
- Overdue 指标。
- Evidence Profile。
- Follow-up Queue。
- Stop Rule suggestion。
- Review Recommendation。

业务规则：

- Assessment 必须绑定 Job Scorecard。
- Assessment 必须有 Rubric。
- 发送 Assessment 前必须人工确认。
- 候选人邮件提交必须进入 Assessment Submission。
- AI Review 只能作为建议，最终校准由人完成。
- Stop Rule 可以建议跳过额外 Assessment，但需人确认。

### 8.12 Founder Inbox

目标：集中处理 Founder 的高价值招聘决策任务。Founder Inbox 是 Tasks 的角色化决策视图，只展示需要 Founder 判断、审批或承担风险的 Task。

核心场景：

- Founder 每天只看真正需要自己处理的候选人。
- Founder 对证据完整候选人做终面或 Offer Decision。
- Founder 对证据不足候选人要求补证据。
- Founder 处理高价值候选人流失、Offer Decision、Final Interview、Reject、Request More Evidence 等 Critical / High Task。

功能需求：

- Open Decisions 指标。
- Avg Wait 指标。
- Evidence Ready 指标。
- Risk Escalations 指标。
- Decision Cards。
- Founder Decision Tasks。
- Decision Anatomy。
- Evidence / Risk / Confidence。
- Approve / Open Card / Request Evidence / Reject / Offer Decision。

业务规则：

- Founder Inbox 不显示普通 HR 操作噪音。
- Founder Inbox 不维护独立任务模型，所有卡片必须映射到 Task。
- AI 推荐必须说明证据、风险和置信度。
- Reject、Final Interview、Offer Decision 必须人工确认。
- Founder 决策必须写入 Decision Record 和 Timeline。

### 8.13 Blocked

目标：让卡住的招聘流程可见、可归因、可处理。

核心场景：

- HR 查看所有逾期流程。
- HR 处理无人负责的 Application。
- Founder 查看高价值候选人流失风险。

功能需求：

- Blocked Applications 列表。
- Root Causes。
- Resolution Playbook。
- Resolve first。
- AI escalation。
- 按 root cause、owner、job、risk 筛选。
- 支持解除阻塞或升级。

根因分类：

- Missing Owner。
- Missing Next Action。
- Missing Due Date。
- Waiting Candidate。
- Waiting Interviewer。
- Waiting Founder。
- Evidence Gap。
- Low Confidence Match。
- Approval Pending。
- Mailbox Error。

业务规则：

- Blocked 不应替代真实状态，应保留 previous_state。
- 解除 Blocked 后回到 previous_state 或用户选择的新状态。
- 高风险 Blocked 可升级给 Founder 或 HR Admin。

### 8.14 Analytics

目标：衡量招聘进展、运营效率、渠道质量和 AI 采纳。

核心场景：

- Founder 查看招聘漏斗和 offer 转化。
- HR 查看邮件到建档、状态更新、反馈及时率。
- 团队评估哪个渠道质量更好。
- 团队判断 AI 是否真的节省时间。

功能需求：

- Recruiting Funnel。
- Channel Quality。
- Operating Insight。
- AI Adoption。
- 按时间、岗位、来源、负责人筛选。
- 指标解释和口径。

核心指标：

- Total CVs。
- Email Intake CVs。
- Pending HR Review。
- HR Shortlisted。
- HR Interviews。
- Assessments。
- Founder Decisions。
- Offer Decisions。
- Hired / Joined Outcome Recorded。
- Source Conversion Rate。
- Time to Candidate Creation。
- Time to Status Update。
- Feedback Timeliness。
- Assessment Review Time。
- Blocked Count。
- AI Draft Acceptance Rate。
- AI Recommendation Acceptance Rate。

业务规则：

- Analytics 必须基于结构化事件，不直接依赖页面展示数。
- 每个指标需要定义口径。
- 数据不足时必须显示原因。

### 8.15 Settings

目标：管理工作区、邮箱、权限、SLA、AI 自动化、模板和证据策略。

核心场景：

- HR Admin 设置 AI 可读取哪些邮箱。
- HR Admin 设置哪些动作可自动写入。
- HR Admin 配置角色权限。
- HR Admin 设置默认 SLA。

功能需求：

- Workspace Configuration。
- Mailbox Connections。
- Roles & Permissions。
- Status & SLA Defaults。
- AI Automation Rules。
- Hiring Templates。
- Evidence Policy。
- Policy Warning。

业务规则：

- Settings 修改必须写 Audit Log。
- 影响安全边界的修改只允许 HR Admin。
- AI 自动写入策略必须按动作类型配置。
- 默认 SLA 修改不应自动覆盖已有 Application，除非用户确认。

### 8.16 Mailbox Settings

目标：把邮箱配置变成明确的生产规则。

核心场景：

- HR Admin 查看已连接邮箱。
- HR Admin 控制同步文件夹和发件域。
- HR Admin 设置需要审批的邮件类型。
- HR Admin 设置写回边界。

功能需求：

- Connected Sources。
- Email Processing Rules。
- Auto-allowed。
- Requires approval。
- Write-back Boundaries。
- Recommended rule。

业务规则：

- 邮箱断连必须在 Dashboard / Inbox / Settings 暴露。
- 读取范围改变后，只影响未来同步，历史重新处理需手动触发。
- 对外发邮件的自动发送必须按风险级别限制。

## 9. AI 能力规格

### 9.1 AI Email Intake

输入：

- Email Thread。
- 附件。
- 已有 Candidate。
- Active Job。
- Job Matching Rules。

输出：

- 邮件分类。
- 候选人提取。
- CV 摘要。
- 重复候选人建议。
- 岗位匹配建议。
- Application 创建/更新建议。
- Evidence Event。
- 置信度。

### 9.2 AI Job Assistant

输入：

- 岗位目标。
- 核心要求。
- 预算与级别。
- 成功标准。
- 历史岗位模板。

输出：

- JD 草稿。
- Scorecard。
- Screening Criteria。
- Workflow Template。
- Assessment Plan。
- SLA 建议。

### 9.3 AI Next-Step Recommendation

输入：

- Application State。
- Timeline。
- Evidence Event。
- SLA。
- Owner。
- Job Workflow。

输出：

- 推荐 Next Action。
- 推荐 Owner。
- 推荐 Due Date。
- 风险提示。
- 是否进入 Blocked。

### 9.4 AI Decision Card

输入：

- Candidate。
- Job。
- Application。
- CV。
- Interview Feedback。
- Assessment Review。
- Evidence Event。
- Risk Record。

输出：

- 候选人摘要。
- 岗位匹配摘要。
- 支持证据。
- 反向证据。
- 风险。
- 证据缺口。
- 推荐动作。
- 置信度。

### 9.5 AI 安全边界

AI 可以自动执行：

- 邮件分类。
- 非敏感摘要。
- Evidence Event 草稿。
- 高置信度非敏感字段补全。
- Dashboard/Analytics 解读。

AI 必须等待人工确认：

- 创建低置信度 Application。
- 合并 Candidate。
- 发送候选人邮件。
- 修改 Application 到终止状态。
- Founder Decision。
- Offer Decision。
- 覆盖人工反馈。

AI 禁止执行：

- 自动拒绝候选人。
- 自动录用候选人。
- 决定薪资或 Offer 条件。
- 删除原始证据。
- 隐藏低置信度或反向证据。

## 10. 关键业务场景

### 场景 1：HR 从邮件创建候选人和申请

前置条件：

- 至少一个 Active Job。
- 招聘邮箱已连接。
- 邮件包含 CV 附件。

主流程：

1. 邮件同步到系统。
2. AI 识别为 CV Intake。
3. AI 提取 Candidate。
4. AI 匹配 Job。
5. 置信度高于阈值。
6. 系统创建 Candidate 和 Application。
7. 系统写 Timeline 和 Evidence Event。
8. HR 在 Applications 看到新流程。

异常：

- 候选人可能重复：进入 Duplicate Review。
- 岗位匹配低置信度：进入 Inbox Detail。
- 附件解析失败：保留 Email Thread，创建解析失败待办。

### 场景 2：同一候选人申请多个岗位

主流程：

1. 系统识别同一个 Candidate。
2. 系统保留 Candidate 主档案。
3. 针对不同 Job 创建多个 Application。
4. 每个 Application 独立拥有状态、Owner、Next Action、SLA 和 Timeline。

业务规则：

- Candidate 不显示单一招聘状态。
- Application 才显示具体流程状态。
- 跨岗位历史在 Candidate Detail 展示。

### 场景 3：面试反馈从邮件进入系统

主流程：

1. 面试官邮件发送反馈。
2. AI 识别 Interview Feedback。
3. AI 匹配 Application 和 Interview。
4. AI 提取评分、证据、风险。
5. 高置信度写入 Evidence Event。
6. Application 状态进入下一步或 Waiting Founder。

异常：

- 无法匹配面试：进入 Inbox。
- 反馈内容不足：标记 Needs Clarification。
- 面试官不在参与人列表：要求 HR 审核。

### 场景 4：Assessment 提交与 Review

主流程：

1. HR 发送 Assessment。
2. Candidate 通过邮件提交。
3. AI 识别提交线程和附件。
4. AI 解析提交内容。
5. AI 按 Rubric 生成 Review。
6. HR 或 Founder 校准。
7. 系统写入 Evidence Event。
8. Application 进入 Founder Review 或下一阶段。

异常：

- 提交过期：创建 Overdue 或 Candidate Follow-up。
- 附件无法解析：创建 Review Item。
- Rubric 不完整：进入 Calibrate。

### 场景 5：Application 被阻塞

主流程：

1. 系统检测 Due Date 逾期。
2. Application 标记 Blocked。
3. Blocked 页面显示根因。
4. AI 推荐解决动作。
5. HR 应用动作，例如分配 owner、发送提醒、请求反馈。
6. 系统解除 Blocked 并写 Timeline。

异常：

- 多次逾期：升级给 HR Admin 或 Founder。
- Owner 离职/禁用：重新分配。
- 缺少必要证据：创建 Missing Evidence 待办。

### 场景 6：Founder 做 Offer Decision

主流程：

1. Application 进入 Founder Review。
2. Evidence Coverage 达到岗位要求。
3. AI 生成 Decision Card。
4. Founder 查看证据和风险。
5. Founder 选择 Offer Decision。
6. 系统记录 Decision。
7. Application 进入 Closed 或 Offer Decision Recorded。

业务规则：

- Offer Decision 不等于 Offer 管理。
- 薪资谈判、合同、入职不在 MVP。
- 如果后续邮件出现 offer 接受/拒绝，只作为结果事件记录。

## 11. 页面与原型映射

| 原型文件 | 页面 | MVP 模块 |
|---|---|---|
| `hireos-dashboard-design.html` | Dashboard | 全局概览 |
| `hireos-jobs.html` | Jobs | 岗位管理 |
| `hireos-job-detail.html` | Job Detail | 岗位详情 |
| `hireos-inbox.html` | Inbox | 统一待办 |
| `hireos-inbox-detail.html` | Inbox Detail | 审核详情 |
| `hireos-email-agent.html` | Email Agent | 邮件结构化 |
| `hireos-applications.html` | Applications | 流程工作台 |
| `hireos-application-detail.html` | Application Detail | 单申请详情 |
| `hireos-candidates.html` | Candidates | 候选人档案 |
| `hireos-assessments.html` | Assessments | 测评工作台 |
| `hireos-founder-inbox.html` | Founder Inbox | 创始人决策 |
| `hireos-blocked.html` | Blocked | 阻塞处理 |
| `hireos-analytics.html` | Analytics | 数据分析 |
| `hireos-settings.html` | Settings | 系统配置 |
| `hireos-settings-mailbox.html` | Mailbox Settings | 邮箱配置 |

## 12. 埋点与指标

### 12.1 事件

| 事件 | 触发时机 | 关键属性 |
|---|---|---|
| job_created | 创建 Job | job_id、created_by、source |
| job_activated | 发布 Active | job_id、missing_config_count |
| mailbox_connected | 邮箱连接成功 | provider、mailbox_id |
| email_thread_received | 邮件同步 | mailbox_id、thread_id |
| email_thread_parsed | 邮件解析完成 | classification、confidence |
| candidate_created | 创建 Candidate | source_type、ai_created |
| duplicate_candidate_detected | 检测重复 | confidence、match_reason |
| application_created | 创建 Application | job_id、candidate_id、source_type |
| application_state_changed | 状态变化 | from_state、to_state、actor_type |
| evidence_event_created | 证据事件创建 | event_type、source_type、confidence |
| inbox_item_created | 待办创建 | type、priority |
| inbox_item_applied | 待办应用 | type、actor_id |
| assessment_sent | Assessment 发送 | assessment_id、job_id |
| assessment_submitted | Assessment 提交 | assessment_id、parsed_status |
| decision_made | 决策完成 | decision_type、founder_id |
| application_blocked | 标记阻塞 | root_cause、sla_status |
| ai_action_generated | AI 动作生成 | action_type、confidence |
| ai_action_approved | AI 动作批准 | action_type、approved_by |
| ai_action_rejected | AI 动作拒绝 | action_type、reason |

### 12.2 指标口径

| 指标 | 口径 |
|---|---|
| Total CVs | 已解析或已上传 CV 数 |
| Email Intake CVs | 来源为招聘邮箱的 CV 数 |
| Pending HR Review | 状态为 Open / In Review 且 owner 为 HR 的 Inbox Item |
| HR Shortlisted | Application 到达 HR Shortlisted 的数量 |
| Interview Rate | 到达 Interview Scheduled 或之后状态的 Application / 有效 Application |
| Assessment Rate | 创建 Assessment 的 Application / 有效 Application |
| Founder Decision Count | Decision type 非空且由 Founder 产生 |
| Offer Decision Rate | 到达 Offer Decision 的 Application / 有效 Application |
| Time to Candidate Creation | 邮件 received_at 到 Candidate created_at |
| Time to Status Update | 邮件 received_at 到 Application state changed |
| Feedback Timeliness | 在 feedback_due_at 前提交的反馈比例 |
| Blocked Count | 当前 Blocked Application 数 |
| AI Adoption Rate | Approved 或 Auto Applied 的 AI Action / Generated AI Action |

## 13. 非功能需求

### 13.1 可用性

- 核心列表支持搜索、筛选、排序、分页。
- 所有关键操作提供成功、失败、加载、空状态。
- 所有 AI 推荐必须可展开查看证据。
- 所有审批动作必须显示写回预览。

### 13.2 安全与隐私

- 邮箱 token 必须加密存储。
- 用户只能访问权限范围内的候选人、邮件和决策。
- 原始邮件和附件应有访问控制。
- 敏感字段访问进入 Audit Log。
- AI 输出不得泄露超出用户权限的数据。

### 13.3 审计

必须审计：

- 邮箱连接和断连。
- Job 发布、暂停、关闭。
- Candidate 合并。
- Application 状态变化。
- Decision。
- AI Action 应用、驳回、撤销。
- 权限和 Settings 修改。

### 13.4 可靠性

- 邮件同步失败可重试。
- 附件解析失败不影响原始邮件保留。
- AI 失败时回退到人工审核。
- 所有自动写入必须可追踪、可撤销。

### 13.5 国际化

- MVP 至少支持中文和英文界面文本。
- 用户语言偏好可保存。
- 数据内容不强制翻译，保留原始语言。

## 14. 异常与边界场景

| 场景 | 系统处理 |
|---|---|
| 邮箱未连接 | Dashboard / Inbox 显示连接入口 |
| 邮箱断连 | 创建 Settings 警告和 Inbox 待办 |
| 邮件无法分类 | 进入 Unknown / Needs Review |
| 邮件涉及多个候选人 | 进入人工审核 |
| 候选人重复 | 创建 Duplicate Review |
| Job 未 Active | 不允许自动匹配 |
| Application 无 owner | 标记 Blocked |
| Application 无 next action | 标记 Blocked |
| 面试反馈超时 | 创建 Waiting Interviewer / Blocked |
| Assessment 逾期 | 创建 Candidate Follow-up |
| AI 置信度低 | 进入人工审批 |
| Founder 决策证据不足 | Request More Evidence |
| 用户无权限 | 显示权限不足，不泄露数据 |

## 15. MVP 验收清单

### 15.1 功能验收

- Dashboard 能展示真实数据指标。
- Tasks 能展示跨模块任务，并支持 My Tasks、Critical、Today、Waiting、Batch Review 视图。
- Jobs 能创建、发布、暂停、关闭岗位。
- Job Detail 能查看岗位配置和候选人列表。
- Inbox 能展示邮件摄取、低置信度解析、重复候选人和 AI Action Review 等审核项。
- Inbox Detail 能完成审批、修改、驳回。
- Email Agent 能同步和解析至少一种邮箱。
- Applications 能展示真实流程状态。
- Application Detail 能展示完整 Timeline 和 Evidence。
- Candidates 能创建、查看、合并候选人。
- Assessments 能创建、发送、接收提交、Review。
- Founder Inbox 能完成 Founder 决策。
- Blocked 能自动识别并解除阻塞。
- Analytics 能按统一口径展示指标。
- Settings 能配置邮箱、权限、SLA 和 AI 规则。

### 15.2 数据验收

- 活跃 Application 必须有 owner、next action、due date。
- 需要人处理的招聘事项必须有 Task。
- Task 必须有关联来源、Owner 或 Owner Role、Priority、Status、Next Action、SLA。
- 每个状态变化必须有 Timeline。
- 每个 AI 写入必须有 AI Action。
- 每个关键判断必须能追溯 Evidence Event。
- Candidate 与 Application 边界清晰。
- 同一 Candidate 可关联多个 Application。

### 15.3 AI 验收

- AI 输出包含证据引用。
- AI 输出包含置信度。
- AI 不自动拒绝、录用或做 Offer Decision。
- 人工可修改、批准、拒绝、撤销 AI 输出。
- 低置信度结果进入 Inbox。
- 敏感 AI Action 进入 AI Action Approval Task。

## 16. 开发拆分建议

### Epic 1：前端产品化

- 建立前端工程。
- 复用当前视觉和页面结构。
- 组件化导航、表格、卡片、状态标签、Agent 面板、弹窗、步骤向导。
- 接入 Mock API。

### Epic 2：核心招聘数据模型

- Organization / User / Job / Candidate / Application。
- Task。
- Evidence Event / Timeline / Decision。
- Audit Log。

### Epic 3：Task Core / Task Center

- Task 状态机。
- Priority / Owner / Owner Role。
- Due Date / SLA Status。
- Task Detail。
- My Tasks / Critical / Today / Waiting / Batch Review。
- Task completion 与下一步 Task 生成。

### Epic 4：Application Workflow

- Application 状态机。
- Owner / Next Action / SLA。
- Blocked 自动识别。
- 状态变更审计。
- Application Task 生成规则。

### Epic 5：Mailbox Intake

- 邮箱连接。
- 邮件同步。
- 附件处理。
- Email Thread 分类。
- Candidate / Job / Application 匹配。

### Epic 6：Review Inbox

- Inbox Item。
- 审核详情。
- 写回预览。
- Approve / Modify / Reject / Escalate。
- Inbox Item 到 Task 的关联。

### Epic 7：AI Governance

- AI Action。
- 置信度和证据引用。
- 自动写入边界。
- 审批规则。
- L1 Suggest / L2 Draft / L3 Execute / L4 Execute + Escalate。
- 撤销和纠错。

### Epic 8：Founder Decision

- Decision Card。
- Founder Inbox。
- Decision Record。
- Offer Decision。
- Founder Decision Task。

### Epic 9：Assessment Workspace

- Assessment。
- Submission。
- Rubric。
- AI Review。
- Stop Rule。
- Assessment Task 生成规则。

### Epic 10：Analytics

- 事件埋点。
- 指标口径。
- Dashboard 与 Analytics 数据源。
- Task aging 与任务吞吐。
- 渠道质量和 AI 采纳。

## 17. 当前原型到实现的说明

当前 `frontend-prototype/` 已经覆盖主要页面、信息架构和部分交互，但仍是静态原型。实现 MVP 时应保留：

- 左侧主导航。
- 右侧 Agent 工作区。
- Dashboard 的漏斗、今日任务摘要和推荐动作。
- Tasks 的独立栏目和跨模块任务视角。
- Jobs 的筛选和新建岗位向导。
- Inbox 的邮件审核队列与邮箱连接向导。
- Applications 的 State / Owner / Next Action / SLA 表格结构。
- Application Detail 的候选人 + 岗位 + 流程分离。
- Founder Inbox 的 Decision Card。
- Blocked 的根因与解决动作。
- Settings 的治理入口。

实现时必须新增：

- 真实路由。
- 组件化。
- 后端 API。
- 数据库。
- 邮箱 OAuth 与同步任务。
- AI Action 记录。
- 状态机和业务规则。
- 审计日志。
- 权限控制。
- 加载、错误、空状态。
