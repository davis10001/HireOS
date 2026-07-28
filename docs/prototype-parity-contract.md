# HireOS Prototype Parity Contract

本文档是所有实现 Session 的硬性约束。`frontend-prototype/` 不是视觉参考，而是 HireOS MVP 的交互功能框架、信息架构、页面层级、模块入口、状态展示和流程承载基准。

## 1. 总原则

1. 原型已设计的页面、模块、导航、二级入口、表格、卡片、时间线、弹窗步骤、右侧 Agent 面板、底部 Agent Dock 必须保留。
2. 实现可以把静态内容接成真实状态、数据、校验和业务动作，但不能把原型替换成另一套简化框架。
3. 原型未覆盖的功能可以新增，但必须挂在已有页面层级或合理的新入口下，并说明为什么原型没有覆盖。
4. 如果业务逻辑需要改变原型结构，必须先在主线程向用户说明影响，不能由子 Session 自行改写。
5. 每个模块交付时必须同时验收功能和原型一致性。

## 2. 固定应用框架

所有页面必须保留以下结构：

- `AppShell`：左侧 Sidebar + 中间 Main + 右侧 Agent。
- Sidebar：品牌区、折叠按钮、`Operate` 分组、`Intelligence` 分组、用户状态、账户菜单、语言切换。
- Main：`topbar`、页面标题、副标题、页面动作按钮、`page-content`。
- Agent：模块对应的 Agent 标题、AI 建议卡、证据列表、操作按钮、输入框。
- Agent Dock：页面底部快捷输入和提示按钮。
- 全局交互：sidebar collapse、agent collapse、account menu、language switch、dock expand。

禁止把所有模块平铺成一个新的简单主导航；必须保持原型中的主导航分组和二级入口关系。

## 3. 原型页面清单

实现必须覆盖并保持以下页面层级：

- Dashboard：`hireos-dashboard-design.html`
- Jobs：`hireos-jobs.html`
- Job Detail：`hireos-job-detail.html`
- Inbox：`hireos-inbox.html`
- Inbox Detail：`hireos-inbox-detail.html`
- Email Agent：`hireos-email-agent.html`
- Applications：`hireos-applications.html`
- Application Detail：`hireos-application-detail.html`
- Candidates：`hireos-candidates.html`
- Assessments：`hireos-assessments.html`
- Founder Inbox：`hireos-founder-inbox.html`
- Blocked：`hireos-blocked.html`
- Analytics：`hireos-analytics.html`
- Settings：`hireos-settings.html`
- Settings Mailbox：`hireos-settings-mailbox.html`

## 4. 模块一致性要求

### Dashboard

必须保留核心指标区、工作台内容区、活动时间线、风险/建议展示、Dashboard Agent 和 Dock。真实数据只能替换指标值和列表内容，不能改变 Dashboard 的信息层级。

### Jobs

必须保留 Jobs 页面中的筛选条、岗位指标、岗位列表/表格、岗位详情入口、右侧 Job Agent。岗位创建必须使用原型的多步弹窗流程，而不是页面内联表单。

岗位创建流程至少保持：

- 创建岗位
- 输入需求
- AI 生成
- 编辑确认

Job Detail 必须保留岗位级 tabs、候选/申请/证据相关内容区和 Agent 上下文。

### Inbox / Email Agent

Inbox 必须保留工作队列、同步状态、关联邮箱三个二级 tab。邮箱连接必须保留多步 modal：

- 邮箱类型
- 授权说明
- 读取规则
- 扫描预览
- 开始同步

Inbox Detail 必须承载低置信度审核、证据、AI 动作确认/拒绝。Email Agent 页面必须保留 intake queue、邮件解析状态、AI action、confidence/review 状态。

### Applications

Applications 必须保留二级入口：

- Applications
- Candidate Profile
- Timeline
- Email Threads
- Interviews
- Assessments
- Decisions

Pipeline Workbench 必须保留状态、负责人、下一步、SLA 表格。Application Timeline、Owner Load、Resolve Now Agent 必须保留。Application Detail 必须保留面试流程与状态时间线。

### Candidates

Candidates 必须保留 Candidate Registry、Duplicate Review、Candidate History 和 Candidate Agent。候选人创建、导入、去重、合并只能接入这些结构，不能改成简单表单列表。

### Assessments

Assessments 必须保留 Assessment Workspace、Review/Sent/Draft tabs、Evidence Profile、Follow-up Queue、Assessment Agent。测评创建、提交、AI Review、人工校准、版本比较必须落在这个框架中。

### Founder Inbox

Founder Inbox 必须保留创始人决策卡、AI 总结、证据、风险、置信度、审批/退回动作和 Founder Agent。不得改成普通任务列表。

### Blocked

Blocked 必须保留 Blocked Applications 表、原因、负责人、下一步、Age/SLA、Resolve Batch、Blocked Agent。阻塞检测规则只能驱动这些状态和动作。

### Analytics

Analytics 必须保留原型中的指标、趋势、漏斗/风险视图和 Analytics Agent。新增图表必须补充而不是替换原信息架构。

### Settings / Settings Mailbox

Settings 必须保留原型的设置层级、AI governance、邮箱配置入口、账户/语言相关状态。Settings Mailbox 必须保留邮箱连接、同步范围、写入规则和权限状态。

## 5. 状态与业务逻辑接入方式

状态字段必须进入原型已有的可视容器：

- Job 状态进入 Jobs 列表、Job Detail tabs、岗位指标。
- Candidate 状态进入 Candidate Registry、Duplicate Review、Candidate History。
- Application 状态进入 Pipeline Workbench、Application Detail、Application Timeline、Blocked。
- Email/AI Action 状态进入 Inbox、Inbox Detail、Email Agent。
- Assessment 状态进入 Assessment Workspace、Evidence Profile、Follow-up Queue。
- Founder decision 状态进入 Founder Inbox 和 Application Timeline。
- Audit/Governance 状态进入 Settings、Settings Mailbox、Agent evidence。

禁止为了方便实现，把这些状态集中到新的“调试面板”或“通用 record card”中。

## 6. 子 Session 交付前检查

每个 Session 在继续实现前必须先提交一段 Prototype Parity Correction Plan，说明：

1. 负责哪些原型页面。
2. 保留哪些原型模块和层级。
3. 哪些业务状态接入哪些原型容器。
4. 是否需要新增原型未覆盖的入口。
5. 哪些依赖需要主线程或用户处理。

每个 Session 交付时必须说明：

- 已覆盖的原型页面。
- 已保留的关键交互。
- 新增功能是否只发生在原型未覆盖区域。
- 与原型不一致的地方及原因。

## 7. 当前纠偏结论

Agent A 之前产出的简化 React UI 不符合本契约。它最多可以复用领域模型、mock API、测试思路，UI 框架需要按 `frontend-prototype/` 重新迁移。
