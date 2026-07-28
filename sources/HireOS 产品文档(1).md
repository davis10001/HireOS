# HireOS 产品文档草稿

## 1. 产品定位

HireOS 是一套面向 Founder 和 HR 团队的 **Email-first AI 原生端到端招聘操作系统**。

它不是传统 ATS 加 AI 功能，不是简历筛选工具，也不是单独的 AI 招聘 Copilot。MVP 的核心切入点是 HR 招聘邮箱：AI 先读取和理解邮件、附件、候选人回复、面试安排和作业提交，再把这些真实招聘信息结构化为 Application Pipeline、Evidence Event 和 Founder Decision。

产品要把招聘流程管理、候选人数据、AI 辅助执行和 Founder 决策支持整合成一个完整招聘闭环。

核心承诺：

- 每个候选人针对某个岗位的招聘流程，都有清晰状态、负责人、下一步、SLA 和完整时间线。
- AI 贯穿整个招聘流程，负责记录、总结、评估、起草和推荐。
- HR 邮箱是 MVP 的主要数据入口，邮件中的 CV、回复、面试安排、作业提交和沟通记录会被 AI 结构化。
- HR 负责日常流程推进、协调和候选人沟通。
- Founder 聚焦高价值招聘判断。
- 所有关键判断都基于可追溯的 Evidence Event，而不是散落在聊天、文件和主观备注中。

## 2. 核心用户

### Founder

Founder 是高价值招聘判断者。Founder 不应该管理日常招聘运营，但必须能看到招聘进展、所有异常流程状态，以及关键决策背后的证据。

Founder 负责：

- 确认岗位标准和 Scorecard。
- 查看关键候选人。
- 在需要时审批或复核 Assessment。
- 做出终面和 Offer Decision 判断。
- 查看重大风险和高价值候选人流失风险。

### HR

HR 是流程推动者和日常操作者。

HR 负责：

- CV intake 和候选人去重。
- 筛选结果确认。
- 候选人沟通。
- 面试协调和结构化记录。
- Assessment 发送与跟进。
- SLA 监控和 blocked 流程升级。
- 即使 Current Owner 是别人，也要确保 Application 持续推进。

## 3. MVP 范围

MVP 覆盖从创建职位到 Founder 决策的完整招聘判断闭环，但只到 **Offer Decision** 为止。Offer 起草、谈判、合同和入职执行不进入 MVP。

MVP 主流程：

```text
AI 辅助创建岗位
  -> 配置招聘流程
  -> 绑定 HR 招聘邮箱
  -> AI Email Intake
  -> 自动匹配职位并创建/更新 Application
  -> Candidate Pipeline
  -> 面试流程与状态管理
  -> Assessment Workspace
  -> Founder Decision Inbox
  -> Offer Decision
```

MVP 不包含：

- Candidate Portal。
- Candidate Task Link。
- 完整 DM 集成。
- VietnamWorks 浏览器抓取。
- AI 自动淘汰或自动录用。
- 实时面试 Copilot、转录或在线视频面试流程。
- Offer 起草、谈判、合同签署或入职执行。
- 完整 Workflow Builder。
- 完整多轮对话式 Job Creator。

## 4. 核心领域模型

### Candidate

Candidate 是“人”。它存储可复用的候选人身份、联系方式、CV 历史、简历证据和跨岗位历史。

### Job

Job 是“岗位”。它存储招聘业务需求、JD、Scorecard、筛选标准、面试方向、Assessment Plan、默认流程和默认 SLA。

### Hiring Workflow

Hiring Workflow 是岗位级招聘流程配置。它定义该岗位需要哪些阶段、每轮面试由谁参与、每轮验证什么能力、默认负责人、默认 SLA 和通过标准。

### Application

Application 是流程核心。它代表某个 Candidate 针对某个 Job 的招聘过程。

Application 拥有：

- 当前状态。
- Current Owner。
- Process Owner。
- 下一步动作。
- SLA / 截止时间。
- 时间线。
- 面试记录。
- Assessment。
- Email 沟通。
- Evidence Event。
- 决策历史。
- Offer Decision 状态。

这样可以避免混淆“人”、“岗位”和“某个人应聘某个岗位的流程”。

### Email Thread

Email Thread 是 MVP 的主要外部数据来源。它可以包含 CV、候选人回复、面试时间确认、面试反馈、Assessment 提交、候选人问题和后续沟通。

AI Email Agent 会把 Email Thread 里的内容解析为 Candidate、Application、Evidence Event、Interview Schedule、Assessment Submission 或状态变化建议。

### Evidence Event

Evidence Event 是任何会影响招聘判断、流程推进、风险识别或未来统计的数据记录。

例子：

- HR 筛选原因。
- 面试记录。
- 候选人 Email 回复。
- Assessment 提交。
- AI Assessment Review。
- Founder 评论。
- 下一步决策。
- 淘汰原因。
- Offer Decision。

原始内容需要保留。AI 负责提取摘要、证据、风险、下一步建议和可统计字段。

## 5. 端到端招聘流程

MVP 的主数据流是：

```text
HR Email / Candidate Email
          ↓
     AI Email Agent
          ↓
   信息识别与结构化
          ↓
Application Timeline
          ↓
Workflow Status
          ↓
Interview / Assessment / Founder Decision
```

| 阶段 | 类型 | 邮件来源 | 人做什么 | AI 做什么 | 产生数据 | 统计指标 |
|---|---|---|---|---|---|---|
| 🟢 Create Job & Hiring Request（创建职位与招聘需求） | Human + AI | 非邮件，系统输入 | Founder / HR 输入岗位需求、职责、预算、硬性条件、成功标准 | 理解招聘需求，生成 JD、岗位画像、筛选标准、Scorecard 初稿 | Job Profile、JD、Hiring Criteria、Scorecard | 岗位数量、需求修改次数、AI 草稿采纳率 |
| 🟢 Configure Hiring Flow（配置招聘流程） | Human + AI | 非邮件，系统配置 | Founder / HR 设置招聘阶段、面试轮次、参与人、负责人、通过标准和 SLA | 根据岗位类型推荐流程模板，生成 Interview Plan 和 Assessment Plan | Hiring Workflow、Stages、Interviewers、Evaluation Criteria | 招聘流程类型、平均轮次、阶段耗时 |
| 🟢 Connect HR Email（绑定招聘邮箱） | Human Required | 邮件基础入口 | HR 授权招聘邮箱接入，确认读取范围和规则 | 建立邮箱读取规则，识别招聘相关邮件和附件 | Email Connection、Permission、Email Rules | 邮箱数量、邮件量、识别率 |
| 🟢 AI Email Intake（AI 读取候选人邮件） | AI Required | 必须 | HR 确认异常识别结果，处理无法自动判断的邮件 | 读取 CV 邮件、附件、发件人信息，提取候选人信息，推荐匹配岗位，创建或更新 Candidate / Application | Candidate Profile、CV、Source、Email Thread、Application | CV 数量、来源、自动匹配准确率、重复候选人数 |
| 🟢 Candidate Pipeline（候选人状态管理） | Human + AI | 来自邮件 + 人工 | HR 确认状态、调整负责人、处理异常情况 | 根据邮件内容和人工动作建议状态变化，识别停滞，提醒 Current Owner / Process Owner | Application Status、Current Owner、Process Owner、Next Action、Timeline | Pipeline 数量、停留时间、Blocked 数量 |
| 🟢 Interview Scheduling（面试安排） | Human + AI | 必须 | HR 通过邮件确认时间、面试官安排，必要时手动调整 | 识别邮件中的时间、人员、岗位和确认状态，自动更新 Interview 状态 | Interview Schedule、Participants、Email Thread | 面试安排耗时、改期次数、确认率 |
| Interview Preparation（面试准备） | Human + AI | 非邮件，数据来自系统 + 历史邮件 | 面试官确认重点能力和问题方向 | 读取 Job、CV、历史邮件、筛选记录和 Evidence Gap，生成 Interview Brief、问题和评分标准 | Interview Plan、Question Set、Evaluation Criteria | 问题采纳率、准备时间、问题覆盖率 |
| 🟢 Interview Feedback（面试反馈） | Human + AI | 推荐邮件入口，也支持系统填写 | 面试官发送反馈邮件或在系统填写结构化反馈 | 读取反馈内容，提取评分、证据、风险和下一步建议 | Interview Feedback、Evidence Event、Risk Record | 反馈及时率、通过率、面试官评分差异 |
| 🟢 Assessment（出题与测试） | Human + AI | 部分必须 | Founder / HR 确认测试目标、题目和 Rubric；HR 通过邮件发送测试；候选人通过邮件提交作业 | 根据 Scorecard、CV 和 Evidence Gap 生成题目与 Rubric，读取提交邮件和附件，分析答案、比较版本、提取证据 | Assessment、Rubric、Submission、Version History、Evidence Profile | 完成率、评估时间、AI 评分采纳率、修改轮数 |
| 🟢 Founder Decision（创始人决策） | Human Required + AI | 非邮件，系统决策 | Founder 查看完整候选人信息，决定下一步、拒绝、终面或 Offer Decision | 汇总邮件、面试、Assessment 和历史 Evidence Event，生成 Decision Card | Decision Record、Decision Timeline、Decision Card | 决策时间、Founder 投入时间、决策等待时间 |
| 🟢 Offer Decision（Offer 决策） | Human Required + AI | 非邮件，后续结果可由邮件记录 | Founder 或授权决策者记录是否进入 Offer；MVP 不管理谈判和合同 | 汇总支持 Offer Decision 的证据和剩余风险，记录决策原因 | Offer Decision Record | Offer Decision 数量、Offer 阶段转化 |

### 必须走邮件的环节

**Candidate Intake**：候选人 CV、推荐简历、VietnamWorks 邮件、HR 转发简历等应优先通过招聘邮箱进入系统。

**Interview Scheduling**：面试邀约、时间确认、改期和候选人回复通常通过邮件完成，AI 需要从邮件中识别时间、参与人和确认状态。

**Assessment 收发**：MVP 不做 Candidate Portal，因此发题、候选人提交、修改版本和候选人问题主要通过邮件及附件完成。

### 推荐走邮件的环节

**Interview Feedback**：面试官可以通过邮件发送反馈，AI 将其结构化为 Evidence Event；同时保留系统内填写入口。

**候选人沟通与跟进**：候选人补资料、状态询问、截止时间提醒、回复意愿等通过邮件沉淀到 Application Timeline。

### 不建议依赖邮件的环节

**Job Creation**：岗位需求、Scorecard、流程默认值和 SLA 需要结构化输入，不能只靠邮件创建。

**Founder Decision**：Founder 决策需要完整上下文，应在 Founder Decision Inbox 内完成，不建议通过邮件拍板。

**Offer Management**：MVP 只记录 Offer Decision，不做 Offer 起草、谈判、合同和入职流程。后续如果通过邮件产生 Offer 结果，可以作为状态结果记录，但不作为 MVP 的完整 Offer 管理能力。

## 6. AI 角色与治理

AI 是 **受控执行者**。

AI 可以：

- 生成 JD、问题、Rubric、消息、摘要和推荐。
- 读取招聘邮箱，解析 CV、候选人回复、面试安排和候选人提交内容。
- 推荐邮件与岗位、候选人、Application 的匹配关系。
- 提取 Evidence Event。
- 起草候选人沟通内容。
- 在配置规则允许下发送低风险 Email。
- 创建任务、提醒和下一步建议。
- 推荐淘汰、修改、终面或 Offer Decision。

AI 不可以：

- 自动淘汰候选人。
- 自动录用候选人。
- 决定薪酬或 Offer 条件。
- 未经人工审批发送敏感消息。
- 用黑箱分数替代来源证据。

敏感决策必须由人确认。

## 7. 产品架构

```text
                         HireOS
        Email-first AI 原生端到端招聘操作系统

┌──────────────────────────────────────────────────────────────┐
│ 用户层                                                        │
│ Founder / HR / Interviewer                                   │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│ 主要数据入口                                                  │
│ HR Recruiting Mailbox / Candidate Email / CV Attachments      │
│ Manual CV Upload / CSV Import                                │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│ AI 编排层                                                     │
│ AI Email Agent                                                │
│ Email Understanding / Job Matching / Candidate Extraction     │
│ AI 辅助创建岗位                                               │
│ AI Screening                                                  │
│ Assessment Intelligence                                       │
│ Next-Step Recommendation                                      │
│ Evidence Event Extraction                                     │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│ 流程层                                                        │
│ Application Pipeline                                          │
│ Current Owner / Process Owner                                 │
│ Next Action / SLA / Blocked / Timeline                        │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│ 工作台层                                                      │
│ Dashboard / Jobs / Applications / Candidates                  │
│ Assessments / Email Agent / Founder Inbox / Blocked / Analytics│
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│ 招聘数据底座                                                  │
│ Job / Candidate / Application / Assessment / Interview        │
│ Email Thread / Evidence Event / Decision / Offer Decision     │
└──────────────────────────────────────────────────────────────┘
```

## 8. MVP 一级模块

### Dashboard

展示招聘漏斗、岗位进展、blocked Application、待处理决策和关键运营指标。

### Jobs

管理岗位设置、JD、Scorecard、流程默认值、筛选标准、Assessment Plan 和岗位级 Pipeline。

### Email Agent

连接招聘邮箱，读取线程和附件，识别候选人、岗位、面试安排、候选人回复和 Assessment 提交；支持 AI 草稿、审批发送、跟进提醒，并把邮件信息同步到 Application Timeline。

### Applications

候选人针对某岗位的主流程工作台。展示状态、Owner、下一步、SLA、时间线、Evidence Event、面试、Assessment、沟通和决策。

### Candidates

存储可复用候选人档案、联系方式、CV 历史、去重结果和跨岗位历史。

### Assessments

管理题目、Rubric、提交、版本比较、AI Review、人工校准、Stop Rule 和下一步建议。

### Founder Inbox

集中处理高价值决策：Scorecard 确认、关键候选人查看、Assessment Review、终面决策、Offer Decision 和重大风险升级。

### Blocked

展示所有逾期、卡住、无人负责、等待中或高风险的 Application。Founder 可以看到所有异常；HR 负责日常流程处理。

### Analytics

展示招聘进展、HR 执行效率、渠道质量和基础 AI 采纳指标。

## 9. 状态与责任模型

每个 Application 都有：

- Current Owner：当前谁需要完成下一步动作。
- Process Owner：HR 侧流程负责人，负责确保 Application 持续推进。
- Current State：当前状态。
- Next Action：下一步动作。
- Due Date / SLA：截止时间或服务时限。
- Status Reason：状态原因。
- Evidence Event links：相关证据事件。

Job 创建时定义流程默认值。Application 继承这些默认值，后续可以根据候选人实际情况调整。

产品不应允许活跃 Application 没有 Owner、没有 Next Action 或没有 Due Date。

## 10. Analytics 与 MVP 验收指标

### 招聘进展

- Total CVs。
- Email Intake CVs。
- Pending HR Review。
- HR Shortlisted。
- HR Interviews。
- Assessments。
- Founder Decisions。
- Offer Decisions。
- 已记录的 Hired / Joined 结果状态。

### HR 执行效率

- CV 审核时间。
- 邮件到候选人建档时间。
- 邮件到状态更新时间。
- 面试反馈及时率。
- Assessment 跟进时间。
- 逾期任务。
- 按 Process Owner 统计的 Blocked Applications。

### 渠道质量

- 按来源统计的 CV 数量。
- Email / VietnamWorks / CSV / 手动上传来源占比。
- Shortlist rate。
- Interview rate。
- Assessment rate。
- Offer Decision rate。
- 可获得时统计 Hire outcome rate。

### AI 采纳

- JD 草稿采纳率。
- 邮件识别准确率。
- 邮件到岗位匹配准确率。
- 问题采纳率。
- Assessment 评分一致性。
- Next-Step Recommendation 采纳率。
- Email 草稿采纳率。
- 估算 HR / Founder 节省时间。

## 11. 关键风险

### 数据纪律

风险：如果 HR 跳过结构化记录，AI 和 Analytics 都会失效。

缓解方式：Job Workflow Defaults、必填 Owner / Next Action / SLA 字段、Evidence Event 提取和 blocked 流程监控。

### 邮箱依赖与误匹配

风险：MVP 主要数据来自招聘邮箱，如果邮件主题混乱、附件缺失、候选人同时匹配多个岗位，AI 可能创建错误 Candidate 或 Application。

缓解方式：AI 对候选人与岗位匹配输出置信度；高置信度自动建档，低置信度进入 HR 确认队列；保留原始 Email Thread，支持人工改绑 Job / Candidate / Application。

### AI 误判

风险：AI screening 或 scoring 可能有偏差或错误。

缓解方式：AI 不能自动淘汰或录用；所有评分必须展示证据、反证、Rubric 和置信度。

### 范围膨胀

风险：Candidate Portal、DM 集成、Offer Management 和实时面试 Copilot 会拖垮 MVP。

缓解方式：MVP 聚焦 HR 邮箱入口、Email Agent、Application Pipeline、Assessment Workspace 和 Offer Decision。

### 候选人疲劳

风险：反复 Assessment 会降低候选人回复率和接受率。

缓解方式：使用 Evidence Gap 驱动问题生成，并使用非强制型 Assessment Stop Rule。

### 平台合规

风险：VietnamWorks 抓取或非官方 DM 自动化会带来法律和运营风险。

缓解方式：使用手动上传、CSV 导入、招聘邮箱解析；DM 集成等官方合规渠道明确后再做。

## 12. 产品文档下一步

这份草稿可以作为基础 PRD。下一步建议把每个 MVP 模块继续展开成：

- 用户目标。
- 主流程。
- 必填字段。
- AI 动作。
- 人工审批点。
- 状态变化。
- 异常场景。
- MVP 验收标准。
