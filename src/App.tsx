import { FormEvent, ReactNode, useEffect, useState } from "react";
import {
  Activity,
  Archive,
  ArrowLeft,
  BadgeCheck,
  BriefcaseBusiness,
  CalendarClock,
  ChartNoAxesCombined,
  Check,
  ChevronUp,
  Download,
  FileQuestion,
  FilePenLine,
  FileUser,
  Inbox,
  Layers3,
  LayoutDashboard,
  LogOut,
  MessagesSquare,
  OctagonAlert,
  PanelLeftClose,
  PanelRightClose,
  PauseCircle,
  Plus,
  Save,
  SendHorizontal,
  Settings,
  Sparkles,
  TriangleAlert,
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
  Candidate,
  CandidateAllocationState,
  CandidateDraft,
  createCandidateFromDraft,
  createEmptyCandidateDraft,
  detectCandidateDuplicate,
  seedCandidates,
  validateCandidateDraft
} from "./domain/candidates";
import {
  Application,
  createApplicationForCandidate,
  seedApplications
} from "./domain/applications";
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

type ShellNavRoute = "dashboard" | "jobs" | "candidates" | "applications" | "inbox" | "analytics" | "settings";
type PlaceholderRoute = Exclude<RouteId, "dashboard" | "jobs" | "job-detail">;

const JOBS_KEY = "hireos.jobs";
const CANDIDATES_KEY = "hireos.candidates";
const APPLICATIONS_KEY = "hireos.applications";
const LANGUAGE_KEY = "hireos.language";

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
type Language = "EN" | "中文";

const appCopy = {
  EN: {
    accountMenu: "User menu for",
    activeJobs: "Active Jobs",
    analytics: "Analytics",
    applications: "Applications",
    candidates: "Candidates",
    candidatesDescription: "Reusable candidate profiles, contact information, CV history, deduplication and cross-job history.",
    dashboard: "Dashboard",
    importCv: "Import CV",
    inbox: "Inbox",
    intelligence: "Intelligence",
    jobs: "Jobs",
    jobsDescription: "Job status, job tags, job members, hiring workflow and job-level metrics.",
    language: "Language",
    newCandidate: "New Candidate",
    newJob: "New Job",
    operate: "Operate",
    settings: "Settings",
    signOut: "Sign out"
  },
  中文: {
    accountMenu: "用户菜单",
    activeJobs: "活跃岗位",
    analytics: "分析",
    applications: "申请流程",
    candidates: "候选人",
    candidatesDescription: "可复用候选人档案、联系方式、CV 历史、去重结果和跨岗位历史。",
    dashboard: "看板",
    importCv: "导入简历",
    inbox: "待办箱",
    intelligence: "智能",
    jobs: "岗位",
    jobsDescription: "岗位状态、岗位 Tag、岗位成员、招聘流程和岗位级统计。",
    language: "语言",
    newCandidate: "新建候选人",
    newJob: "新建岗位",
    operate: "运营",
    settings: "设置",
    signOut: "退出登录"
  }
} satisfies Record<Language, Record<string, string>>;

export default function App() {
  const [session, setSession] = useState<AuthSession | null>(() => loadAuthState());
  const [route, setRoute] = useState<RouteId>(() => readRouteFromLocation().route);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(() => readRouteFromLocation().jobId);
  const [jobs, setJobs] = useState<Job[]>(loadJobs);
  const [candidates, setCandidates] = useState<Candidate[]>(loadCandidates);
  const [applications, setApplications] = useState<Application[]>(loadApplications);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(() => readRouteFromLocation().applicationId);
  const [language, setLanguage] = useState<Language>(loadLanguage);

  useEffect(() => {
    saveJobs(jobs);
  }, [jobs]);

  useEffect(() => {
    saveCandidates(candidates);
  }, [candidates]);

  useEffect(() => {
    saveApplications(applications);
  }, [applications]);

  useEffect(() => {
    const onPopState = () => {
      const next = readRouteFromLocation();
      setRoute(next.route);
      setSelectedJobId(next.jobId);
      setSelectedApplicationId(next.applicationId);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  function navigate(routeId: RouteId, jobId?: string) {
    window.history.pushState({}, "", routeToPath(routeId, jobId));
    setRoute(routeId);
    setSelectedJobId(jobId ?? null);
    setSelectedApplicationId(routeId === "application-detail" ? jobId ?? null : null);
  }

  function createCandidate(candidate: Candidate) {
    setCandidates((current) => [candidate, ...current]);
    if (candidate.allocationState === "assigned" && candidate.currentJobId) {
      const job = jobs.find((item) => item.id === candidate.currentJobId);
      if (job?.status === "active") {
        setApplications((current) => [createApplicationForCandidate(candidate, job), ...current]);
      }
    }
  }

  function attachCandidateToJob(candidateId: string, jobId: string): Application | null {
    const candidate = candidates.find((item) => item.id === candidateId);
    const job = jobs.find((item) => item.id === jobId);
    if (!candidate || !job || job.status !== "active" || candidate.allocationState === "duplicate_review") return null;
    const existing = applications.find((application) => application.candidateId === candidateId && application.jobId === jobId);
    if (existing) return existing;
    const application = createApplicationForCandidate(candidate, job);
    setApplications((current) => [application, ...current]);
    setCandidates((current) => current.map((item) => item.id === candidateId ? { ...item, allocationState: "assigned", currentJobId: jobId, updatedAt: new Date().toISOString() } : item));
    return application;
  }

  function markCandidateNotFit(candidateId: string, jobId: string) {
    setCandidates((current) => current.map((item) => item.id === candidateId ? { ...item, allocationState: "not_fit_current_job", currentJobId: jobId, notFitReason: "Not Fit Current Job", updatedAt: new Date().toISOString() } : item));
  }

  function resolveDuplicateCandidate(candidateId: string) {
    setCandidates((current) => current.map((item) => item.id === candidateId ? { ...item, allocationState: "unassigned_pool", currentJobId: null, poolReason: "Duplicate reviewed by HR", updatedAt: new Date().toISOString() } : item));
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
  const selectedApplication = applications.find((application) => application.id === selectedApplicationId) ?? applications[0];
  const selectedApplicationCandidate = selectedApplication ? candidates.find((candidate) => candidate.id === selectedApplication.candidateId) : undefined;
  const agentContext = buildAgentContext(route, selectedJob, selectedApplicationCandidate);

  return (
    <AppShell
      activeRoute={shellActiveRoute(route)}
      agentContext={agentContext}
      agentTitle={route === "application-detail" ? "申请 AI 工作区" : route === "job-detail" ? "Job AI Workspace" : route === "jobs" ? "岗位 Agent" : "HireOS Agent"}
      agentSubtitle={route === "application-detail" ? "候选人、流程状态和下一步" : route === "job-detail" ? "Role setup and workflow checks" : route === "jobs" ? "流程与 Scorecard 设置" : "Workflow and evidence"}
      language={language}
      onLanguageChange={(nextLanguage) => {
        setLanguage(nextLanguage);
        saveLanguage(nextLanguage);
      }}
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
          language={language}
          onCreateJob={(job) => setJobs((current) => [job, ...current])}
          onOpenJob={(jobId) => {
            navigate("job-detail", jobId);
          }}
        />
      ) : null}
      {route === "job-detail" ? (
        <JobDetailPage
          applications={applications}
          candidates={candidates}
          job={selectedJob}
          onAttachCandidate={(candidateId, jobId) => attachCandidateToJob(candidateId, jobId)}
          onBack={() => navigate("jobs")}
          onCreateCandidate={createCandidate}
          onMarkNotFit={markCandidateNotFit}
          onOpenApplication={(applicationId) => navigate("application-detail", applicationId)}
          onResolveDuplicate={resolveDuplicateCandidate}
        />
      ) : null}
      {route === "candidates" ? <CandidatesPage applications={applications} candidates={candidates} jobs={jobs} language={language} onCreateCandidate={createCandidate} onResolveDuplicate={resolveDuplicateCandidate} /> : null}
      {route === "applications" ? <ApplicationsPage applications={applications} language={language} onOpenApplication={(applicationId) => navigate("application-detail", applicationId)} /> : null}
      {route === "application-detail" ? <ApplicationDetailPage application={selectedApplication} candidate={selectedApplicationCandidate} /> : null}
      {isPlaceholderRoute(route) && route !== "application-detail" && route !== "applications" && route !== "candidates" ? <PlaceholderPage route={route} title={placeholderLabels[route]} /> : null}
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
  language,
  onLanguageChange,
  onNavigate,
  onSignOut,
  session
}: {
  activeRoute: ShellNavRoute;
  agentContext: AgentContext;
  agentTitle: string;
  agentSubtitle: string;
  children: ReactNode;
  language: Language;
  onLanguageChange: (language: Language) => void;
  onNavigate: (route: ShellNavRoute) => void;
  onSignOut: () => void;
  session: AuthSession;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [agentCollapsed, setAgentCollapsed] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [dockOpen, setDockOpen] = useState(false);
  const copy = appCopy[language];

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

        <div className="nav-section">{copy.operate}</div>
        <nav className="nav">
          <NavButton active={activeRoute === "dashboard"} icon={<LayoutDashboard />} label={copy.dashboard} onClick={() => onNavigate("dashboard")} />
          <NavButton active={activeRoute === "jobs"} count="12" icon={<BriefcaseBusiness />} label={copy.jobs} onClick={() => onNavigate("jobs")} />
          <NavButton active={activeRoute === "candidates"} icon={<UsersRound />} label={copy.candidates} onClick={() => onNavigate("candidates")} />
          <NavButton active={activeRoute === "applications"} icon={<Layers3 />} label={copy.applications} onClick={() => onNavigate("applications")} />
          <NavButton active={activeRoute === "inbox"} count="76" icon={<Inbox />} label={copy.inbox} onClick={() => onNavigate("inbox")} />
        </nav>
        <div className="nav-section">{copy.intelligence}</div>
        <nav className="nav">
          <NavButton active={activeRoute === "analytics"} icon={<ChartNoAxesCombined />} label={copy.analytics} onClick={() => onNavigate("analytics")} />
          <NavButton active={activeRoute === "settings"} icon={<Settings />} label={copy.settings} onClick={() => onNavigate("settings")} />
        </nav>
        <div className="sidebar-footer">
          <div
            aria-expanded={accountOpen}
            aria-label={`${copy.accountMenu} ${session.name}`}
            className="user-status"
            onClick={() => setAccountOpen((value) => !value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setAccountOpen((value) => !value);
              }
            }}
            role="button"
            tabIndex={0}
          >
            <div className="avatar">LT</div>
            <div className="user-copy"><strong>{session.name}</strong><span><b /> Online · {session.role}</span></div>
            <button
              className="account-toggle"
              aria-label="Account menu"
              title="Account menu"
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setAccountOpen((value) => !value);
              }}
            >
              <ChevronUp aria-hidden="true" />
            </button>
          </div>
          <div className={`account-menu ${accountOpen ? "is-open" : ""}`}>
            <div className="language-switch" aria-label="语言切换">
              <span>{copy.language}</span>
              <div>
                <button aria-pressed={language === "EN"} className={language === "EN" ? "active" : ""} onClick={() => onLanguageChange("EN")} type="button">EN</button>
                <button aria-pressed={language === "中文"} className={language === "中文" ? "active" : ""} onClick={() => onLanguageChange("中文")} type="button">中文</button>
              </div>
            </div>
            <button type="button" onClick={onSignOut}><LogOut aria-hidden="true" /> {copy.signOut}</button>
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

function JobsPage({ jobs, language, onCreateJob, onOpenJob }: { jobs: Job[]; language: Language; onCreateJob: (job: Job) => void; onOpenJob: (jobId: string) => void }) {
  const [statusFilter, setStatusFilter] = useState<JobStatus | "all">("all");
  const [modalOpen, setModalOpen] = useState(false);
  const metrics = buildJobMetrics(jobs);
  const filteredJobs = statusFilter === "all" ? jobs : jobs.filter((job) => job.status === statusFilter);
  const copy = appCopy[language];

  return (
    <>
      <header className="topbar">
        <div className="page-title"><h1>{copy.jobs}</h1><p>{copy.jobsDescription}</p></div>
        <div className="top-actions"><button className="primary-button" onClick={() => setModalOpen(true)} type="button"><Plus aria-hidden="true" /> {copy.newJob}</button></div>
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
          <Metric label={copy.activeJobs} value={String(metrics.active)} detail={`${metrics.total} total roles`} />
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

function CandidatesPage({ applications, candidates, jobs, language, onCreateCandidate, onResolveDuplicate }: { applications: Application[]; candidates: Candidate[]; jobs: Job[]; language: Language; onCreateCandidate: (candidate: Candidate) => void; onResolveDuplicate: (candidateId: string) => void }) {
  const [modalOpen, setModalOpen] = useState(false);
  const assigned = candidates.filter((candidate) => candidate.allocationState === "assigned");
  const unassigned = candidates.filter((candidate) => candidate.allocationState === "unassigned_pool");
  const notFit = candidates.filter((candidate) => candidate.allocationState === "not_fit_current_job" || candidate.allocationState === "rejected_global");
  const duplicates = candidates.filter((candidate) => candidate.allocationState === "duplicate_review");
  const copy = appCopy[language];

  return (
    <>
      <header className="topbar"><div className="page-title"><h1>{copy.candidates}</h1><p>{copy.candidatesDescription}</p></div><div className="top-actions"><button className="ghost-button" type="button">{copy.importCv}</button><button className="primary-button" type="button" onClick={() => setModalOpen(true)}><Plus aria-hidden="true" /> {copy.newCandidate}</button></div></header>
      <section className="page-content">
        <div className="hero-row"><section className="hero-panel"><h2>Candidate is the person record. Applications keep the job-specific process separate.</h2><p>This prevents one candidate's multiple role histories from collapsing into a single vague status.</p></section><section className="hero-panel ai"><h2>Deduplication insight</h2><p>{duplicates.length} profiles need HR review before they can be assigned to a Job.</p></section></div>
        <section className="metric-grid"><Metric label={copy.candidates} value={String(candidates.length)} detail={`${applications.length} job-bound applications`} /><Metric label="Assigned" value={String(assigned.length)} detail="Have at least one Application" /><Metric label="Unassigned" value={String(unassigned.length)} detail="People pool, no pipeline entry" /><Metric label="Duplicates" value={String(duplicates.length)} detail="Blocked from assignment" warning={duplicates.length > 0} /></section>
        <section className="panel"><div className="panel-header"><div><h2>Candidate Registry</h2><p>Identity, source, CV history, and cross-job context</p></div><div className="tabs"><button className="tab active" type="button">All</button><button className="tab" type="button">Duplicates</button><button className="tab" type="button">High value</button></div></div><CandidateTable candidates={candidates} applications={applications} /></section>
        <section className="content-grid">
          <CandidatePoolPanel title="Assigned Candidates" detail="Candidates with one or more Job-bound Applications" candidates={assigned} applications={applications} empty="No assigned candidates yet." />
          <CandidatePoolPanel title="Unassigned Pool" detail="Candidates saved without a Job. They must not appear in Applications Pipeline." candidates={unassigned} applications={applications} empty="No unassigned candidates." />
          <CandidatePoolPanel title="Rejected / Not Fit Pool" detail="Not Fit Current Job keeps the person reusable for other Jobs." candidates={notFit} applications={applications} empty="No not-fit candidates." />
          <CandidatePoolPanel title="Duplicate Review" detail="Duplicate candidates cannot be attached until HR resolves the review." candidates={duplicates} applications={applications} empty="No duplicates to review." onResolveDuplicate={onResolveDuplicate} />
        </section>
        <section className="panel"><div className="panel-header"><div><h2>Candidate History</h2><p>Cross-job Applications, pool state, not-fit history, and duplicate review remain attached to the person record.</p></div></div><div className="timeline">{candidates.map((candidate) => {
          const candidateApplications = applications.filter((application) => application.candidateId === candidate.id);
          const historyDetail = candidateApplications.length
            ? candidateApplications.map((application) => `${application.jobTitle}: ${application.currentState}, ${application.currentOwner} owns ${application.nextAction}`).join(" · ")
            : candidate.allocationState === "not_fit_current_job"
              ? candidate.notFitReason || "Not Fit Current Job, reusable for other Jobs"
              : candidate.allocationState === "duplicate_review"
                ? candidate.poolReason || "Duplicate review blocks assignment"
                : candidate.poolReason || "Saved to Unassigned Pool";
          return <TimelineStep key={candidate.id} index={allocationLabel(candidate.allocationState)} title={candidate.fullName} detail={historyDetail} status={candidateApplications[0]?.slaStatus ?? (candidate.allocationState === "duplicate_review" ? "Review" : "Pool")} warn={candidate.allocationState === "duplicate_review"} />;
        })}</div></section>
      </section>
      {modalOpen ? <NewCandidateModal candidates={candidates} jobs={jobs} onClose={() => setModalOpen(false)} onCreate={(candidate) => { onCreateCandidate(candidate); setModalOpen(false); }} /> : null}
    </>
  );
}

function CandidatePoolPanel({ applications, candidates, detail, empty, onResolveDuplicate, title }: { applications: Application[]; candidates: Candidate[]; detail: string; empty: string; onResolveDuplicate?: (candidateId: string) => void; title: string }) {
  return <section className="panel"><div className="panel-header"><div><h2>{title}</h2><p>{detail}</p></div></div><div className="cards">{candidates.map((candidate) => <CandidateCard key={candidate.id} applications={applications} candidate={candidate} onResolveDuplicate={candidate.allocationState === "duplicate_review" ? onResolveDuplicate : undefined} />)}{candidates.length === 0 ? <div className="empty-state">{empty}</div> : null}</div></section>;
}

function CandidateTable({ applications, candidates }: { applications: Application[]; candidates: Candidate[] }) {
  return (
    <div className="table candidates-table">
      <div className="table-row header"><span>Candidate</span><span>Source</span><span>Applications</span><span>Latest Evidence</span><span>Status</span></div>
      {candidates.map((candidate) => (
        <div className="table-row" key={candidate.id}><div className="person-row"><div className="avatar">{candidateInitials(candidate.fullName)}</div><div className="cell-main"><strong>{candidate.fullName}</strong><span>{candidate.primaryEmail || candidate.phone || "No contact yet"}</span></div></div><span>{candidate.source}</span><span>{applications.filter((application) => application.candidateId === candidate.id).length}</span><span>{candidate.cvNote || candidate.skillsSummary}</span><span className={`pill ${candidate.allocationState === "duplicate_review" ? "danger" : candidate.allocationState === "unassigned_pool" ? "warn" : "green"}`}>{allocationLabel(candidate.allocationState)}</span></div>
      ))}
    </div>
  );
}

function CandidateCard({ applications, candidate, onResolveDuplicate }: { applications: Application[]; candidate: Candidate; onResolveDuplicate?: (candidateId: string) => void }) {
  const appCount = applications.filter((application) => application.candidateId === candidate.id).length;
  return <div className="work-card"><div className="card-top"><div className="card-copy"><strong>{candidate.fullName}</strong><span>{candidate.currentTitle || "Candidate"} · {candidate.location || "Location pending"} · {appCount} applications</span></div><span className={`pill ${candidate.allocationState === "duplicate_review" ? "danger" : candidate.allocationState === "unassigned_pool" ? "warn" : "green"}`}>{allocationLabel(candidate.allocationState)}</span></div>{onResolveDuplicate ? <button className="ghost-button row-action" type="button" onClick={() => onResolveDuplicate(candidate.id)}>Resolve duplicate for {candidate.fullName}</button> : null}</div>;
}

function JobCandidateSection({ applications, candidates, onMarkNotFit, onOpenApplication, title }: { applications: Application[]; candidates: Candidate[]; onMarkNotFit?: (candidateId: string, jobId: string) => void; onOpenApplication?: (applicationId: string) => void; title: string }) {
  return (
    <section className="panel nested-panel">
      <div className="panel-header"><div><h2>{title}</h2><p>Candidate identity is shown beside Application workflow state.</p></div></div>
      <div className="table apps-table workflow-table">
        <div className="table-row header"><span>候选人</span><span>状态</span><span>负责人</span><span>下一步</span><span>SLA</span><span>Action</span></div>
        {candidates.map((candidate) => {
          const application = applications.find((item) => item.candidateId === candidate.id);
          return (
            <div className="table-row" key={candidate.id}>
              <div className="cell-main"><strong>{candidate.fullName}</strong><span>{candidate.cvNote || candidate.skillsSummary}</span></div>
              <span>{application?.currentState ?? allocationLabel(candidate.allocationState)}</span>
              <span>{application?.currentOwner ?? "HR"}</span>
              <span>{application?.nextAction ?? "Review later fit"}</span>
              <span className={`pill ${application?.slaStatus === "Today" ? "warn" : "green"}`}>{application?.slaStatus ?? "保留"}</span>
              <div className="row-actions">{application && onOpenApplication ? <button className="ghost-button row-action" type="button" onClick={() => onOpenApplication(application.id)}>Open Application for {candidate.fullName}</button> : null}{application && onMarkNotFit ? <button className="ghost-button row-action" type="button" onClick={() => onMarkNotFit(candidate.id, application.jobId)}>Not Fit Current Job for {candidate.fullName}</button> : null}</div>
            </div>
          );
        })}
        {candidates.length === 0 ? <div className="empty-state">No candidates in this group.</div> : null}
      </div>
    </section>
  );
}

function NewCandidateModal({ candidates, jobs, onClose, onCreate }: { candidates: Candidate[]; jobs: Job[]; onClose: () => void; onCreate: (candidate: Candidate) => void }) {
  const activeJobs = jobs.filter((job) => job.status === "active");
  const [draft, setDraft] = useState<CandidateDraft>(() => createEmptyCandidateDraft());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [jobId, setJobId] = useState(activeJobs[0]?.id ?? "");

  function update<K extends keyof CandidateDraft>(key: K, value: CandidateDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function submit(choice: "pool" | "job") {
    const duplicate = detectCandidateDuplicate(draft, candidates);
    const nextDraft: CandidateDraft = {
      ...draft,
      allocationState: duplicate ? "duplicate_review" : choice === "job" ? "assigned" : "unassigned_pool",
      currentJobId: duplicate ? null : choice === "job" ? jobId : null,
      poolReason: duplicate ? `Duplicate ${duplicate.field} match requires HR review` : draft.poolReason
    };
    const nextErrors = validateCandidateDraft(nextDraft);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    onCreate(createCandidateFromDraft(nextDraft));
  }

  return (
    <div className="modal-backdrop">
      <div className="mail-connect-modal candidate-modal" role="dialog" aria-modal="true" aria-label="New Candidate">
        <header className="modal-header"><div><h2>New Candidate</h2><p>Create a reusable person record, then save to pool or bind to an Active Job.</p></div><button className="icon-button" type="button" aria-label="关闭" onClick={onClose}><X aria-hidden="true" /></button></header>
        <div className="connect-panels"><section className="connect-panel"><div className="job-form-grid"><FormInput label="Full name" value={draft.fullName} onChange={(value) => update("fullName", value)} error={errors.fullName} /><FormInput label="Email" value={draft.primaryEmail} onChange={(value) => update("primaryEmail", value)} /><FormInput label="Phone" value={draft.phone} onChange={(value) => update("phone", value)} /><FormInput label="Source" value={draft.source} onChange={(value) => update("source", value)} /><FormInput label="Current title" value={draft.currentTitle} onChange={(value) => update("currentTitle", value)} /><FormInput label="Current company" value={draft.currentCompany} onChange={(value) => update("currentCompany", value)} /><FormInput label="Location" value={draft.location} onChange={(value) => update("location", value)} /><label className="form-field"><span>Attach to Active Job</span><select aria-label="Attach to Active Job" value={jobId} onChange={(event) => setJobId(event.target.value)}>{activeJobs.map((job) => <option key={job.id} value={job.id}>{job.title}</option>)}</select></label><label className="form-field wide"><span>Skills summary</span><textarea aria-label="Skills summary" rows={3} value={draft.skillsSummary} onChange={(event) => update("skillsSummary", event.target.value)} /></label><label className="form-field wide"><span>CV/evidence note</span><textarea aria-label="CV/evidence note" rows={3} value={draft.cvNote} onChange={(event) => update("cvNote", event.target.value)} /></label></div></section></div>
        <footer className="modal-footer"><button className="ghost-button" type="button" onClick={onClose}>取消</button><span className="footer-spacer" /><button className="ghost-button" type="button" onClick={() => submit("pool")}>Save to Unassigned Pool</button><button className="primary-button" type="button" onClick={() => submit("job")}>Create and Attach Candidate</button></footer>
      </div>
    </div>
  );
}

function JobDetailPage({ applications, candidates, job, onAttachCandidate, onBack, onCreateCandidate, onMarkNotFit, onOpenApplication, onResolveDuplicate }: { applications: Application[]; candidates: Candidate[]; job?: Job; onAttachCandidate: (candidateId: string, jobId: string) => Application | null; onBack: () => void; onCreateCandidate: (candidate: Candidate) => void; onMarkNotFit: (candidateId: string, jobId: string) => void; onOpenApplication: (applicationId: string) => void; onResolveDuplicate: (candidateId: string) => void }) {
  const [activeTab, setActiveTab] = useState<"candidates" | "details">("candidates");
  const [candidateModalOpen, setCandidateModalOpen] = useState(false);

  if (!job) {
    return (
      <>
        <header className="topbar"><div className="title-with-back"><button className="icon-button" aria-label="Back icon to Jobs" type="button" onClick={onBack}><ArrowLeft aria-hidden="true" /></button><div className="page-title"><h1>Job not found</h1><p>The selected job could not be loaded.</p></div></div></header>
        <section className="page-content"><section className="unframed-section"><button className="primary-button" type="button" onClick={onBack}>Back to Jobs</button></section></section>
      </>
    );
  }

  const jobApplications = applications.filter((application) => application.jobId === job.id);
  const assignedCandidates = candidates.filter((candidate) => candidate.allocationState === "assigned" && jobApplications.some((application) => application.candidateId === candidate.id));
  const unassignedCandidates = candidates.filter((candidate) => candidate.allocationState === "unassigned_pool");
  const notFitCandidates = candidates.filter((candidate) => candidate.allocationState === "not_fit_current_job" && candidate.currentJobId === job.id);
  const duplicateCandidates = candidates.filter((candidate) => candidate.allocationState === "duplicate_review");

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
          <div className="panel-header"><div><h2>候选人成员列表</h2><p>当前岗位下的候选人、流程状态、负责人和下一步动作</p></div><button className="ghost-button" type="button" disabled={job.status !== "active"} onClick={() => setCandidateModalOpen(true)}>Create and attach Candidate</button></div>
          <JobCandidateSection title="Assigned Candidates" candidates={assignedCandidates} applications={jobApplications} onMarkNotFit={onMarkNotFit} onOpenApplication={onOpenApplication} />
          <section className="panel nested-panel"><div className="panel-header"><div><h2>Unassigned Pool</h2><p>Attach an existing Candidate to this Active Job to create an Application.</p></div></div><div className="table apps-table"><div className="table-row header"><span>Candidate</span><span>Source</span><span>Confidence</span><span>Pool Reason</span><span>Action</span></div>{unassignedCandidates.map((candidate) => <div className="table-row" key={candidate.id}><div className="cell-main"><strong>{candidate.fullName}</strong><span>{candidate.skillsSummary || candidate.cvNote}</span></div><span>{candidate.source}</span><span>{candidate.matchConfidence || "Manual"}</span><span>{candidate.poolReason || "Saved to pool"}</span><button className="ghost-button row-action" type="button" disabled={job.status !== "active"} onClick={() => onAttachCandidate(candidate.id, job.id)}>Attach {candidate.fullName} to this Job</button></div>)}{unassignedCandidates.length === 0 ? <div className="empty-state">No unassigned candidates available.</div> : null}</div></section>
          <JobCandidateSection title="Rejected / Not Fit Pool" candidates={notFitCandidates} applications={jobApplications} />
          <section className="panel nested-panel"><div className="panel-header"><div><h2>Duplicate Review</h2><p>Duplicate candidates cannot be attached until HR resolves identity.</p></div></div><div className="cards">{duplicateCandidates.map((candidate) => <CandidateCard key={candidate.id} applications={applications} candidate={candidate} onResolveDuplicate={onResolveDuplicate} />)}</div></section>
          {jobApplications.map((application) => <div className="rule-note" key={application.id}><strong>{application.candidateName} attached to {application.jobTitle}</strong><span>Application created with owner, process owner, next action, due date and timeline.</span></div>)}
        </section>
        <section className={`detail-grid ${activeTab === "details" ? "" : "is-hidden"}`} data-job-detail-panel="details">
          <div className="detail-stack">
            <section className="panel"><div className="panel-header"><div><h2>招聘需求</h2><p>创建岗位时填写，后续可修改并保留变更记录</p></div></div><div className="settings-grid"><article className="config-card"><h3>岗位目标</h3><p>{job.requirements}</p><div className="config-meta"><span className="pill green">创始人已确认</span><span className="pill">{job.location}</span></div></article><article className="config-card"><h3>预算与级别</h3><p>{job.salaryRange || "高级个人贡献者，5 年以上经验，越南薪资带，要求英文协作。"}</p><div className="config-meta"><span className="pill">{job.department}</span><span className="pill">{job.employmentType}</span></div></article></div></section>
            <section className="panel"><div className="panel-header"><div><h2>已配置流程</h2><p>每个申请都会继承阶段、负责人、下一步和 SLA</p></div></div><div className="timeline"><TimelineStep index="01" title="HR 审核" detail="负责人：Linh · SLA：1 个工作日 · 验证基础匹配" status="就绪" /><TimelineStep index="02" title="技术面试" detail="负责人：技术负责人 · 证据：架构、调试、沟通" status="就绪" /><TimelineStep index="03" title="测评" detail="负责人：HR + 技术负责人 · 评分标准待审核" status="审核" warn /><TimelineStep index="04" title="创始人决策" detail="创始人查看完整证据、缺口和异常流程历史" status="就绪" /></div></section>
          </div>
          <section className="panel"><div className="panel-header"><div><h2>邮件匹配规则</h2><p>邮箱数据如何进入该岗位</p></div></div><div className="cards"><div className="work-card"><div className="card-top"><div className="card-copy"><strong>允许自动匹配</strong><span>只有活跃岗位会接收招聘邮箱中的高置信度 CV 匹配。</span></div><span className="pill green">On</span></div></div><div className="work-card"><div className="card-top"><div className="card-copy"><strong>匹配置信度阈值</strong><span>候选人、岗位和附件证据超过 85% 后才可自动创建申请。</span></div><span className="pill">85%</span></div></div><div className="work-card"><div className="card-top"><div className="card-copy"><strong>低置信度兜底</strong><span>模糊 CV 进入待办箱由 HR 确认，而不是静默创建数据。</span></div><span className="pill warn">待办箱</span></div></div></div></section>
        </section>
        {candidateModalOpen ? <NewCandidateModal candidates={candidates} jobs={[job]} onClose={() => setCandidateModalOpen(false)} onCreate={(candidate) => { onCreateCandidate(candidate); setCandidateModalOpen(false); }} /> : null}
      </section>
    </>
  );
}

function ApplicationsPage({ applications, language, onOpenApplication }: { applications: Application[]; language: Language; onOpenApplication: (applicationId: string) => void }) {
  const copy = appCopy[language];
  const tabs = [copy.applications, "Candidate Profile", "Timeline", "Email Threads", "Interviews", "Assessments", "Decisions"];

  return (
    <>
      <header className="topbar"><div className="page-title"><h1>{copy.applications}</h1><p>Pipeline Workbench with State, Owner, Next Action, SLA, timeline and owner load.</p></div></header>
      <section className="page-content">
        <div className="secondary-tabs">{tabs.map((tab, index) => <button className={`secondary-tab ${index === 0 ? "active" : ""}`} type="button" key={tab}>{tab}</button>)}</div>
        <section className="metric-grid"><Metric label="Open Applications" value={String(applications.length)} detail="Created only after Candidate + Job binding" /><Metric label="Due Today" value={String(applications.filter((app) => app.slaStatus === "Today").length)} detail="SLA scan" warning={applications.some((app) => app.slaStatus === "Today")} /><Metric label="Owner Load" value={String(new Set(applications.map((app) => app.currentOwner)).size)} detail="Active owners" /><Metric label="Timeline Events" value={String(applications.reduce((sum, app) => sum + app.timeline.length, 0))} detail="Application history" /></section>
        <section className="panel"><div className="panel-header"><div><h2>Pipeline Workbench</h2><p>State, Owner, Next Action, and SLA stay visible together.</p></div></div><div className="table apps-table workflow-table"><div className="table-row header"><span>Application</span><span>State</span><span>Owner</span><span>Next Action</span><span>SLA</span><span>Action</span></div>{applications.map((application) => <div className="table-row" key={application.id}><div className="cell-main"><strong>{application.candidateName}</strong><span>{application.jobTitle}</span></div><span>{application.currentState}</span><span>{application.currentOwner}</span><span>{application.nextAction}</span><span className={`pill ${application.slaStatus === "Today" ? "warn" : "green"}`}>{application.slaStatus} · {new Date(application.dueAt).toLocaleDateString("en-CA")}</span><button className="ghost-button row-action" type="button" onClick={() => onOpenApplication(application.id)}>Open Application for {application.candidateName}</button></div>)}</div>{applications.length === 0 ? <div className="empty-state">No Applications yet. Attach a Candidate to an Active Job first.</div> : null}</section>
        <section className="content-grid"><section className="panel"><div className="panel-header"><div><h2>Application Timeline</h2><p>Every created Application writes an initial timeline event.</p></div></div><div className="timeline">{applications.flatMap((application) => application.timeline.map((event) => <TimelineStep key={event.id} index={application.currentState} title={event.title} detail={`${application.candidateName} · ${event.detail}`} status={application.slaStatus} warn={application.slaStatus !== "Ready"} />))}</div></section><section className="panel"><div className="panel-header"><div><h2>Owner Load</h2><p>Owner and process accountability stay visible.</p></div></div><div className="cards">{Array.from(new Set(applications.map((application) => application.currentOwner))).map((owner) => <div className="work-card" key={owner}><div className="card-top"><div className="card-copy"><strong>{owner}</strong><span>{applications.filter((application) => application.currentOwner === owner).length} active applications</span></div><span className="pill green">Active</span></div></div>)}</div></section></section>
      </section>
    </>
  );
}

function ApplicationDetailPage({ application, candidate }: { application?: Application; candidate?: Candidate }) {
  const [activeTab, setActiveTab] = useState<"basic" | "interview" | "questions">("interview");
  const candidateName = candidate?.fullName ?? application?.candidateName ?? "Trang Nguyen";
  const jobTitle = application?.jobTitle ?? "高级后端工程师";
  const currentState = application?.currentState ?? "Founder Review";
  const currentOwner = application?.currentOwner ?? "Founder";
  const nextAction = application?.nextAction ?? "批准终面";
  const dueAt = application?.dueAt ? new Date(application.dueAt).toLocaleDateString("en-CA") : "今天到期";

  return (
    <>
      <header className="topbar">
        <div className="page-title"><h1>{candidateName} · {jobTitle}</h1><p>候选人身份信息与 Application 流程状态分离展示。</p></div>
      </header>
      <section className="page-content">
        <div className="secondary-tabs application-detail-tabs" aria-label="申请详情视图">
          <button className={`secondary-tab ${activeTab === "basic" ? "active" : ""}`} type="button" onClick={() => setActiveTab("basic")}><FileUser aria-hidden="true" /> 基本信息</button>
          <button className={`secondary-tab ${activeTab === "interview" ? "active" : ""}`} type="button" onClick={() => setActiveTab("interview")}><MessagesSquare aria-hidden="true" /> 面试流程</button>
          <button className={`secondary-tab ${activeTab === "questions" ? "active" : ""}`} type="button" onClick={() => setActiveTab("questions")}><FileQuestion aria-hidden="true" /> 生成题目</button>
        </div>

        <section className={`ai-summary-panel ${activeTab === "basic" ? "" : "is-hidden"}`} data-application-detail-panel="basic">
          <div><span>AI 分析与建议</span><p>候选人在后端架构、调试深度和 API ownership 上已有强证据；主要缺口是压力下领导力和跨团队协作。建议进入创始人终面，不再增加一轮测评。</p></div>
          <div className="ai-summary-action"><strong>推荐动作</strong><span>建议推进创始人终面，并在终面中覆盖压力下领导力、跨团队冲突和候选人 Offer 时间线。</span></div>
        </section>
        <section className={`panel ${activeTab === "basic" ? "" : "is-hidden"}`} data-application-detail-panel="basic">
          <div className="panel-header"><div><h2>候选人基本信息</h2><p>申请身份、当前流程和完整简历详情</p></div></div>
          <div className="applicant-summary"><div><span>Candidate Identity</span><strong>{candidateName}</strong></div><div><span>Application Workflow</span><strong>{jobTitle}</strong></div><div><span>Current Owner</span><strong>{currentOwner}</strong></div><div><span>Current State</span><strong>{currentState}</strong></div><div><span>Next Action</span><strong>{nextAction} · {dueAt}</strong></div></div>
          <section className="resume-detail-block">
            <div className="resume-detail-head"><div><h3>简历详情</h3><p>{candidateName.replace(/\s+/g, "_")}_CV.pdf · Candidate identity record remains reusable across Jobs</p></div><button className="ghost-button" type="button"><Download aria-hidden="true" /> 下载原始简历</button></div>
            <div className="resume-profile"><div><span>当前职位</span><strong>{candidate?.currentTitle || "后端工程师"}</strong></div><div><span>核心经验</span><strong>{candidate?.skillsSummary || "金融科技 API、分布式系统、服务可靠性"}</strong></div><div><span>工作方式</span><strong>{candidate?.location || "胡志明市 · 可接受混合办公"}</strong></div><div><span>联系方式</span><strong>{candidate?.primaryEmail || candidate?.phone || "Contact pending"}</strong></div></div>
            <div className="resume-section-grid">
              <article><h4>技术栈</h4><p>Go、Node.js、PostgreSQL、Redis、Kafka、Docker、Kubernetes、AWS。熟悉高并发 API、异步任务、支付与风控相关服务。</p></article>
              <article><h4>项目经历</h4><p>主导金融科技平台账户与交易 API 重构，将关键接口延迟降低并提升可观测性；参与拆分单体服务到事件驱动架构。</p></article>
              <article><h4>系统能力</h4><p>具备服务降级、幂等设计、数据一致性、故障排查和容量规划经验，能在跨团队场景中推动接口契约落地。</p></article>
              <article><h4>招聘备注</h4><p>薪资范围、Notice period、地点和英文协作已在 HR 审核中确认；AI 解析置信度 94%，邮件线程已关联。</p></article>
            </div>
            <div className="config-meta"><span className="pill green">高匹配</span><span className="pill">CV 已解析</span><span className="pill">94% 置信度</span><span className="pill">原文保留</span></div>
          </section>
        </section>

        <section className={`ai-summary-panel ${activeTab === "interview" ? "" : "is-hidden"}`} data-application-detail-panel="interview">
          <div><span>AI 总结分析</span><p>候选人在后端架构、调试深度、书面沟通和 API ownership 上已有强证据；测评 V2 已补齐关键技术判断，不建议继续加测。当前主要缺口是压力下领导力、跨团队冲突处理和候选人 Offer 时间线。</p></div>
          <div className="ai-summary-action"><strong>推荐动作</strong><span>进入创始人终面，安排 45 分钟面试，只覆盖未验证能力。</span></div>
        </section>
        <section className={`panel interview-panel ${activeTab === "interview" ? "" : "is-hidden"}`} data-application-detail-panel="interview">
          <div className="panel-header"><div><h2>面试流程与状态</h2><p>当前申请在该岗位下的阶段、负责人、下一步、SLA、AI 准备状态和证据缺口</p></div></div>
          <div className="application-timeline">
            <ApplicationStep done icon={<Check />} title="HR 审核" subtitle="基础条件、薪资范围和英语协作已确认" status="已完成" owner="Linh Tran" next="无" sla="完成" ai="摘要已生成 · 追问已记录" evidence="地点、薪资、Notice period、英语协作" />
            <ApplicationStep done icon={<Check />} title="技术面试" subtitle="系统设计、调试思路和 API 质量已验证" status="已完成" owner="Tech Lead" next="补充记录" sla="完成" ai="记录已摘要 · 评分待面试官确认" evidence="架构取舍、调试深度、API ownership" focus="证据强度高；缺少的是领导力场景，而不是技术深度。" />
            <ApplicationStep done icon={<Check />} title="测评" subtitle="V2 提交已解析，代码取舍证据充足" status="已完成" owner="HR + Tech Lead" next="归档评分" sla="完成" ai="V1/V2 已比较 · Rubric 已关联" evidence="不建议继续加测，信息增益偏低" />
            <article className="application-step current">
              <div className="step-marker"><CalendarClock aria-hidden="true" /></div>
              <div className="step-card">
                <div className="step-head"><div><strong>创始人终面</strong><span>需要验证压力下的领导力、团队协作和 Offer 风险</span></div><span className="pill warn">待安排</span></div>
                <div className="step-meta"><span>负责人：创始人</span><span>下一步：确认终面时间</span><span>SLA：今天</span></div>
                <div className="step-detail-list"><div><span>AI 状态</span><strong>Brief 已生成 · 终面问题待确认</strong></div><div><span>证据缺口</span><strong>压力下领导力、跨团队冲突、候选人时间线</strong></div></div>
                <div className="step-focus warn"><TriangleAlert aria-hidden="true" /><span>AI 推荐安排 45 分钟创始人终面；候选人提到本周还有另一个 Offer 时间线，建议先确认可面试时间。</span></div>
                <div className="step-artifacts"><button className="primary-button" type="button"><BadgeCheck aria-hidden="true" /> 推进终面</button></div>
              </div>
            </article>
          </div>
        </section>
        <section className={`panel ${activeTab === "interview" ? "" : "is-hidden"}`}>
          <div className="panel-header"><div><h2>Application Timeline</h2><p>真实 Application 时间线，独立于 Candidate 身份信息。</p></div></div>
          <div className="timeline">
            {(application?.timeline ?? []).map((event) => <TimelineStep key={event.id} index={event.title} title={event.title} detail={event.detail} status={application?.slaStatus ?? "Ready"} />)}
          </div>
        </section>

        <section className={`panel question-workspace ${activeTab === "questions" ? "" : "is-hidden"}`} data-application-detail-panel="questions">
          <div className="panel-header"><div><h2>生成题目</h2><p>基于候选人证据缺口与终面目标，与 AI 协作生成面试题</p></div><button className="ai-button" type="button"><Sparkles aria-hidden="true" /> 继续生成</button></div>
          <div className="question-meta-grid"><article><span>生成的人</span><strong>Linh Tran</strong><small>HR Lead · 2026-07-28 10:24</small></article><article><span>面试阶段</span><strong>创始人终面</strong><small>45 分钟 · 只覆盖未验证能力</small></article><article><span>AI 依据</span><strong>7 个证据事件</strong><small>技术面试、测评 V2、简历和邮件线程</small></article></div>
          <div className="question-workspace-grid">
            <section className="question-chat"><h3>AI 交互记录</h3><div className="chat-turn user"><span>Linh Tran</span><p>请基于当前证据缺口生成创始人终面问题，不要重复技术深度问题。</p></div><div className="chat-turn ai"><span>HireOS AI</span><p>已排除后端架构、调试深度和 API ownership，题目聚焦压力下领导力、跨团队冲突处理和 Offer 时间线。</p></div><div className="chat-turn user"><span>Linh Tran</span><p>每个问题要能产生可评分证据，并给出追问方向。</p></div></section>
            <section className="question-list"><h3>已生成题目</h3><article className="question-card"><span>01 · 领导力</span><strong>讲一次你在关键系统压力下推动团队做取舍的经历。</strong><p>追问：你如何判断优先级、同步风险，以及复盘后改变了什么。</p></article><article className="question-card"><span>02 · 跨团队冲突</span><strong>当产品、合规和工程对上线窗口意见冲突时，你会如何推进决策？</strong><p>追问：你会要求哪些证据，哪些情况会暂停上线。</p></article><article className="question-card"><span>03 · Offer 风险</span><strong>你当前的时间线和其他机会会怎样影响入职决策？</strong><p>追问：确认可接受的决策窗口、薪资边界和入职限制。</p></article></section>
          </div>
        </section>
      </section>
    </>
  );
}

function ApplicationStep({ ai, done, evidence, focus, icon, next, owner, sla, status, subtitle, title }: { ai: string; done?: boolean; evidence: string; focus?: string; icon: ReactNode; next: string; owner: string; sla: string; status: string; subtitle: string; title: string }) {
  return (
    <article className={`application-step ${done ? "done" : ""}`}>
      <div className="step-marker">{icon}</div>
      <div className="step-card">
        <div className="step-head"><div><strong>{title}</strong><span>{subtitle}</span></div><span className="pill green">{status}</span></div>
        <div className="step-meta"><span>负责人：{owner}</span><span>下一步：{next}</span><span>SLA：{sla}</span></div>
        <div className="step-detail-list"><div><span>AI 状态</span><strong>{ai}</strong></div><div><span>面试反馈</span><strong>{evidence}</strong></div></div>
        {focus ? <div className="step-focus"><BadgeCheck aria-hidden="true" /><span>{focus}</span></div> : null}
      </div>
    </article>
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

function allocationLabel(status: CandidateAllocationState): string {
  return ({
    assigned: "Assigned",
    duplicate_review: "Duplicate Review",
    not_fit_current_job: "Not Fit Current Job",
    rejected_global: "Rejected Global",
    unassigned_pool: "Unassigned Pool"
  })[status];
}

function candidateInitials(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "C";
}

function loadJobs(): Job[] {
  return loadLocalState(JOBS_KEY, seedJobs);
}

function saveJobs(jobs: Job[]) {
  saveLocalState(JOBS_KEY, jobs);
}

function loadCandidates(): Candidate[] {
  return loadLocalState(CANDIDATES_KEY, seedCandidates);
}

function saveCandidates(candidates: Candidate[]) {
  saveLocalState(CANDIDATES_KEY, candidates);
}

function loadApplications(): Application[] {
  return loadLocalState(APPLICATIONS_KEY, seedApplications);
}

function saveApplications(applications: Application[]) {
  saveLocalState(APPLICATIONS_KEY, applications);
}

function loadLanguage(): Language {
  try {
    return window.localStorage.getItem(LANGUAGE_KEY) === "中文" ? "中文" : "EN";
  } catch {
    return "EN";
  }
}

function saveLanguage(language: Language) {
  try {
    window.localStorage.setItem(LANGUAGE_KEY, language);
  } catch {
    // Local persistence is best-effort for the prototype slice.
  }
}

function loadLocalState<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveLocalState<T>(key: string, value: T) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Local persistence is best-effort for the prototype slice.
  }
}

function readRouteFromLocation(): { route: RouteId; jobId: string | null; applicationId: string | null } {
  const path = window.location.pathname.replace(/\/$/, "") || "/";
  if (path === "/" || path === "/login" || path === "/dashboard") return { route: "dashboard", jobId: null, applicationId: null };
  if (path === "/jobs") return { route: "jobs", jobId: null, applicationId: null };
  if (path.startsWith("/jobs/")) return { route: "job-detail", jobId: decodeURIComponent(path.slice("/jobs/".length)), applicationId: null };
  if (path === "/applications") return { route: "applications", jobId: null, applicationId: null };
  if (path.startsWith("/applications/")) return { route: "application-detail", jobId: null, applicationId: decodeURIComponent(path.slice("/applications/".length)) };
  if (path === "/application-detail") return { route: "application-detail", jobId: null, applicationId: null };
  if (path === "/settings/mailbox") return { route: "settings-mailbox", jobId: null, applicationId: null };
  const route = path.slice(1) as RouteId;
  return isPlaceholderRoute(route) ? { route, jobId: null, applicationId: null } : { route: "dashboard", jobId: null, applicationId: null };
}

function routeToPath(route: RouteId, jobId?: string): string {
  if (route === "dashboard") return "/dashboard";
  if (route === "job-detail") return `/jobs/${encodeURIComponent(jobId ?? "")}`;
  if (route === "application-detail") return jobId ? `/applications/${encodeURIComponent(jobId)}` : "/application-detail";
  if (route === "settings-mailbox") return "/settings/mailbox";
  return `/${route}`;
}

function shellActiveRoute(route: RouteId): ShellNavRoute {
  if (route === "job-detail" || route === "application-detail") return "jobs";
  if (route === "inbox-detail" || route === "email-agent") return "inbox";
  if (route === "settings-mailbox") return "settings";
  if (route === "analytics") return "analytics";
  if (route === "jobs" || route === "dashboard" || route === "candidates" || route === "applications" || route === "inbox" || route === "settings") return route;
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

function buildAgentContext(route: RouteId, job?: Job, candidate?: Candidate): AgentContext {
  if (route === "application-detail") {
    return {
      recommendation: "可以询问候选人背景、面试状态、为什么建议进入终面，或让 AI 起草终面问题。",
      evidence: [
        { label: "Candidate", value: candidate?.fullName ?? "Selected application candidate" },
        { label: "建议", value: "推进创始人终面，不再增加测评。" },
        { label: "风险", value: "领导力缺口需要在终面覆盖。" },
        { label: "置信度", value: "高 · 已关联 7 个证据事件。" }
      ],
      ask: "询问这个候选人的背景、证据缺口、终面准备或下一步动作。",
      approveLabel: "起草问题",
      reviewLabel: "查看依据"
    };
  }
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
