import { FormEvent, ReactNode, useEffect, useState } from "react";
import {
  Activity,
  Archive,
  ArrowLeft,
  BadgeCheck,
  Bell,
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
  ListChecks,
  LogOut,
  MailOpen,
  MailPlus,
  MailQuestion,
  MessagesSquare,
  OctagonAlert,
  PanelLeftClose,
  PanelRightClose,
  Paperclip,
  PauseCircle,
  Plus,
  RefreshCw,
  Save,
  SendHorizontal,
  Settings,
  Sparkles,
  TriangleAlert,
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
  InterviewDraft,
  completeInterview,
  createInterviewForApplication,
  parseInterviewFeedback
} from "./domain/interviews";
import {
  Assessment,
  acceptStopRule,
  assessmentApplicationState,
  buildAssessmentDraft,
  completeAssessment,
  createAssessment,
  markAssessmentReady,
  parseAssessmentSubmission,
  recordAssessmentSubmission,
  requireCalibration,
  seedAssessments,
  sendAssessment,
  startAssessmentReview
} from "./domain/assessments";
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
import {
  DuplicateSignalSeam,
  InboxItemStatus,
  countNeedsReviewThreads,
  reviewInboxItem,
  seedAiActions,
  seedDuplicateSignals,
  seedEmailThreads,
  seedInboxItems
} from "./domain/inbox";
import {
  RecruitingTask,
  TaskCompletion,
  TaskView,
  buildRecruitingTasks,
  completeTask,
  filterFounderTasks,
  filterSettingsGovernanceTasks,
  filterTasks
} from "./domain/tasks";
import {
  GovernanceState,
  defaultGovernanceState,
  evaluateAiAction,
  updateGovernanceState
} from "./domain/governance";
import "./styles.css";

type RouteId =
  | "dashboard"
  | "tasks"
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

type ShellNavRoute = "dashboard" | "tasks" | "jobs" | "candidates" | "applications" | "assessments" | "inbox" | "founder-inbox" | "analytics" | "settings";
type PlaceholderRoute = Exclude<RouteId, "dashboard" | "tasks" | "jobs" | "job-detail">;

const JOBS_KEY = "hireos.jobs";
const CANDIDATES_KEY = "hireos.candidates";
const APPLICATIONS_KEY = "hireos.applications";
const ASSESSMENTS_KEY = "hireos.assessments";
const GOVERNANCE_KEY = "hireos.governance";
const LANGUAGE_KEY = "hireos.language";
const TASK_COMPLETIONS_KEY = "hireos.taskCompletions";

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
type RouteState = { route: RouteId; jobId: string | null; applicationId: string | null; taskView: TaskView | null };

const appCopy = {
  EN: {
    accountMenu: "User menu for",
    analytics: "Analytics",
    applications: "Applications",
    assessments: "Assessments",
    candidates: "Candidates",
    dashboard: "Dashboard",
    founderInbox: "Founder Inbox",
    inbox: "Inbox",
    intelligence: "Intelligence",
    jobs: "Jobs",
    language: "Language",
    newCandidate: "New Candidate",
    operate: "Operate",
    settings: "Settings",
    tasks: "Tasks",
    signOut: "Sign out"
  },
  中文: {
    accountMenu: "用户菜单",
    analytics: "分析",
    applications: "申请流程",
    assessments: "测评",
    candidates: "候选人",
    dashboard: "看板",
    founderInbox: "创始人待办",
    inbox: "待办箱",
    intelligence: "智能",
    jobs: "岗位",
    language: "语言",
    newCandidate: "新建候选人",
    operate: "运营",
    settings: "设置",
    tasks: "任务",
    signOut: "退出登录"
  }
} satisfies Record<Language, Record<string, string>>;

export default function App() {
  const initialRoute = readRouteFromLocation();
  const [session, setSession] = useState<AuthSession | null>(() => loadAuthState());
  const [route, setRoute] = useState<RouteId>(() => initialRoute.route);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(() => initialRoute.jobId);
  const [jobs, setJobs] = useState<Job[]>(loadJobs);
  const [candidates, setCandidates] = useState<Candidate[]>(loadCandidates);
  const [applications, setApplications] = useState<Application[]>(loadApplications);
  const [assessments, setAssessments] = useState<Assessment[]>(loadAssessments);
  const [governance, setGovernance] = useState<GovernanceState>(loadGovernance);
  const [language, setLanguage] = useState<Language>(loadLanguage);
  const [taskCompletions, setTaskCompletions] = useState<TaskCompletion[]>(loadTaskCompletions);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(() => initialRoute.applicationId);
  const [initialTaskView, setInitialTaskView] = useState<TaskView | null>(() => initialRoute.taskView);

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
    saveAssessments(assessments);
  }, [assessments]);

  useEffect(() => {
    saveGovernance(governance);
  }, [governance]);

  useEffect(() => {
    saveLanguage(language);
  }, [language]);

  useEffect(() => {
    saveTaskCompletions(taskCompletions);
  }, [taskCompletions]);

  useEffect(() => {
    const onPopState = () => {
      const next = readRouteFromLocation();
      setRoute(next.route);
      setSelectedJobId(next.jobId);
      setSelectedApplicationId(next.applicationId);
      setInitialTaskView(next.taskView);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  function navigate(routeId: RouteId, jobId?: string, taskView?: TaskView) {
    window.history.pushState({}, "", routeToPath(routeId, jobId, taskView));
    setRoute(routeId);
    setSelectedJobId(jobId ?? null);
    setSelectedApplicationId(routeId === "application-detail" ? jobId ?? null : null);
    setInitialTaskView(routeId === "tasks" ? taskView ?? null : null);
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

  function scheduleInterview(applicationId: string, draft: InterviewDraft) {
    setApplications((current) => current.map((application) => {
      if (application.id !== applicationId) return application;
      const result = createInterviewForApplication(application, draft);
      return { ...result.application, interviews: [...(application.interviews ?? []), result.interview] };
    }));
  }

  function markInterviewCompleted(applicationId: string, interviewId: string) {
    setApplications((current) => current.map((application) => {
      if (application.id !== applicationId) return application;
      const interview = application.interviews?.find((item) => item.id === interviewId);
      if (!interview) return application;
      const result = completeInterview(application, interview);
      return {
        ...result.application,
        interviews: (application.interviews ?? []).map((item) => item.id === interviewId ? result.interview : item)
      };
    }));
  }

  function submitInterviewFeedback(applicationId: string, interviewId: string, draft: Parameters<typeof parseInterviewFeedback>[2]) {
    setApplications((current) => current.map((application) => {
      if (application.id !== applicationId) return application;
      const interview = application.interviews?.find((item) => item.id === interviewId);
      if (!interview) return application;
      const result = parseInterviewFeedback(application, interview, draft);
      return {
        ...result.application,
        interviews: (application.interviews ?? []).map((item) => item.id === interviewId ? result.interview : item)
      };
    }));
  }

  function createAssessmentDraft(applicationId: string, title: string, purpose: string, prompt: string) {
    const application = applications.find((item) => item.id === applicationId);
    const job = application ? jobs.find((item) => item.id === application.jobId) : undefined;
    if (!application || !job) return;
    const draft = buildAssessmentDraft(application, job, session?.name ?? "Linh Tran");
    const assessment = createAssessment({ ...draft, title, purpose, prompt });
    setAssessments((current) => [assessment, ...current]);
    setApplications((current) => syncAssessmentIntoApplications(current, assessment));
  }

  function transitionAssessment(assessmentId: string, transform: (assessment: Assessment) => Assessment) {
    const currentAssessment = assessments.find((assessment) => assessment.id === assessmentId);
    if (!currentAssessment) return;
    const nextAssessment = transform(currentAssessment);
    setAssessments((current) => current.map((assessment) => assessment.id === assessmentId ? nextAssessment : assessment));
    setApplications((current) => syncAssessmentIntoApplications(current, nextAssessment));
  }

  function tightenGovernanceThreshold() {
    setGovernance((current) => updateGovernanceState(current, { thresholds: { ...current.thresholds, candidateMatch: 0.9, autoApply: 0.94 } }, "Tighten AI writeback boundaries"));
  }

  function recordTaskAction(task: RecruitingTask, actionLabel: string) {
    const completion = completeTask(task, actionLabel, session?.name ?? "Linh Tran");
    setTaskCompletions((current) => [completion, ...current.filter((item) => item.id !== task.id)]);
    applyTaskSourceAction(task, actionLabel);
    const applicationRef = task.relatedObjects.find((item) => item.module === "Applications");
    if (applicationRef) {
      setApplications((current) => current.map((application) => {
        if (application.id !== applicationRef.id) return application;
        return {
          ...application,
          timeline: [
            ...application.timeline,
            {
              actor: completion.completedBy ?? "Linh Tran",
              detail: `${actionLabel} recorded from Task Center.`,
              eventType: "state_changed",
              id: `timeline-${task.id}-${Date.now()}`,
              occurredAt: completion.completedAt ?? new Date().toISOString(),
              title: "Task action recorded"
            }
          ]
        };
      }));
    }
  }

  function applyTaskSourceAction(task: RecruitingTask, actionLabel: string) {
    const assessmentRef = task.relatedObjects.find((item) => item.module === "Assessments");
    if (assessmentRef) {
      if (actionLabel === "Mark ready to send") transitionAssessment(assessmentRef.id, markAssessmentReady);
      if (actionLabel === "Send assessment") transitionAssessment(assessmentRef.id, (assessment) => sendAssessment(assessment, "email-thread-assessment-send"));
      if (actionLabel === "Parse submission") transitionAssessment(assessmentRef.id, parseAssessmentSubmission);
      if (actionLabel === "Start AI review") transitionAssessment(assessmentRef.id, startAssessmentReview);
      if (actionLabel === "Confirm Stop Rule" || actionLabel === "Mark reviewed") transitionAssessment(assessmentRef.id, (assessment) => completeAssessment(assessment, "Task Center completed assessment review."));
    }

    const applicationRef = task.relatedObjects.find((item) => item.module === "Applications");
    if (applicationRef && actionLabel === "Mark interview completed") {
      const application = applications.find((item) => item.id === applicationRef.id);
      const interview = application?.interviews?.find((item) => task.id.endsWith(item.id));
      if (interview) markInterviewCompleted(applicationRef.id, interview.id);
    }
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
  const tasks = buildRecruitingTasks({ applications, assessments, jobs, completions: taskCompletions });
  const agentContext = buildAgentContext(route, selectedJob, selectedApplicationCandidate);

  return (
    <AppShell
      activeRoute={shellActiveRoute(route)}
      agentContext={agentContext}
      agentTitle={agentTitle(route)}
      agentSubtitle={agentSubtitle(route)}
      language={language}
      onLanguageChange={setLanguage}
      onNavigate={(nextRoute) => navigate(nextRoute)}
      onSignOut={() => {
        clearAuthState();
        setSession(null);
        window.history.pushState({}, "", "/login");
        setRoute("dashboard");
        setSelectedJobId(null);
        setInitialTaskView(null);
      }}
      session={session}
      taskCount={tasks.filter((task) => task.status !== "Completed" && task.status !== "Routed").length}
    >
      {route === "dashboard" ? <DashboardPage applications={applications} assessments={assessments} jobs={jobs} onOpenTasks={(view) => navigate("tasks", undefined, view)} tasks={tasks} /> : null}
      {route === "tasks" ? <TasksPage actor={{ name: session.name, role: session.role }} initialView={initialTaskView} onOpenApplication={(applicationId) => navigate("application-detail", applicationId)} onTaskAction={recordTaskAction} tasks={tasks} /> : null}
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
      {route === "candidates" ? <CandidatesPage applications={applications} candidates={candidates} copy={appCopy[language]} jobs={jobs} onCreateCandidate={createCandidate} onResolveDuplicate={resolveDuplicateCandidate} /> : null}
      {route === "applications" ? <ApplicationsPage applications={applications} assessments={assessments} onOpenApplication={(applicationId) => navigate("application-detail", applicationId)} /> : null}
      {route === "application-detail" ? <ApplicationDetailPage application={selectedApplication} assessments={assessments.filter((assessment) => assessment.applicationId === selectedApplication?.id)} candidate={selectedApplicationCandidate} onCompleteInterview={markInterviewCompleted} onScheduleInterview={scheduleInterview} onSubmitFeedback={submitInterviewFeedback} /> : null}
      {route === "assessments" ? (
        <AssessmentsPage
          applications={applications}
          assessments={assessments}
          onAcceptStopRule={(assessmentId) => transitionAssessment(assessmentId, (assessment) => acceptStopRule(assessment, "Evidence coverage is enough after v2."))}
          onCalibrate={(assessmentId) => transitionAssessment(assessmentId, (assessment) => requireCalibration(assessment, "Rubric threshold needs human calibration."))}
          onComplete={(assessmentId) => transitionAssessment(assessmentId, (assessment) => completeAssessment(assessment, "HR calibrated rubric and accepted the stop rule."))}
          onCreateDraft={createAssessmentDraft}
          onMarkReady={(assessmentId) => transitionAssessment(assessmentId, markAssessmentReady)}
          onParseSubmission={(assessmentId) => transitionAssessment(assessmentId, parseAssessmentSubmission)}
          onRecordSubmission={(assessmentId) => transitionAssessment(assessmentId, (assessment) => recordAssessmentSubmission(assessment, { attachments: ["backend-case-v2.zip", "architecture-notes.pdf"], emailThreadId: "email-thread-assessment-submit", submittedAt: new Date().toISOString(), version: "v2" }))}
          onSend={(assessmentId) => transitionAssessment(assessmentId, (assessment) => sendAssessment(assessment, "email-thread-assessment-send"))}
          onStartReview={(assessmentId) => transitionAssessment(assessmentId, startAssessmentReview)}
        />
      ) : null}
      {route === "inbox" ? <InboxPage onOpenDetail={() => navigate("inbox-detail")} onOpenEmailAgent={() => navigate("email-agent")} /> : null}
      {route === "email-agent" ? <EmailAgentPage /> : null}
      {route === "inbox-detail" ? <InboxDetailPage /> : null}
      {route === "founder-inbox" ? <FounderInboxPage onTaskAction={recordTaskAction} tasks={tasks} /> : null}
      {route === "settings" ? <SettingsPage governance={governance} tasks={tasks} onOpenMailbox={() => navigate("settings-mailbox")} onTightenThreshold={tightenGovernanceThreshold} /> : null}
      {route === "settings-mailbox" ? <SettingsMailboxPage governance={governance} onBack={() => navigate("settings")} /> : null}
      {isPlaceholderRoute(route) && !["application-detail", "applications", "assessments", "candidates", "inbox", "email-agent", "inbox-detail", "founder-inbox", "settings", "settings-mailbox"].includes(route) ? <PlaceholderPage route={route} title={placeholderLabels[route]} /> : null}
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
  session,
  taskCount
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
  taskCount: number;
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
          <NavButton active={activeRoute === "tasks"} count={String(taskCount)} icon={<ListChecks />} label={copy.tasks} onClick={() => onNavigate("tasks")} />
          <NavButton active={activeRoute === "jobs"} count="12" icon={<BriefcaseBusiness />} label={copy.jobs} onClick={() => onNavigate("jobs")} />
          <NavButton active={activeRoute === "candidates"} icon={<UsersRound />} label={copy.candidates} onClick={() => onNavigate("candidates")} />
          <NavButton active={activeRoute === "applications"} icon={<Layers3 />} label={copy.applications} onClick={() => onNavigate("applications")} />
          <NavButton active={activeRoute === "assessments"} icon={<FilePenLine />} label={copy.assessments} onClick={() => onNavigate("assessments")} />
          <NavButton active={activeRoute === "inbox"} count="76" icon={<Inbox />} label={copy.inbox} onClick={() => onNavigate("inbox")} />
          <NavButton active={activeRoute === "founder-inbox"} icon={<BadgeCheck />} label={copy.founderInbox} onClick={() => onNavigate("founder-inbox")} />
        </nav>
        <div className="nav-section">{copy.intelligence}</div>
        <nav className="nav">
          <NavButton active={activeRoute === "analytics"} icon={<ChartNoAxesCombined />} label={copy.analytics} onClick={() => onNavigate("analytics")} />
          <NavButton active={activeRoute === "settings"} icon={<Settings />} label={copy.settings} onClick={() => onNavigate("settings")} />
        </nav>
        <div className="sidebar-footer">
          <button className="user-status" aria-expanded={accountOpen} aria-label={`Account menu ${copy.accountMenu} ${session.name}`} type="button" onClick={() => setAccountOpen((value) => !value)}>
            <div className="avatar">LT</div>
            <div className="user-copy"><strong>{session.name}</strong><span><b /> Online · {session.role}</span></div>
            <span className="account-toggle" title={copy.accountMenu}>
              <ChevronUp aria-hidden="true" />
            </span>
          </button>
          <div className={`account-menu ${accountOpen ? "is-open" : ""}`}>
            <button type="button"><UserRound aria-hidden="true" /> Profile</button>
            <button type="button"><Bell aria-hidden="true" /> Notifications</button>
            <div className="language-switch" aria-label="语言切换"><span>{copy.language}</span><div>{(["EN", "中文"] as const).map((item) => <button aria-pressed={language === item} className={language === item ? "active" : ""} key={item} onClick={() => onLanguageChange(item)} type="button">{item}</button>)}</div></div>
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

function DashboardPage({
  applications,
  assessments,
  jobs,
  onOpenTasks,
  tasks
}: {
  applications: Application[];
  assessments: Assessment[];
  jobs: Job[];
  onOpenTasks: (view: TaskView) => void;
  tasks: RecruitingTask[];
}) {
  const criticalTasks = filterTasks(tasks, "Critical", { name: "", role: "" });
  const todayTasks = filterTasks(tasks, "Today", { name: "", role: "" });
  const waitingTasks = filterTasks(tasks, "Waiting on Others", { name: "", role: "" });
  const batchTasks = filterTasks(tasks, "Batch Review", { name: "", role: "" });
  const activeJobs = jobs.filter((job) => job.status === "active");
  const interviewTasks = tasks.filter((task) => task.sourceModule === "Applications" && /interview/i.test(`${task.title} ${task.nextAction}`));
  const reviewLoad = batchTasks.length + assessments.filter((assessment) => ["Submitted", "Parsed", "In Review", "Calibrate"].includes(assessment.status)).length;
  const openTasks = tasks.filter((task) => task.status !== "Completed" && task.status !== "Routed");
  const healthScore = Math.max(0, Math.round(((activeJobs.length + applications.length) / Math.max(1, activeJobs.length + applications.length + waitingTasks.length + criticalTasks.length)) * 100));

  const summaries: DashboardSummaryCard[] = [
    {
      detail: `${criticalTasks.slice(0, 2).map((task) => task.sourceModule).join(", ") || "No same-day risks"} need a decision path.`,
      icon: <OctagonAlert aria-hidden="true" />,
      label: "Critical",
      tone: "danger",
      value: String(criticalTasks.length),
      view: "Critical"
    },
    {
      detail: `${todayTasks.length ? "Due by today's SLA window" : "No due-today tasks"} across active recruiting work.`,
      icon: <CalendarClock aria-hidden="true" />,
      label: "Today Due",
      tone: "warn",
      value: String(todayTasks.length),
      view: "Today"
    },
    {
      detail: "Candidate, founder, or setup dependencies that need a nudge or route.",
      icon: <PauseCircle aria-hidden="true" />,
      label: "Waiting on Others",
      value: String(waitingTasks.length),
      view: "Waiting on Others"
    },
    {
      detail: interviewTasks.length ? interviewTasks.slice(0, 2).map((task) => task.title).join(" · ") : "Interview work will appear here once scheduled.",
      icon: <MessagesSquare aria-hidden="true" />,
      label: "Upcoming Interviews",
      value: String(interviewTasks.length),
      view: "Today"
    },
    {
      detail: `${reviewLoad} evidence or intake items can be handled together.`,
      icon: <Layers3 aria-hidden="true" />,
      label: "Batch Review",
      value: String(batchTasks.length),
      view: "Batch Review"
    },
    {
      detail: `${openTasks.length} open tasks across ${activeJobs.length} active jobs.`,
      icon: <Activity aria-hidden="true" />,
      label: "Recruitment Health",
      tone: healthScore < 70 ? "warn" : "green",
      value: `${healthScore}%`,
      view: "All Tasks"
    }
  ];

  return (
    <>
      <header className="topbar">
        <div className="page-title"><h1>Daily Home</h1><p>Founder and HR summary for today&apos;s recruiting decisions, handoffs, and health.</p></div>
      </header>
      <section className="page-content dashboard-home">
        <section className="dashboard-summary-grid" aria-label="Daily task summary">
          {summaries.map((summary) => <DashboardSummaryCard key={summary.label} onOpenTasks={onOpenTasks} summary={summary} />)}
        </section>
        <section className="unframed-section">
          <div className="panel-header"><div><h2>Daily Focus</h2><p>Summary-only home view. Use each card to continue in the filtered Task Center.</p></div><span className="pill green">{openTasks.length} open task signals</span></div>
        </section>
        <section className="content-grid">
          <section className="panel">
            <div className="panel-header"><div><h2>Activity Timeline</h2><p>Recent recruiting operations events stay in the Dashboard hierarchy.</p></div></div>
            <div className="timeline">
              {applications.flatMap((application) => application.timeline).slice(-3).map((event) => (
                <TimelineStep key={event.id} index={new Date(event.occurredAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} title={event.title} detail={event.detail} status={event.actor} />
              ))}
            </div>
          </section>
          <section className="panel">
            <div className="panel-header"><div><h2>Risk Recommendations</h2><p>Dashboard-level AI recommendations remain separate from module detail work.</p></div></div>
            <div className="cards">
              {criticalTasks.slice(0, 2).map((task) => (
                <div className="work-card" key={task.id}><div className="card-top"><div className="card-copy"><strong>{task.title}</strong><span>{task.aiRecommendation ?? task.nextAction}</span></div><span className="pill warn">{task.priority}</span></div></div>
              ))}
              {criticalTasks.length === 0 ? <div className="work-card"><div className="card-top"><div className="card-copy"><strong>No critical task risk</strong><span>Continue from Today Due or Batch Review when new signals arrive.</span></div><span className="pill green">Ready</span></div></div> : null}
            </div>
          </section>
        </section>
      </section>
    </>
  );
}

type DashboardSummaryCard = {
  detail: string;
  icon: ReactNode;
  label: string;
  tone?: "danger" | "green" | "warn";
  value: string;
  view: TaskView;
};

function DashboardSummaryCard({ onOpenTasks, summary }: { onOpenTasks: (view: TaskView) => void; summary: DashboardSummaryCard }) {
  return (
    <button aria-label={`Open ${summary.label} tasks`} className={`summary-card ${summary.tone ?? ""}`} onClick={() => onOpenTasks(summary.view)} type="button">
      <span className="summary-icon">{summary.icon}</span>
      <span className="summary-copy"><span>{summary.label}</span><strong>{summary.value}</strong><small>{summary.detail}</small></span>
    </button>
  );
}

function TasksPage({
  actor,
  initialView,
  onOpenApplication,
  onTaskAction,
  tasks
}: {
  actor: { name: string; role: string };
  initialView: TaskView | null;
  onOpenApplication: (applicationId: string) => void;
  onTaskAction: (task: RecruitingTask, actionLabel: string) => void;
  tasks: RecruitingTask[];
}) {
  const [activeView, setActiveView] = useState<TaskView>(initialView ?? "All Tasks");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const visibleTasks = filterTasks(tasks, activeView, actor);
  const selectedTask = selectedTaskId ? tasks.find((task) => task.id === selectedTaskId) : undefined;
  const openTasks = tasks.filter((task) => task.status !== "Completed" && task.status !== "Routed");
  const completedTasks = tasks.filter((task) => task.completedAction);

  useEffect(() => {
    setActiveView(initialView ?? "All Tasks");
    setSelectedTaskId(null);
  }, [initialView]);

  function chooseView(view: TaskView) {
    setActiveView(view);
    setSelectedTaskId(null);
  }

  function act(task: RecruitingTask, actionLabel: string) {
    onTaskAction(task, actionLabel);
  }

  return (
    <>
      <header className="topbar">
        <div className="page-title"><h1>Tasks</h1><p>One execution center for recruiting next actions, owners, SLA, and evidence-linked actions.</p></div>
      </header>
      <section className="page-content tasks-page">
        <section className="metric-grid">
          <Metric label="Open Tasks" value={String(openTasks.length)} detail="Across Applications, Inbox, Jobs, Assessments" />
          <Metric label="Critical" value={String(tasks.filter((task) => task.priority === "Critical").length)} detail="Needs same-day attention" warning={tasks.some((task) => task.priority === "Critical")} />
          <Metric label="Waiting" value={String(tasks.filter((task) => task.status === "Waiting on Others").length)} detail="Owned by candidate, founder, or setup dependency" />
          <Metric label="Completed Actions" value={String(completedTasks.length)} detail="Local action history" />
        </section>

        <section className="panel">
          <div className="panel-header">
            <div><h2>Task Center</h2><p>Filters keep each execution view separate while preserving the same task contract underneath.</p></div>
            <span className="pill green">Task contract baseline</span>
          </div>
          <div className="secondary-tabs task-tabs" aria-label="Task views">
            {(["All Tasks", "My Tasks", "Critical", "Today", "Waiting on Others", "Batch Review"] as TaskView[]).map((view) => (
              <button className={`secondary-tab ${activeView === view ? "active" : ""}`} key={view} type="button" onClick={() => chooseView(view)}>{view}</button>
            ))}
          </div>
          <div className="table tasks-table">
            <div className="table-row header"><span>Task</span><span>Source</span><span>Owner</span><span>Next Action</span><span>SLA</span><span>Action</span></div>
            {visibleTasks.map((task) => (
              <div className="table-row" key={task.id}>
                <div className="cell-main"><strong>{task.title}</strong><span>{task.completedAction ? `Action recorded: ${task.completedAction}` : task.risk ?? "Ready for review"}</span></div>
                <span>Source: {task.sourceModule}</span>
                <span>{task.owner ?? task.ownerRole ?? "Unassigned"}</span>
                <span>{task.nextAction}</span>
                <span className={`pill ${task.slaState === "Today" || task.slaState === "Blocked" ? "warn" : "green"}`}>{task.slaState}{task.dueAt ? ` · ${new Date(task.dueAt).toLocaleDateString("en-CA")}` : ""}</span>
                <button className="ghost-button row-action" type="button" onClick={() => setSelectedTaskId(task.id)}>Open {task.title}</button>
              </div>
            ))}
          </div>
          {visibleTasks.length === 0 ? <div className="empty-state">No tasks in this view.</div> : null}
        </section>

        <section className="content-grid">
          <section className="panel"><div className="panel-header"><div><h2>Action Timeline</h2><p>Completes and routes are recorded visibly for audit review.</p></div></div><div className="timeline">{completedTasks.map((task) => <TimelineStep key={task.id} index={task.status} title={`Task action: ${task.completedAction}`} detail={`${task.status === "Routed" ? routedAuditCopy(task.completedAction, task.completedBy) : `Done by ${task.completedBy}`} · ${formatDateTime(task.completedAt)}`} status={task.status} />)}{completedTasks.length === 0 ? <TimelineStep index="Ready" title="No Task Center actions yet" detail="Complete or route a task to record local audit feedback." status="Open" /> : null}</div></section>
          <section className="panel"><div className="panel-header"><div><h2>Related Work</h2><p>Task links show the source object without changing the owning module.</p></div></div><div className="cards">{tasks.slice(0, 4).map((task) => <div className="work-card" key={task.id}><div className="card-top"><div className="card-copy"><strong>{task.sourceModule} context</strong><span>{task.relatedObjects.map((item) => `${item.module}: ${item.label}`).join(" · ")}</span></div><span className={`pill ${task.priority === "Critical" ? "warn" : "green"}`}>{task.priority}</span></div></div>)}</div></section>
        </section>
      </section>
      {selectedTask ? <TaskDetailDialog onAction={act} onClose={() => setSelectedTaskId(null)} onOpenApplication={(applicationId) => { setSelectedTaskId(null); onOpenApplication(applicationId); }} task={selectedTask} /> : null}
    </>
  );
}

function TaskDetailDialog({ onAction, onClose, onOpenApplication, task }: { onAction: (task: RecruitingTask, actionLabel: string) => void; onClose: () => void; onOpenApplication: (applicationId: string) => void; task: RecruitingTask }) {
  const applicationRef = task.relatedObjects.find((item) => item.module === "Applications");

  return (
    <div className="modal-backdrop">
      <div className="mail-connect-modal task-detail-modal" role="dialog" aria-modal="true" aria-label={task.title}>
        <header className="modal-header"><div><h2>{task.title}</h2><p>{task.sourceModule} task · {task.owner ?? task.ownerRole ?? "Unassigned"} owns the next step.</p></div><button className="icon-button" type="button" aria-label="关闭" onClick={onClose}><X aria-hidden="true" /></button></header>
        <div className="connect-panels task-detail-grid">
          <section className="connect-panel">
            <div className="applicant-summary compact-summary"><div><span>Priority</span><strong>{task.priority}</strong></div><div><span>Status</span><strong>{task.status}</strong></div><div><span>SLA</span><strong>{task.slaState}</strong></div><div><span>Next action</span><strong>{task.nextAction}</strong></div></div>
            <div className="rule-note"><strong>AI recommendation</strong><span>{task.aiRecommendation ?? "Review task context before changing owner or state."}</span></div>
            <div className="rule-note"><strong>Risk</strong><span>{task.risk ?? "No AI risk attached."}</span></div>
            {task.completedAction ? <div className="rule-note"><strong>Completion</strong><span>Completed action: {task.completedAction} · Completed by: {task.completedBy} · {formatDateTime(task.completedAt)}</span></div> : null}
          </section>
          <section className="connect-panel">
            <div className="panel-header compact"><div><h3>Evidence refs</h3><p>Source evidence stays attached to the task.</p></div></div>
            <div className="cards">{(task.evidenceRefs?.length ? task.evidenceRefs : ["No evidence refs attached"]).map((item) => <div className="work-card" key={item}><div className="card-copy"><strong>{item}</strong><span>Evidence ref</span></div></div>)}</div>
            <div className="panel-header compact"><div><h3>Related objects</h3><p>Objects owned by source modules.</p></div></div>
            <div className="config-meta">{task.relatedObjects.map((item) => <span className="pill" key={`${item.module}-${item.id}`}>{item.module}: {item.label}</span>)}</div>
          </section>
        </div>
        <footer className="modal-footer">
          <button className="ghost-button" type="button" onClick={onClose}>Close</button>
          {applicationRef ? <button className="ghost-button" type="button" onClick={() => onOpenApplication(applicationRef.id)}>Open Application context</button> : null}
          <span className="footer-spacer" />
          {task.allowedActions.map((action) => <button className={action.kind === "complete" ? "primary-button" : "ghost-button"} disabled={Boolean(task.completedAction)} key={action.label} type="button" onClick={() => onAction(task, action.label)}>{action.label}</button>)}
        </footer>
      </div>
    </div>
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

function CandidatesPage({ applications, candidates, copy, jobs, onCreateCandidate, onResolveDuplicate }: { applications: Application[]; candidates: Candidate[]; copy: typeof appCopy[Language]; jobs: Job[]; onCreateCandidate: (candidate: Candidate) => void; onResolveDuplicate: (candidateId: string) => void }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [duplicateSignalMessage, setDuplicateSignalMessage] = useState("");
  const assigned = candidates.filter((candidate) => candidate.allocationState === "assigned");
  const unassigned = candidates.filter((candidate) => candidate.allocationState === "unassigned_pool");
  const notFit = candidates.filter((candidate) => candidate.allocationState === "not_fit_current_job" || candidate.allocationState === "rejected_global");
  const duplicates = candidates.filter((candidate) => candidate.allocationState === "duplicate_review");

  return (
    <>
      <header className="topbar"><div className="page-title"><h1>{copy.candidates}</h1><p>可复用候选人档案、联系方式、CV 历史、去重结果和跨岗位历史。</p></div><div className="top-actions"><button className="ghost-button" type="button">Import CV</button><button className="primary-button" type="button" onClick={() => setModalOpen(true)}><Plus aria-hidden="true" /> {copy.newCandidate}</button></div></header>
      <section className="page-content">
        <div className="hero-row"><section className="hero-panel"><h2>Candidate is the person record. Applications keep the job-specific process separate.</h2><p>This prevents one candidate's multiple role histories from collapsing into a single vague status.</p></section><section className="hero-panel ai"><h2>Deduplication insight</h2><p>{duplicates.length} profiles need HR review before they can be assigned to a Job.</p></section></div>
        <section className="metric-grid"><Metric label="Candidates" value={String(candidates.length)} detail={`${applications.length} job-bound applications`} /><Metric label="Assigned" value={String(assigned.length)} detail="Have at least one Application" /><Metric label="Unassigned" value={String(unassigned.length)} detail="People pool, no pipeline entry" /><Metric label="Duplicates" value={String(duplicates.length)} detail="Blocked from assignment" warning={duplicates.length > 0} /></section>
        <section className="panel"><div className="panel-header"><div><h2>Candidate Registry</h2><p>Identity, source, CV history, and cross-job context</p></div><div className="tabs"><button className="tab active" type="button">All</button><button className="tab" type="button">Duplicates</button><button className="tab" type="button">High value</button></div></div><CandidateTable candidates={candidates} applications={applications} /></section>
        <section className="content-grid">
          <CandidatePoolPanel title="Assigned Candidates" detail="Candidates with one or more Job-bound Applications" candidates={assigned} applications={applications} empty="No assigned candidates yet." />
          <CandidatePoolPanel title="Unassigned Pool" detail="Candidates saved without a Job. They must not appear in Applications Pipeline." candidates={unassigned} applications={applications} empty="No unassigned candidates." />
          <CandidatePoolPanel title="Rejected / Not Fit Pool" detail="Not Fit Current Job keeps the person reusable for other Jobs." candidates={notFit} applications={applications} empty="No not-fit candidates." />
          <CandidatePoolPanel title="Duplicate Review" detail="Duplicate candidates cannot be attached until HR resolves the review." candidates={duplicates} applications={applications} empty="No duplicates to review." onResolveDuplicate={onResolveDuplicate} />
        </section>
        <section className="panel">
          <div className="panel-header"><div><h2>Duplicate Review Signals</h2><p>Inbox dedup evidence stays visible without merging Candidate records automatically.</p></div></div>
          <div className="cards">
            {seedDuplicateSignals.map((signal) => <DuplicateSignalCard key={signal.id} signal={signal} onQueue={() => setDuplicateSignalMessage("Queued for HR review. Merge waits for A-owned Candidate domain.")} />)}
          </div>
          {duplicateSignalMessage ? <div className="rule-note"><strong>{duplicateSignalMessage}</strong><span>Duplicate review preserves evidence while Candidate identity remains separate from job-bound Applications.</span></div> : null}
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

function ApplicationsPage({ applications, assessments, onOpenApplication }: { applications: Application[]; assessments: Assessment[]; onOpenApplication: (applicationId: string) => void }) {
  return (
    <>
      <header className="topbar"><div className="page-title"><h1>Applications</h1><p>Pipeline Workbench with State, Owner, Next Action, SLA, timeline and owner load.</p></div></header>
      <section className="page-content">
        <div className="secondary-tabs">{["Applications", "Candidate Profile", "Timeline", "Email Threads", "Interviews", "Assessments", "Decisions"].map((tab, index) => <button className={`secondary-tab ${index === 0 ? "active" : ""}`} type="button" key={tab}>{tab}</button>)}</div>
        <section className="metric-grid"><Metric label="Open Applications" value={String(applications.length)} detail="Created only after Candidate + Job binding" /><Metric label="Assessments" value={String(assessments.length)} detail={`${assessments.filter((assessment) => assessment.status === "Complete").length} complete`} /><Metric label="Due Today" value={String(applications.filter((app) => app.slaStatus === "Today").length)} detail="SLA scan" warning={applications.some((app) => app.slaStatus === "Today")} /><Metric label="Timeline Events" value={String(applications.reduce((sum, app) => sum + app.timeline.length, 0))} detail="Application history" /></section>
        <section className="panel"><div className="panel-header"><div><h2>Pipeline Workbench</h2><p>State, Owner, Next Action, SLA, and assessment summary stay visible together.</p></div></div><div className="table apps-table workflow-table"><div className="table-row header"><span>Application</span><span>State</span><span>Owner</span><span>Next Action</span><span>SLA</span><span>Action</span></div>{applications.map((application) => {
          const latestAssessment = assessments.find((assessment) => assessment.applicationId === application.id);
          return <div className="table-row" key={application.id}><div className="cell-main"><strong>{application.candidateName}</strong><span>{application.jobTitle}{latestAssessment ? ` · ${latestAssessment.title} · ${latestAssessment.status}` : ""}</span></div><span>{application.currentState}</span><span>{application.currentOwner}</span><span>{application.nextAction}</span><span className={`pill ${application.slaStatus === "Today" ? "warn" : "green"}`}>{application.slaStatus} · {new Date(application.dueAt).toLocaleDateString("en-CA")}</span><button className="ghost-button row-action" type="button" onClick={() => onOpenApplication(application.id)}>Open Application for {application.candidateName}</button></div>;
        })}</div>{applications.length === 0 ? <div className="empty-state">No Applications yet. Attach a Candidate to an Active Job first.</div> : null}</section>
        <section className="content-grid"><section className="panel"><div className="panel-header"><div><h2>Application Timeline</h2><p>Every created Application writes an initial timeline event.</p></div></div><div className="timeline">{applications.flatMap((application) => application.timeline.map((event) => <TimelineStep key={event.id} index={application.currentState} title={event.title} detail={`${application.candidateName} · ${event.detail}`} status={application.slaStatus} warn={application.slaStatus !== "Ready"} />))}</div></section><section className="panel"><div className="panel-header"><div><h2>Owner Load</h2><p>Owner and process accountability stay visible.</p></div></div><div className="cards">{Array.from(new Set(applications.map((application) => application.currentOwner))).map((owner) => <div className="work-card" key={owner}><div className="card-top"><div className="card-copy"><strong>{owner}</strong><span>{applications.filter((application) => application.currentOwner === owner).length} active applications</span></div><span className="pill green">Active</span></div></div>)}</div></section></section>
      </section>
    </>
  );
}

function AssessmentsPage({
  applications,
  assessments,
  onAcceptStopRule,
  onCalibrate,
  onComplete,
  onCreateDraft,
  onMarkReady,
  onParseSubmission,
  onRecordSubmission,
  onSend,
  onStartReview
}: {
  applications: Application[];
  assessments: Assessment[];
  onAcceptStopRule: (assessmentId: string) => void;
  onCalibrate: (assessmentId: string) => void;
  onComplete: (assessmentId: string) => void;
  onCreateDraft: (applicationId: string, title: string, purpose: string, prompt: string) => void;
  onMarkReady: (assessmentId: string) => void;
  onParseSubmission: (assessmentId: string) => void;
  onRecordSubmission: (assessmentId: string) => void;
  onSend: (assessmentId: string) => void;
  onStartReview: (assessmentId: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<"Review" | "Sent" | "Draft">("Review");
  const [modalOpen, setModalOpen] = useState(false);
  const reviewAssessments = assessments.filter((assessment) => ["Submitted", "Parsed", "In Review", "Calibrate", "Complete", "Skipped by Stop Rule"].includes(assessment.status));
  const sentAssessments = assessments.filter((assessment) => ["Ready to Send", "Sent", "Candidate Question"].includes(assessment.status));
  const draftAssessments = assessments.filter((assessment) => assessment.status === "Draft");
  const visibleAssessments = activeTab === "Review" ? reviewAssessments : activeTab === "Sent" ? sentAssessments : draftAssessments;
  const latestReview = assessments.find((assessment) => assessment.aiReview) ?? assessments[0];
  const overdue = assessments.filter((assessment) => new Date(assessment.dueAt).getTime() < Date.now() && assessment.status !== "Complete").length;

  return (
    <>
      <header className="topbar">
        <div className="page-title"><h1>Assessments</h1><p>题目、Rubric、提交、版本比较、AI Review、人工校准、Stop Rule 和下一步建议。</p></div>
        <div className="top-actions"><button className="ghost-button" type="button" onClick={() => setModalOpen(true)}><FilePenLine aria-hidden="true" /> Draft rubric</button><button className="primary-button" type="button" onClick={() => setModalOpen(true)}><SendHorizontal aria-hidden="true" /> Send assessment</button></div>
      </header>
      <section className="page-content">
        <div className="hero-row"><section className="hero-panel"><h2>Assessments should close evidence gaps, not become extra process drag.</h2><p>Each assignment is tied to Scorecard criteria, candidate context, submitted artifacts, and a human-calibrated decision.</p></section><section className="hero-panel ai"><h2>Stop Rule suggestion</h2><p>{latestReview?.aiReview?.stopRuleRecommendation ?? "For Trang Nguyen, evidence coverage is high enough to move forward without another assignment round."}</p></section></div>
        <section className="metric-grid"><Metric label="Open Assessments" value={String(assessments.filter((assessment) => assessment.status !== "Complete").length)} detail={`${reviewAssessments.length} require review`} /><Metric label="Submitted" value={String(assessments.filter((assessment) => assessment.submissions.length > 0).length)} detail="Parsed from email or attachment" /><Metric label="Avg Review Time" value="1.8d" detail="Mock review-time seam" /><Metric label="Overdue" value={String(overdue)} detail="Need HR follow-up" warning={overdue > 0} /></section>
        <section className="panel">
          <div className="panel-header"><div><h2>Assessment Workspace</h2><p>Submission status, rubric confidence, and next decision</p></div><div className="tabs">{(["Review", "Sent", "Draft"] as const).map((tab) => <button className={`tab ${activeTab === tab ? "active" : ""}`} key={tab} type="button" onClick={() => setActiveTab(tab)}>{tab}</button>)}</div></div>
          <div className="toolbar"><div className="search">Search candidate, job, rubric</div><span className="chip green"><Sparkles aria-hidden="true" /> Rubric linked</span><button className="primary-button" type="button" onClick={() => setModalOpen(true)}><Plus aria-hidden="true" /> Create Assessment Draft</button></div>
          <div className="table assessment-table">
            <div className="table-row header"><span>Assessment</span><span>Rubric</span><span>Submission</span><span>AI Review</span><span>Status</span><span>Action</span></div>
            {visibleAssessments.map((assessment) => (
              <AssessmentWorkspaceRow
                assessment={assessment}
                key={assessment.id}
                onAcceptStopRule={onAcceptStopRule}
                onCalibrate={onCalibrate}
                onComplete={onComplete}
                onMarkReady={onMarkReady}
                onParseSubmission={onParseSubmission}
                onRecordSubmission={onRecordSubmission}
                onSend={onSend}
                onStartReview={onStartReview}
              />
            ))}
          </div>
          {visibleAssessments.length === 0 ? <div className="empty-state">No {activeTab.toLowerCase()} assessments yet.</div> : null}
        </section>
        <section className="content-grid">
          <section className="panel"><div className="panel-header"><div><h2>Evidence Profile</h2><p>Rubric-linked signals</p></div></div><div className="cards">{assessments.flatMap((assessment) => assessment.evidenceEvents.map((event) => <div className="work-card ai" key={event.id}><div className="card-copy"><strong>{event.eventType.replaceAll("_", " ")}</strong><p>{event.summary}</p></div><div className="config-meta"><span className="pill green">{event.approvalStatus}</span><span className="pill">{event.sourceType}</span>{event.confidence ? <span className="pill">Rubric match {event.confidence}%</span> : null}</div></div>))}{assessments.every((assessment) => assessment.evidenceEvents.length === 0) ? <div className="work-card"><div className="card-copy"><strong>Debugging depth</strong><p>Candidate identified failure modes, rollback plan, and observability gaps.</p></div></div> : null}</div></section>
          <section className="panel"><div className="panel-header"><div><h2>Follow-up Queue</h2><p>Assessment operations</p></div></div><div className="timeline">{assessments.filter((assessment) => assessment.status !== "Complete").map((assessment) => <TimelineStep key={assessment.id} index={assessment.status} title={assessment.title} detail={`${assessment.candidateName} · ${assessment.owner} owns ${assessment.status === "Sent" ? "candidate follow-up" : "rubric calibration"}`} status={assessment.status === "Calibrate" ? "Ready" : "HR"} warn={assessment.status === "Sent"} />)}{assessments.every((assessment) => assessment.status === "Complete") ? <TimelineStep index="Now" title="No pending assessment follow-up" detail="Completed assessments are visible in Application Timeline." status="Ready" /> : null}</div></section>
        </section>
      </section>
      {modalOpen ? <AssessmentDraftModal applications={applications} onClose={() => setModalOpen(false)} onCreate={(applicationId, title, purpose, prompt) => { onCreateDraft(applicationId, title, purpose, prompt); setActiveTab("Draft"); setModalOpen(false); }} /> : null}
    </>
  );
}

function AssessmentWorkspaceRow({ assessment, onAcceptStopRule, onCalibrate, onComplete, onMarkReady, onParseSubmission, onRecordSubmission, onSend, onStartReview }: { assessment: Assessment; onAcceptStopRule: (assessmentId: string) => void; onCalibrate: (assessmentId: string) => void; onComplete: (assessmentId: string) => void; onMarkReady: (assessmentId: string) => void; onParseSubmission: (assessmentId: string) => void; onRecordSubmission: (assessmentId: string) => void; onSend: (assessmentId: string) => void; onStartReview: (assessmentId: string) => void }) {
  return (
    <div className="table-row">
      <div className="cell-main"><strong>{assessment.title}</strong><span>{assessment.candidateName} · {assessment.jobTitle} · {assessment.submissions[0]?.attachments.join(", ") || "No submission yet"}</span></div>
      <span className={`pill ${assessment.rubric.length >= 3 ? "green" : "warn"}`}>{assessment.rubric.length >= 3 ? "Complete" : "Partial"}</span>
      <span>{assessment.submissions[0]?.parsedStatus ?? "Pending"}</span>
      <span>{assessment.aiReview ? `Rubric match ${assessment.aiReview.rubricMatch}%` : "Not reviewed"}</span>
      <span className={`pill ${assessment.status === "Calibrate" ? "warn" : assessment.status === "Complete" ? "green" : ""}`}>{assessment.status}</span>
      <div className="row-actions">{assessment.status === "Draft" ? <button className="ghost-button row-action" type="button" onClick={() => onMarkReady(assessment.id)}>Mark {assessment.title} ready to send</button> : null}{assessment.status === "Ready to Send" ? <button className="ghost-button row-action" type="button" onClick={() => onSend(assessment.id)}>Send {assessment.title}</button> : null}{assessment.status === "Sent" ? <button className="ghost-button row-action" type="button" onClick={() => onRecordSubmission(assessment.id)}>Record submission for {assessment.title}</button> : null}{assessment.status === "Submitted" ? <button className="ghost-button row-action" type="button" onClick={() => onParseSubmission(assessment.id)}>Parse submission for {assessment.title}</button> : null}{assessment.status === "Parsed" ? <button className="ghost-button row-action" type="button" onClick={() => onStartReview(assessment.id)}>Start review for {assessment.title}</button> : null}{assessment.status === "In Review" ? <><button className="ghost-button row-action" type="button" onClick={() => onCalibrate(assessment.id)}>Calibrate {assessment.title}</button><button className="ghost-button row-action" type="button" onClick={() => onAcceptStopRule(assessment.id)}>Accept Stop Rule for {assessment.title}</button></> : null}{assessment.status === "Calibrate" || assessment.status === "Skipped by Stop Rule" ? <button className="ghost-button row-action" type="button" onClick={() => onComplete(assessment.id)}>Complete {assessment.title}</button> : null}</div>
    </div>
  );
}

function AssessmentTableRow({ assessment }: { assessment: Assessment }) {
  return <div className="table-row"><div className="cell-main"><strong>{assessment.title}</strong><span>{assessment.submissions[0]?.attachments.join(", ") || assessment.purpose}</span></div><span className="pill green">{assessment.rubric.length ? "Complete" : "Partial"}</span><span>{assessment.submissions[0]?.parsedStatus ?? "Pending"}</span><span>{assessment.aiReview ? `${assessment.aiReview.confidence} · Rubric match ${assessment.aiReview.rubricMatch}%` : "Pending"}</span><span className={`pill ${assessment.status === "Calibrate" ? "warn" : "green"}`}>{assessment.status}</span></div>;
}

function AssessmentDraftModal({ applications, onClose, onCreate }: { applications: Application[]; onClose: () => void; onCreate: (applicationId: string, title: string, purpose: string, prompt: string) => void }) {
  const [applicationId, setApplicationId] = useState(applications[0]?.id ?? "");
  const [title, setTitle] = useState("Backend system design");
  const [purpose, setPurpose] = useState("Close backend scorecard evidence gaps without adding process drag.");
  const [prompt, setPrompt] = useState("Review an event-driven API failure and propose a rollback plan.");

  return (
    <div className="modal-backdrop">
      <div className="mail-connect-modal candidate-modal" role="dialog" aria-modal="true" aria-label="Create Assessment Draft">
        <header className="modal-header"><div><h2>Create Assessment Draft</h2><p>Bind the assessment to one Application and the Job scorecard before sending.</p></div><button className="icon-button" type="button" aria-label="关闭" onClick={onClose}><X aria-hidden="true" /></button></header>
        <div className="connect-panels"><section className="connect-panel"><div className="job-form-grid"><label className="form-field wide"><span>Target Application</span><select aria-label="Target Application" value={applicationId} onChange={(event) => setApplicationId(event.target.value)}>{applications.map((application) => <option key={application.id} value={application.id}>{application.candidateName} · {application.jobTitle}</option>)}</select></label><FormInput label="Assessment title" value={title} onChange={setTitle} /><FormInput label="Purpose" value={purpose} onChange={setPurpose} /><label className="form-field wide"><span>Prompt</span><textarea aria-label="Prompt" rows={4} value={prompt} onChange={(event) => setPrompt(event.target.value)} /></label></div></section></div>
        <footer className="modal-footer"><button className="ghost-button" type="button" onClick={onClose}>取消</button><span className="footer-spacer" /><button className="primary-button" type="button" disabled={!applicationId} onClick={() => onCreate(applicationId, title, purpose, prompt)}>Create Draft</button></footer>
      </div>
    </div>
  );
}

function ApplicationDetailPage({
  application,
  assessments,
  candidate,
  onCompleteInterview,
  onScheduleInterview,
  onSubmitFeedback
}: {
  application?: Application;
  assessments: Assessment[];
  candidate?: Candidate;
  onCompleteInterview: (applicationId: string, interviewId: string) => void;
  onScheduleInterview: (applicationId: string, draft: InterviewDraft) => void;
  onSubmitFeedback: (applicationId: string, interviewId: string, draft: Parameters<typeof parseInterviewFeedback>[2]) => void;
}) {
  const [activeTab, setActiveTab] = useState<"basic" | "interview" | "assessments" | "questions">("interview");
  const [interviewDraft, setInterviewDraft] = useState<InterviewDraft>({
    candidateConfirmationStatus: "Confirmed",
    interviewer: "Mai Ho",
    interviewType: "Technical",
    locationOrLink: "https://meet.hireos.test/trang-tech",
    scheduledStartAt: "2026-07-29T03:00:00.000Z"
  });
  const [feedbackDraft, setFeedbackDraft] = useState({
    evidenceNotes: "",
    followUpQuestions: "",
    risks: "",
    scorecardScores: "",
    strengths: ""
  });
  const candidateName = candidate?.fullName ?? application?.candidateName ?? "Trang Nguyen";
  const jobTitle = application?.jobTitle ?? "高级后端工程师";
  const currentState = application?.currentState ?? "Founder Review";
  const currentOwner = application?.currentOwner ?? "Founder";
  const nextAction = application?.nextAction ?? "批准终面";
  const dueAt = application?.dueAt ? new Date(application.dueAt).toLocaleDateString("en-CA") : "今天到期";
  const activeInterview = application?.interviews?.find((interview) => interview.status !== "Cancelled" && interview.status !== "No Show") ?? application?.interviews?.[0];

  function updateInterviewDraft<K extends keyof InterviewDraft>(key: K, value: InterviewDraft[K]) {
    setInterviewDraft((current) => ({ ...current, [key]: value }));
  }

  function submitInterviewSchedule(event: FormEvent) {
    event.preventDefault();
    if (!application) return;
    onScheduleInterview(application.id, interviewDraft);
  }

  function submitFeedback(event: FormEvent) {
    event.preventDefault();
    if (!application || !activeInterview) return;
    onSubmitFeedback(application.id, activeInterview.id, {
      evidenceNotes: feedbackDraft.evidenceNotes,
      followUpQuestions: feedbackDraft.followUpQuestions.split(/\n|;/).map((item) => item.trim()).filter(Boolean),
      recommendation: "Strong Yes",
      risks: feedbackDraft.risks,
      scorecardScores: parseScorecardScores(feedbackDraft.scorecardScores),
      sourceType: "Form",
      strengths: feedbackDraft.strengths
    });
  }

  return (
    <>
      <header className="topbar">
        <div className="page-title"><h1>{candidateName} · {jobTitle}</h1><p>候选人身份信息与 Application 流程状态分离展示。</p></div>
      </header>
      <section className="page-content">
        <div className="secondary-tabs application-detail-tabs" aria-label="申请详情视图">
          <button className={`secondary-tab ${activeTab === "basic" ? "active" : ""}`} type="button" onClick={() => setActiveTab("basic")}><FileUser aria-hidden="true" /> 基本信息</button>
          <button className={`secondary-tab ${activeTab === "interview" ? "active" : ""}`} type="button" onClick={() => setActiveTab("interview")}><MessagesSquare aria-hidden="true" /> 面试流程</button>
          <button className={`secondary-tab ${activeTab === "assessments" ? "active" : ""}`} type="button" onClick={() => setActiveTab("assessments")}><FilePenLine aria-hidden="true" /> Assessments</button>
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
          <section className="interview-ops-grid" aria-label="Interview workflow controls">
            <form className="interview-form" onSubmit={submitInterviewSchedule}>
              <div className="panel-header compact"><div><h3>Schedule in Application Detail</h3><p>安排面试不离开当前 Application drill-down。</p></div></div>
              <label className="form-field"><span>Interview type</span><select aria-label="Interview type" value={interviewDraft.interviewType} onChange={(event) => updateInterviewDraft("interviewType", event.target.value as InterviewDraft["interviewType"])}><option>HR Screen</option><option>Technical</option><option>Product</option><option>Founder</option><option>Final</option></select></label>
              <FormInput label="Interviewer" value={interviewDraft.interviewer} onChange={(value) => updateInterviewDraft("interviewer", value)} />
              <label className="form-field"><span>Interview time</span><input aria-label="Interview time" type="datetime-local" value={toDateTimeLocalValue(interviewDraft.scheduledStartAt)} onChange={(event) => {
                const nextIso = parseDateTimeLocalValue(event.target.value);
                if (nextIso) updateInterviewDraft("scheduledStartAt", nextIso);
              }} /></label>
              <FormInput label="Location or link" value={interviewDraft.locationOrLink} onChange={(value) => updateInterviewDraft("locationOrLink", value)} />
              <label className="form-field"><span>Candidate confirmation</span><select aria-label="Candidate confirmation" value={interviewDraft.candidateConfirmationStatus} onChange={(event) => updateInterviewDraft("candidateConfirmationStatus", event.target.value as InterviewDraft["candidateConfirmationStatus"])}><option>Pending</option><option>Confirmed</option><option>Declined</option></select></label>
              <button className="primary-button" type="submit"><CalendarClock aria-hidden="true" /> Save interview</button>
            </form>
            <section className="interview-status-card">
              <div className="panel-header compact"><div><h3>Current Interview</h3><p>状态和反馈 SLA 回写到 Application。</p></div></div>
              <div className="applicant-summary compact-summary"><div><span>Application State</span><strong>{currentState}</strong></div><div><span>Next Action</span><strong>{nextAction}</strong></div><div><span>SLA</span><strong>{application?.slaStatus ?? "Ready"} · {dueAt}</strong></div></div>
              {activeInterview ? (
                <div className="cards">
                  <div className="work-card ai"><div className="card-top"><div className="card-copy"><strong>{activeInterview.status}</strong><span>{activeInterview.interviewType} · {activeInterview.interviewer} · {activeInterview.locationOrLink}</span></div><span className={`pill ${activeInterview.status === "Feedback Complete" ? "green" : activeInterview.status === "Feedback Pending" ? "danger" : "warn"}`}>{activeInterview.candidateConfirmationStatus}</span></div></div>
                  <button className="ghost-button" disabled={activeInterview.status === "Feedback Pending" || activeInterview.status === "Feedback Complete"} type="button" onClick={() => application ? onCompleteInterview(application.id, activeInterview.id) : undefined}>Mark interview completed</button>
                </div>
              ) : <div className="empty-state">No Interview created yet for this Application.</div>}
            </section>
          </section>
          <section className="feedback-evidence-panel" aria-label="Interview feedback evidence">
            <div className="panel-header compact"><div><h3>Feedback to Evidence Event</h3><p>表单或邮件反馈必须结构化为推荐、评分、证据、风险和追问。</p></div></div>
            <form className="feedback-form" onSubmit={submitFeedback}>
              <FormInput label="Strengths" value={feedbackDraft.strengths} onChange={(value) => setFeedbackDraft((current) => ({ ...current, strengths: value }))} />
              <FormInput label="Risks" value={feedbackDraft.risks} onChange={(value) => setFeedbackDraft((current) => ({ ...current, risks: value }))} />
              <FormInput label="Scorecard scores" value={feedbackDraft.scorecardScores} onChange={(value) => setFeedbackDraft((current) => ({ ...current, scorecardScores: value }))} />
              <label className="form-field wide"><span>Evidence notes</span><textarea aria-label="Evidence notes" rows={3} value={feedbackDraft.evidenceNotes} onChange={(event) => setFeedbackDraft((current) => ({ ...current, evidenceNotes: event.target.value }))} /></label>
              <label className="form-field wide"><span>Follow-up questions</span><textarea aria-label="Follow-up questions" rows={3} value={feedbackDraft.followUpQuestions} onChange={(event) => setFeedbackDraft((current) => ({ ...current, followUpQuestions: event.target.value }))} /></label>
              <button className="primary-button" disabled={!activeInterview} type="submit"><BadgeCheck aria-hidden="true" /> Submit feedback</button>
            </form>
            <div className="cards evidence-event-list">
              {(application?.evidenceEvents ?? []).map((event) => (
                <div className="work-card" key={event.id}><div className="card-top"><div className="card-copy"><strong>{event.summary}</strong><span>{event.riskSummary} · Source: {event.sourceType}</span></div><span className="pill green">Evidence Event</span></div></div>
              ))}
            </div>
          </section>
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

        <section className={`panel ${activeTab === "assessments" ? "" : "is-hidden"}`} data-application-detail-panel="assessments">
          <div className="panel-header"><div><h2>Assessment Summary</h2><p>Assessment status, submission, AI review, and evidence events for this Application.</p></div></div>
          <div className="table assessment-table">
            <div className="table-row header"><span>Assessment</span><span>Rubric</span><span>Submission</span><span>AI Review</span><span>Status</span></div>
            {assessments.map((assessment) => <AssessmentTableRow assessment={assessment} key={assessment.id} />)}
          </div>
          {assessments.length === 0 ? <div className="empty-state">No assessment attached to this Application yet.</div> : null}
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

function InboxPage({ onOpenDetail, onOpenEmailAgent }: { onOpenDetail: () => void; onOpenEmailAgent: () => void }) {
  const [activeTab, setActiveTab] = useState<"queue" | "sync" | "mailboxes">("queue");
  const [modalOpen, setModalOpen] = useState(false);
  const needsReviewCount = countNeedsReviewThreads(seedEmailThreads);

  return (
    <>
      <header className="topbar">
        <div className="page-title"><h1>Inbox</h1><p>邮件录入、低置信度匹配、候选人去重和 AI 动作审批的统一工作台。</p></div>
        <div className="top-actions"><button className="ghost-button" type="button"><RefreshCw aria-hidden="true" /> Sync</button><button className="primary-button" type="button" onClick={() => setModalOpen(true)}><MailPlus aria-hidden="true" /> Connect Mailbox</button></div>
      </header>
      <section className="page-content">
        <div className="hero-row single">
          <section className="hero-panel ai"><h2>AI 审批规则</h2><p>AI 可以起草、分类、提取和建议。低置信度匹配、候选人合并和 Application 创建在本模块只进入 review seam。</p></section>
        </div>
        <section className="metric-grid">
          <Metric label="Email Intake" value="48" detail="Threads need structure" />
          <Metric label="Needs Review" value={String(needsReviewCount)} detail="Low-confidence seam items" warning />
          <Metric label="Duplicate Signals" value={String(seedDuplicateSignals.length)} detail="Merge disabled in B slice" />
          <Metric label="AI Actions" value={String(seedAiActions.length)} detail="Pending approval shell" warning />
        </section>
        <section className="unframed-section">
          <div className="panel-header"><div><h2>统一工作队列</h2><p>二级业务队列统一归入一个运营待办箱</p></div><div className="top-actions"><button className="ghost-button" type="button" onClick={onOpenEmailAgent}>Open Email Agent</button></div></div>
          <div className="secondary-tabs">
            <button className={`secondary-tab ${activeTab === "queue" ? "active" : ""}`} type="button" onClick={() => setActiveTab("queue")}><Inbox aria-hidden="true" /> 工作队列</button>
            <button className={`secondary-tab ${activeTab === "sync" ? "active" : ""}`} type="button" onClick={() => setActiveTab("sync")}><RefreshCw aria-hidden="true" /> 同步状态</button>
            <button className={`secondary-tab ${activeTab === "mailboxes" ? "active" : ""}`} type="button" onClick={() => setActiveTab("mailboxes")}><MailPlus aria-hidden="true" /> 关联邮箱</button>
          </div>
          <section className={activeTab === "queue" ? "" : "is-hidden"}>
            <div className="table inbox-table">
              <div className="table-row header"><span>队列项</span><span>类型</span><span>对象</span><span>状态</span></div>
              {seedInboxItems.map((item) => (
                <button className="table-row table-row-button" key={item.id} type="button" onClick={onOpenDetail}>
                  <div className="cell-main"><strong>{item.title}</strong><span>{item.recommendation}</span></div>
                  <span>{item.type}</span>
                  <span>{item.object}</span>
                  <span className={pillClass(item.status)}>{statusCopy(item.status)}</span>
                </button>
              ))}
              <div className="table-row"><div className="cell-main"><strong>CV - Trang Nguyen Backend</strong><span>High confidence intake remains a seam until A domain is ready</span></div><span>Email Intake</span><span>Email Thread</span><span className="pill green">Ready seam</span></div>
              <div className="table-row"><div className="cell-main"><strong>Quang Do duplicate signal</strong><span>Duplicate Review shell only, merge disabled</span></div><span>Candidate Duplicate</span><span>Candidate Seam</span><span className="pill warn">Review</span></div>
            </div>
          </section>
          <section className={activeTab === "sync" ? "" : "is-hidden"}>
            <div className="table sync-table">
              <div className="table-row header"><span>同步时间</span><span>邮件</span><span>类型</span><span>基本信息</span><span>处理结果</span></div>
              {seedEmailThreads.map((thread, index) => (
                <div className="table-row" key={thread.id}><span>{index === 0 ? "10:42" : index === 1 ? "09:24" : "09:10"}</span><div className="cell-main"><strong>{thread.subject}</strong><span>{thread.sender}</span></div><span>{thread.detectedType}</span><span>{thread.jobMatch} · {Math.round(thread.confidence * 100)}%</span><span className={thread.status === "needs_review" ? "pill danger" : thread.status === "auto_applied" ? "pill green" : "pill warn"}>{thread.status === "needs_review" ? "低置信度" : thread.status === "auto_applied" ? "Seam ready" : "Draft"}</span></div>
              ))}
            </div>
          </section>
          <section className={activeTab === "mailboxes" ? "" : "is-hidden"}>
            <div className="mailbox-panel-head"><div><h3>已关联邮箱</h3><p>管理哪些邮箱参与招聘邮件同步、AI 识别和写回规则。</p></div></div>
            <div className="table mailbox-table">
              <div className="table-row header"><span>邮箱</span><span>同步范围</span><span>写入规则</span><span>状态</span><span>操作</span></div>
              <div className="table-row"><div className="cell-main"><strong>recruiting@company.vn</strong><span>主 HR 招聘邮箱</span></div><span>Inbox / CV / Assessment</span><span>仅写入 B seam</span><span className="pill green">已连接</span><div className="row-actions"><button type="button">编辑</button><button type="button">删除</button></div></div>
              <div className="table-row"><div className="cell-main"><strong>agency-intake@company.vn</strong><span>猎头转发与补充材料</span></div><span>Agency / Forwarded</span><span>全部进入人工审核</span><span className="pill warn">需确认</span><div className="row-actions"><button type="button">编辑</button><button type="button">删除</button></div></div>
            </div>
          </section>
        </section>
      </section>
      {modalOpen ? <MailboxConnectModal onClose={() => setModalOpen(false)} /> : null}
    </>
  );
}

function MailboxConnectModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const labels = ["邮箱类型", "授权说明", "读取规则", "扫描预览", "开始同步"];

  return (
    <div className="modal-backdrop">
      <section className="mail-connect-modal" role="dialog" aria-modal="true" aria-labelledby="mail-connect-title">
        <header className="modal-header"><div><h2 id="mail-connect-title">连接招聘邮箱</h2><p>先授权，再配置读取范围，最后预览 AI 识别结果。当前只连接 Inbox seam，不创建 Candidate/Application。</p></div><button className="icon-button" type="button" aria-label="关闭邮箱连接流程" onClick={onClose}><X aria-hidden="true" /></button></header>
        <div className="connect-steps" aria-label="邮箱连接步骤">
          {labels.map((label, index) => <button className={`connect-step ${step === index ? "active" : ""}`} key={label} type="button" onClick={() => setStep(index)}><span>{index + 1}</span>{label}</button>)}
        </div>
        <div className="connect-panels">
          {step === 0 ? <section className="connect-panel"><div className="option-grid"><button className="mail-provider active" type="button"><MailOpen aria-hidden="true" /><strong>Gmail</strong><span>MVP 先接入 HR 招聘邮箱</span></button><button className="mail-provider" type="button" disabled><Inbox aria-hidden="true" /><strong>Outlook</strong><span>后续版本支持</span></button></div><div className="rule-note"><strong>业务规则</strong><span>连接的是 HR 招聘邮箱，不是个人消息中心。</span></div></section> : null}
          {step === 1 ? <section className="connect-panel"><div className="permission-grid"><article><strong>邮件标题与线程</strong><span>判断是否招聘相关，并还原完整沟通上下文。</span></article><article><strong>邮件正文</strong><span>提取候选人回复和异常信息。</span></article><article><strong>附件</strong><span>识别 CV 和补充材料。</span></article><article><strong>发件人/收件人</strong><span>区分候选人、HR、面试官和猎头。</span></article></div><div className="rule-note"><strong>授权边界</strong><span>低置信度、候选人合并和 Application 创建必须等待人工和 A-owned domain。</span></div></section> : null}
          {step === 2 ? <section className="connect-panel"><div className="settings-grid"><article className="config-card"><h3>监控范围</h3><p>只读取招聘相关 Label：Inbox / CV / Assessment。</p></article><article className="config-card"><h3>自动写入</h3><p>当前只写入本地 seam state，不写 Candidate/Application。</p></article></div></section> : null}
          {step === 3 ? <section className="connect-panel"><div className="preview-metrics"><div><span>可能的 CV 邮件</span><strong>48</strong></div><div><span>可匹配岗位</span><strong>36</strong></div><div><span>低置信度匹配</span><strong>9</strong></div><div><span>重复候选人</span><strong>2</strong></div><div><span>待审核</span><strong>1</strong></div></div><div className="table connect-preview-table"><div className="table-row header"><span>识别结果</span><span>AI 动作</span><span>写入方式</span></div><div className="table-row"><span>Forwarded profile from agency</span><span>可能重复候选人</span><span className="pill warn">人工审核</span></div></div></section> : null}
          {step === 4 ? <section className="connect-panel"><div className="connect-done"><div className="done-icon"><Check aria-hidden="true" /></div><h3>招聘邮箱已开始同步</h3><p>高置信度事件只进入 seam preview；模糊项进入待办箱，附带原始邮件、AI 提取字段和置信度。</p><div className="config-meta"><span className="pill green">Gmail 已连接</span><span className="pill warn">9 个待审核</span></div></div></section> : null}
        </div>
        <footer className="modal-footer"><button className="ghost-button" type="button" onClick={() => setStep((current) => Math.max(0, current - 1))}>上一步</button><span className="footer-spacer" /><button className="ghost-button" type="button" onClick={onClose}>取消</button><button className="primary-button" type="button" onClick={() => step === 4 ? onClose() : setStep((current) => Math.min(4, current + 1))}>下一步</button></footer>
      </section>
    </div>
  );
}

function EmailAgentPage() {
  const [tab, setTab] = useState<"Needs Review" | "Auto Applied" | "Drafts">("Needs Review");
  const visibleThreads = seedEmailThreads.filter((thread) => tab === "Needs Review" ? thread.status === "needs_review" : tab === "Auto Applied" ? thread.status === "auto_applied" : thread.status === "draft");

  return (
    <>
      <header className="topbar"><div className="page-title"><h1>Email Agent</h1><p>读取线程和附件，识别候选人、岗位和 AI 动作；当前只承载前置 seam。</p></div><div className="top-actions"><button className="ghost-button" type="button"><RefreshCw aria-hidden="true" /> Sync</button><button className="primary-button" type="button"><MailPlus aria-hidden="true" /> Connect Mailbox</button></div></header>
      <section className="page-content">
        <div className="hero-row single"><section className="hero-panel"><h2>48 email threads need structured decisions before they touch the pipeline.</h2><p>The page separates high-confidence seam previews from low-confidence HR review, preserving raw email evidence.</p></section></div>
        <section className="metric-grid"><Metric label="Threads Parsed" value="128" detail="Today across 2 mailboxes" /><Metric label="CV Attachments" value="42" detail="Duplicate candidates found" /><Metric label="Auto Matched" value="87%" detail="Seam preview only" /><Metric label="Needs Review" value="14" detail="Ambiguous role or duplicate" warning /></section>
        <section className="panel"><div className="panel-header"><div><h2>Intake Queue</h2><p>Email threads before candidate/application updates</p></div><div className="tabs">{(["Needs Review", "Auto Applied", "Drafts"] as const).map((label) => <button className={`tab ${tab === label ? "active" : ""}`} key={label} type="button" onClick={() => setTab(label)}>{label}</button>)}</div></div><div className="toolbar"><div className="search"><MailQuestion aria-hidden="true" /> Search sender, job, attachment</div><span className="chip green"><Sparkles aria-hidden="true" /> Evidence extraction on</span></div><div className="table email-table"><div className="table-row header"><span>Email Thread</span><span>Detected Type</span><span>Job Match</span><span>AI Action</span><span>Status</span></div>{visibleThreads.map((thread) => <div className="table-row" key={thread.id}><div className="cell-main"><strong>{thread.subject}</strong><span>{thread.sender}</span></div><span>{thread.detectedType}</span><span>{thread.jobMatch}</span><span>{thread.aiAction}</span><span className={thread.status === "needs_review" ? "pill danger" : thread.status === "auto_applied" ? "pill green" : "pill warn"}>{thread.status === "needs_review" ? "Low conf." : thread.status === "auto_applied" ? "Ready" : "Draft"}</span></div>)}</div></section>
      </section>
    </>
  );
}

function InboxDetailPage() {
  const item = seedInboxItems[0];
  const aiAction = seedAiActions[0];
  const [message, setMessage] = useState("");
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  function applyReview(status: InboxItemStatus, note?: string) {
    const result = reviewInboxItem(item, status, note);
    if (status === "approved" && result.candidateApplicationWriteBlocked) setMessage("Approved in B seam only. Candidate/Application write remains blocked.");
    if (status === "modified" && result.candidateApplicationWriteBlocked) setMessage("Modified in B seam only. Candidate/Application write remains blocked.");
    if (status === "snoozed") setMessage("Snoozed for HR follow-up. Candidate/Application write remains blocked.");
  }

  return (
    <>
      <header className="topbar"><div className="page-title"><h1>Agency-forwarded profile</h1><p>Inbox 队列详情：原始邮件、AI 推荐、置信度、人工审批和写回预览。</p></div><div className="top-actions"><button className="ghost-button" type="button"><MailOpen aria-hidden="true" /> Open Raw Email</button><button className="primary-button" type="button" onClick={() => applyReview("approved")}><Check aria-hidden="true" /> Confirm Match</button></div></header>
      <section className="page-content">
        <div className="secondary-tabs"><button className="secondary-tab active" type="button"><MailQuestion aria-hidden="true" /> Low-confidence Review</button><button className="secondary-tab" type="button"><Paperclip aria-hidden="true" /> Evidence</button><button className="secondary-tab" type="button"><BadgeCheck aria-hidden="true" /> AI Action Approval</button></div>
        <div className="hero-row"><section className="hero-panel"><h2>This queue item is blocked because the candidate identity is ambiguous.</h2><p>AI should not create or merge candidate records when identity confidence is medium.</p></section><section className="hero-panel ai"><h2>Approval boundary</h2><p>AI can extract, compare, and suggest. Human approval is required before merge or Application creation.</p></section></div>
        <section className="metric-grid"><Metric label="Detected Type" value="CV Intake" detail="Agency forward" /><Metric label="Job Match" value="62%" detail="Platform Engineer" warning /><Metric label="Identity Match" value="72%" detail="Possible duplicate" warning /><Metric label="Write-back" value="Blocked" detail="Seam only" warning /></section>
        <section className="detail-grid">
          <div className="detail-stack">
            <section className="panel"><div className="panel-header"><div><h2>Raw Email Evidence</h2><p>Primary source stays attached to every extracted event</p></div></div><div className="cards">{item.rawEvidence.map((evidence) => <div className="work-card" key={evidence}><div className="card-copy"><strong>{evidence}</strong><span>Source remains the original Email Thread / Attachment seam.</span></div></div>)}</div></section>
            <section className="panel"><div className="panel-header"><div><h2>AI Recommendation</h2><p>Confidence and action preview before any human decision</p></div></div><div className="settings-grid"><article className="config-card"><h3>{aiAction.actionType}</h3><p>{aiAction.outputSummary}</p><div className="config-meta"><span className="pill warn">{Math.round(aiAction.confidence * 100)}% confidence</span><span className="pill">Pending Approval</span></div></article><article className="config-card"><h3>Recommendation</h3><p>{item.recommendation}</p><div className="config-meta"><span className="pill danger">No auto-write</span></div></article></div></section>
            <section className="panel"><div className="panel-header"><div><h2>Write-back Preview</h2><p>What will change if HR confirms</p></div></div><div className="timeline">{item.writebackPreview.map((preview, index) => <TimelineStep key={preview} index={String(index + 1)} title={preview} detail="Preview only; Candidate/Application domain is not mutated in B." status={index === 0 ? "Review" : "Blocked"} warn={index !== 0} />)}</div></section>
          </div>
          <section className="panel"><div className="panel-header"><div><h2>Human Review Checklist</h2><p>Why this cannot be fully automatic</p></div></div><div className="cards"><div className="work-card"><div className="card-copy"><strong>Confirm identity</strong><span>Same phone number but different agency email.</span></div></div><div className="work-card"><div className="card-copy"><strong>Confirm job</strong><span>Platform 62%, Backend 58%; not strong enough.</span></div></div></div><div className="review-action-grid"><button className="primary-button" type="button" onClick={() => applyReview("approved")}>Approve</button><button className="ghost-button" type="button" onClick={() => applyReview("modified")}>Modify</button><button className="ghost-button" type="button" onClick={() => setRejecting(true)}>Reject</button><button className="ghost-button" type="button" onClick={() => applyReview("snoozed")}>Snooze</button></div>{rejecting ? <div className="reject-box"><label className="form-field"><span>Reject reason</span><textarea aria-label="Reject reason" value={rejectReason} onChange={(event) => setRejectReason(event.target.value)} /></label><button className="primary-button" type="button" disabled={!rejectReason.trim()} onClick={() => setMessage(`Rejected with reason: ${rejectReason.trim()}`)}>Confirm Reject</button></div> : null}{message ? <div className="rule-note"><strong>{message}</strong><span>No Candidate/Application core data was written by this review action.</span></div> : null}</section>
        </section>
      </section>
    </>
  );
}

function FounderInboxPage({ onTaskAction, tasks }: { onTaskAction: (task: RecruitingTask, actionLabel: string) => void; tasks: RecruitingTask[] }) {
  const founderTasks = filterFounderTasks(tasks);
  const completedTasks = founderTasks.filter((task) => task.completedAction);

  return (
    <>
      <header className="topbar">
        <div className="page-title"><h1>Founder Inbox</h1><p>Founder Decision and risk escalation Tasks only; HR operational Tasks stay in Task Center.</p></div>
      </header>
      <section className="page-content">
        <div className="hero-row">
          <section className="hero-panel"><h2>{founderTasks.length} founder decisions need evidence-backed human confirmation.</h2><p>This role view consumes RecruitingTask, so Founder Inbox stays aligned with Task Center instead of becoming another queue.</p></section>
          <section className="hero-panel ai"><h2>Audit boundary</h2><p>Continue, Request More Evidence, Final Interview, Reject and Offer Decision are human-confirmed Task actions.</p></section>
        </div>
        <section className="metric-grid">
          <Metric label="Founder Tasks" value={String(founderTasks.length)} detail="Decision and risk only" warning />
          <Metric label="HR Ops Hidden" value={String(tasks.length - founderTasks.length)} detail="Ordinary operational Tasks excluded" />
          <Metric label="L4 Decisions" value={String(founderTasks.filter((task) => task.aiAutomationLevel === "L4").length)} detail="Human confirmation required" warning />
          <Metric label="Completed Actions" value={String(completedTasks.length)} detail="Visible audit trail" />
        </section>
        <section className="content-grid">
          {founderTasks.map((task) => (
            <article className="panel" key={task.id}>
              <div className="panel-header"><div><h2>{task.title}</h2><p>{task.relatedObjects.map((item) => item.label).join(" · ")}</p></div><span className={`pill ${task.slaState === "Today" || task.slaState === "Blocked" ? "warn" : "green"}`}>{task.slaState}</span></div>
              <div className="config-meta"><span className="pill danger">{task.priority}</span><span className="pill">{task.sourceModule}</span><span className="pill warn">{task.aiAutomationLevel ?? "L2"}</span><span className="pill">{task.ownerRole}</span></div>
              <div className="settings-grid">
                <article className="config-card"><h3>AI Recommendation</h3><p>{task.aiRecommendation}</p><div className="config-meta"><span className="pill warn">{task.nextAction}</span></div></article>
                <article className="config-card"><h3>Risk</h3><p>{task.risk}</p><div className="evidence-list">{(task.evidenceRefs ?? []).slice(0, 3).map((item) => <div className="evidence-item" key={item}><span>{item}</span><strong>Evidence</strong></div>)}</div></article>
              </div>
              {task.completedAction ? <div className="rule-note"><strong>Completed action: {task.completedAction}</strong><span>Completed by: {task.completedBy} · {formatDateTime(task.completedAt)}</span></div> : null}
              <div className="review-action-grid">
                {task.allowedActions.map((action) => <button className={action.kind === "complete" ? "primary-button" : "ghost-button"} disabled={Boolean(task.completedAction)} key={action.label} type="button" onClick={() => onTaskAction(task, action.label)}>{action.label} for {task.title}</button>)}
              </div>
            </article>
          ))}
        </section>
        <section className="panel">
          <div className="panel-header"><div><h2>Action Timeline</h2><p>Founder decisions write back through Task completion metadata.</p></div></div>
          <div className="timeline">{completedTasks.map((task) => <TimelineStep key={task.id} index={task.status} title={`Task action: ${task.completedAction}`} detail={`${task.status === "Routed" ? routedAuditCopy(task.completedAction, task.completedBy) : `Done by ${task.completedBy}`} · ${formatDateTime(task.completedAt)}`} status={task.status} />)}{completedTasks.length === 0 ? <TimelineStep index="Ready" title="No Founder Task actions yet" detail="Use a human-confirmed action to record an audit-visible Task event." status="Open" /> : null}</div>
        </section>
      </section>
    </>
  );
}

function SettingsPage({ governance, onOpenMailbox, onTightenThreshold, tasks }: { governance: GovernanceState; onOpenMailbox: () => void; onTightenThreshold: () => void; tasks: RecruitingTask[] }) {
  const safeDecision = evaluateAiAction(governance, { actionType: "extract_evidence", confidence: 0.93 });
  const lowConfidenceDecision = evaluateAiAction(governance, { actionType: "candidate_match", confidence: 0.74 });
  const forbiddenDecision = evaluateAiAction(governance, { actionType: "auto_hire", confidence: 0.99 });
  const governanceTasks = filterSettingsGovernanceTasks(tasks);
  const approvalTasks = governanceTasks.filter((task) => task.aiApprovalRequired);

  return (
    <>
      <header className="topbar">
        <div className="page-title"><h1>Settings</h1><p>邮箱连接、用户权限、SLA、AI 自动化规则和招聘模板。</p></div>
        <div className="top-actions"><button className="ghost-button" type="button">Audit Log</button><button className="primary-button" type="button" onClick={onTightenThreshold}><Save aria-hidden="true" /> Save Changes</button></div>
      </header>
      <section className="page-content">
        <div className="hero-row">
          <section className="hero-panel"><h2>Settings define what AI can read, suggest, and write back into the hiring workflow.</h2><p>This page keeps operational rules out of daily queue pages, while making mailbox scope, approval gates, and status defaults explicit.</p></section>
          <section className="hero-panel ai"><h2>Governance rule</h2><p>AI may structure evidence and update workflow status, but cannot auto-reject, auto-hire, or make an offer decision.</p></section>
        </div>
        <section className="metric-grid">
          <Metric label="Mailboxes" value={String(governance.mailboxes.length)} detail="Recruiting + agency intake" />
          <Metric label="Users" value={String(governance.roles.length)} detail="HR, founder, interviewers" />
          <Metric label="SLA Rules" value={String(Object.keys(governance.slaDefaults).length)} detail="By application state" />
          <Metric label="AI Rules" value={String(governance.aiAutomationRules.length)} detail={`${governance.aiAutomationRules.filter((rule) => rule.mode === "approval_required").length} require review`} warning />
        </section>
        <section className="panel">
          <div className="panel-header"><div><h2>Workspace Configuration</h2><p>Company-level settings that shape every Job and Application</p></div></div>
          <div className="settings-grid">
            <button className="config-card link-card" type="button" onClick={onOpenMailbox}><h3>Mailbox Connections</h3><p>Control which HR inboxes AI can read, which folders count as recruiting data, and which sender domains require review.</p><div className="config-meta"><span className="pill green">Connected</span><span className="pill">{governance.mailboxes.length} inboxes</span><span className="pill warn">Low-conf review</span></div></button>
            <article className="config-card governance-card"><h3>Roles & Permissions</h3><p>Define who can create jobs, change job status, approve evidence, view abnormal processes, and make offer decisions.</p><div className="config-meta">{governance.roles.map((role) => <span className="pill" key={role.id}>{role.label}</span>)}</div></article>
            <article className="config-card governance-card"><h3>Status & SLA Defaults</h3><p>Owner defaults, due dates, and blocked detection rules inherited by each new job.</p><div className="config-meta"><span className="pill">HR review {governance.slaDefaults.hrReviewHours}h</span><span className="pill warn">Founder decision {governance.slaDefaults.founderDecisionHours}h</span><span className="pill">Feedback {governance.slaDefaults.interviewFeedbackHours}h</span><span className="pill warn">Pending approval {governance.slaDefaults.pendingApprovalHours}h</span></div></article>
            <article className="config-card governance-card"><h3>AI Automation Rules</h3><p>Choose which AI actions are automatic, which require approval, and which sensitive actions are out of scope for MVP.</p><div className="config-meta"><span className="pill green">{safeDecision.status}</span><span className="pill warn">{lowConfidenceDecision.status}</span><span className="pill danger">{forbiddenDecision.status}</span></div><div className="evidence-list"><div className="evidence-item"><span>Candidate match</span><strong>{Math.round(governance.thresholds.candidateMatch * 100)}%</strong></div><div className="evidence-item"><span>Auto apply</span><strong>{Math.round(governance.thresholds.autoApply * 100)}%</strong></div></div></article>
            <article className="config-card"><h3>Hiring Templates</h3><p>Reusable interview stages, scorecards, assessment plans, and evaluation rubrics for common role families.</p><div className="config-meta"><span className="pill">Engineer</span><span className="pill">GTM</span><span className="pill">Design</span><span className="pill">Ops</span></div></article>
            <article className="config-card governance-card"><h3>Evidence Policy</h3><p>Required evidence event types for decisions.</p><div className="config-meta">{governance.evidencePolicy.requiredDecisionEvidence.map((item) => <span className="pill" key={item}>{item}</span>)}</div></article>
          </div>
        </section>
        <section className="content-grid">
          <section className="panel"><div className="panel-header"><div><h2>Audit Trail</h2><p>Settings changes append local audit events without mutating business records.</p></div></div><div className="timeline">{governance.auditEvents.map((event) => <TimelineStep key={event.id} index={event.actorType} title={event.action} detail={event.reason} status="Audit" />)}</div></section>
          <section className="panel"><div className="panel-header"><div><h2>Human Approval Required</h2><p>Sensitive AI actions route back through Inbox review.</p></div></div><div className="cards">{governance.auditPolicy.humanApprovalRequired.map((item) => <div className="work-card" key={item}><div className="card-copy"><strong>{item.replaceAll("_", " ")}</strong><span>Approval gate remains active in the MVP shell.</span></div></div>)}</div></section>
          <section className="panel"><div className="panel-header"><div><h2>Automation Levels</h2><p>L1-L4 defaults map AI autonomy to RecruitingTask approval behavior.</p></div></div><div className="table analytics-table"><div className="table-row header"><span>Level</span><span>Default</span><span>Task behavior</span></div><div className="table-row"><span className="pill green">L1</span><span>Suggest only</span><span>Human starts the writeback</span></div><div className="table-row"><span className="pill">L2</span><span>Draft and prepare</span><span>Task records next action and SLA</span></div><div className="table-row"><span className="pill warn">L3</span><span>Approval gated</span><span>AI Action Approval Task required</span></div><div className="table-row"><span className="pill danger">L4</span><span>Sensitive decision</span><span>Founder or HR Admin confirmation required</span></div></div></section>
          <section className="panel"><div className="panel-header"><div><h2>Governance Task Queue</h2><p>Settings alerts and sensitive AI writebacks consume RecruitingTask.</p></div><span className="pill warn">{governanceTasks.length} Tasks</span></div><div className="table apps-table"><div className="table-row header"><span>Task</span><span>Owner</span><span>Level</span><span>Next Action</span><span>SLA</span></div>{governanceTasks.map((task) => <div className="table-row" key={task.id}><div className="cell-main"><strong>{task.title}</strong><span>{task.sourceModule} · {task.aiApprovalRequired ? "AI Action Approval" : "Settings Alert"}</span></div><span>{task.ownerRole ?? task.owner ?? "Unassigned"}</span><span>{task.aiAutomationLevel ?? "L2"}</span><span>{task.nextAction}</span><span className={`pill ${task.slaState === "Today" ? "warn" : "green"}`}>{task.slaState}</span></div>)}</div></section>
          <section className="panel"><div className="panel-header"><div><h2>AI Action Approval Tasks</h2><p>Sensitive writebacks remain Tasks, not a competing approval model.</p></div><span className="pill danger">{approvalTasks.length} approval Tasks</span></div><div className="cards">{approvalTasks.map((task) => <div className="work-card ai" key={task.id}><div className="card-copy"><strong>{task.title}</strong><span>{task.nextAction} · {task.ownerRole}</span></div><div className="config-meta"><span className="pill warn">{task.aiAutomationLevel} approval required</span><span className="pill">{task.slaState}</span></div></div>)}</div></section>
        </section>
      </section>
    </>
  );
}

function SettingsMailboxPage({ governance, onBack }: { governance: GovernanceState; onBack: () => void }) {
  return (
    <>
      <header className="topbar"><div className="title-with-back"><button className="icon-button" aria-label="Back to Settings" type="button" onClick={onBack}><ArrowLeft aria-hidden="true" /></button><div className="page-title"><h1>Mailbox Connections</h1><p>邮箱连接详情：读取范围、文件夹规则、AI 识别边界、写回权限和审计。</p></div></div><div className="top-actions"><button className="ghost-button" type="button"><RefreshCw aria-hidden="true" /> Test Sync</button><button className="primary-button" type="button"><MailPlus aria-hidden="true" /> Add Mailbox</button></div></header>
      <section className="page-content">
        <div className="panel-header"><div><span className="eyebrow">Mailbox Connection</span><h2>Settings Mailbox</h2><p>Connection rules stay under governance while connection details remain visible to HR admins.</p></div><span className="pill">Mailbox setting</span></div>
        <div className="secondary-tabs"><button className="secondary-tab active" type="button"><Inbox aria-hidden="true" /> Mailbox Connections</button><button className="secondary-tab" type="button"><UsersRound aria-hidden="true" /> Roles & Permissions</button><button className="secondary-tab" type="button"><CalendarClock aria-hidden="true" /> Status & SLA</button><button className="secondary-tab" type="button"><Sparkles aria-hidden="true" /> AI Rules</button><button className="secondary-tab" type="button" onClick={onBack}><Settings aria-hidden="true" /> All Settings</button></div>
        <div className="hero-row"><section className="hero-panel"><h2>Email is the primary system input, so mailbox settings are production rules.</h2><p>This page decides what AI can read, what counts as recruiting evidence, when AI can write status updates, and when HR approval is required.</p></section><section className="hero-panel ai"><h2>Privacy and control</h2><p>Only configured folders and recruiting senders are processed. Sensitive replies and offer decisions require human approval.</p></section></div>
        <section className="metric-grid"><Metric label="Connected Mailboxes" value={String(governance.mailboxes.length)} detail="Recruiting + agency" /><Metric label="Folders Watched" value={String(governance.mailboxes.reduce((sum, mailbox) => sum + mailbox.foldersWatched.length, 0))} detail="Inbox, CV, Assessment" /><Metric label="Auto Write-back" value="3" detail="Safe event types" /><Metric label="Review Rules" value={String(governance.mailboxes.filter((mailbox) => mailbox.reviewPolicy === "always").length + governance.auditPolicy.humanApprovalRequired.length)} detail="Low confidence or sensitive" warning /></section>
        <section className="detail-grid">
          <div className="detail-stack">
            <section className="panel"><div className="panel-header"><div><h2>Connected Sources</h2><p>Which inboxes AI can read</p></div></div><div className="table analytics-table"><div className="table-row header"><span>Mailbox</span><span>Status</span><span>Scope</span><span>Write-back</span><span>Review</span></div>{governance.mailboxes.map((mailbox) => <div className="table-row" key={mailbox.id}><div className="cell-main"><strong>{mailbox.address}</strong><span>{mailbox.foldersWatched.join(", ")}</span></div><span className="pill green">{mailbox.status}</span><span>{mailbox.foldersWatched.length} folders</span><span>{mailbox.writebackMode}</span><span>{mailbox.reviewPolicy}</span></div>)}</div></section>
            <section className="panel"><div className="panel-header"><div><h2>Email Processing Rules</h2><p>What AI can do with mailbox data</p></div></div><div className="settings-grid"><article className="config-card"><h3>Auto-allowed</h3><p>Parse CV attachments, extract candidate identity, attach raw email, create evidence events for high-confidence updates.</p><div className="config-meta"><span className="pill green">CV parse</span><span className="pill green">Evidence event</span></div></article><article className="config-card"><h3>Requires approval</h3><p>Candidate merge, low-confidence job match, status updates from ambiguous threads, outbound candidate replies.</p><div className="config-meta"><span className="pill warn">Merge</span><span className="pill warn">Reply</span></div></article></div></section>
          </div>
          <section className="panel"><div className="panel-header"><div><h2>Write-back Boundaries</h2><p>Rules aligned with MVP scope</p></div></div><div className="cards"><div className="work-card"><div className="card-copy"><strong>Allowed automatically</strong><span>High-confidence CV intake, interview schedule confirmation, assessment submission attachment.</span></div></div><div className="work-card"><div className="card-copy"><strong>Allowed after approval</strong><span>Candidate merge, job match correction, human-facing reply draft, blocked escalation task.</span></div></div><div className="work-card"><div className="card-copy"><strong>Never automatic in MVP</strong><span>Reject candidate, make offer decision, change compensation, or send sensitive offer communication.</span></div></div></div></section>
        </section>
      </section>
    </>
  );
}

function DuplicateSignalCard({ onQueue, signal }: { onQueue: () => void; signal: DuplicateSignalSeam }) {
  return <div className="work-card ai"><div className="card-top"><div className="card-copy"><strong>{signal.candidateLabel}</strong><p>{signal.matchReason}</p></div><span className="pill warn">{Math.round(signal.confidence * 100)}%</span></div><div className="config-meta">{signal.evidence.map((item) => <span className="pill" key={item}>{item}</span>)}</div><button className="ghost-button" type="button" onClick={onQueue}>Queue duplicate review for {signal.candidateLabel}</button></div>;
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

function pillClass(status: InboxItemStatus): string {
  if (status === "approved" || status === "modified") return "pill green";
  if (status === "rejected") return "pill danger";
  return "pill warn";
}

function statusCopy(status: InboxItemStatus): string {
  const copy: Record<InboxItemStatus, string> = {
    approved: "Approved",
    in_review: "In Review",
    modified: "Modified",
    open: "Open",
    rejected: "Rejected",
    snoozed: "Snoozed"
  };
  return copy[status];
}

function toDateTimeLocalValue(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 16);
}

function parseDateTimeLocalValue(value: string): string | null {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function parseScorecardScores(value: string): Record<string, number> {
  return value.split(",").reduce<Record<string, number>>((scores, segment) => {
    const match = segment.trim().match(/^(.+?)\s+(\d+)$/);
    if (!match) return scores;
    scores[match[1].trim().toLowerCase().replace(/\s+/g, "_")] = Number(match[2]);
    return scores;
  }, {});
}

function formatDateTime(value?: string): string {
  if (!value) return "time not recorded";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.toLocaleDateString("en-CA")} ${date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;
}

function routedAuditCopy(action?: string, actor?: string): string {
  if (action === "Route to HR review") return `Routed to HR review by ${actor}`;
  return `${action ?? "Routed"} by ${actor}`;
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

function loadAssessments(): Assessment[] {
  return loadLocalState(ASSESSMENTS_KEY, seedAssessments);
}

function saveAssessments(assessments: Assessment[]) {
  saveLocalState(ASSESSMENTS_KEY, assessments);
}

function loadGovernance(): GovernanceState {
  return loadLocalState(GOVERNANCE_KEY, defaultGovernanceState);
}

function saveGovernance(governance: GovernanceState) {
  saveLocalState(GOVERNANCE_KEY, governance);
}

function loadLanguage(): Language {
  return loadLocalState(LANGUAGE_KEY, "EN" as Language);
}

function saveLanguage(language: Language) {
  saveLocalState(LANGUAGE_KEY, language);
}

function loadTaskCompletions(): TaskCompletion[] {
  return loadLocalState(TASK_COMPLETIONS_KEY, []);
}

function saveTaskCompletions(completions: TaskCompletion[]) {
  saveLocalState(TASK_COMPLETIONS_KEY, completions);
}

function syncAssessmentIntoApplications(applications: Application[], assessment: Assessment): Application[] {
  return applications.map((application) => {
    if (application.id !== assessment.applicationId) return application;
    const knownTimelineIds = new Set(application.timeline.map((event) => event.id));
    const nextEvents = assessment.timelineEvents.filter((event) => !knownTimelineIds.has(event.id));
    return {
      ...application,
      currentState: assessmentApplicationState(assessment.status),
      currentOwner: assessment.status === "Sent" ? "Candidate" : assessment.status === "In Review" || assessment.status === "Calibrate" ? "HR / Founder" : application.currentOwner,
      nextAction: assessmentNextAction(assessment),
      timeline: [...application.timeline, ...nextEvents.map((event) => ({ ...event, detail: `${assessment.title}: ${event.detail}` }))]
    };
  });
}

function assessmentNextAction(assessment: Assessment): string {
  if (assessment.status === "Draft") return "Review assessment draft";
  if (assessment.status === "Ready to Send") return "Send assessment";
  if (assessment.status === "Sent") return "Wait for candidate submission";
  if (assessment.status === "Submitted") return "Parse assessment submission";
  if (assessment.status === "Parsed") return "Start AI assessment review";
  if (assessment.status === "In Review") return "Calibrate assessment result";
  if (assessment.status === "Calibrate") return "Resolve rubric calibration";
  if (assessment.status === "Skipped by Stop Rule") return "Confirm Stop Rule";
  if (assessment.status === "Complete") return "Review assessment evidence";
  return "Review assessment";
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

function readRouteFromLocation(): RouteState {
  const path = window.location.pathname.replace(/\/$/, "") || "/";
  const taskView = parseTaskView(new URLSearchParams(window.location.search).get("view"));
  if (path === "/" || path === "/login" || path === "/dashboard") return { route: "dashboard", jobId: null, applicationId: null, taskView: null };
  if (path === "/tasks") return { route: "tasks", jobId: null, applicationId: null, taskView };
  if (path === "/jobs") return { route: "jobs", jobId: null, applicationId: null, taskView: null };
  if (path.startsWith("/jobs/")) return { route: "job-detail", jobId: decodeURIComponent(path.slice("/jobs/".length)), applicationId: null, taskView: null };
  if (path === "/applications") return { route: "applications", jobId: null, applicationId: null, taskView: null };
  if (path.startsWith("/applications/")) return { route: "application-detail", jobId: null, applicationId: decodeURIComponent(path.slice("/applications/".length)), taskView: null };
  if (path === "/application-detail") return { route: "application-detail", jobId: null, applicationId: null, taskView: null };
  if (path === "/settings/mailbox") return { route: "settings-mailbox", jobId: null, applicationId: null, taskView: null };
  const route = path.slice(1) as RouteId;
  return isPlaceholderRoute(route) ? { route, jobId: null, applicationId: null, taskView: null } : { route: "dashboard", jobId: null, applicationId: null, taskView: null };
}

function routeToPath(route: RouteId, jobId?: string, taskView?: TaskView): string {
  if (route === "dashboard") return "/dashboard";
  if (route === "tasks") return taskView ? `/tasks?view=${encodeURIComponent(taskView)}` : "/tasks";
  if (route === "job-detail") return `/jobs/${encodeURIComponent(jobId ?? "")}`;
  if (route === "application-detail") return jobId ? `/applications/${encodeURIComponent(jobId)}` : "/application-detail";
  if (route === "settings-mailbox") return "/settings/mailbox";
  return `/${route}`;
}

function parseTaskView(value: string | null): TaskView | null {
  const taskViews: TaskView[] = ["All Tasks", "My Tasks", "Critical", "Today", "Waiting on Others", "Batch Review"];
  return taskViews.includes(value as TaskView) ? value as TaskView : null;
}

function shellActiveRoute(route: RouteId): ShellNavRoute {
  if (route === "job-detail") return "jobs";
  if (route === "application-detail") return "applications";
  if (route === "inbox-detail" || route === "email-agent") return "inbox";
  if (route === "settings-mailbox") return "settings";
  if (route === "analytics") return "analytics";
  if (route === "jobs" || route === "tasks" || route === "dashboard" || route === "candidates" || route === "applications" || route === "assessments" || route === "inbox" || route === "founder-inbox" || route === "settings") return route;
  return "dashboard";
}

function agentTitle(route: RouteId): string {
  if (route === "application-detail") return "申请 AI 工作区";
  if (route === "tasks") return "Task AI Workspace";
  if (route === "job-detail") return "Job AI Workspace";
  if (route === "jobs") return "岗位 Agent";
  if (route === "assessments") return "Assessment Agent";
  if (route === "inbox" || route === "inbox-detail") return "Inbox AI Workspace";
  if (route === "email-agent") return "Email Agent";
  if (route === "candidates") return "Candidate Agent";
  if (route === "settings" || route === "settings-mailbox") return route === "settings-mailbox" ? "Mailbox AI Workspace" : "Settings AI Workspace";
  return "HireOS Agent";
}

function agentSubtitle(route: RouteId): string {
  if (route === "application-detail") return "候选人、流程状态和下一步";
  if (route === "tasks") return "Execution, risk, and evidence";
  if (route === "job-detail") return "Role setup and workflow checks";
  if (route === "jobs") return "流程与 Scorecard 设置";
  if (route === "assessments") return "Rubric and evidence";
  if (route === "inbox") return "Queues, approvals, and write-back seams";
  if (route === "inbox-detail") return "Extraction and approval";
  if (route === "email-agent") return "Mailbox intake and confidence review";
  if (route === "candidates") return "Identity and history";
  if (route === "settings") return "Governance and templates";
  if (route === "settings-mailbox") return "Input rules and automation boundaries";
  return "Workflow and evidence";
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
  if (route === "tasks") {
    return {
      recommendation: "Start with Critical and Today, then route waiting items so every recruiting action has an owner and evidence trail.",
      evidence: [
        { label: "Scope", value: "Applications, Inbox, Jobs, Assessments" },
        { label: "Risk", value: "Waiting tasks can hide owner or SLA drift." },
        { label: "Audit", value: "Completion records action, actor, and time." }
      ],
      ask: "Ask which task is blocking the recruiting flow, why it is critical, or what evidence supports the next action.",
      approveLabel: "Complete",
      reviewLabel: "Route"
    };
  }
  if (route === "assessments") {
    return {
      recommendation: "Move Trang Nguyen forward and skip additional assessment.",
      evidence: [
        { label: "Evidence", value: "6 of 7 Backend scorecard areas covered." },
        { label: "Risk", value: "Another assignment may reduce candidate response rate." },
        { label: "Confidence", value: "High · rubric match 88%." }
      ],
      ask: "Ask about assessment evidence, rubric quality, submissions, or Stop Rule confidence.",
      approveLabel: "Approve",
      reviewLabel: "Open rubric"
    };
  }
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
  if (route === "inbox") {
    return {
      recommendation: "Do not auto-apply the agency-forwarded profile. Route the identity and job ambiguity through Inbox Detail.",
      evidence: [
        { label: "Evidence", value: "Raw email, CV attachment, and duplicate phone signal are preserved." },
        { label: "Risk", value: "Candidate merge and Application creation are blocked in this B seam." },
        { label: "Confidence", value: "Medium · identity match 72%." }
      ],
      ask: "Ask about queue risk, mailbox sync status, or why an item needs human review.",
      approveLabel: "Create task",
      reviewLabel: "Inspect"
    };
  }
  if (route === "inbox-detail") {
    return {
      recommendation: "Approve, modify, reject, or snooze this item only inside the Inbox seam. Candidate/Application writes remain disabled.",
      evidence: [
        { label: "Evidence", value: "Identity 72%, job match 62%, source is agency forward." },
        { label: "Risk", value: "Wrong merge could pollute two candidate histories." },
        { label: "Boundary", value: "No final domain write in B." }
      ],
      ask: "Ask why this match is low confidence or draft a review note.",
      approveLabel: "Queue review",
      reviewLabel: "Ask HR"
    };
  }
  if (route === "email-agent") {
    return {
      recommendation: "Keep high-confidence parsing visible as intake preview, and send ambiguous identity/job matches to Inbox.",
      evidence: [
        { label: "Queue", value: "Needs Review / Auto Applied / Drafts are preserved." },
        { label: "Status", value: "AI Action and confidence are visible before writeback." },
        { label: "Boundary", value: "Auto Applied means seam-ready, not Candidate/Application write." }
      ],
      ask: "Show low-confidence matches, draft a reply, or explain why a thread was classified.",
      approveLabel: "Queue",
      reviewLabel: "Inspect"
    };
  }
  if (route === "candidates") {
    return {
      recommendation: "Hold duplicate merges for HR review. Evidence is suggestive, not definitive, and A owns the final Candidate domain.",
      evidence: [
        { label: "Evidence", value: "Phone number matches, but source email differs." },
        { label: "Risk", value: "Wrong merge could pollute two application timelines." },
        { label: "Confidence", value: "Medium · 72% identity match." }
      ],
      ask: "Ask about candidate history, duplicate evidence, or merge risk.",
      approveLabel: "Queue review",
      reviewLabel: "Compare"
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
