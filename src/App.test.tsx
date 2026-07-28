import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, beforeEach } from "vitest";
import { renderApp } from "./test-utils/render";

describe("Login + Jobs prototype slice", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("shows login before authentication", () => {
    renderApp();
    expect(screen.getByRole("heading", { name: /sign in to hireos/i })).toBeInTheDocument();
  });

  it("renders the prototype shell after login", async () => {
    const user = userEvent.setup();
    renderApp();

    await user.type(screen.getByLabelText(/email/i), "linh@hireos.vn");
    await user.type(screen.getByLabelText(/password/i), "secret1");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(screen.getByLabelText("主导航")).toBeInTheDocument();
    expect(screen.getByText("Operate")).toBeInTheDocument();
    expect(screen.getByText("Intelligence")).toBeInTheDocument();
    expect(screen.getByLabelText("Agent 对话区")).toBeInTheDocument();
    expect(screen.getByLabelText("Agent 快捷输入")).toBeInTheDocument();
  });

  it("shows login validation errors and persists successful auth", async () => {
    const user = userEvent.setup();
    const { unmount } = renderApp();

    await user.click(screen.getByRole("button", { name: /sign in/i }));
    expect(screen.getByText("Enter a valid email")).toBeInTheDocument();
    expect(screen.getByText("Password must be at least 6 characters")).toBeInTheDocument();

    await user.type(screen.getByLabelText(/email/i), "linh@hireos.vn");
    await user.type(screen.getByLabelText(/password/i), "secret1");
    await user.click(screen.getByRole("button", { name: /sign in/i }));
    expect(screen.getByLabelText("主导航")).toBeInTheDocument();

    unmount();
    renderApp();
    expect(screen.getByLabelText("主导航")).toBeInTheDocument();
  });

  it("supports stable Jobs and missing Job Detail URLs", async () => {
    window.history.pushState({}, "", "/jobs");
    const user = userEvent.setup();
    renderApp();

    await user.type(screen.getByLabelText(/email/i), "linh@hireos.vn");
    await user.type(screen.getByLabelText(/password/i), "secret1");
    await user.click(screen.getByRole("button", { name: /sign in/i }));
    expect(screen.getByRole("heading", { name: "Jobs" })).toBeInTheDocument();

    window.history.pushState({}, "", "/jobs/missing-job");
    window.dispatchEvent(new PopStateEvent("popstate"));
    expect(await screen.findByText("Job not found")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Back to Jobs" }));
    expect(screen.getByRole("heading", { name: "Jobs" })).toBeInTheDocument();

    window.history.pushState({}, "", "/settings/mailbox");
    window.dispatchEvent(new PopStateEvent("popstate"));
    expect(await screen.findByRole("heading", { name: "Settings Mailbox" })).toBeInTheDocument();
    expect(screen.getByText("Mailbox Connection")).toBeInTheDocument();
  });

  it("logs in, creates a job through the four-step modal, opens detail, and logs out", async () => {
    const user = userEvent.setup();
    renderApp();

    await user.type(screen.getByLabelText(/email/i), "linh@hireos.vn");
    await user.type(screen.getByLabelText(/password/i), "secret1");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await user.click(screen.getByRole("button", { name: "Jobs" }));
    expect(screen.getByText("岗位筛选")).toBeInTheDocument();
    expect(screen.getByText("岗位列表")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /new job/i }));
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByRole("button", { name: "1 Create job" })).toBeInTheDocument();

    await user.clear(within(dialog).getByLabelText("Job title"));
    await user.type(within(dialog).getByLabelText("Job title"), "Revenue Analyst");
    await user.clear(within(dialog).getByLabelText("Department"));
    await user.type(within(dialog).getByLabelText("Department"), "Finance");
    await user.clear(within(dialog).getByLabelText("Location"));
    await user.type(within(dialog).getByLabelText("Location"), "Hanoi");
    await user.click(within(dialog).getByRole("button", { name: /next/i }));

    await user.clear(within(dialog).getByLabelText("Requirements"));
    await user.type(within(dialog).getByLabelText("Requirements"), "Revenue reporting and hiring budget analysis");
    await user.click(within(dialog).getByRole("button", { name: /next/i }));

    await user.click(within(dialog).getByRole("button", { name: "Generate" }));
    expect(within(dialog).getByText(/AI generated scorecard/i)).toBeInTheDocument();
    await user.click(within(dialog).getByRole("button", { name: /next/i }));
    await user.clear(within(dialog).getByLabelText("Final summary"));
    await user.type(within(dialog).getByLabelText("Final summary"), "Final summary approved by HR.");

    await user.click(within(dialog).getByRole("button", { name: "Create Job" }));
    expect(screen.getByRole("button", { name: /open revenue analyst/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /open revenue analyst/i }));
    expect(screen.getByRole("heading", { name: "Revenue Analyst" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /候选人/i })).toHaveClass("active");
    expect(screen.getByRole("heading", { name: "候选人成员列表" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Assigned Candidates" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Unassigned Pool" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "邮件匹配规则" }).closest(".detail-grid")).toHaveClass("is-hidden");

    await user.click(screen.getByRole("button", { name: /岗位详情/i }));
    expect(screen.getByRole("button", { name: /岗位详情/i })).toHaveClass("active");
    expect(screen.getByRole("heading", { name: "招聘需求" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "已配置流程" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "邮件匹配规则" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "邮件匹配规则" }).closest(".detail-grid")).not.toHaveClass("is-hidden");
    const agent = screen.getByLabelText("Agent 对话区");
    expect(within(agent).getByText("Job AI Workspace")).toBeInTheDocument();
    expect(within(agent).getByText("Review the Assessment rubric before sending another case, then keep the job Active.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /account menu/i }));
    await user.click(screen.getByRole("button", { name: /sign out/i }));
    expect(screen.getByRole("heading", { name: /sign in to hireos/i })).toBeInTheDocument();
  });

  it("creates a candidate in the pool, attaches to a job, and creates an application", async () => {
    window.history.pushState({}, "", "/candidates");
    const user = userEvent.setup();
    renderApp();

    await user.type(screen.getByLabelText(/email/i), "linh@hireos.vn");
    await user.type(screen.getByLabelText(/password/i), "secret1");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(screen.getByRole("heading", { name: "Candidates" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Candidate Registry" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Assigned Candidates" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Unassigned Pool" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Rejected / Not Fit Pool" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Duplicate Review" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /new candidate/i }));
    const modal = screen.getByRole("dialog", { name: /new candidate/i });
    await user.type(within(modal).getByLabelText("Full name"), "Nora Le");
    await user.type(within(modal).getByLabelText("Email"), "nora@example.com");
    await user.type(within(modal).getByLabelText("Phone"), "+84 900 111 222");
    await user.type(within(modal).getByLabelText("Source"), "Manual outreach");
    await user.type(within(modal).getByLabelText("Current title"), "Backend Engineer");
    await user.type(within(modal).getByLabelText("Location"), "Ho Chi Minh");
    await user.type(within(modal).getByLabelText("Skills summary"), "Node.js, PostgreSQL, payment APIs");
    await user.type(within(modal).getByLabelText("CV/evidence note"), "Strong API ownership evidence");
    await user.click(within(modal).getByRole("button", { name: "Save to Unassigned Pool" }));

    expect(screen.getAllByText("Nora Le").length).toBeGreaterThan(0);
    await user.click(screen.getByRole("button", { name: "Applications" }));
    expect(screen.queryByText("Nora Le")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Jobs" }));
    await user.click(screen.getByRole("button", { name: /open senior backend engineer/i }));
    expect(screen.getByRole("heading", { name: "Unassigned Pool" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /attach nora le to this job/i }));
    expect(screen.getByText("Nora Le attached to Senior Backend Engineer")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Applications" }));
    expect(screen.getByText("Pipeline Workbench")).toBeInTheDocument();
    expect(screen.getByText("Nora Le")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /open application for nora le/i }));
    expect(screen.getByRole("heading", { name: "Nora Le · Senior Backend Engineer" })).toBeInTheDocument();
    expect(screen.getByText("Candidate Identity")).toBeInTheDocument();
    expect(screen.getByText("Application Workflow")).toBeInTheDocument();
    expect(screen.getAllByText("Application created").length).toBeGreaterThan(0);
  });

  it("creates and attaches a candidate from Job Detail through the candidate modal", async () => {
    window.history.pushState({}, "", "/jobs/job-backend");
    const user = userEvent.setup();
    renderApp();

    await user.type(screen.getByLabelText(/email/i), "linh@hireos.vn");
    await user.type(screen.getByLabelText(/password/i), "secret1");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(screen.getByRole("heading", { name: "Senior Backend Engineer" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Create and attach Candidate" }));
    const modal = screen.getByRole("dialog", { name: /new candidate/i });
    await user.type(within(modal).getByLabelText("Full name"), "Omar Vo");
    await user.type(within(modal).getByLabelText("Email"), "omar@example.com");
    await user.type(within(modal).getByLabelText("Source"), "Manual referral");
    await user.type(within(modal).getByLabelText("Skills summary"), "Backend systems and API ownership");
    await user.click(within(modal).getByRole("button", { name: "Create and Attach Candidate" }));

    expect(screen.getByText("Omar Vo attached to Senior Backend Engineer")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Applications" }));
    expect(screen.getByText("Omar Vo")).toBeInTheDocument();
  });

  it("resolves duplicates before assignment and can mark a candidate not fit for the current job", async () => {
    window.history.pushState({}, "", "/jobs/job-backend");
    const user = userEvent.setup();
    renderApp();

    await user.type(screen.getByLabelText(/email/i), "linh@hireos.vn");
    await user.type(screen.getByLabelText(/password/i), "secret1");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(screen.queryByRole("button", { name: /attach nora le to this job/i })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Resolve duplicate for Nora Le" }));
    await user.click(screen.getByRole("button", { name: /attach nora le to this job/i }));
    expect(screen.getByText("Nora Le attached to Senior Backend Engineer")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Not Fit Current Job for Nora Le" }));
    expect(screen.getByRole("heading", { name: "Rejected / Not Fit Pool" })).toBeInTheDocument();
    expect(screen.getAllByText("Nora Le").length).toBeGreaterThan(0);

    await user.click(screen.getByRole("button", { name: "Applications" }));
    expect(screen.getByText(/Ready ·/)).toBeInTheDocument();
  });

  it("preserves the Inbox prototype tabs and mailbox connection modal", async () => {
    const user = userEvent.setup();
    renderApp();

    await login(user);
    await user.click(screen.getByRole("button", { name: "Inbox" }));

    expect(screen.getByRole("heading", { name: "Inbox" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /工作队列/i })).toHaveClass("active");
    expect(screen.getByRole("button", { name: /同步状态/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /关联邮箱/i })).toBeInTheDocument();
    expect(screen.getByText("Agency-forwarded profile")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /connect mailbox/i }));
    const dialog = screen.getByRole("dialog", { name: /连接招聘邮箱/i });
    expect(within(dialog).getByRole("button", { name: /1 邮箱类型/i })).toHaveClass("active");
    expect(within(dialog).getByRole("button", { name: /2 授权说明/i })).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: /3 读取规则/i })).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: /4 扫描预览/i })).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: /5 开始同步/i })).toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: /下一步/i }));
    expect(within(dialog).getByRole("button", { name: /2 授权说明/i })).toHaveClass("active");
  });

  it("renders the Email Agent intake queue as the prototype front door", async () => {
    const user = userEvent.setup();
    window.history.pushState({}, "", "/email-agent");
    renderApp();

    await login(user);

    expect(screen.getByRole("heading", { name: "Email Agent" })).toBeInTheDocument();
    expect(screen.getByText("Intake Queue")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Needs Review" })).toHaveClass("active");
    expect(screen.getByText("Email Thread")).toBeInTheDocument();
    expect(screen.getByText("Detected Type")).toBeInTheDocument();
    expect(screen.getByText("Job Match")).toBeInTheDocument();
    expect(screen.getByText("AI Action")).toBeInTheDocument();
    expect(screen.getByText("Forwarded profile from agency")).toBeInTheDocument();
    expect(screen.getByText("Low conf.")).toBeInTheDocument();
  });

  it("supports low-confidence Inbox Detail review actions without Candidate/Application writes", async () => {
    const user = userEvent.setup();
    window.history.pushState({}, "", "/inbox-detail");
    renderApp();

    await login(user);

    expect(screen.getByRole("heading", { name: "Agency-forwarded profile" })).toBeInTheDocument();
    expect(screen.getByText("Raw Email Evidence")).toBeInTheDocument();
    expect(screen.getByText("AI Recommendation")).toBeInTheDocument();
    expect(screen.getByText("Write-back Preview")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Approve" }));
    expect(screen.getByText("Approved in B seam only. Candidate/Application write remains blocked.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Reject" }));
    expect(screen.getByLabelText("Reject reason")).toBeInTheDocument();
    await user.type(screen.getByLabelText("Reject reason"), "Wrong job match");
    await user.click(screen.getByRole("button", { name: "Confirm Reject" }));
    expect(screen.getByText("Rejected with reason: Wrong job match")).toBeInTheDocument();
  });

  it("keeps duplicate review as a Candidate-page shell instead of merging", async () => {
    const user = userEvent.setup();
    window.history.pushState({}, "", "/candidates");
    renderApp();

    await login(user);

    expect(screen.getByRole("heading", { name: "Candidates" })).toBeInTheDocument();
    expect(screen.getByText("Candidate Registry")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Duplicate Review" })).toBeInTheDocument();
    expect(screen.getByText("Quang Do / Q. Do")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /queue duplicate review for quang do/i }));
    expect(screen.getByText("Queued for HR review. Merge waits for A-owned Candidate domain.")).toBeInTheDocument();
  });

  it("schedules an interview, collects feedback evidence, and reflects next action in Applications", async () => {
    window.history.pushState({}, "", "/applications");
    const user = userEvent.setup();
    renderApp();

    await user.type(screen.getByLabelText(/email/i), "linh@hireos.vn");
    await user.type(screen.getByLabelText(/password/i), "secret1");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(screen.getByRole("heading", { name: "Applications" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Interviews" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /open application for trang nguyen/i }));

    expect(screen.getByRole("heading", { name: "Trang Nguyen · Senior Backend Engineer" })).toBeInTheDocument();
    expect(screen.getByLabelText("Agent 对话区")).toBeInTheDocument();
    expect(screen.getByLabelText("Agent 快捷输入")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "面试流程与状态" })).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("Interview type"), "Technical");
    await user.clear(screen.getByLabelText("Interviewer"));
    await user.type(screen.getByLabelText("Interviewer"), "Mai Ho");
    await user.clear(screen.getByLabelText("Interview time"));
    await user.type(screen.getByLabelText("Interview time"), "2026-07-29T10:00");
    await user.clear(screen.getByLabelText("Location or link"));
    await user.type(screen.getByLabelText("Location or link"), "https://meet.hireos.test/trang-tech");
    await user.selectOptions(screen.getByLabelText("Candidate confirmation"), "Pending");
    await user.click(screen.getByRole("button", { name: "Save interview" }));

    expect(screen.getAllByText("Scheduling Interview").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Confirm interview time with Trang Nguyen").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Interview scheduling started").length).toBeGreaterThan(0);

    await user.click(screen.getByRole("button", { name: "Applications" }));
    expect(screen.getByText("Confirm interview time with Trang Nguyen")).toBeInTheDocument();
    expect(screen.getByText(/Today ·/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /open application for trang nguyen/i }));
    await user.click(screen.getByRole("button", { name: "Mark interview completed" }));
    expect(screen.getAllByText("Waiting Feedback").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Submit interview feedback for Trang Nguyen").length).toBeGreaterThan(0);

    await user.type(screen.getByLabelText("Strengths"), "Architecture tradeoffs, debugging depth, API ownership");
    await user.type(screen.getByLabelText("Risks"), "Leadership under pressure needs one follow-up.");
    await user.type(screen.getByLabelText("Scorecard scores"), "Architecture 5, Debugging 4, Ownership 5");
    await user.type(screen.getByLabelText("Evidence notes"), "Explained API rollback tradeoffs with clear ownership.");
    await user.type(screen.getByLabelText("Follow-up questions"), "Ask about conflict resolution under release pressure.");
    await user.click(screen.getByRole("button", { name: "Submit feedback" }));

    expect(screen.getAllByText("Feedback Complete").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Interview feedback parsed").length).toBeGreaterThan(0);
    expect(screen.getByText("Strong Yes: Architecture tradeoffs, debugging depth, API ownership")).toBeInTheDocument();
    expect(screen.getByText("Evidence Event")).toBeInTheDocument();
  });
});

async function login(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/email/i), "linh@hireos.vn");
  await user.type(screen.getByLabelText(/password/i), "secret1");
  await user.click(screen.getByRole("button", { name: /sign in/i }));
}
