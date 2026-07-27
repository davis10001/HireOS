

AI 作为贯穿整个招聘生命周期的智能中枢（AI Recruitment Intelligence Layer），所有人的操作、反馈、沟通、决策都会沉淀到 AI 可理解的数据结构中。
# 一、整体产品形态
AI-Native Recruitment Operating System
![[Pasted image 20260727204034.png]]
# 二、端到端招聘流程MVP

| 阶段（中文说明）                                  | 类型             | 邮件来源          | 人做什么                         | AI做什么                               | 产生数据                                     | 数据统计                 |
| ----------------------------------------- | -------------- | ------------- | ---------------------------- | ----------------------------------- | ---------------------------------------- | -------------------- |
| 🟢 Create Job & Hiring Request（创建职位与招聘需求） | Human + AI     | ❌ 非邮件（系统输入）   | Founder / HR 输入岗位需求、职责、预算、要求 | AI理解需求，生成JD、岗位画像、筛选标准               | Job Profile、JD、Hiring Criteria           | 岗位数量、需求修改次数          |
| 🟢 Configure Hiring Flow（配置招聘流程）          | Human + AI     | ❌ 非邮件（系统配置）   | HR / Founder 设置面试流程、参与人、负责人  | AI推荐流程模板、生成Interview Plan           | Hiring Workflow、Stages、Interviewers      | 招聘流程类型、平均轮次          |
| 🟢 Connect HR Email（绑定招聘邮箱）               | Human Required | ✅ 邮件基础入口      | HR授权招聘邮箱接入                   | AI建立邮箱读取规则、识别招聘邮件                   | Email Connection、Permission              | 邮箱数量、邮件量             |
| 🟢 AI Email Intake（AI读取候选人邮件）             | AI Required    | ✅ 必须          | HR确认异常情况                     | AI读取CV邮件、附件、发件人信息，创建候选人，匹配岗位        | Candidate Profile、CV、Source、Email Thread | CV数量、来源、自动匹配准确率      |
| 🟢 Candidate Pipeline（候选人状态管理）            | Human + AI     | ✅ 状态变化来自邮件+人工 | HR确认状态、调整负责人、处理异常            | AI根据邮件内容自动判断状态变化                    | Candidate Status、Owner、Timeline          | 候选人数量、停留时间、Blocked数量 |
| Interview Scheduling（面试安排）                | Human + AI     | ✅ 必须          | HR通过邮件确认时间、面试官安排             | AI识别邮件中的时间、人员、岗位，自动更新Interview状态    | Interview Schedule、Participants          | 面试安排时间、改期次数          |
| Interview Preparation（面试准备）               | Human + AI     | ❌ 数据来自系统+历史邮件 | 面试官确认重点                      | AI读取CV、岗位、历史沟通，生成问题和Interview Brief | Interview Plan、Question Set              | 问题采纳率                |
| 🟢 Interview Feedback（面试反馈）               | Human + AI     | ✅ 推荐邮件入口      | 面试官发送反馈邮件或系统填写               | AI读取反馈内容，提取评分、证据、风险                 | Interview Feedback、Evidence              | 反馈及时率、通过率            |
| 🟢 Assessment（出题与测试）                      | Human + AI     | ✅ 部分必须        | HR发送测试，Founder确认结果           | AI生成题目、Rubric，读取候选人提交邮件附件，分析答案      | Assessment、Submission、Score              | 完成率、评估时间             |
| 🟢 Founder Decision（创始人决策）                | Human + AI     | ❌ 系统决策        | Founder查看信息并决定下一步            | AI汇总邮件、面试、测试记录，生成Decision Card      | Decision Record                          | 决策时间、录用率             |
| Offer（Offer沟通）                            | Human + AI     | ✅ 必须          | HR发送Offer、谈薪、确认条件            | AI读取候选人回复，识别接受/拒绝/风险                | Offer Record、Negotiation History         | Offer接受率             |


## 核心问题与产品化方案

| 核心问题      | 当前表现                                         | 产品化方案                                                          | 对应模块/机制                                    |
| --------- | -------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------ |
| 招聘漏斗不可见   | 不知道每个岗位有多少人进入筛选、面试、Assessment、Offer Decision | 建立岗位级招聘漏斗，实时展示各阶段人数和转化                                         | Dashboard / Jobs / Analytics               |
| 收了多少 CV？  | CV 分散在邮箱、文件夹、表格里，无法统计总量和岗位归属                 | 建立统一 CV Intake，记录来源、岗位、收集人、日期、是否重复                             | CV Intake / Candidate / Application        |
| 哪些渠道有效？   | 只能看到渠道带来多少简历，看不到后续质量                         | 保留 Source Attribution，追踪从 CV 到 Offer Decision 的转化              | Source Attribution / Analytics             |
| 现在招聘到哪一步？ | 状态分散在 HR 记忆、聊天记录、邮件里                         | 用 Application Pipeline 统一候选人在岗位流程中的状态                          | Application Pipeline / Jobs / Applications |
| 候选人状态混乱   | 同一个候选人可能关联多个岗位，流程记录混在一起                      | 用 Candidate + Job + Application 三层模型区分人、岗位和流程                  | Candidate / Job / Application              |
| 人在哪里？     | 不知道候选人是在等 HR、Founder、候选人提交，还是已暂停/拒绝          | 每个 Application 必须有 Current State，并支持按状态筛选                      | Current State / Application                |
| 谁负责？      | 卡住时不知道该 HR、Founder、候选人还是面试官行动                | 使用 Current Owner + Process Owner 双层责任模型                        | Current Owner / Process Owner              |
| 下一步是什么？   | 只显示 Pending、Reviewing 等抽象状态，不知道具体动作          | 每个 Application 必须有具体 Next Action，AI 可推荐下一步                     | Next Action / Next-Step Recommendation     |
| 卡在哪里？     | 候选人长时间停滞后才被发现，高价值候选人可能流失                     | 用 SLA、Due Date、Last Activity 自动识别 Due Soon / Overdue / Blocked | Blocked / SLA / Due Date / Alerts          |
|           |                                              |                                                                |                                            |
