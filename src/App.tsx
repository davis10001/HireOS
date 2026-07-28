import { FormEvent, ReactNode, useEffect, useState } from "react";
import {
  Activity,
  Archive,
  ArrowLeft,
  Bell,
  BriefcaseBusiness,
  ChartNoAxesCombined,
  ChevronUp,
  FilePenLine,
  Inbox,
  Layers3,
  LayoutDashboard,
  LogOut,
  OctagonAlert,
  PanelLeftClose,
  PanelRightClose,
  PauseCircle,
  Plus,
  Save,
  SendHorizontal,
  Settings,
  Sparkles,
  UserRound,
  UsersRound,
  X
} from "lucide-react";
import {
  AuthSession,
  clearAuthState,
  createSession,
  loadAuthState,
  saveAuthState,
  validateLogin
} from "./domain/auth";
import {
  Job,
  JobDraft,
  JobStatus,
  buildJobMetrics,
  createEmptyJobDraft,
  createJobFromDraft,
  generateJobDraft,
  seedJobs,
  validateJobStep
} from "./domain/jobs";
import "./styles.css";

type RouteId =
  | "dashboard"
  | "jobs"
  | "job-detail"
  | "inbox"
  | "inbox-detail"
  | "email-agent"
  | "applications"
  | "application-detail"
  | "candidates"
  | "assessments"
  | "founder-inbox"
  | "blocked"
  | "analytics"
  | "settings"
  | "settings-mailbox";

type ShellNavRoute = "dashboard" | "jobs" | "inbox" | "analytics" | "settings";
type PlaceholderRoute = Exclude<RouteId, "dashboard" | "jobs" | "job-detail">;

const JOBS_KEY = "hireos.jobs";

const placeholderLabels: Record<PlaceholderRoute, string> = {
  "application-detail": "Application Detail",
  applications: "Applications",
  assessments: "Assessments",
  blocked: "Blocked",
  "email-agent": "Email Agent",
  "founder-inbox": "Founder Inbox",
  inbox: "Inbox",
  "inbox-detail": "Inbox Detail",
  candidates: "Candidates",
  analytics: "Analytics",
  settings: "Settings",
  "settings-mailbox": "Settings Mailbox"
};

type AgentContext = {
  recommendation: string;
  evidence: Array<{ label: string; value: string }>;
  ask: string;
  approveLabel?: string;
  reviewLabel?: string;
};
type PlaceholderRow = { item: string; state: string; owner: string; action: string; sla: string; note: string; warn?: boolean };
type PlaceholderModule = { title: string; detail: string; rows: PlaceholderRow[] };

export default function App() {
  const [session, setSession] = useState<AuthSession | null>(() => loadAuthState());
  const [route, setRoute] = useState<RouteId>(() => readRouteFromLocation().route);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(() => readRouteFromLocation().jobId);
  const [jobs, setJobs] = useState<Job[]>(loadJobs);

  useEffect(() => {
    saveJobs(jobs);
  }, [jobs]);

  useEffect(() => {
    const onPopState = () => {
      const next = readRouteFromLocation();
      setRoute(next.route);
      setSelectedJobId(next.jobId);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  function navigate(routeId: RouteId, jobId?: string) {
    window.history.pushState({}, "", routeToPath(routeId, jobId));
    setRoute(routeId);
    setSelectedJobId(jobId ?? null);
  }

  if (!session) {
    return (
      <LoginPage
        onLogin={(nextSession) => {
          saveAuthState(nextSession);
          setSession(nextSession);
          if (window.location.pathname === "/" || window.location.pathname === "/login") {
            navigate("dashboard");
          }
        }}
      />
    );
  }

  const selectedJob = jobs.find((job) => job.id === selectedJobId);
  const agentContext = buildAgentContext(route, selectedJob);

  return (
    <AppShell
      activeRoute={shellActiveRoute(route)}
      agentContext={agentContext}
      agentTitle={route === "job-detail" ? "Job AI Workspace" : route === "jobs" ? "岗位 Agent" : "HireOS Agent"}
      agentSubtitle={route === "job-detail" ? "Role setup and workflow checks" : route === "jobs" ? "流程与 Scorecard 设置" : "Workflow and evidence"}
      onNavigate={(nextRoute) => navigate(nextRoute)}
      onSignOut={() => {
        clearAuthState();
        setSession(null);
        window.history.pushState({}, "", "/login");
        setRoute("dashboard");
        setSelectedJobId(null);
      }}
      session={session}
    >
      {route === "dashboard" ? <DashboardPage /> : null}
      {route === "jobs" ? (
        <JobsPage
          jobs={jobs}
          onCreateJob={(job) => setJobs((current) => [job, ...current])}
          onOpenJob={(jobId) => {
            navigate("job-detail", jobId);
          }}
        />
      ) : null}
      {route === "job-detail" ? (
        <JobDetailPage job={selectedJob} onBack={() => navigate("jobs")} />
      ) : null}
      {isPlaceholderRoute(route) ? <PlaceholderPage route={route} title={placeholderLabels[route]} /> : null}
    </AppShell>
  );
}

function LoginPage({ onLogin }: { onLogin: (session: AuthSession) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  function submit(event: FormEvent) {
    event.preventDefault();
    const result = validateLogin(email, password);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    onLogin(createSession(email.trim()));
  }

  return (
    <main className="login-page">
      <section className="login-panel" aria-label="HireOS login">
        <div className="login-brand">
          <div className="brand-mark">H</div>
          <div>
            <strong>HireOS</strong>
            <span>AI Hiring Operating System</span>
          </div>
        </div>
        <div className="login-copy">
          <h1>Sign in to HireOS</h1>
          <p>Access the recruiting operating shell, Jobs workspace, and AI-assisted workflow checks.</p>
        </div>
        <form className="login-form" onSubmit={submit}>
          <label className="form-field">
            <span>Email</span>
            <input
              aria-invalid={Boolean(errors.email)}
              autoComplete="email"
              onChange={(event) => setEmail(event.target.value)}
              value={email}
            />
            {errors.email ? <small className="form-error">{errors.email}</small> : null}
          </label>
          <label className="form-field">
            <span>Password</span>
            <input
              aria-invalid={Boolean(errors.password)}
              autoComplete="current-password"
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              value={password}
            />
            {errors.password ? <small className="form-error">{errors.password}</small> : null}
          </label>
          <button className="primary-button login-submit" type="submit">
            Sign in
          </button>
        </form>
      </section>
    </main>
  );
}

function AppShell({
  activeRoute,
  agentContext,
  agentTitle,
  agentSubtitle,
  children,
  onNavigate,
  onSignOut,
  session
}: {
  activeRoute: ShellNavRoute;
  agentContext: AgentContext;
  agentTitle: string;
  agentSubtitle: string;
  children: ReactNode;
  onNavigate: (route: ShellNavRoute) => void;
  onSignOut: () => void;
  session: AuthSession;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [agentCollapsed, setAgentCollapsed] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [dockOpen, setDockOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("sidebar-collapsed", sidebarCollapsed);
    document.body.classList.toggle("agent-collapsed", agentCollapsed);
    document.body.classList.toggle("dock-expanded", dockOpen);
    return () => {
      document.body.classList.remove("sidebar-collapsed", "agent-collapsed", "dock-expanded");
    };
  }, [sidebarCollapsed, agentCollapsed, dockOpen]);

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="主导航">
        <div className="brand">
          <button className="brand-mark sidebar-logo-toggle" aria-label="HireOS" title="HireOS" type="button">H</button>
          <div className="brand-copy"><strong>HireOS</strong><span>AI Hiring Operating System</span></div>
          <button className="icon-button sidebar-toggle" aria-label="收起侧边栏" title="收起侧边栏" type="button" onClick={() => setSidebarCollapsed((value) => !value)}>
            <PanelLeftClose aria-hidden="true" />
          </button>
        </div>

        <div className="nav-section">Operate</div>
        <nav className="nav">
          <NavButton active={activeRoute === "dashboard"} icon={<LayoutDashboard />} label="Dashboard" onClick={() => onNavigate("dashboard")} />
          <NavButton active={activeRoute === "jobs"} count="12" icon={<BriefcaseBusiness />} label="Jobs" onClick={() => onNavigate("jobs")} />
          <NavButton active={activeRoute === "inbox"} count="76" icon={<Inbox />} label="Inbox" onClick={() => onNavigate("inbox")} />
        </nav>
        <div className="nav-section">Intelligence</div>
        <nav className="nav">
          <NavButton active={activeRoute === "analytics"} icon={<ChartNoAxesCombined />} label="Analytics" onClick={() => onNavigate("analytics")} />
          <NavButton active={activeRoute === "settings"} icon={<Settings />} label="Settings" onClick={() => onNavigate("settings")} />
        </nav>
        <div className="sidebar-footer">
          <div className="user-status" aria-expanded={accountOpen} role="button" tabIndex={0}>
            <div className="avatar">LT</div>
            <div className="user-copy"><strong>{session.name}</strong><span><b /> Online · {session.role}</span></div>
            <button className="account-toggle" aria-label="Account menu" title="Account menu" type="button" onClick={() => setAccountOpen((value) => !value)}>
              <ChevronUp aria-hidden="true" />
            </button>
          </div>
          <div className={`account-menu ${accountOpen ? "is-open" : ""}`}>
            <button type="button"><UserRound aria-hidden="true" /> Profile</button>
            <button type="button"><Bell aria-hidden="true" /> Notifications</button>
            <div className="language-switch" aria-label="语言切换"><span>Language</span><div><button className="active" type="button">EN</button><button type="button">中文</button></div></div>
            <button type="button" onClick={onSignOut}><LogOut aria-hidden="true" /> Sign out</button>
          </div>
        </div>
      </aside>

      <main className="main">{children}</main>

      <aside className="agent" aria-label="Agent 对话区">
        <header className="agent-header">
          <div className="agent-title"><div className="agent-orb"><Sparkles aria-hidden="true" /></div><div><strong>{agentTitle}</strong><span>{agentSubtitle}</span></div></div>
          <button className="icon-button agent-toggle" aria-label="收起 Agent" title="收起 Agent" type="button" onClick={() => setAgentCollapsed((value) => !value)}>
            <PanelRightClose aria-hidden="true" />
          </button>
        </header>
        <div className="agent-body">
          <section className="agent-card ai">
            <h3>推荐设置</h3>
            <p>{agentContext.recommendation}</p>
            <div className="evidence-list">
              {agentContext.evidence.map((item) => (
                <div className="evidence-item" key={item.label}><span>{item.label}</span><strong>{item.value}</strong></div>
              ))}
            </div>
            <div className="agent-actions"><button className="approve">{agentContext.approveLabel ?? "应用"}</button><button className="review">{agentContext.reviewLabel ?? "审核"}</button></div>
          </section>
          <section className="agent-card"><h3>提问</h3><p>{agentContext.ask}</p></section>
        </div>
        <footer className="agent-compose"><div className="compose-box"><input aria-label="向 Agent 提问" placeholder="询问岗位设置..." /><button className="icon-button" aria-label="发送"><SendHorizontal aria-hidden="true" /></button></div></footer>
      </aside>

      <div className={`agent-dock ${dockOpen ? "expanded" : ""}`} aria-label="Agent 快捷输入">
        <button className="agent-dock-bar" type="button" onClick={() => setDockOpen((value) => !value)}>
          <Sparkles aria-hidden="true" />
          <span>Ask HireOS Agent about this page...</span>
          <SendHorizontal aria-hidden="true" />
        </button>
        <div className="agent-dock-prompts">
          <button type="button">Summarize risks</button>
          <button type="button">Suggest next action</button>
          <button type="button">Show evidence gaps</button>
        </div>
      </div>
    </div>
  );
}

function NavButton({ active, count, icon, label, onClick }: { active: boolean; count?: string; icon: ReactNode; label: string; onClick: () => void }) {
  return (
    <button aria-label={label} className={`nav-item ${active ? "active" : ""}`} onClick={onClick} type="button">
      {icon}
      <span>{label}</span>
      {count ? <span className="count">{count}</span> : null}
    </button>
  );
}

function DashboardPage() {
  return (
    <>
      <header className="topbar">
        <div className="page-title"><h1>Dashboard</h1><p>Hiring operations overview and AI risk recommendations.</p></div>
      </header>
      <section className="page-content">
        <section className="metric-grid">
          <Metric label="Active Jobs" value="12" detail="8 configured roles" />
          <Metric label="Needs Review" value="76" detail="Inbox and workflow items" />
          <Metric label="Blocked" value="6" detail="Owner or SLA gaps" warning />
        </section>
        <section className="unframed-section">
          <div className="panel-header"><div><h2>Operations Workbench</h2><p>Placeholder shell content preserved for the Dashboard route.</p></div></div>
        </section>
        <section className="content-grid">
          <section className="panel">
            <div className="panel-header"><div><h2>Activity Timeline</h2><p>Recent recruiting operations events stay in the Dashboard hierarchy.</p></div></div>
            <div className="timeline">
              <TimelineStep index="09:10" title="Job created" detail="Senior Backend Engineer configuration reviewed" status="Done" />
              <TimelineStep index="10:30" title="Workflow check" detail="Platform Engineer still needs SLA defaults" status="Risk" warn />
            </div>
          </section>
          <section className="panel">
            <div className="panel-header"><div><h2>Risk Recommendations</h2><p>Dashboard-level AI recommendations remain separate from module detail work.</p></div></div>
            <div className="cards"><div className="work-card"><div className="card-top"><div className="card-copy"><strong>Resolve workflow gaps</strong><span>Confirm owner and SLA defaults before opening more job intake.</span></div><span className="pill warn">Review</span></div></div></div>
          </section>
        </section>
      </section>
    </>
  );
}

function JobsPage({ jobs, onCreateJob, onOpenJob }: { jobs: Job[]; onCreateJob: (job: Job) => void; onOpenJob: (jobId: string) => void }) {
  const [statusFilter, setStatusFilter] = useState<JobStatus | "all">("all");
  const [modalOpen, setModalOpen] = useState(false);
  const metrics = buildJobMetrics(jobs);
  const filteredJobs = statusFilter === "all" ? jobs : jobs.filter((job) => job.status === statusFilter);

  return (
    <>
      <header className="topbar">
        <div className="page-title"><h1>Jobs</h1><p>岗位状态、岗位 Tag、岗位成员、招聘流程和岗位级统计。</p></div>
        <div className="top-actions"><button className="primary-button" onClick={() => setModalOpen(true)} type="button"><Plus aria-hidden="true" /> New Job</button></div>
      </header>
      <section className="page-content">
        <section className="filter-strip" aria-label="岗位筛选">
          <div className="filter-row">
            <div className="filter-label">岗位筛选</div>
            <div className="filter-options" aria-label="岗位状态筛选">
              <FilterChip active={statusFilter === "all"} icon={<Layers3 />} label="全部状态" onClick={() => setStatusFilter("all")} />
              <FilterChip active={statusFilter === "active"} icon={<Activity />} label="活跃" onClick={() => setStatusFilter("active")} />
              <FilterChip active={statusFilter === "paused"} icon={<PauseCircle />} label="暂停" onClick={() => setStatusFilter("paused")} />
              <FilterChip active={statusFilter === "draft"} icon={<FilePenLine />} label="草稿" onClick={() => setStatusFilter("draft")} />
              <FilterChip active={statusFilter === "closed"} icon={<Archive />} label="已关闭" onClick={() => setStatusFilter("closed")} />
            </div>
          </div>
          <div className="filter-row">
            <div className="filter-label">岗位：</div>
            <div className="filter-options" aria-label="岗位 Tag 筛选">
              <FilterChip active icon={<BriefcaseBusiness />} label="All 岗位" onClick={() => undefined} />
              {jobs.slice(0, 4).map((job) => <FilterChip key={job.id} icon={<BriefcaseBusiness />} label={job.title} onClick={() => undefined} />)}
            </div>
          </div>
        </section>
        <section className="metric-grid">
          <Metric label="Active Jobs" value={String(metrics.active)} detail={`${metrics.total} total roles`} />
          <Metric label="Paused Jobs" value={String(metrics.paused)} detail="Not receiving auto matches" />
          <Metric label="JD Drafts" value={String(metrics.draft)} detail="Need confirmation" />
          <Metric label="Workflow Gaps" value={String(metrics.blocked)} detail="Scorecard or SLA incomplete" warning />
        </section>
        <section className="unframed-section">
          <div className="panel-header"><div><h2>岗位列表</h2><p>Job Pipeline keeps owner, status, headcount, and candidate counts in the original table container.</p></div></div>
          <div className="table jobs-table">
            <div className="table-row header"><span>岗位名</span><span>状态</span><span>招聘经理</span><span>岗位人数</span><span>候选人数量</span></div>
            {filteredJobs.map((job) => (
              <div className="table-row" key={job.id}>
                <div className="cell-main"><strong>{job.title}</strong><span>{job.department} · {job.employmentType}</span></div>
                <span className={`pill ${job.status === "active" ? "green" : job.status === "paused" ? "warn" : ""}`}>{statusLabel(job.status)}</span>
                <span>{job.owner}</span>
                <span>0/{job.headcount}</span>
                <span>{job.applicationsCount}</span>
                <button className="ghost-button row-action" type="button" onClick={() => onOpenJob(job.id)}>Open {job.title}</button>
              </div>
            ))}
          </div>
          {filteredJobs.length === 0 ? <div className="empty-state">当前筛选条件下没有岗位。</div> : null}
        </section>
      </section>
      {modalOpen ? <JobCreateModal onClose={() => setModalOpen(false)} onCreate={(job) => { onCreateJob(job); setModalOpen(false); }} /> : null}
    </>
  );
}

function JobCreateModal({ onClose, onCreate }: { onClose: () => void; onCreate: (job: Job) => void }) {
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
  const [draft, setDraft] = useState<JobDraft>(() => ({
    ...createEmptyJobDraft(),
    title: "Senior Data Engineer",
    department: "Data Platform",
    location: "Ho Chi Minh · Hybrid",
    owner: "Linh Tran",
    headcount: 2
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});

  function next() {
    const stepErrors = validateJobStep(step, draft);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length) return;
    setStep((current) => Math.min(3, current + 1) as 0 | 1 | 2 | 3);
  }

  function update<K extends keyof JobDraft>(key: K, value: JobDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="modal-backdrop" data-job-create-modal>
      <div className="mail-connect-modal job-create-modal" role="dialog" aria-modal="true" aria-labelledby="job-create-title">
        <header className="modal-header">
          <div><h2 id="job-create-title">新建岗位</h2><p>创建岗位、输入招聘需求，由 AI 生成招聘模板、流程和 Scorecard，再由人编辑确认。</p></div>
          <button className="icon-button" type="button" aria-label="关闭" onClick={onClose}><X aria-hidden="true" /></button>
        </header>
        <div className="connect-steps job-create-steps" aria-label="新建岗位步骤">
          {["Create job", "Enter requirements", "AI generate", "Edit and confirm"].map((label, index) => (
            <button aria-label={`${index + 1} ${label}`} className={`connect-step ${step === index ? "active" : ""}`} key={label} type="button" onClick={() => setStep(index as 0 | 1 | 2 | 3)}>
              <span>{index + 1}</span>{label}
            </button>
          ))}
        </div>
        <div className="connect-panels">
          {step === 0 ? (
            <section className="connect-panel">
              <div className="job-form-grid">
                <FormInput label="Job title" value={draft.title} onChange={(value) => update("title", value)} error={errors.title} />
                <FormInput label="Department" value={draft.department} onChange={(value) => update("department", value)} error={errors.department} />
                <FormInput label="Location" value={draft.location} onChange={(value) => update("location", value)} error={errors.location} />
                <label className="form-field"><span>Employment type</span><select aria-label="Employment type" value={draft.employmentType} onChange={(event) => update("employmentType", event.target.value)}><option>Full-time</option><option>Contract</option><option>Part-time</option></select></label>
                <label className="form-field"><span>Headcount</span><input aria-label="Headcount" type="number" min="1" value={draft.headcount} onChange={(event) => update("headcount", Number(event.target.value))} /></label>
                <label className="form-field"><span>Status</span><select aria-label="Status" value={draft.status} onChange={(event) => update("status", event.target.value as JobStatus)}><option value="draft">Draft</option><option value="active">Active</option><option value="paused">Paused</option></select></label>
              </div>
              <div className="rule-note"><strong>状态规则</strong><span>新岗位默认保存为草稿。只有 JD、招聘流程、负责人默认值、SLA 和 Scorecard 经过确认后，才允许开启邮件自动匹配。</span></div>
            </section>
          ) : null}
          {step === 1 ? (
            <section className="connect-panel">
              <div className="job-form-grid">
                <label className="form-field wide"><span>Requirements</span><textarea aria-label="Requirements" rows={4} value={draft.requirements} onChange={(event) => update("requirements", event.target.value)} /></label>
                {errors.requirements ? <small className="form-error">{errors.requirements}</small> : null}
                <FormInput label="Must-have skills" value={draft.mustHaveSkills} onChange={(value) => update("mustHaveSkills", value)} />
                <FormInput label="Nice-to-have skills" value={draft.niceToHaveSkills} onChange={(value) => update("niceToHaveSkills", value)} />
                <FormInput label="Salary range" value={draft.salaryRange} onChange={(value) => update("salaryRange", value)} />
                <FormInput label="Owner" value={draft.owner} onChange={(value) => update("owner", value)} />
              </div>
              <div className="rule-note"><strong>人负责输入真实约束</strong><span>岗位需求在创建时必须填写，后续可以修改，并保留需求变更记录。</span></div>
            </section>
          ) : null}
          {step === 2 ? (
            <section className="connect-panel">
              <div className="generated-layout">
                {(draft.scorecard.length ? draft.scorecard : ["JD draft pending", "Workflow template pending", "Scorecard pending"]).map((item) => (
                  <article className="generated-card" key={item}><h3>{item.startsWith("AI generated") ? "AI generated scorecard" : item}</h3><p>{draft.generatedSummary || "Generate AI output from the role requirements before confirmation."}</p><span className="pill green">AI 生成</span></article>
                ))}
              </div>
              <div className="rule-note"><strong>AI 负责生成可编辑模板</strong><span>AI 根据岗位目标和需求生成 JD、流程、测评计划和 Scorecard，但不会直接发布岗位。</span></div>
            </section>
          ) : null}
          {step === 3 ? (
            <section className="connect-panel">
              <label className="form-field wide">
                <span>Final summary</span>
                <textarea aria-label="Final summary" rows={4} value={draft.generatedSummary} onChange={(event) => update("generatedSummary", event.target.value)} />
              </label>
              <label className="form-field">
                <span>Final status</span>
                <select aria-label="Final status" value={draft.status} onChange={(event) => update("status", event.target.value as JobStatus)}>
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                </select>
              </label>
              <div className="approval-checklist">
                <label><input type="checkbox" defaultChecked /> JD confirmed</label>
                <label><input type="checkbox" defaultChecked /> Hiring workflow confirmed</label>
                <label><input type="checkbox" defaultChecked /> Owners and SLA confirmed</label>
                <label><input type="checkbox" /> Scorecard needs hiring manager review</label>
              </div>
              <div className="connect-done"><div className="done-icon"><BriefcaseBusiness aria-hidden="true" /></div><h3>岗位将保存为 {draft.status}</h3><p>保存后进入岗位详情页继续编辑。确认所有流程纪律后，再切换为活跃状态。</p></div>
            </section>
          ) : null}
        </div>
        <footer className="modal-footer">
          <button className="ghost-button" type="button" onClick={onClose}>取消</button>
          <span className="footer-spacer" />
          <button className="ghost-button" type="button" onClick={() => setStep((current) => Math.max(0, current - 1) as 0 | 1 | 2 | 3)}>上一步</button>
          {step === 2 ? <button className="primary-button" type="button" onClick={() => setDraft((current) => generateJobDraft(current))}>Generate</button> : null}
          {step < 3 ? <button className="primary-button" type="button" onClick={next}>Next</button> : <button className="primary-button" type="button" onClick={() => onCreate(createJobFromDraft(draft))}>Create Job</button>}
        </footer>
      </div>
    </div>
  );
}

function JobDetailPage({ job, onBack }: { job?: Job; onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<"candidates" | "details">("candidates");

  if (!job) {
    return (
      <>
        <header className="topbar"><div className="title-with-back"><button className="icon-button" aria-label="Back icon to Jobs" type="button" onClick={onBack}><ArrowLeft aria-hidden="true" /></button><div className="page-title"><h1>Job not found</h1><p>The selected job could not be loaded.</p></div></div></header>
        <section className="page-content"><section className="unframed-section"><button className="primary-button" type="button" onClick={onBack}>Back to Jobs</button></section></section>
      </>
    );
  }

  return (
    <>
      <header className="topbar">
        <div className="title-with-back"><button className="icon-button" aria-label="返回岗位列表" title="返回岗位列表" type="button" onClick={onBack}><ArrowLeft aria-hidden="true" /></button><div className="page-title"><h1>{job.title}</h1><p>岗位详情：状态、需求、邮箱匹配规则和候选人。</p></div></div>
        <div className="top-actions"><button className="ghost-button"><PauseCircle aria-hidden="true" /> 暂停岗位</button><button className="primary-button"><Save aria-hidden="true" /> 保存岗位</button></div>
      </header>
      <section className="page-content">
        <div className="secondary-tabs">
          <button className={`secondary-tab ${activeTab === "candidates" ? "active" : ""}`} type="button" onClick={() => setActiveTab("candidates")}><UsersRound aria-hidden="true" /> 候选人</button>
          <button className={`secondary-tab ${activeTab === "details" ? "active" : ""}`} type="button" onClick={() => setActiveTab("details")}><BriefcaseBusiness aria-hidden="true" /> 岗位详情</button>
        </div>
        <section className={`unframed-section ${activeTab === "candidates" ? "" : "is-hidden"}`} data-job-detail-panel="candidates">
          <div className="panel-header"><div><h2>候选人成员列表</h2><p>当前岗位下的候选人、流程状态、负责人和下一步动作</p></div></div>
          <div className="table apps-table">
            <div className="table-row header"><span>候选人</span><span>状态</span><span>负责人</span><span>下一步</span><span>SLA</span></div>
            <button className="table-row table-row-button" type="button"><div className="cell-main"><strong>Trang Nguyen</strong><span>7 个证据事件 · 1 个测评</span></div><span>创始人审核</span><span>Founder</span><span>批准终面</span><span className="pill warn">今天</span></button>
            <div className="table-row"><div className="cell-main"><strong>Anh Le</strong><span>面试反馈混合 · 存在证据缺口</span></div><span>面试</span><span>Mai Ho</span><span>收集反馈</span><span className="pill danger">逾期</span></div>
            <div className="table-row"><div className="cell-main"><strong>Minh Pham</strong><span>Offer 证据完整</span></div><span>Offer 决策</span><span>Founder</span><span>决策</span><span className="pill green">就绪</span></div>
          </div>
        </section>
        <section className={`detail-grid ${activeTab === "details" ? "" : "is-hidden"}`} data-job-detail-panel="details">
          <div className="detail-stack">
            <section className="panel"><div className="panel-header"><div><h2>招聘需求</h2><p>创建岗位时填写，后续可修改并保留变更记录</p></div></div><div className="settings-grid"><article className="config-card"><h3>岗位目标</h3><p>{job.requirements}</p><div className="config-meta"><span className="pill green">创始人已确认</span><span className="pill">{job.location}</span></div></article><article className="config-card"><h3>预算与级别</h3><p>{job.salaryRange || "高级个人贡献者，5 年以上经验，越南薪资带，要求英文协作。"}</p><div className="config-meta"><span className="pill">{job.department}</span><span className="pill">{job.employmentType}</span></div></article></div></section>
            <section className="panel"><div className="panel-header"><div><h2>已配置流程</h2><p>每个申请都会继承阶段、负责人、下一步和 SLA</p></div></div><div className="timeline"><TimelineStep index="01" title="HR 审核" detail="负责人：Linh · SLA：1 个工作日 · 验证基础匹配" status="就绪" /><TimelineStep index="02" title="技术面试" detail="负责人：技术负责人 · 证据：架构、调试、沟通" status="就绪" /><TimelineStep index="03" title="测评" detail="负责人：HR + 技术负责人 · 评分标准待审核" status="审核" warn /><TimelineStep index="04" title="创始人决策" detail="创始人查看完整证据、缺口和异常流程历史" status="就绪" /></div></section>
          </div>
          <section className="panel"><div className="panel-header"><div><h2>邮件匹配规则</h2><p>邮箱数据如何进入该岗位</p></div></div><div className="cards"><div className="work-card"><div className="card-top"><div className="card-copy"><strong>允许自动匹配</strong><span>只有活跃岗位会接收招聘邮箱中的高置信度 CV 匹配。</span></div><span className="pill green">On</span></div></div><div className="work-card"><div className="card-top"><div className="card-copy"><strong>匹配置信度阈值</strong><span>候选人、岗位和附件证据超过 85% 后才可自动创建申请。</span></div><span className="pill">85%</span></div></div><div className="work-card"><div className="card-top"><div className="card-copy"><strong>低置信度兜底</strong><span>模糊 CV 进入待办箱由 HR 确认，而不是静默创建数据。</span></div><span className="pill warn">待办箱</span></div></div></div></section>
        </section>
      </section>
    </>
  );
}

function PlaceholderPage({ route, title }: { route: PlaceholderRoute; title: string }) {
  const modules = placeholderModules(route);
  const metrics = placeholderMetrics(route);

  return (
    <>
      <header className="topbar"><div className="page-title"><h1>{title}</h1><p>{placeholderIntro(route)}</p></div></header>
      <section className="page-content">
        <section className="unframed-section">
          <div className="panel-header"><div><h2>{title} workspace</h2><p>原型页面层级保留为静态承载区，深层业务留给后续模块实现。</p></div></div>
          <div className="secondary-tabs">{placeholderTabs(route).map((tab, index) => <button className={`secondary-tab ${index === 0 ? "active" : ""}`} key={tab} type="button">{tab}</button>)}</div>
          <div className="placeholder-actions">{placeholderDrilldowns(route).map((target) => <button className="ghost-button" key={target} type="button">{target}</button>)}</div>
        </section>
        <section className="metric-grid">
          {metrics.map((metric) => <Metric key={metric.label} label={metric.label} value={metric.value} detail={metric.detail} warning={metric.warning} />)}
        </section>
        <section className="content-grid">
          {modules.map((module) => (
            <section className="panel" key={module.title}>
              <div className="panel-header"><div><h2>{module.title}</h2><p>{module.detail}</p></div></div>
              <div className="table apps-table">
                <div className="table-row header"><span>Item</span><span>State</span><span>Owner</span><span>Next Action</span><span>SLA</span></div>
                {module.rows.map((row) => (
                  <div className="table-row" key={`${module.title}-${row.item}`}>
                    <div className="cell-main"><strong>{row.item}</strong><span>{row.note}</span></div>
                    <span>{row.state}</span>
                    <span>{row.owner}</span>
                    <span>{row.action}</span>
                    <span className={`pill ${row.warn ? "warn" : "green"}`}>{row.sla}</span>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </section>
      </section>
    </>
  );
}

function Metric({ detail, label, value, warning = false }: { detail: string; label: string; value: string; warning?: boolean }) {
  return <div className={`metric ${warning ? "warning" : ""}`}><div className="metric-label">{label} {warning ? <OctagonAlert aria-hidden="true" /> : <BriefcaseBusiness aria-hidden="true" />}</div><strong>{value}</strong><small>{detail}</small></div>;
}

function FilterChip({ active = false, icon, label, onClick }: { active?: boolean; icon: ReactNode; label: string; onClick: () => void }) {
  return <button className={`filter-chip ${active ? "active" : ""}`} onClick={onClick} type="button">{icon}{label}</button>;
}

function FormInput({ error, label, onChange, value }: { error?: string; label: string; onChange: (value: string) => void; value: string }) {
  return (
    <label className="form-field">
      <span>{label}</span>
      <input aria-label={label} value={value} onChange={(event) => onChange(event.target.value)} />
      {error ? <small className="form-error">{error}</small> : null}
    </label>
  );
}

function TimelineStep({ detail, index, status, title, warn = false }: { detail: string; index: string; status: string; title: string; warn?: boolean }) {
  return <div className="timeline-row"><time>{index}</time><div className="cell-main"><strong>{title}</strong><span>{detail}</span></div><span className={`pill ${warn ? "warn" : "green"}`}>{status}</span></div>;
}

function statusLabel(status: JobStatus): string {
  return ({ active: "Active", draft: "Draft", paused: "Paused", closed: "Closed" })[status];
}

function loadJobs(): Job[] {
  try {
    const raw = window.localStorage.getItem(JOBS_KEY);
    return raw ? (JSON.parse(raw) as Job[]) : seedJobs;
  } catch {
    return seedJobs;
  }
}

function saveJobs(jobs: Job[]) {
  try {
    window.localStorage.setItem(JOBS_KEY, JSON.stringify(jobs));
  } catch {
    // Local persistence is best-effort for the prototype slice.
  }
}

function readRouteFromLocation(): { route: RouteId; jobId: string | null } {
  const path = window.location.pathname.replace(/\/$/, "") || "/";
  if (path === "/" || path === "/login" || path === "/dashboard") return { route: "dashboard", jobId: null };
  if (path === "/jobs") return { route: "jobs", jobId: null };
  if (path.startsWith("/jobs/")) return { route: "job-detail", jobId: decodeURIComponent(path.slice("/jobs/".length)) };
  if (path === "/settings/mailbox") return { route: "settings-mailbox", jobId: null };
  const route = path.slice(1) as RouteId;
  return isPlaceholderRoute(route) ? { route, jobId: null } : { route: "dashboard", jobId: null };
}

function routeToPath(route: RouteId, jobId?: string): string {
  if (route === "dashboard") return "/dashboard";
  if (route === "job-detail") return `/jobs/${encodeURIComponent(jobId ?? "")}`;
  if (route === "settings-mailbox") return "/settings/mailbox";
  return `/${route}`;
}

function shellActiveRoute(route: RouteId): ShellNavRoute {
  if (route === "job-detail") return "jobs";
  if (route === "inbox-detail" || route === "email-agent") return "inbox";
  if (route === "settings-mailbox") return "settings";
  if (route === "analytics") return "analytics";
  if (route === "jobs" || route === "dashboard" || route === "inbox" || route === "settings") return route;
  return "dashboard";
}

function isPlaceholderRoute(route: RouteId): route is PlaceholderRoute {
  return route in placeholderLabels;
}

function placeholderTabs(route: PlaceholderRoute): string[] {
  const tabs: Partial<Record<PlaceholderRoute, string[]>> = {
    "application-detail": ["Overview", "Timeline", "Email Threads", "Interviews", "Assessments", "Decisions"],
    applications: ["Applications", "Candidate Profile", "Timeline", "Email Threads", "Interviews", "Assessments", "Decisions"],
    candidates: ["Candidate Registry", "Duplicate Review", "Candidate History"],
    assessments: ["Review", "Sent", "Draft", "Evidence Profile", "Follow-up Queue"],
    blocked: ["Blocked Applications", "Cause", "Owner", "Next Action", "Age", "SLA"],
    "email-agent": ["Intake Queue", "Parse Status", "AI Action", "Confidence Review"],
    "founder-inbox": ["Decision Cards", "AI Summary", "Evidence", "Risk", "Confidence"],
    inbox: ["Work Queue", "Sync Status", "Related Mailboxes"],
    "inbox-detail": ["Low-confidence Review", "Evidence", "AI Action Approval"],
    analytics: ["Metrics", "Trends", "Funnel", "Risk Views"],
    settings: ["Settings", "AI Governance", "Mailbox", "Account", "Language"],
    "settings-mailbox": ["Mailbox connection", "Sync scope", "Write rules", "Permissions"]
  };
  return tabs[route] ?? ["Overview", "Timeline", "Agent context"];
}

function buildAgentContext(route: RouteId, job?: Job): AgentContext {
  if (route === "job-detail" && job) {
    return {
      recommendation: "Review the Assessment rubric before sending another case, then keep the job Active.",
      evidence: [
        { label: "Evidence", value: "Scorecard is 92% covered; rubric has one incomplete dimension." },
        { label: "Risk", value: "Weak rubric will reduce assessment evidence quality." },
        { label: "Confidence", value: "High · based on workflow configuration." }
      ],
      ask: `Ask about ${job.title} role setup, workflow checks, or assessment rubric quality.`,
      approveLabel: "Draft rubric",
      reviewLabel: "Review"
    };
  }
  if (route === "jobs") {
    return {
      recommendation: "在批准更多 CV 流入前，先确认岗位默认负责人、SLA 和 Scorecard。",
      evidence: [
        { label: "证据", value: "活跃岗位必须承载候选人与申请流程。" },
        { label: "风险", value: "缺少流程默认值会让阻塞识别不可靠。" },
        { label: "置信度", value: "高 · 基于岗位配置。" }
      ],
      ask: "对比岗位招聘流程，或起草一段 Scorecard。"
    };
  }
  return {
    recommendation: "Keep this module in the authenticated shell while its deep workflow waits for a later slice.",
    evidence: [
      { label: "Scope", value: "Login + Jobs are implemented in this slice." },
      { label: "Parity", value: "Prototype navigation, right Agent panel, and dock remain visible." },
      { label: "Risk", value: "Deep module behavior is intentionally static for now." }
    ],
    ask: "Ask for route context, missing evidence, or the next module handoff."
  };
}

function placeholderIntro(route: PlaceholderRoute): string {
  const intros: Partial<Record<PlaceholderRoute, string>> = {
    applications: "Applications hierarchy preserved for list, candidate profile, timeline, email threads, interviews, assessments, and decisions.",
    "application-detail": "Application detail preserves the drill-down layout for owner, state, next action, due date, evidence, and timeline.",
    candidates: "Candidate registry structure preserved for candidate records, duplicate review, and history.",
    assessments: "Assessment workspace structure preserved for review, sent, draft, evidence profile, and follow-up queues.",
    inbox: "Inbox shell preserved for work queue, mailbox sync, parsing status, and related mailbox context.",
    "inbox-detail": "Inbox detail drill-down preserved for low-confidence review, evidence, and AI action approval.",
    "email-agent": "Email Agent page preserved for intake parsing, confidence review, and human approval.",
    "founder-inbox": "Founder Inbox preserved for decision cards, AI summaries, evidence, risk, and confidence.",
    blocked: "Blocked workspace preserved for cause, owner, next action, age, and SLA handling.",
    analytics: "Analytics structure preserved for metrics, trends, funnel views, and risk reporting.",
    settings: "Settings hierarchy preserved for governance, mailbox setup, account controls, and language.",
    "settings-mailbox": "Mailbox setup flow preserved for connection, sync scope, write rules, and permissions."
  };
  return intros[route] ?? "Prototype page structure preserved inside the authenticated HireOS shell.";
}

function placeholderDrilldowns(route: PlaceholderRoute): string[] {
  const drilldowns: Partial<Record<PlaceholderRoute, string[]>> = {
    applications: ["Open Application Detail", "Review Candidate Profile", "View Timeline"],
    candidates: ["Open Candidate Detail", "Review Duplicate Match", "View Candidate History"],
    inbox: ["Open Inbox Detail", "Open Email Agent", "Review Mailbox Sync"],
    settings: ["Open Mailbox Settings", "Review AI Governance"],
    analytics: ["Open Funnel View", "Open Risk View"]
  };
  return drilldowns[route] ?? placeholderTabs(route).slice(0, 3);
}

function placeholderMetrics(route: PlaceholderRoute): Array<{ label: string; value: string; detail: string; warning?: boolean }> {
  const metrics: Partial<Record<PlaceholderRoute, Array<{ label: string; value: string; detail: string; warning?: boolean }>>> = {
    applications: [
      { label: "Open Applications", value: "42", detail: "Static shell count" },
      { label: "Needs Owner", value: "7", detail: "Owner review placeholder", warning: true },
      { label: "Due Soon", value: "11", detail: "SLA placeholder" }
    ],
    inbox: [
      { label: "Unprocessed", value: "76", detail: "Inbox work queue" },
      { label: "Low Confidence", value: "9", detail: "Needs human review", warning: true },
      { label: "Mailboxes", value: "3", detail: "Related sources" }
    ],
    settings: [
      { label: "Connected", value: "2", detail: "Mailbox and account" },
      { label: "Governance Rules", value: "8", detail: "AI action controls" },
      { label: "Needs Setup", value: "1", detail: "Mailbox permissions", warning: true }
    ]
  };
  return metrics[route] ?? [
    { label: "Queue", value: "0", detail: "Static placeholder" },
    { label: "Needs Review", value: "0", detail: "Awaiting future module" },
    { label: "SLA Risk", value: "0", detail: "No live data yet" }
  ];
}

function placeholderModules(route: PlaceholderRoute): PlaceholderModule[] {
  const modules: Partial<Record<PlaceholderRoute, PlaceholderModule[]>> = placeholderModulesMap();
  return modules[route] ?? [
    {
      title: "Workflow Timeline",
      detail: "Timeline container kept for future owner, state, next action, and due date tracking.",
      rows: [placeholderRow("Future workflow item", "Static", "HireOS", "Implement in later slice", "Ready")]
    },
    {
      title: "Agent Context",
      detail: "Right Agent remains paired with this page for later evidence-backed actions.",
      rows: [placeholderRow("Evidence context", "Static", "HireOS Agent", "Wait for module scope", "Ready")]
    }
  ];
}

function placeholderModulesMap() {
  return {
    applications: [
      { title: "Applications Workbench", detail: "List/table container for application state, owner, next action, due date, and current state.", rows: [placeholderRow("Manual application baseline", "Planned", "HR", "Open application detail", "Ready")] },
      { title: "Application Timeline", detail: "Timeline and email thread slots are preserved for the Applications module.", rows: [placeholderRow("Timeline event stream", "Static", "Process Owner", "Review evidence", "Ready")] }
    ],
    "application-detail": [
      { title: "Application Detail", detail: "Drill-down area for current owner, process owner, next action, due date, current state, and timeline.", rows: [placeholderRow("Candidate application", "Static", "HR", "Resolve next action", "Ready")] },
      { title: "Evidence and Interviews", detail: "Evidence, email threads, interviews, assessments, and decision context stay in separate panels.", rows: [placeholderRow("Evidence packet", "Pending", "Hiring Manager", "Review when implemented", "Later")] }
    ],
    candidates: [
      { title: "Candidate Registry", detail: "Candidate list container with duplicate review and candidate history affordances.", rows: [placeholderRow("Candidate record", "Static", "HR", "Open candidate detail", "Ready")] },
      { title: "Duplicate Review", detail: "Duplicate review lane remains available for the future Candidates slice.", rows: [placeholderRow("Potential duplicate", "Static", "HireOS Agent", "Compare records", "Later")] }
    ],
    assessments: [
      { title: "Assessment Workspace", detail: "Review, sent, draft, evidence profile, and follow-up queues remain distinct.", rows: [placeholderRow("Assessment review", "Static", "Hiring Manager", "Send follow-up", "Ready")] },
      { title: "Evidence Profile", detail: "Assessment evidence panel is reserved for later scorecard integration.", rows: [placeholderRow("Rubric evidence", "Pending", "Interviewer", "Attach evidence", "Later")] }
    ],
    inbox: [
      { title: "Work Queue", detail: "Mailbox intake queue with sync status and related mailbox context.", rows: [placeholderRow("Inbound email", "Static", "HR", "Review parse confidence", "Ready", true)] },
      { title: "Related Mailboxes", detail: "Mailbox context is visible but connection behavior stays in Settings Mailbox.", rows: [placeholderRow("careers@hireos.test", "Connected", "Admin", "Review sync scope", "Ready")] }
    ],
    "inbox-detail": [
      { title: "Low-confidence Review", detail: "Detail drill-down for evidence, AI action approval, and human confirmation.", rows: [placeholderRow("Parsed candidate email", "Low confidence", "HR", "Approve or return", "Review", true)] },
      { title: "Evidence", detail: "Evidence extraction container preserved for future email parsing work.", rows: [placeholderRow("Attachment evidence", "Static", "HireOS Agent", "Wait for Inbox slice", "Later")] }
    ],
    "email-agent": [
      { title: "Intake Queue", detail: "Email Agent queue and parse status are preserved as separate module surfaces.", rows: [placeholderRow("Parsed message", "Static", "HireOS Agent", "Request approval", "Ready")] },
      { title: "AI Action Approval", detail: "Confidence review and action approval remain visible for later automation.", rows: [placeholderRow("Create candidate action", "Needs approval", "HR", "Approve action", "Review", true)] }
    ],
    "founder-inbox": [
      { title: "Decision Cards", detail: "Founder-facing decisions keep evidence, risk, confidence, approve, and return containers.", rows: [placeholderRow("Candidate decision", "Static", "Founder", "Approve or return", "Ready")] },
      { title: "AI Summary", detail: "Summary and risk containers remain separated from application detail.", rows: [placeholderRow("Evidence summary", "Static", "HireOS Agent", "Review confidence", "Ready")] }
    ],
    blocked: [
      { title: "Blocked Applications", detail: "Blocked table preserves cause, owner, next action, age, and SLA columns.", rows: [placeholderRow("Missing owner", "Blocked", "Process Owner", "Assign owner", "Overdue", true)] },
      { title: "Resolve Batch", detail: "Batch resolution affordance stays visible without implementing deep behavior.", rows: [placeholderRow("SLA breach group", "Review", "HR Admin", "Resolve cause", "Review", true)] }
    ],
    analytics: [
      { title: "Funnel View", detail: "Metrics, trends, funnel, and risk reporting are preserved for the Analytics module.", rows: [placeholderRow("Hiring funnel", "Static", "Ops", "Review trend", "Ready")] },
      { title: "Risk Views", detail: "Risk and SLA views remain available in the authenticated shell.", rows: [placeholderRow("Workflow risk", "Static", "HireOS Agent", "Explain risk", "Ready")] }
    ],
    settings: [
      { title: "AI Governance", detail: "Governance, mailbox entry, account controls, and language settings stay in their own hierarchy.", rows: [placeholderRow("AI write approval", "Configured", "Admin", "Review policy", "Ready")] },
      { title: "Mailbox Entry", detail: "Mailbox settings route remains a child under Settings.", rows: [placeholderRow("Settings Mailbox", "Needs setup", "Admin", "Open mailbox setup", "Review", true)] }
    ],
    "settings-mailbox": [
      { title: "Mailbox Connection", detail: "Connection flow container for mailbox authentication and permissions.", rows: [placeholderRow("careers mailbox", "Static", "Admin", "Confirm connection", "Ready")] },
      { title: "Sync Scope and Write Rules", detail: "Sync scope, write rules, and permissions remain visible as separate setup steps.", rows: [placeholderRow("Write permissions", "Needs review", "Admin", "Approve send rules", "Review", true)] }
    ]
  };
}

function placeholderRow(item: string, state: string, owner: string, action: string, sla: string, warn = false) {
  return { item, state, owner, action, sla, note: "Prototype parity placeholder", warn };
}
