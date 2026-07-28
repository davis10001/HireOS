# HireOS 前端原型到 MVP 差距评估

## 1. 结论

当前 `frontend-prototype/` 是一个高完成度的信息架构与交互演示原型，已经表达出 HireOS 的核心产品方向：Email-first、Application Pipeline、Evidence Event、Founder Decision、Blocked 监控和 AI 辅助工作台。

但它离可用 MVP 还有明显距离：目前主要是静态页面与局部前端交互，没有真实数据、账号权限、邮箱接入、AI 结构化、业务写入、状态机、审计、通知、后台任务和可验证指标。因此它适合作为 MVP 的产品蓝图和前端视觉基准，不适合作为 MVP 代码基础直接上线。

推荐判断：

- 设计方向：接近 MVP，约 75%。
- 信息架构：接近 MVP，约 80%。
- 前端可复用度：中等，约 45%。可复用视觉语言、页面结构和部分组件，但需要组件化、路由化、状态化。
- 业务功能完成度：低，约 15%。尚未接真实数据和真实流程。
- 可上线 MVP 完成度：约 20%-25%。

## 2. 已经覆盖的 MVP 设计能力

### 2.1 一级模块覆盖完整

原型已覆盖 MVP 所需的主要工作区：

- Dashboard：招聘漏斗、岗位进展、待处理、证据时间线、推荐下一步。
- Jobs：岗位列表、岗位筛选、新建岗位向导、岗位详情。
- Inbox：统一工作队列、邮箱连接向导、二级队列入口、审核详情。
- Email Agent：邮件线程 intake、候选人/岗位匹配、低置信度审核。
- Applications：Pipeline Workbench、Application Timeline、Owner Load、状态与下一步。
- Application Detail：候选人基本信息、当前申请、岗位匹配、面试流程、AI 建议。
- Candidates：候选人档案、去重、跨岗位历史。
- Assessments：题目、Rubric、提交、AI Review、Stop Rule。
- Founder Inbox：Founder 决策卡、风险和证据。
- Blocked：阻塞申请、根因、解决 playbook。
- Analytics：招聘漏斗、渠道质量、运营洞察。
- Settings：邮箱、权限、状态/SLA、AI 自动化规则、模板、证据策略。

### 2.2 核心产品语言已经清晰

原型与项目参考文档一致地表达了以下关键模型：

- Candidate 是人。
- Job 是岗位。
- Application 是候选人针对岗位的流程实例。
- Email Thread 是 MVP 主数据入口。
- Evidence Event 是判断依据。
- Current Owner / Process Owner / Next Action / SLA 是流程推进核心。
- AI 可以推荐、提取、起草和写入低风险内容，但不能自动拒绝、自动录用或做 Offer 决策。

### 2.3 关键交互雏形已经存在

原型已有下列前端交互：

- 多页面导航。
- 侧边栏折叠与 Agent 面板折叠。
- 中英文语言切换，使用本地存储记住语言。
- 账户菜单展开。
- Jobs 筛选，包含状态和岗位类型筛选。
- Job Detail 标签切换。
- Inbox 工作区标签切换。
- 邮箱连接向导弹窗。
- 新建岗位向导弹窗。
- Agent dock prompt 唤起。

这些交互适合保留为体验标准，但需要改造成真实应用状态和后端动作。

## 3. 与 MVP 的关键差距

### 3.1 技术形态差距

当前状态：

- HTML/CSS/JS 静态文件。
- 静态模拟数据写死在页面里。
- 页面之间靠普通链接跳转。
- 无构建系统、无组件系统、无真实路由、无数据层。
- 部分图标依赖外部 CDN。

MVP 需要：

- 前端应用框架或可维护的页面架构。
- 组件化 UI，例如导航、表格、队列、状态标签、证据卡、Agent 面板、审批弹窗。
- 统一路由。
- API client、加载态、错误态、空状态、权限态。
- 真实数据模型映射。
- 可测试的交互逻辑。
- 生产构建和部署方式。

### 3.2 数据与后端差距

当前状态：

- 无数据库。
- 无 Candidate、Job、Application、Email Thread、Evidence Event 等实体持久化。
- 无状态变更记录。
- 无附件存储。
- 无后台同步任务。

MVP 需要：

- 领域数据模型和数据库 schema。
- CRUD 与列表查询 API。
- Timeline / Evidence Event 写入机制。
- Application 状态机。
- Owner、Next Action、Due Date、SLA 计算。
- 文件与邮件附件存储。
- 审计日志。
- 数据导入与去重逻辑。

### 3.3 邮箱接入差距

当前状态：

- 有邮箱连接向导 UI。
- 没有真实 OAuth、权限范围、邮箱同步、线程读取和附件解析。

MVP 需要：

- Gmail 或 Outlook 至少一种真实邮箱连接。
- 邮箱授权、token 管理、断连重连。
- 邮件同步任务。
- 招聘相关邮件识别。
- 附件下载、CV 解析、重复附件识别。
- 邮件线程与 Candidate / Job / Application 绑定。
- 低置信度审核队列。
- 邮件写回边界和审批发送。

### 3.4 AI 能力差距

当前状态：

- Agent 面板展示推荐和证据，但没有真实推理、调用或写入。
- AI 动作按钮只是视觉元素。

MVP 需要：

- 邮件分类、候选人提取、岗位匹配、状态变更建议。
- CV 解析和摘要。
- Evidence Event 抽取。
- 面试安排识别。
- Assessment 提交解析和 Rubric 对齐。
- Decision Card 生成。
- 回复草稿生成。
- AI 输出置信度、证据引用、人工审批门槛。
- Prompt、工具调用和结果版本管理。

### 3.5 Workflow 与状态机差距

当前状态：

- 页面展示状态、owner、next action、SLA，但没有真实状态规则。
- Jobs 中有 Active / Paused / Draft / Closed 视觉状态。
- Application 中有 Founder Review、Blocked、Ready 等状态表达。

MVP 需要：

- Job 状态机。
- Application 状态机。
- Interview 状态机。
- Assessment 状态机。
- Inbox Item 状态机。
- Email Connection 状态机。
- AI Action 状态机。
- 状态转换权限和审批规则。
- SLA 与 Blocked 自动识别。

### 3.6 权限与治理差距

当前状态：

- UI 展示 HR Lead、Founder、审批边界、Settings 权限模块。
- 没有真实登录、角色、权限、审计。

MVP 需要：

- 账号登录。
- 角色：Founder、HR Admin、HR Member、Interviewer、Hiring Manager。
- 权限：查看、创建、编辑、审批、决策、发送邮件、配置规则。
- 敏感动作审批：拒绝、Offer Decision、候选人合并、邮件发送、自动写回。
- AI 行为边界和组织级策略。

### 3.7 运营可用性差距

当前状态：

- 有漂亮的信息视图，但真实招聘运营所需的边界状态不完整。

MVP 需要补齐：

- 加载失败。
- 邮箱同步延迟。
- 邮件无法解析。
- 附件打不开或格式不支持。
- 候选人重复冲突。
- 一个候选人匹配多个岗位。
- 一个邮件线程涉及多个候选人。
- 手动纠错、撤销和重新绑定。
- 通知与提醒。
- 批量操作。
- 搜索、排序、分页。
- 导出或基础报表口径校验。

## 4. MVP 必须补齐清单

### P0：没有这些不能算 MVP

- 用户登录与角色权限。
- Job 创建、编辑、状态管理。
- Application 创建、更新、状态机、Owner、Next Action、SLA。
- Candidate 档案与去重审核。
- 至少一种真实邮箱连接和邮件同步。
- Email Thread 解析为候选人、岗位、Application、Evidence Event。
- 低置信度审核队列。
- Application Timeline。
- Founder Inbox 决策卡。
- Assessment 基础创建、发送记录、提交记录、AI Review 或人工 Review。
- AI 输出必须带证据引用和置信度。
- 敏感决策必须人工确认。
- Blocked 自动识别。
- 基础 Analytics 指标。

### P1：MVP 体验完整性

- 全局搜索。
- 批量审核邮件线程。
- 批量更新 owner / due date。
- 通知与提醒。
- 邮件草稿审批发送。
- 手动上传 CV / CSV 导入。
- Job workflow 模板。
- Interview feedback 表单。
- Assessment version comparison。
- 数据导出。
- 审计日志页面。

### P2：MVP 后增强

- Candidate Portal。
- DM 集成。
- VietnamWorks 官方集成或合规导入增强。
- 实时面试 Copilot。
- Offer 起草、谈判、合同和入职管理。
- 高级 Workflow Builder。
- 跨组织模板市场。

## 5. 推荐落地路线

### 阶段 1：把原型产品化

目标：保留当前体验，把静态页面变成可维护前端。

交付：

- 前端项目结构。
- 路由和页面组件。
- 组件库：导航、表格、状态标签、队列卡、Agent 面板、弹窗、步骤向导。
- Mock API。
- 统一空状态、加载态、错误态。

### 阶段 2：打通核心招聘闭环

目标：从 Job 到 Application 到 Founder Decision 可真实操作。

交付：

- Job / Candidate / Application / Evidence Event / Decision 数据模型。
- Application 状态机。
- Timeline。
- Owner / Next Action / SLA。
- Founder Inbox。
- Blocked 识别。

### 阶段 3：打通 Email-first 入口

目标：招聘邮件能进入系统，并可靠转化为审核项和流程记录。

交付：

- 邮箱连接。
- 邮件同步。
- 附件和 CV 解析。
- Candidate / Job / Application 匹配。
- 低置信度审核。
- Evidence Event 写入。

### 阶段 4：AI 可控执行

目标：AI 从展示推荐变成可审计、可批准、可写入的执行层。

交付：

- AI Action 记录。
- 证据引用。
- 置信度。
- 人工审批。
- 回复草稿。
- Decision Card。
- Assessment Review。

## 6. 验收标准

MVP 可以被认为成立，当它能完成以下闭环：

1. HR 创建一个 Job，确认 JD、Scorecard、流程、Owner 默认值和 SLA。
2. HR 连接招聘邮箱。
3. 系统读取一封含 CV 的邮件，识别候选人并匹配岗位。
4. 高置信度邮件自动生成 Candidate / Application，低置信度邮件进入 Inbox 审核。
5. HR 能确认、修改或驳回 AI 提取结果。
6. Application 自动拥有状态、Owner、Next Action、Due Date 和 Timeline。
7. 面试安排、反馈或 Assessment 提交可以从邮件或人工录入进入 Timeline。
8. AI 能生成带证据引用的 Decision Card。
9. Founder 能在 Founder Inbox 做出下一步、终面、拒绝或 Offer Decision。
10. Blocked 页面能显示逾期、等待、无人负责或证据缺口导致的异常流程。
11. Analytics 能展示招聘漏斗、渠道质量、HR 执行效率和基础 AI 采纳。

