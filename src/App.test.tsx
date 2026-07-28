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

    await user.click(screen.getByRole("button", { name: /account menu/i }));
    await user.click(screen.getByRole("button", { name: /sign out/i }));
    expect(screen.getByRole("heading", { name: /sign in to hireos/i })).toBeInTheDocument();
  });
});
