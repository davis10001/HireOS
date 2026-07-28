function refreshIcons() {
  lucide.createIcons();
}

function setToggleIcon(button, icon, label) {
  button.innerHTML = `<i data-lucide="${icon}"></i>`;
  button.setAttribute("aria-label", label);
  button.setAttribute("title", label);
  refreshIcons();
}

const zhTextMap = new Map([
  ["Dashboard", "仪表盘"],
  ["Jobs", "岗位"],
  ["Email Agent", "邮件 Agent"],
  ["Applications", "申请流程"],
  ["Candidates", "候选人"],
  ["Assessments", "测评"],
  ["Founder Inbox", "创始人收件箱"],
  ["Blocked", "阻塞项"],
  ["Analytics", "分析"],
  ["Operate", "运营"],
  ["Decision", "决策"],
  ["Profile", "个人资料"],
  ["Notifications", "通知"],
  ["Language", "语言"],
  ["Sign out", "退出登录"],
  ["Online · HR Lead", "在线 · HR 负责人"],
  ["Ask HireOS Agent about this page...", "向 HireOS Agent 询问当前页面..."],
  ["Summarize risks", "总结风险"],
  ["Suggest next action", "建议下一步"],
  ["Show evidence gaps", "查看证据缺口"],
  ["Ask Agent", "询问 Agent"],
  ["New Job", "新建岗位"],
  ["Filters", "筛选"],
  ["Sync", "同步"],
  ["Connect Mailbox", "连接邮箱"],
  ["Draft rubric", "起草 Rubric"],
  ["Send assessment", "发送测评"],
  ["Export", "导出"],
  ["Batch Review", "批量审核"],
  ["Resolve Batch", "批量处理"],
  ["Add Application", "新增申请"],
  ["New Candidate", "新增候选人"],
  ["Import CV", "导入 CV"],
  ["Review decisions", "查看决策"],
  ["Resolve blocked", "处理阻塞"],
  ["Approve", "批准"],
  ["Open card", "打开卡片"],
  ["Create tasks", "创建任务"],
  ["Edit draft", "编辑草稿"],
  ["Merge", "合并"],
  ["Inspect", "检查"],
  ["Apply", "应用"],
  ["Open", "打开"],
  ["Compare", "对比"],
  ["Create report", "生成报告"],
  ["Drill down", "下钻"],
  ["Ready", "就绪"],
  ["Review", "审核"],
  ["Risk", "风险"],
  ["Healthy", "健康"],
  ["Overdue", "逾期"],
  ["Complete", "完整"],
  ["Partial", "部分"],
  ["Monday, Jul 27", "7月27日，星期一"],
  ["AI Daily Brief", "AI 每日简报"],
  ["Founder attention is needed on 5 decisions and 3 stalled high-value applications.", "5 个决策和 3 个停滞的高价值申请需要创始人关注。"],
  ["AI found delayed feedback in Product Designer and Backend Engineer pipelines. Two candidates have strong evidence for final interview, but both have open compensation and timeline risks.", "AI 发现产品设计师和后端工程师流程中存在反馈延迟。两位候选人具备进入终面的强证据，但都存在薪酬和时间风险。"],
  ["Next critical action", "下一项关键动作"],
  ["Approve Assessment rubric for Senior Backend", "批准高级后端测评 Rubric"],
  ["Risk window", "风险窗口"],
  ["2 high-fit candidates inactive over 72h", "2 位高匹配候选人超过 72 小时无进展"],
  ["Recommendation confidence", "推荐置信度"],
  ["Evidence coverage is high across email intake, interview notes, and assessment submissions.", "邮件录入、面试记录和测评提交中的证据覆盖度较高。"],
  ["86% evidence coverage", "86% 证据覆盖"],
  ["Total CVs", "CV 总数"],
  ["Pending HR Review", "待 HR 审核"],
  ["Founder Decisions", "创始人决策"],
  ["Blocked Applications", "阻塞申请"],
  ["Recruiting Funnel", "招聘漏斗"],
  ["All active jobs, email-first applications", "所有活跃岗位，邮件优先申请"],
  ["Week", "周"],
  ["Month", "月"],
  ["Quarter", "季度"],
  ["CV Intake", "CV 录入"],
  ["HR Review", "HR 审核"],
  ["Shortlist", "入围"],
  ["Offer Decision", "Offer 决策"],
  ["Evidence-first decisions waiting for human approval", "等待人工审批的证据优先决策"],
  ["Job Progress", "岗位进展"],
  ["Role-level pipeline health and SLA exposure", "岗位级流程健康度与 SLA 暴露"],
  ["View jobs", "查看岗位"],
  ["Senior Backend Engineer", "高级后端工程师"],
  ["Product Designer", "产品设计师"],
  ["GTM Lead", "GTM 负责人"],
  ["Evidence Timeline", "证据时间线"],
  ["Latest structured events from email and interviews", "来自邮件和面试的最新结构化事件"],
  ["Assessment submission parsed", "测评提交已解析"],
  ["Interview feedback extracted", "面试反馈已提取"],
  ["Low-confidence job match", "低置信度岗位匹配"],
  ["Recommended next move", "推荐下一步"],
  ["Approve final interview for Trang Nguyen and ask HR to clarify availability before Friday.", "批准 Trang Nguyen 进入终面，并请 HR 在周五前确认可面试时间。"],
  ["Draft action", "草拟动作"],
  ["Send HR a concise follow-up list for overdue feedback and low-confidence job matches.", "向 HR 发送一份简洁的跟进清单，涵盖逾期反馈和低置信度岗位匹配。"],
  ["Candidate is the person record. Applications keep the job-specific process separate.", "Candidate 是人的记录；Application 保留具体岗位下的流程。"],
  ["This prevents one candidate's multiple role histories from collapsing into a single vague status.", "这可以避免同一候选人的多个岗位历史被压成一个模糊状态。"],
  ["Deduplication insight", "去重洞察"],
  ["11 profiles may be duplicates based on phone, email aliases, CV filename, and agency-forwarded attachments.", "基于手机号、邮箱别名、CV 文件名和猎头转发附件，11 份档案可能重复。"],
  ["Duplicates", "重复项"],
  ["Need HR merge review", "需要 HR 合并审核"],
  ["Multi-role", "多岗位"],
  ["Applied to 2+ jobs", "申请 2 个以上岗位"],
  ["CV Versions", "CV 版本"],
  ["Updated attachments retained", "已保留更新附件"],
  ["Candidate Registry", "候选人库"],
  ["Identity, source, CV history, and cross-job context", "身份、来源、CV 历史和跨岗位上下文"],
  ["All", "全部"],
  ["High value", "高价值"],
  ["Dedup watch", "去重监控"],
  ["Candidate", "候选人"],
  ["Source", "来源"],
  ["Latest Evidence", "最新证据"],
  ["Status", "状态"],
  ["High fit", "高匹配"],
  ["Duplicate signal", "重复信号"],
  ["Duplicate Review", "重复审核"],
  ["Merge candidates only with evidence", "仅在有证据时合并候选人"],
  ["Same phone number, different agency email. CV skill section has 89% overlap.", "手机号相同，但猎头邮箱不同。CV 技能部分重合度 89%。"],
  ["Email alias match and same attachment hash.", "邮箱别名匹配，附件哈希相同。"],
  ["Candidate History", "候选人历史"],
  ["Cross-job evidence continuity", "跨岗位证据连续性"],
  ["Backend application", "后端申请"],
  ["Assessment and interview evidence retained", "已保留测评和面试证据"],
  ["Active", "活跃"],
  ["Platform referral", "平台岗位推荐"],
  ["Rejected due to seniority mismatch", "因资历不匹配被拒"],
  ["Past", "历史"],
  ["Candidate Agent", "候选人 Agent"],
  ["Identity and history", "身份与历史"],
  ["Merge recommendation", "合并建议"],
  ["Hold Quang Do merge for HR review. Evidence is suggestive, not definitive.", "暂缓合并 Quang Do，交由 HR 审核。证据有提示性，但还不够确定。"],
  ["Phone number matches, but source email differs.", "手机号匹配，但来源邮箱不同。"],
  ["Wrong merge could pollute two application timelines.", "错误合并可能污染两条申请时间线。"],
  ["Queue review", "加入审核队列"],
  ["48 email threads need structured decisions before they touch the pipeline.", "48 个邮件线程需要先结构化判断，再进入流程。"],
  ["The page separates high-confidence automation from low-confidence HR review, preserving raw email evidence for every extracted event.", "本页区分高置信度自动化和低置信度 HR 审核，并为每个提取事件保留原始邮件证据。"],
  ["AI intake rule", "AI 录入规则"],
  ["Auto-create Applications only when candidate, job, source, and attachment evidence all pass confidence threshold.", "仅当候选人、岗位、来源和附件证据都达到置信度阈值时，才自动创建 Application。"],
  ["Threads Parsed", "已解析线程"],
  ["CV Attachments", "CV 附件"],
  ["Auto Matched", "自动匹配"],
  ["Needs Review", "需要审核"],
  ["Intake Queue", "录入队列"],
  ["Email threads before candidate/application updates", "候选人/申请更新前的邮件线程"],
  ["Auto Applied", "自动应用"],
  ["Drafts", "草稿"],
  ["Evidence extraction on", "证据提取已开启"],
  ["Email Thread", "邮件线程"],
  ["Detected Type", "识别类型"],
  ["Job Match", "岗位匹配"],
  ["AI Action", "AI 动作"],
  ["Create Application", "创建申请"],
  ["Update Interview", "更新面试"],
  ["Attach Evidence", "附加证据"],
  ["Ask HR", "询问 HR"],
  ["Low conf.", "低置信度"],
  ["Drafted Replies", "已起草回复"],
  ["Human approval before sensitive messages", "敏感消息发送前需人工批准"],
  ["Mailbox Rules", "邮箱规则"],
  ["Current automation boundaries", "当前自动化边界"],
  ["Never reject automatically", "永不自动拒绝"],
  ["Low-confidence matches enter queue", "低置信度匹配进入队列"],
  ["Extraction and approval", "提取与审批"],
  ["Recommended review", "推荐审核"],
  ["Confirm the agency-forwarded profile before creating a Platform application.", "创建平台岗位申请前，先确认猎头转发的档案。"],
  ["Show low-confidence matches, draft a reply, or explain why a thread was classified.", "查看低置信度匹配、起草回复，或解释线程分类原因。"],
  ["Application is the operating unit: candidate plus job plus workflow state.", "Application 是运营单元：候选人 + 岗位 + 流程状态。"],
  ["This page keeps people, roles, and process history separate, so HR can move work forward without losing evidence.", "本页将人、岗位和流程历史分开，让 HR 在推进流程时不丢失证据。"],
  ["AI next-step rule", "AI 下一步规则"],
  ["No active Application should be missing Current Owner, Next Action, Due Date, or Evidence links.", "任何活跃 Application 都不应缺少当前负责人、下一步动作、截止时间或证据链接。"],
  ["Active Applications", "活跃申请"],
  ["Due Today", "今日到期"],
  ["Waiting Candidate", "等待候选人"],
  ["Missing Owner", "缺少负责人"],
  ["Pipeline Workbench", "流程工作台"],
  ["Status, owner, next action and SLA in one table", "状态、负责人、下一步和 SLA 汇总在一张表中"],
  ["State", "状态"],
  ["Owner", "负责人"],
  ["Next Action", "下一步"],
  ["Today", "今天"],
  ["Unassigned", "未分配"],
  ["Missing", "缺失"],
  ["Application Timeline", "申请时间线"],
  ["Structured evidence events", "结构化证据事件"],
  ["Owner Load", "负责人负载"],
  ["Current owner responsibility", "当前负责人职责"],
  ["Application Agent", "申请 Agent"],
  ["Status and next action", "状态与下一步"],
  ["Resolve now", "立即处理"],
  ["Assign Quang Do to Linh Tran or pause the application until job match is confirmed.", "将 Quang Do 分配给 Linh Tran，或在岗位匹配确认前暂停该申请。"],
  ["Assessments should close evidence gaps, not become extra process drag.", "测评应补齐证据缺口，而不是制造额外流程负担。"],
  ["Each assignment is tied to Scorecard criteria, candidate context, submitted artifacts, and a human-calibrated decision.", "每项作业都关联 Scorecard 标准、候选人上下文、提交材料和人工校准后的决策。"],
  ["Stop Rule suggestion", "停止规则建议"],
  ["For Trang Nguyen, evidence coverage is high enough to move to final interview without another assignment round.", "对 Trang Nguyen 来说，证据覆盖已足够进入终面，无需再增加一轮作业。"],
  ["Open Assessments", "开放测评"],
  ["Submitted", "已提交"],
  ["Avg Review Time", "平均审核时间"],
  ["Assessment Workspace", "测评工作台"],
  ["Submission status, rubric confidence, and next decision", "提交状态、Rubric 置信度和下一步决策"],
  ["Sent", "已发送"],
  ["Draft", "草稿"],
  ["Rubric linked", "Rubric 已关联"],
  ["Rubric", "Rubric"],
  ["Submission", "提交"],
  ["AI Review", "AI 审核"],
  ["Parsed", "已解析"],
  ["Strong evidence", "强证据"],
  ["Mixed signal", "混合信号"],
  ["Calibrate", "校准"],
  ["Offer-ready", "Offer 就绪"],
  ["Evidence Profile", "证据画像"],
  ["Rubric-linked signals", "Rubric 关联信号"],
  ["Debugging depth", "调试深度"],
  ["Communication clarity", "沟通清晰度"],
  ["Follow-up Queue", "跟进队列"],
  ["Assessment operations", "测评运营"],
  ["Now", "现在"],
  ["Assessment Agent", "测评 Agent"],
  ["Rubric and evidence", "Rubric 与证据"],
  ["Review recommendation", "审核建议"],
  ["Move Trang Nguyen forward and skip additional assessment.", "推进 Trang Nguyen，并跳过额外测评。"],
  ["9 Applications are blocked; 4 are overdue enough to risk candidate drop-off.", "9 个申请处于阻塞状态，其中 4 个已逾期到可能导致候选人流失。"],
  ["Blocked is the operational truth surface: who owns the next action, what is missing, and how long it has been stuck.", "Blocked 是运营事实界面：谁负责下一步、缺了什么、卡了多久。"],
  ["AI escalation", "AI 升级提醒"],
  ["The largest cause this week is missing interview feedback after time confirmation emails.", "本周最大原因是面试时间确认后缺少面试反馈。"],
  ["Overdue SLA", "SLA 逾期"],
  ["Blocked Applications", "阻塞申请"],
  ["Reason, owner, next action and escalation path", "原因、负责人、下一步和升级路径"],
  ["Reason", "原因"],
  ["Age", "时长"],
  ["Root Causes", "根因"],
  ["What is creating blocks", "阻塞来源"],
  ["Job match", "岗位匹配"],
  ["Resolution Playbook", "处理手册"],
  ["AI-drafted, human-approved actions", "AI 起草、人工批准的动作"],
  ["Feedback reminder", "反馈提醒"],
  ["Owner assignment", "负责人分配"],
  ["Blocked Agent", "阻塞 Agent"],
  ["Escalation and cleanup", "升级与清理"],
  ["Resolve first", "优先处理"],
  ["Pipeline visibility is improving, but execution delay is concentrated in interview feedback.", "流程可见性正在改善，但执行延迟集中在面试反馈。"],
  ["Analytics here measures operational discipline, channel quality, and AI adoption without hiding the evidence behind black-box scores.", "这里的分析衡量运营纪律、渠道质量和 AI 采纳，而不是用黑箱分数隐藏证据。"],
  ["AI metric caveat", "AI 指标说明"],
  ["AI adoption is only counted when a human accepts a draft, recommendation, extracted event, or status update.", "只有人工接受草稿、建议、提取事件或状态更新时，才计入 AI 采纳。"],
  ["Shortlist Rate", "入围率"],
  ["AI Adoption", "AI 采纳"],
  ["CV to Offer Decision conversion", "CV 到 Offer 决策转化"],
  ["Volume", "数量"],
  ["Rate", "比率"],
  ["CVs", "CV 数"],
  ["Offer", "Offer"],
  ["HR Execution", "HR 执行"],
  ["Operational speed and discipline", "运营速度与纪律"],
  ["Channel Quality", "渠道质量"],
  ["Source attribution from CV to decision quality", "从 CV 到决策质量的来源归因"],
  ["Email inbound", "邮件流入"],
  ["Referral", "推荐"],
  ["Agency", "猎头"],
  ["Forwarded profiles", "转发档案"],
  ["Analytics Agent", "分析 Agent"],
  ["Metrics with evidence", "有证据的指标"],
  ["Operating insight", "运营洞察"],
  ["5 high-value decisions are waiting, but only 2 are truly time-sensitive.", "5 个高价值决策在等待，但只有 2 个真正紧急。"],
  ["Founder Inbox removes operational noise and shows the decision, evidence, risk, and recommended action in one place.", "创始人收件箱去除运营噪音，在一个地方展示决策、证据、风险和推荐动作。"],
  ["Decision principle", "决策原则"],
  ["Open Decisions", "开放决策"],
  ["Avg Wait", "平均等待"],
  ["Evidence Ready", "证据就绪"],
  ["Risk Escalations", "风险升级"],
  ["Decision Cards", "决策卡"],
  ["Decision Anatomy", "决策结构"],
  ["Every card follows the same hierarchy", "每张卡遵循同样的信息层级"],
  ["Founder Agent", "创始人 Agent"],
  ["Decision support", "决策支持"],
  ["Decision recommendation", "决策建议"],
  ["12 active jobs need workflow discipline before more intake volume lands.", "在更多简历进入前，12 个活跃岗位需要先补齐流程纪律。"],
  ["AI setup suggestion", "AI 设置建议"],
  ["Active Jobs", "活跃岗位"],
  ["Missing SLA", "缺少 SLA"],
  ["Draft JDs", "JD 草稿"],
  ["Workflow Gaps", "流程缺口"],
  ["Job Control Table", "岗位控制表"],
  ["Role-level health before candidates move through pipeline", "候选人流转前的岗位级健康度"],
  ["Paused", "已暂停"],
  ["AI checks enabled", "AI 检查已开启"],
  ["Job", "岗位"],
  ["Pipeline", "流程"],
  ["Scorecard", "Scorecard"],
  ["Workflow Defaults", "流程默认值"],
  ["Scorecard Coverage", "Scorecard 覆盖"],
  ["Signals by role family", "按岗位族展示信号"],
  ["Job Agent", "岗位 Agent"],
  ["Workflow and scorecard setup", "流程与 Scorecard 设置"],
  ["Inbox", "待办箱"],
  ["Intelligence", "智能分析"],
  ["Settings", "设置"],
  ["AI Hiring Operating System", "AI 招聘操作系统"],
  ["Evidence", "证据"],
  ["Confidence", "置信度"],
  ["Ask", "提问"],
  ["High", "高"],
  ["Yes", "是"],
  ["Search candidate, job, owner", "搜索候选人、岗位、负责人"],
  ["Application", "申请"],
  ["Interview", "面试"],
  ["Assessment", "测评"],
  ["Backend", "后端"],
  ["Design", "设计"],
  ["Ops", "运营"],
  ["Data", "数据"],
  ["Audit", "审计"],
  ["AI highlights jobs missing Scorecard coverage, owner defaults, or SLA rules. The goal is to make every downstream Application inherit a clear process.", "AI 会标出缺少 Scorecard 覆盖、负责人默认值或 SLA 规则的岗位，目标是让每个下游申请都继承清晰流程。"],
  ["Paused Jobs", "已暂停岗位"],
  ["Excluded from email auto-match", "不参与邮件自动匹配"],
  ["8 fully configured", "8 个已完整配置"],
  ["Need founder confirmation", "需要创始人确认"],
  ["Scorecard or rubric incomplete", "Scorecard 或评分标准不完整"],
  ["74 applications · Ho Chi Minh", "74 个申请 · 胡志明市"],
  ["43 applications · Remote VN", "43 个申请 · 越南远程"],
  ["38 applications · Hanoi", "38 个申请 · 河内"],
  ["29 applications · Hybrid", "29 个申请 · 混合办公"],
  ["Assessment-heavy pipeline · 3 blocked", "测评较重的流程 · 3 个阻塞"],
  ["Open detail", "打开详情"],
  ["Feedback due today", "反馈今日到期"],
  ["Scorecard partial", "Scorecard 不完整"],
  ["Offer decision stage", "Offer 决策阶段"],
  ["Email match off", "邮件匹配关闭"],
  ["Platform Engineer", "平台工程师"],
  ["Needs workflow defaults", "需要流程默认值"],
  ["Email match blocked", "邮件匹配已阻断"],
  ["Add due dates and Process Owner defaults to Platform Engineer before approving more CV intake.", "在批准更多 CV 进入前，先给平台工程师岗位补充截止时间和流程负责人默认值。"],
  ["29 active applications inherit no SLA.", "29 个活跃申请没有继承 SLA。"],
  ["Blocked detection will be unreliable.", "阻塞识别会不可靠。"],
  ["High · workflow defaults missing.", "高 · 缺少流程默认值。"],
  ["Compare Backend and Platform hiring flows, or draft a Scorecard section.", "对比后端和平台岗位招聘流程，或起草一段 Scorecard。"],
  ["Pause Job", "暂停岗位"],
  ["Save Job", "保存岗位"],
  ["Job Detail", "岗位详情"],
  ["Hiring Workflow", "招聘流程"],
  ["Assessment Plan", "测评方案"],
  ["Job Pipeline", "岗位流程"],
  ["This job is Active, so AI can match inbound CV emails into Applications.", "该岗位为活跃状态，因此 AI 可以把流入的 CV 邮件匹配为申请。"],
  ["Active status requires confirmed JD, workflow stages, owner defaults, SLA rules, and minimum Scorecard coverage. Draft or Paused jobs must not receive automatic matches.", "活跃状态需要确认 JD、流程阶段、负责人默认值、SLA 规则和最低 Scorecard 覆盖度。草稿或暂停岗位不能接收自动匹配。"],
  ["AI setup check", "AI 设置检查"],
  ["Scorecard coverage is ready, but Assessment rubric should be reviewed before sending the next technical case.", "Scorecard 覆盖已就绪，但发送下一份技术案例前应先审核测评评分标准。"],
  ["Job Status", "岗位状态"],
  ["Email match enabled", "邮件匹配已开启"],
  ["29 active in workflow", "29 个处于活跃流程"],
  ["Evidence dimensions covered", "证据维度已覆盖"],
  ["Assessment rubric review", "测评评分标准待审核"],
  ["Hiring Requirement", "招聘需求"],
  ["Creation-time fields can be edited later with change history", "创建岗位时填写，后续可修改并保留变更记录"],
  ["Role Goal", "岗位目标"],
  ["Own backend service reliability, API design, and integration quality for the hiring OS platform.", "负责招聘 OS 平台的后端服务可靠性、API 设计和集成质量。"],
  ["Founder confirmed", "创始人已确认"],
  ["Ho Chi Minh", "胡志明市"],
  ["Budget & Level", "预算与级别"],
  ["Senior IC, 5+ years, Vietnam-based compensation band. Requires English collaboration.", "高级个人贡献者，5 年以上经验，越南薪资带，要求英文协作。"],
  ["Senior", "高级"],
  ["Hybrid", "混合办公"],
  ["Configured Workflow", "已配置流程"],
  ["Every Application inherits stages, owner, next action, and SLA", "每个申请都会继承阶段、负责人、下一步和 SLA"],
  ["Owner: Linh · SLA: 1 business day · verify base fit", "负责人：Linh · SLA：1 个工作日 · 验证基础匹配"],
  ["Technical Interview", "技术面试"],
  ["Owner: Tech Lead · evidence: architecture, debugging, communication", "负责人：技术负责人 · 证据：架构、调试、沟通"],
  ["Owner: HR + Tech Lead · rubric review pending", "负责人：HR + 技术负责人 · 评分标准待审核"],
  ["Founder Decision", "创始人决策"],
  ["Founder sees complete evidence, gaps, and abnormal process history", "创始人查看完整证据、缺口和异常流程历史"],
  ["Email Matching Rules", "邮件匹配规则"],
  ["How mailbox data enters this job", "邮箱数据如何进入该岗位"],
  ["Eligible for automatic matching", "允许自动匹配"],
  ["Only Active jobs receive high-confidence CV matches from the recruiting mailbox.", "只有活跃岗位会接收招聘邮箱中的高置信度 CV 匹配。"],
  ["Match confidence threshold", "匹配置信度阈值"],
  ["Candidate + job + attachment evidence must pass 85% before auto-create Application.", "候选人、岗位和附件证据超过 85% 后才可自动创建申请。"],
  ["Low-confidence fallback", "低置信度兜底"],
  ["Ambiguous CVs enter Inbox for HR confirmation instead of silently creating data.", "模糊 CV 进入待办箱由 HR 确认，而不是静默创建数据。"],
  ["Job AI Workspace", "岗位 AI 工作区"],
  ["Role setup and workflow checks", "岗位设置与流程检查"],
  ["Recommended action", "推荐动作"],
  ["Review the Assessment rubric before sending another case, then keep the job Active.", "发送下一份案例前先审核测评评分标准，然后保持岗位活跃。"],
  ["Scorecard is 92% covered; rubric has one incomplete dimension.", "Scorecard 覆盖率为 92%；评分标准仍有一个维度不完整。"],
  ["Weak rubric will reduce assessment evidence quality.", "评分标准薄弱会降低测评证据质量。"],
  ["High · based on workflow configuration.", "高 · 基于流程配置。"],
  ["Inbox turns scattered recruiting work into queues with clear ownership.", "待办箱把分散的招聘工作整理成有明确负责人的队列。"],
  ["Email remains the primary data source, but AI only writes high-confidence events automatically. Everything ambiguous becomes a review item with raw evidence attached.", "邮件仍是主要数据来源，但 AI 只会自动写入高置信度事件。所有模糊项都会变成带原始证据的审核任务。"],
  ["AI approval rule", "AI 审批规则"],
  ["AI can draft, classify, extract, and suggest. Low-confidence matches, candidate merges, and offer decisions require human approval.", "AI 可以起草、分类、提取和建议。低置信度匹配、候选人合并和 Offer 决策必须人工审批。"],
  ["Email Intake", "邮件录入"],
  ["Threads need structure", "线程需要结构化"],
  ["Decisions", "决策"],
  ["Founder approval queue", "创始人审批队列"],
  ["Assessment Reviews", "测评审核"],
  ["Submissions awaiting review", "等待审核的提交"],
  ["Owner, SLA, or evidence gap", "负责人、SLA 或证据缺口"],
  ["Unified Work Queue", "统一工作队列"],
  ["Secondary business queues grouped under one operational Inbox", "二级业务队列统一归入一个运营待办箱"],
  ["Search thread, candidate, job, owner", "搜索邮件线程、候选人、岗位、负责人"],
  ["Contextual AI write-back on", "上下文 AI 写回已开启"],
  ["Queue Item", "队列项"],
  ["Type", "类型"],
  ["Object", "对象"],
  ["AI Suggestion", "AI 建议"],
  ["CV - Trang Nguyen Backend", "CV - Trang Nguyen 后端"],
  ["3 attachments from recruiting mailbox", "来自招聘邮箱的 3 个附件"],
  ["Create record", "创建记录"],
  ["Minh Pham offer decision", "Minh Pham Offer 决策"],
  ["Evidence complete, awaiting founder", "证据完整，等待创始人"],
  ["Approve offer decision", "批准 Offer 决策"],
  ["Assessment submission v2", "测评提交 V2"],
  ["Version changes detected in README", "README 中检测到版本变化"],
  ["Compare V1/V2", "对比 V1/V2"],
  ["Anh Le interview feedback", "Anh Le 面试反馈"],
  ["Feedback missing after scheduled interview", "面试后缺少反馈"],
  ["Remind owner", "提醒负责人"],
  ["Agency-forwarded profile", "猎头转发档案"],
  ["Possible duplicate identity", "可能重复身份"],
  ["Merge candidate", "合并候选人"],
  ["Inbox AI Workspace", "待办箱 AI 工作区"],
  ["Queues, approvals, and write-back", "队列、审批与写回"],
  ["Highest-risk item", "最高风险项"],
  ["Do not auto-merge the agency-forwarded profile. Ask HR to confirm identity before updating the Candidate Timeline.", "不要自动合并猎头转发档案。更新候选人时间线前先请 HR 确认身份。"],
  ["Same phone number appears on an existing Backend candidate.", "相同手机号出现在已有后端候选人中。"],
  ["Duplicate merge could corrupt application history.", "错误合并可能污染申请历史。"],
  ["Medium · identity match 72%.", "中 · 身份匹配 72%。"],
  ["Create task", "创建任务"],
  ["Query any queue, draft a reply, explain an extraction, or apply a reviewed status update.", "查询任意队列、起草回复、解释提取结果，或应用已审核的状态更新。"],
  ["Agency-forwarded profile", "猎头转发档案"],
  ["Open Raw Email", "打开原始邮件"],
  ["Confirm Match", "确认匹配"],
  ["This queue item is blocked because the candidate identity is ambiguous.", "该队列项被阻塞，因为候选人身份不明确。"],
  ["AI should not create or merge candidate records when identity confidence is medium. HR must review the raw email and approve the write-back.", "当身份置信度为中等时，AI 不应创建或合并候选人记录。HR 必须审核原始邮件并批准写回。"],
  ["Approval boundary", "审批边界"],
  ["AI can extract, compare, and suggest. Human approval is required before merge, reject, or offer decision.", "AI 可以提取、对比和建议。合并、拒绝或 Offer 决策前必须人工审批。"],
  ["Agency forward", "猎头转发"],
  ["Identity Match", "身份匹配"],
  ["Possible duplicate", "可能重复"],
  ["Write-back", "写回"],
  ["Hold", "暂缓"],
  ["Needs HR approval", "需要 HR 审批"],
  ["Raw Email Evidence", "原始邮件证据"],
  ["Primary source stays attached to every extracted event", "每个提取事件都会保留原始来源"],
  ["Forwarded profile from agency", "猎头转发档案"],
  ["Thread", "线程"],
  ["Parse CV", "解析 CV"],
  ["Done", "完成"],
  ["Phone number match", "手机号匹配"],
  ["Matches existing Backend candidate record", "匹配已有后端候选人记录"],
  ["Identity", "身份"],
  ["Merge review", "合并审核"],
  ["Job keyword mismatch", "岗位关键词不匹配"],
  ["Backend CV forwarded for Platform Engineer", "后端 CV 被转发到平台工程师岗位"],
  ["Low", "低"],
  ["Write-back Preview", "写回预览"],
  ["What will change if HR confirms", "HR 确认后会发生什么变化"],
  ["Update Candidate", "更新候选人"],
  ["Merge CV version into existing person record", "将 CV 版本合并到已有人员记录"],
  ["Approval", "审批"],
  ["Only if HR confirms Platform Engineer is the intended job", "仅当 HR 确认目标岗位为平台工程师时执行"],
  ["Add Evidence Event", "新增证据事件"],
  ["Attach raw email, CV, match score, and reviewer decision", "附加原始邮件、CV、匹配分和审核人决策"],
  ["Safe", "安全"],
  ["Human Review Checklist", "人工审核清单"],
  ["Why this cannot be fully automatic", "为什么不能完全自动化"],
  ["Confirm identity", "确认身份"],
  ["Same phone number but different agency email. Wrong merge can corrupt timelines.", "手机号相同但猎头邮箱不同。错误合并会污染时间线。"],
  ["Required", "必需"],
  ["Confirm job", "确认岗位"],
  ["AI sees Platform 62%, Backend 58%. Active job match is not strong enough.", "AI 判断平台 62%、后端 58%。活跃岗位匹配不够强。"],
  ["Preserve evidence", "保留证据"],
  ["Raw email and AI extraction must stay visible in Candidate Timeline.", "原始邮件和 AI 提取结果必须在候选人时间线中可见。"],
  ["Do not auto-apply", "不要自动应用"],
  ["Send this to HR review instead of merging candidate records automatically.", "将其发送给 HR 审核，而不是自动合并候选人记录。"],
  ["Identity 72%, job match 62%, source is agency forward.", "身份 72%，岗位匹配 62%，来源为猎头转发。"],
  ["Could create duplicate Candidate or wrong Application.", "可能创建重复候选人或错误申请。"],
  ["Medium · human confirmation needed.", "中 · 需要人工确认。"],
  ["Application 是运营单元：候选人 + 岗位 + 流程状态。", "Application 是运营单元：候选人 + 岗位 + 流程状态。"],
  ["Candidate Profile", "候选人档案"],
  ["Timeline", "时间线"],
  ["Email Threads", "邮件线程"],
  ["Interviews", "面试"],
  ["Across 12 jobs", "覆盖 12 个岗位"],
  ["Mostly interview feedback", "主要是面试反馈"],
  ["Assessment or availability", "测评或可面试时间"],
  ["Must be assigned", "必须分配"],
  ["Due", "到期"],
  ["Next-step suggestions", "下一步建议"],
  ["7 evidence events · 1 assessment", "7 个证据事件 · 1 个测评"],
  ["Founder Review", "创始人审核"],
  ["Founder", "创始人"],
  ["Approve final interview", "批准终面"],
  ["Mixed feedback · evidence gap", "反馈混合 · 存在证据缺口"],
  ["Collect feedback", "收集反馈"],
  ["Offer evidence complete", "Offer 证据完整"],
  ["Assign owner", "分配负责人"],
  ["System design and debugging evidence extracted", "已提取系统设计和调试证据"],
  ["Evidence gap reduced for product thinking", "产品思维证据缺口已减少"],
  ["Assessment parsed", "测评已解析"],
  ["Interview feedback linked", "面试反馈已关联"],
  ["Owner missing", "缺少负责人"],
  ["Application blocked from workflow defaults", "申请被流程默认值阻塞"],
  ["Alert", "警报"],
  ["44 applications · 8 due this week", "44 个申请 · 本周 8 个到期"],
  ["31 applications · 4 overdue feedback", "31 个申请 · 4 个反馈逾期"],
  ["Application has no Current Owner and no Due Date.", "申请缺少当前负责人和截止日期。"],
  ["Active pipeline item can disappear from SLA monitoring.", "活跃流程项可能从 SLA 监控中消失。"],
  ["High · required fields missing.", "高 · 缺少必填字段。"],
  ["Assign", "分配"],
  ["Move to Founder Review", "移动到创始人审核"],
  ["This Application is ready for founder review, but one leadership evidence gap remains.", "该申请已可进入创始人审核，但仍有一个领导力证据缺口。"],
  ["Application is the workflow unit. Candidate identity stays reusable, while this page stores job-specific state, evidence, SLA, and decision history.", "Application 是流程单元。候选人身份保持可复用，本页存储具体岗位的状态、证据、SLA 和决策历史。"],
  ["Decision context", "决策上下文"],
  ["AI recommendation uses Evidence Gap + Scorecard + CV, and never makes the final offer decision.", "AI 推荐基于证据缺口、Scorecard 和 CV，但永远不做最终 Offer 决策。"],
  ["Application State", "申请状态"],
  ["Owner: Founder", "负责人：创始人"],
  ["Evidence Events", "证据事件"],
  ["Email, interview, assessment", "邮件、面试、测评"],
  ["Decision due", "决策到期"],
  ["Evidence Gap", "证据缺口"],
  ["Leadership under pressure", "压力下的领导力"],
  ["Person record plus job-specific Application state", "人员记录 + 具体岗位申请状态"],
  ["Trang Nguyen · backend engineer with fintech API and distributed systems experience.", "Trang Nguyen · 具备金融科技 API 和分布式系统经验的后端工程师。"],
  ["CV parsed", "CV 已解析"],
  ["Senior Backend Engineer · Active job · current state is Founder Review after assessment evidence.", "高级后端工程师 · 活跃岗位 · 测评证据后当前状态为创始人审核。"],
  ["Owner set", "负责人已设置"],
  ["Due today", "今日到期"],
  ["Every human and AI update is stored as an Evidence Event", "每一次人工和 AI 更新都会记录为证据事件"],
  ["Debugging depth and architecture tradeoff evidence extracted", "已提取调试深度和架构取舍证据"],
  ["Tech Lead confirmed strong systems reasoning", "技术负责人确认系统推理能力强"],
  ["Human", "人工"],
  ["CV intake from mailbox", "从邮箱录入 CV"],
  ["Email Agent matched candidate to Senior Backend with 94% confidence", "邮件 Agent 以 94% 置信度将候选人匹配到高级后端岗位"],
  ["Decision Card", "决策卡片"],
  ["Founder sees evidence, gap, risk, and recommended action", "创始人查看证据、缺口、风险和推荐动作"],
  ["Proceed to final interview instead of asking for another assessment round.", "进入终面，而不是再增加一轮测评。"],
  ["Proceed", "推进"],
  ["Verified", "已验证"],
  ["Backend architecture, debugging depth, written communication, API ownership.", "后端架构、调试深度、书面沟通、API 责任感。"],
  ["Strong", "强"],
  ["Unknown", "未知"],
  ["Leadership under pressure has not been directly tested.", "压力下领导力尚未被直接验证。"],
  ["Gap", "缺口"],
  ["Decision boundary", "决策边界"],
  ["AI can recommend, but founder must approve final interview, rejection, or offer decision.", "AI 可以推荐，但终面、拒绝或 Offer 决策必须由创始人批准。"],
  ["Application AI Workspace", "申请 AI 工作区"],
  ["Evidence, gaps, and next actions", "证据、缺口与下一步"],
  ["Ask in context", "基于上下文提问"],
  ["You can ask about the CV, interview feedback, assessment versions, timeline, or why the next action is recommended.", "你可以询问 CV、面试反馈、测评版本、时间线，或为什么推荐该下一步。"],
  ["Decision uses Scorecard + CV + Evidence Gap.", "决策使用 Scorecard、CV 和证据缺口。"],
  ["Leadership gap should be covered in final interview.", "领导力缺口应在终面中覆盖。"],
  ["High · seven evidence events linked.", "高 · 已关联 7 个证据事件。"],
  ["Draft questions", "起草问题"],
  ["Show evidence", "查看证据"],
  ["Last 30 days", "最近 30 天"],
  ["2 paused, 4 draft", "2 个暂停，4 个草稿"],
  ["22 due today", "22 个今日到期"],
  ["Email Match Accuracy", "邮件匹配准确率"],
  ["Human-confirmed matches", "人工确认的匹配"],
  ["Offer Decision Rate", "Offer 决策率"],
  ["MVP stops here", "MVP 到此为止"],
  ["Job Status & SLA", "岗位状态与 SLA"],
  ["Role availability and inherited workflow discipline", "岗位可用性与继承的流程纪律"],
  ["Active jobs with clean defaults", "默认值完整的活跃岗位"],
  ["8 of 12 active jobs have owner, SLA, scorecard, and workflow", "12 个活跃岗位中有 8 个具备负责人、SLA、Scorecard 和流程"],
  ["Paused jobs excluded from email matching", "暂停岗位不参与邮件匹配"],
  ["2 jobs are still visible but do not receive automatic applications", "2 个岗位仍可见，但不接收自动申请"],
  ["Draft jobs blocking intake", "草稿岗位阻止录入"],
  ["4 jobs need founder confirmation before AI matching turns on", "4 个岗位需要创始人确认后才能开启 AI 匹配"],
  ["Email-first AI Quality", "邮件优先的 AI 质量"],
  ["Automation quality before data enters the workflow", "数据进入流程前的自动化质量"],
  ["Email to candidate record", "邮件到候选人记录"],
  ["Median 18 minutes from thread to structured Application", "从邮件线程到结构化申请的中位时间为 18 分钟"],
  ["Good", "良好"],
  ["Email to status update", "邮件到状态更新"],
  ["74% of scheduling and submission threads update status correctly", "74% 的安排和提交线程能正确更新状态"],
  ["Watch", "关注"],
  ["Low-confidence review rate", "低置信度审核率"],
  ["14 threads require HR confirmation before write-back", "14 个线程写回前需要 HR 确认"],
  ["Decision Operations", "决策运营"],
  ["Founder-visible abnormal flow and decision load", "创始人可见的异常流程和决策负载"],
  ["Founder abnormal-flow visibility", "创始人异常流程可见性"],
  ["All 9 blocked applications are visible in Inbox", "9 个阻塞申请都在待办箱中可见"],
  ["Offer decision waiting time", "Offer 决策等待时间"],
  ["Median 1.3 days after evidence complete", "证据完整后中位等待 1.3 天"],
  ["Stable", "稳定"],
  ["Evidence gap before decision", "决策前证据缺口"],
  ["5 applications need Scorecard, CV, or Assessment support", "5 个申请需要 Scorecard、CV 或测评支持"],
  ["Recruiting mailbox", "招聘邮箱"],
  ["Founder + team intros", "创始人与团队推荐"],
  ["Manual upload / email", "手动上传 / 邮件"],
  ["Analytics AI Workspace", "分析 AI 工作区"],
  ["Referral has the highest offer decision rate, but inbound email produces most total shortlisted candidates.", "推荐渠道 Offer 决策率最高，但流入邮件贡献了最多入围候选人。"],
  ["Referral offer decision rate is 8.3%; email inbound produces 45 shortlisted candidates.", "推荐渠道 Offer 决策率为 8.3%；流入邮件产生 45 个入围候选人。"],
  ["Interview feedback SLA is dragging overall cycle time.", "面试反馈 SLA 正在拖慢整体周期。"],
  ["High · based on structured source attribution.", "高 · 基于结构化来源归因。"],
  ["Audit Log", "审计日志"],
  ["Save Changes", "保存修改"],
  ["Settings define what AI can read, suggest, and write back into the hiring workflow.", "设置定义 AI 可以读取、建议和写回招聘流程的范围。"],
  ["This page keeps operational rules out of daily queue pages, while making mailbox scope, approval gates, and status defaults explicit.", "本页将运营规则从日常队列页中抽离，同时明确邮箱范围、审批门槛和状态默认值。"],
  ["Governance rule", "治理规则"],
  ["AI may structure evidence and update workflow status, but cannot auto-reject, auto-hire, or make an offer decision.", "AI 可以结构化证据并更新流程状态，但不能自动拒绝、自动录用或做 Offer 决策。"],
  ["Mailboxes", "邮箱"],
  ["Recruiting + agency intake", "招聘 + 猎头录入"],
  ["Users", "用户"],
  ["HR, founder, interviewers", "HR、创始人、面试官"],
  ["SLA Rules", "SLA 规则"],
  ["By application state", "按申请状态"],
  ["AI Rules", "AI 规则"],
  ["3 require review", "3 条需要审核"],
  ["Workspace Configuration", "工作区配置"],
  ["Company-level settings that shape every Job and Application", "影响每个岗位和申请的公司级设置"],
  ["Mailbox Connections", "邮箱连接"],
  ["Control which HR inboxes AI can read, which folders count as recruiting data, and which sender domains require review.", "控制 AI 可读取哪些 HR 邮箱、哪些文件夹算招聘数据，以及哪些发件域名需要审核。"],
  ["Connected", "已连接"],
  ["2 inboxes", "2 个邮箱"],
  ["Low-conf review", "低置信度审核"],
  ["Roles & Permissions", "角色与权限"],
  ["Define who can create jobs, change job status, approve evidence, view all abnormal processes, and make offer decisions.", "定义谁可以创建岗位、修改岗位状态、批准证据、查看所有异常流程和做 Offer 决策。"],
  ["Founder override", "创始人覆盖权限"],
  ["HR admin", "HR 管理员"],
  ["Interviewer", "面试官"],
  ["Status & SLA Defaults", "状态与 SLA 默认值"],
  ["Set Application Status, Job Status, owner defaults, due dates, and blocked detection rules inherited by each new job.", "设置新岗位继承的申请状态、岗位状态、负责人默认值、截止日期和阻塞识别规则。"],
  ["Closed", "已关闭"],
  ["AI Automation Rules", "AI 自动化规则"],
  ["Choose which AI actions are automatic, which require approval, and which sensitive actions are out of scope for MVP.", "选择哪些 AI 动作可自动执行、哪些需要审批，以及哪些敏感动作不在 MVP 范围内。"],
  ["Extract evidence", "提取证据"],
  ["Confirm match", "确认匹配"],
  ["No auto-hire", "不自动录用"],
  ["Hiring Templates", "招聘模板"],
  ["Reusable interview stages, scorecards, assessment plans, and evaluation rubrics for common role families.", "面向常见岗位族的可复用面试阶段、Scorecard、测评方案和评分标准。"],
  ["Engineer", "工程"],
  ["Evidence Policy", "证据策略"],
  ["Define the required evidence event types for decisions: Scorecard, CV, Evidence Gap, Interview, Assessment, and Offer Decision.", "定义决策所需的证据事件类型：Scorecard、CV、证据缺口、面试、测评和 Offer 决策。"],
  ["Evidence Event", "证据事件"],
  ["Settings AI Workspace", "设置 AI 工作区"],
  ["Governance and templates", "治理与模板"],
  ["Policy warning", "策略警告"],
  ["Three active jobs still allow applications without owner defaults. Add a fallback owner before more email intake is synced.", "仍有 3 个活跃岗位允许没有负责人默认值的申请。同步更多邮件录入前请添加兜底负责人。"],
  ["Platform, Ops, and Data jobs have missing SLA defaults.", "平台、运营和数据岗位缺少 SLA 默认值。"],
  ["Founder may see abnormal flows without a responsible owner.", "创始人可能看到没有负责人的异常流程。"],
  ["High · inherited settings incomplete.", "高 · 继承设置不完整。"],
  ["Draft rule", "起草规则"],
  ["Review jobs", "审核岗位"],
  ["Test Sync", "测试同步"],
  ["Add Mailbox", "添加邮箱"],
  ["Status & SLA", "状态与 SLA"],
  ["Templates", "模板"],
  ["All Settings", "全部设置"],
  ["Email is the primary system input, so mailbox settings are production rules.", "邮件是主要系统输入，因此邮箱设置就是生产规则。"],
  ["This page decides what AI can read, what counts as recruiting evidence, when AI can write status updates, and when HR approval is required.", "本页决定 AI 能读取什么、什么算招聘证据、何时可写回状态，以及何时需要 HR 审批。"],
  ["Privacy and control", "隐私与控制"],
  ["Only configured folders and recruiting senders are processed. Sensitive replies and offer decisions require human approval.", "只处理已配置文件夹和招聘发件人。敏感回复和 Offer 决策需要人工审批。"],
  ["Connected Mailboxes", "已连接邮箱"],
  ["Folders Watched", "监听文件夹"],
  ["Inbox, CV, Assessment", "待办箱、CV、测评"],
  ["Auto Write-back", "自动写回"],
  ["Safe event types", "安全事件类型"],
  ["Review Rules", "审核规则"],
  ["Low confidence or sensitive", "低置信度或敏感"],
  ["Connected Sources", "已连接来源"],
  ["Which inboxes AI can read", "AI 可读取的邮箱"],
  ["Mailbox", "邮箱"],
  ["Scope", "范围"],
  ["recruiting@company.vn", "recruiting@company.vn"],
  ["Main HR recruiting mailbox", "主 HR 招聘邮箱"],
  ["6 folders", "6 个文件夹"],
  ["agency-intake@company.vn", "agency-intake@company.vn"],
  ["Forwarded profiles and agency updates", "转发档案和猎头更新"],
  ["2 folders", "2 个文件夹"],
  ["Always", "始终"],
  ["Email Processing Rules", "邮件处理规则"],
  ["What AI can do with mailbox data", "AI 可以如何处理邮箱数据"],
  ["Auto-allowed", "允许自动执行"],
  ["Parse CV attachments, extract candidate identity, attach raw email, create evidence events for high-confidence updates.", "解析 CV 附件、提取候选人身份、附加原始邮件，并为高置信度更新创建证据事件。"],
  ["CV parse", "CV 解析"],
  ["Evidence event", "证据事件"],
  ["Requires approval", "需要审批"],
  ["Candidate merge, low-confidence job match, status updates from ambiguous threads, outbound candidate replies.", "候选人合并、低置信度岗位匹配、模糊线程状态更新、对候选人的外发回复。"],
  ["Reply", "回复"],
  ["Write-back Boundaries", "写回边界"],
  ["Rules aligned with MVP scope", "与 MVP 范围一致的规则"],
  ["Allowed automatically", "允许自动执行"],
  ["High-confidence CV intake, interview schedule confirmation, assessment submission attachment.", "高置信度 CV 录入、面试时间确认、测评提交附件。"],
  ["Allowed after approval", "审批后允许"],
  ["Candidate merge, job match correction, human-facing reply draft, blocked escalation task.", "候选人合并、岗位匹配修正、面向人的回复草稿、阻塞升级任务。"],
  ["Never automatic in MVP", "MVP 中永不自动执行"],
  ["Reject candidate, make offer decision, change compensation, or send sensitive offer communication.", "拒绝候选人、做 Offer 决策、修改薪酬或发送敏感 Offer 沟通。"],
  ["Mailbox AI Workspace", "邮箱 AI 工作区"],
  ["Input rules and automation boundaries", "输入规则与自动化边界"],
  ["Recommended rule", "推荐规则"],
  ["Keep agency mailbox write-back on Hold; use it for evidence extraction but require HR approval before merge or application creation.", "保持猎头邮箱写回为暂缓；可用于证据提取，但合并或创建申请前必须 HR 审批。"],
  ["Agency forwards create most duplicate identity risks.", "猎头转发带来最多重复身份风险。"],
  ["Wrong merge can corrupt Candidate Timeline.", "错误合并会污染候选人时间线。"],
  ["High · based on current review queue.", "高 · 基于当前审核队列。"],
  ["Apply rule", "应用规则"],
  ["Recommended setup", "推荐设置"],
]);

const enTextMap = new Map([...zhTextMap].map(([en, zh]) => [zh, en]));

const zhPlaceholderMap = new Map([
  ["Ask about pipeline, evidence, risk...", "询问流程、证据、风险..."],
  ["Ask about this mailbox...", "询问这个邮箱..."],
  ["Ask about job setup...", "询问岗位设置..."],
  ["Ask about applications...", "询问申请流程..."],
  ["Ask about candidate history...", "询问候选人历史..."],
  ["Ask about assessment evidence...", "询问测评证据..."],
  ["Ask about founder decisions...", "询问创始人决策..."],
  ["Ask how to unblock...", "询问如何解除阻塞..."],
  ["Ask about hiring metrics...", "询问招聘指标..."],
  ["Ask about this job...", "询问这个岗位..."],
  ["Ask about this inbox...", "询问这个待办箱..."],
  ["Ask about this queue item...", "询问这个队列项..."],
  ["Ask about this application...", "询问这个申请..."],
  ["Ask about rules or templates...", "询问规则或模板..."],
  ["Ask about mailbox rules...", "询问邮箱规则..."],
  ["Search thread, candidate, job, owner", "搜索邮件线程、候选人、岗位、负责人"],
  ["Search sender, job, attachment", "搜索发件人、岗位、附件"],
  ["Search candidate, job, rubric", "搜索候选人、岗位、Rubric"],
  ["Search jobs, owner, location", "搜索岗位、负责人、地点"],
  ["Search candidate, job, owner", "搜索候选人、岗位、负责人"],
  ["Search name, email, source", "搜索姓名、邮箱、来源"],
  ["Search blocked item, owner, reason", "搜索阻塞项、负责人、原因"],
]);

const enPlaceholderMap = new Map([...zhPlaceholderMap].map(([en, zh]) => [zh, en]));

function replaceTextNode(node, map) {
  const value = node.nodeValue;
  const trimmed = value.trim();
  if (!trimmed || !map.has(trimmed)) return;
  node.nodeValue = value.replace(trimmed, map.get(trimmed));
}

function walkText(root, map) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || ["SCRIPT", "STYLE"].includes(parent.tagName)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach((node) => replaceTextNode(node, map));
}

function applyLanguage(lang) {
  const toZh = lang === "zh";
  walkText(document.body, toZh ? zhTextMap : enTextMap);
  document.querySelectorAll("input[placeholder]").forEach((input) => {
    const map = toZh ? zhPlaceholderMap : enPlaceholderMap;
    if (map.has(input.placeholder)) input.placeholder = map.get(input.placeholder);
  });
  document.documentElement.lang = toZh ? "zh-CN" : "en";
  localStorage.setItem("hireos-language-v2", lang);
  document.querySelectorAll(".language-switch button").forEach((button) => {
    button.classList.toggle("active", button.dataset.lang === lang);
  });
}

function setSidebarState(collapsed, persist = true) {
  document.body.classList.toggle("sidebar-collapsed", collapsed);
  document.body.classList.remove("account-menu-open");
  if (persist) {
    localStorage.setItem("hireos-sidebar-collapsed", collapsed ? "true" : "false");
  }
  document.querySelectorAll(".sidebar-toggle").forEach((button) => {
    setToggleIcon(button, "panel-left-close", "收起侧边栏");
  });
  document.querySelectorAll(".sidebar-logo-toggle").forEach((button) => {
    if (collapsed) {
      setToggleIcon(button, "panel-left-open", "展开侧边栏");
    } else {
      button.textContent = "H";
      button.setAttribute("aria-label", "HireOS");
      button.setAttribute("title", "HireOS");
      refreshIcons();
    }
  });
}

document.querySelectorAll(".sidebar-toggle, .sidebar-logo-toggle").forEach((button) => {
  button.addEventListener("click", () => {
    setSidebarState(!document.body.classList.contains("sidebar-collapsed"));
  });
});

document.querySelectorAll(".agent-toggle").forEach((button) => {
  button.addEventListener("click", () => {
    const collapsed = document.body.classList.toggle("agent-collapsed");
    if (!collapsed) {
      document.body.classList.remove("dock-expanded");
    }
    setToggleIcon(button, collapsed ? "panel-right-open" : "panel-right-close", collapsed ? "展开 Agent" : "收起 Agent");
  });
});

document.querySelectorAll(".agent-dock-bar").forEach((button) => {
  button.addEventListener("click", () => {
    document.body.classList.toggle("dock-expanded");
  });
});

document.querySelectorAll(".agent-dock-prompts button").forEach((button) => {
  button.addEventListener("click", () => {
    document.body.classList.remove("agent-collapsed", "dock-expanded");
    document.querySelectorAll(".agent-toggle").forEach((toggle) => {
      setToggleIcon(toggle, "panel-right-close", "收起 Agent");
    });
  });
});

document.querySelectorAll(".user-status, .account-toggle").forEach((target) => {
  target.addEventListener("click", (event) => {
    event.stopPropagation();
    if (document.body.classList.contains("sidebar-collapsed")) return;
    const open = document.body.classList.toggle("account-menu-open");
    document.querySelectorAll(".user-status").forEach((status) => {
      status.setAttribute("aria-expanded", String(open));
    });
  });
});

document.querySelectorAll(".language-switch button").forEach((button) => {
  const label = button.textContent.trim();
  button.dataset.lang = label === "中文" ? "zh" : "en";
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    applyLanguage(button.dataset.lang);
  });
});

document.addEventListener("click", () => {
  document.body.classList.remove("account-menu-open");
});

const jobsFilterState = {
  status: "all",
  job: "all",
};

const jobsMetricPresets = {
  all: [
    ["活跃岗位", "12", "8 个岗位已完整配置"],
    ["暂停岗位", "2", "不参与邮件自动匹配"],
    ["JD 草稿", "4", "需要创始人确认"],
    ["流程缺口", "6", "Scorecard 或评分标准不完整"],
  ],
  active: [
    ["活跃岗位", "12", "8 个岗位已完整配置"],
    ["活跃申请", "168", "正在推进的岗位申请"],
    ["今日到期", "22", "主要是面试反馈"],
    ["异常流程", "9", "创始人可见"],
  ],
  paused: [
    ["暂停岗位", "2", "不参与邮件自动匹配"],
    ["保留申请", "38", "仍可查看历史流程"],
    ["待恢复", "1", "等待创始人确认"],
    ["匹配关闭", "2", "邮箱不自动创建申请"],
  ],
  draft: [
    ["草稿岗位", "4", "创建后可继续修改"],
    ["JD 草稿", "4", "需要创始人确认"],
    ["流程缺口", "6", "缺少默认负责人或 SLA"],
    ["匹配阻断", "4", "未进入自动匹配"],
  ],
  closed: [
    ["已关闭岗位", "0", "当前筛选无成员"],
    ["历史申请", "0", "未展示在当前列表"],
    ["邮箱匹配", "0", "关闭岗位不匹配"],
    ["待归档", "0", "暂无"],
  ],
  backend: [
    ["岗位申请", "74", "高级后端工程师"],
    ["活跃流程", "29", "当前处于测评阶段"],
    ["阻塞项", "3", "需要 HR 跟进"],
    ["Scorecard", "92%", "证据维度覆盖"],
  ],
  designer: [
    ["岗位申请", "43", "产品设计师"],
    ["活跃流程", "31", "当前处于面试阶段"],
    ["反馈逾期", "4", "需要面试官提交"],
    ["Scorecard", "66%", "部分完成"],
  ],
  gtm: [
    ["岗位申请", "38", "GTM 负责人"],
    ["岗位状态", "暂停", "邮件匹配关闭"],
    ["Offer 决策", "1", "等待创始人"],
    ["Scorecard", "74%", "已就绪"],
  ],
  platform: [
    ["岗位申请", "29", "平台工程师"],
    ["岗位状态", "草稿", "邮件匹配阻断"],
    ["流程缺口", "2", "缺少默认值"],
    ["Scorecard", "草稿", "待确认"],
  ],
};

function updateJobsMetrics() {
  const metrics = document.querySelectorAll("[data-job-metric]");
  if (!metrics.length) return;
  const presetKey = jobsFilterState.job !== "all" ? jobsFilterState.job : jobsFilterState.status;
  const preset = jobsMetricPresets[presetKey] || jobsMetricPresets.all;
  metrics.forEach((metric, index) => {
    const data = preset[index];
    if (!data) return;
    const label = metric.querySelector(".metric-label");
    const value = metric.querySelector("strong");
    const note = metric.querySelector("small");
    const icon = label?.querySelector("svg");
    if (label) {
      label.childNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) node.nodeValue = "";
      });
      label.prepend(document.createTextNode(data[0] + " "));
      if (icon && !label.contains(icon)) label.append(icon);
    }
    if (value) value.textContent = data[1];
    if (note) note.textContent = data[2];
  });
}

function updateJobsList() {
  const rows = document.querySelectorAll("[data-job-row]");
  if (!rows.length) return;
  let visibleCount = 0;
  rows.forEach((row) => {
    const statusMatch = jobsFilterState.status === "all" || row.dataset.status === jobsFilterState.status;
    const jobMatch = jobsFilterState.job === "all" || row.dataset.job === jobsFilterState.job;
    const visible = statusMatch && jobMatch;
    row.classList.toggle("is-hidden", !visible);
    if (visible) visibleCount += 1;
  });
  const empty = document.querySelector("[data-jobs-empty]");
  if (empty) empty.classList.toggle("is-hidden", visibleCount > 0);
}

function initJobsFilters() {
  const chips = document.querySelectorAll("[data-filter-group][data-filter-value]");
  if (!chips.length) return;
  chips.forEach((chip) => {
    chip.addEventListener("click", (event) => {
      event.preventDefault();
      const group = chip.dataset.filterGroup;
      const value = chip.dataset.filterValue;
      jobsFilterState[group] = value;
      document.querySelectorAll(`[data-filter-group="${group}"]`).forEach((item) => {
        item.classList.toggle("active", item === chip);
      });
      updateJobsMetrics();
      updateJobsList();
    });
  });
  updateJobsMetrics();
  updateJobsList();
}

function initJobDetailTabs() {
  const tabs = document.querySelectorAll("[data-job-detail-tab]");
  const panels = document.querySelectorAll("[data-job-detail-panel]");
  if (!tabs.length || !panels.length) return;
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.jobDetailTab;
      tabs.forEach((item) => item.classList.toggle("active", item === tab));
      panels.forEach((panel) => {
        panel.classList.toggle("is-hidden", panel.dataset.jobDetailPanel !== target);
      });
    });
  });
}

function initInboxWorkTabs() {
  const tabs = document.querySelectorAll("[data-inbox-work-tab]");
  const panels = document.querySelectorAll("[data-inbox-work-panel]");
  if (!tabs.length || !panels.length) return;
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.inboxWorkTab;
      tabs.forEach((item) => item.classList.toggle("active", item === tab));
      panels.forEach((panel) => {
        panel.classList.toggle("is-hidden", panel.dataset.inboxWorkPanel !== target);
      });
      refreshIcons();
    });
  });
}

function initMailboxConnectFlow() {
  const modal = document.querySelector("[data-mail-connect-modal]");
  if (!modal) return;

  const openButtons = document.querySelectorAll("[data-mail-connect-open]");
  const closeButtons = modal.querySelectorAll("[data-mail-connect-close]");
  const nextButtons = modal.querySelectorAll("[data-mail-next]");
  const prevButton = modal.querySelector("[data-mail-prev]");
  const stepButtons = modal.querySelectorAll("[data-mail-step]");
  const panels = modal.querySelectorAll("[data-mail-step-panel]");
  const statusButtons = document.querySelectorAll("[data-mail-connect-status]");
  let currentStep = 0;

  function renderStep() {
    stepButtons.forEach((button) => {
      const step = Number(button.dataset.mailStep);
      button.classList.toggle("active", step === currentStep);
      button.disabled = step > currentStep;
    });
    panels.forEach((panel) => {
      panel.classList.toggle("is-hidden", Number(panel.dataset.mailStepPanel) !== currentStep);
    });
    if (prevButton) prevButton.disabled = currentStep === 0;
    nextButtons.forEach((button) => {
      if (button.classList.contains("connect-oauth")) return;
      button.textContent = currentStep === panels.length - 2 ? "确认导入并开始同步" : currentStep === panels.length - 1 ? "完成" : "下一步";
    });
    refreshIcons();
  }

  function openModal() {
    currentStep = 0;
    modal.classList.remove("is-hidden");
    document.body.classList.add("modal-open");
    renderStep();
  }

  function closeModal() {
    modal.classList.add("is-hidden");
    document.body.classList.remove("modal-open");
  }

  openButtons.forEach((button) => button.addEventListener("click", openModal));
  closeButtons.forEach((button) => button.addEventListener("click", closeModal));
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.classList.contains("is-hidden")) closeModal();
  });
  nextButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (currentStep < panels.length - 1) {
        currentStep += 1;
        renderStep();
        return;
      }
      closeModal();
      statusButtons.forEach((connectButton) => {
        connectButton.innerHTML = '<i data-lucide="check"></i> 邮箱已连接';
        connectButton.classList.remove("primary-button");
        connectButton.classList.add("ai-button");
      });
      refreshIcons();
    });
  });
  if (prevButton) {
    prevButton.addEventListener("click", () => {
      currentStep = Math.max(0, currentStep - 1);
      renderStep();
    });
  }
  stepButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetStep = Number(button.dataset.mailStep);
      if (targetStep <= currentStep) {
        currentStep = targetStep;
        renderStep();
      }
    });
  });
}

function initJobCreateFlow() {
  const modal = document.querySelector("[data-job-create-modal]");
  if (!modal) return;

  const openButtons = document.querySelectorAll("[data-job-create-open]");
  const closeButtons = modal.querySelectorAll("[data-job-create-close]");
  const nextButton = modal.querySelector("[data-job-next]");
  const prevButton = modal.querySelector("[data-job-prev]");
  const stepButtons = modal.querySelectorAll("[data-job-step]");
  const panels = modal.querySelectorAll("[data-job-step-panel]");
  let currentStep = 0;

  function renderStep() {
    stepButtons.forEach((button) => {
      const step = Number(button.dataset.jobStep);
      button.classList.toggle("active", step === currentStep);
      button.disabled = step > currentStep;
    });
    panels.forEach((panel) => {
      panel.classList.toggle("is-hidden", Number(panel.dataset.jobStepPanel) !== currentStep);
    });
    if (prevButton) prevButton.disabled = currentStep === 0;
    if (nextButton) {
      nextButton.textContent = currentStep === panels.length - 1 ? "保存草稿" : currentStep === 1 ? "让 AI 生成模板" : "下一步";
    }
    refreshIcons();
  }

  function openModal() {
    currentStep = 0;
    modal.classList.remove("is-hidden");
    document.body.classList.add("modal-open");
    renderStep();
  }

  function closeModal() {
    modal.classList.add("is-hidden");
    document.body.classList.remove("modal-open");
  }

  openButtons.forEach((button) => button.addEventListener("click", openModal));
  closeButtons.forEach((button) => button.addEventListener("click", closeModal));
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.classList.contains("is-hidden")) closeModal();
  });
  if (nextButton) {
    nextButton.addEventListener("click", () => {
      if (currentStep < panels.length - 1) {
        currentStep += 1;
        renderStep();
        return;
      }
      closeModal();
    });
  }
  if (prevButton) {
    prevButton.addEventListener("click", () => {
      currentStep = Math.max(0, currentStep - 1);
      renderStep();
    });
  }
  stepButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetStep = Number(button.dataset.jobStep);
      if (targetStep <= currentStep) {
        currentStep = targetStep;
        renderStep();
      }
    });
  });
}

setSidebarState(localStorage.getItem("hireos-sidebar-collapsed") === "true", false);
applyLanguage(localStorage.getItem("hireos-language-v2") || "zh");
initJobsFilters();
initJobDetailTabs();
initInboxWorkTabs();
initMailboxConnectFlow();
initJobCreateFlow();
refreshIcons();
