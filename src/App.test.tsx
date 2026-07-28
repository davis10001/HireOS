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
    expect(screen.getByText("Trang Nguyen")).toBeInTheDocument();
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

    await user.click(screen.getByRole("button", { name: /trang nguyen/i }));
    expect(screen.getByRole("heading", { name: "Trang Nguyen · 高级后端工程师" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /面试流程/i })).toHaveClass("active");
    expect(screen.getByRole("heading", { name: "面试流程与状态" })).toBeInTheDocument();
    expect(screen.getByText("推进终面")).toBeInTheDocument();
    expect(within(screen.getByLabelText("Agent 对话区")).getByText("申请 AI 工作区")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /基本信息/i }));
    expect(screen.getByRole("heading", { name: "候选人基本信息" })).toBeInTheDocument();
    expect(screen.getByText("简历详情")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /生成题目/i }));
    expect(screen.getByRole("heading", { name: "生成题目" })).toBeInTheDocument();
    expect(screen.getByText("已生成题目")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /account menu/i }));
    await user.click(screen.getByRole("button", { name: /sign out/i }));
    expect(screen.getByRole("heading", { name: /sign in to hireos/i })).toBeInTheDocument();
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
    expect(screen.getByText("Duplicate Review")).toBeInTheDocument();
    expect(screen.getByText("Quang Do / Q. Do")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /queue duplicate review for quang do/i }));
    expect(screen.getByText("Queued for HR review. Merge waits for A-owned Candidate domain.")).toBeInTheDocument();
  });
});

async function login(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/email/i), "linh@hireos.vn");
  await user.type(screen.getByLabelText(/password/i), "secret1");
  await user.click(screen.getByRole("button", { name: /sign in/i }));
}
