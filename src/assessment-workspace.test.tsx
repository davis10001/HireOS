import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { renderApp } from "./test-utils/render";

describe("Assessment workspace prototype parity", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.history.pushState({}, "", "/assessments");
  });

  it("keeps the assessment prototype hierarchy while sending, reviewing, and writing application timeline evidence", async () => {
    const user = userEvent.setup();
    renderApp();

    await user.type(screen.getByLabelText(/email/i), "linh@hireos.vn");
    await user.type(screen.getByLabelText(/password/i), "secret1");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(screen.getByRole("heading", { name: "Assessments" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Assessment Workspace" })).toBeInTheDocument();
    const tabs = screen.getByRole("heading", { name: "Assessment Workspace" }).closest("section")!;
    expect(within(tabs).getByRole("button", { name: "Review" })).toBeInTheDocument();
    expect(within(tabs).getByRole("button", { name: "Sent" })).toBeInTheDocument();
    expect(within(tabs).getByRole("button", { name: "Draft" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Evidence Profile" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Follow-up Queue" })).toBeInTheDocument();
    expect(within(screen.getByLabelText("Agent 对话区")).getByText("Assessment Agent")).toBeInTheDocument();
    expect(screen.getByLabelText("Agent 快捷输入")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Create Assessment Draft" }));
    const dialog = screen.getByRole("dialog", { name: "Create Assessment Draft" });
    await user.clear(within(dialog).getByLabelText("Assessment title"));
    await user.type(within(dialog).getByLabelText("Assessment title"), "Investment evidence gap case");
    await user.clear(within(dialog).getByLabelText("Prompt"));
    await user.type(within(dialog).getByLabelText("Prompt"), "Review an event-driven API failure and propose a rollback plan.");
    await user.click(within(dialog).getByRole("button", { name: "Create Draft" }));

    expect(screen.getAllByText("Investment evidence gap case").length).toBeGreaterThan(0);
    await user.click(screen.getByRole("button", { name: "Mark Investment evidence gap case ready to send" }));
    await user.click(screen.getByRole("button", { name: "Sent" }));
    await user.click(screen.getByRole("button", { name: "Send Investment evidence gap case" }));
    await user.click(screen.getByRole("button", { name: "Record submission for Investment evidence gap case" }));
    await user.click(screen.getByRole("button", { name: "Review" }));
    await user.click(screen.getByRole("button", { name: "Parse submission for Investment evidence gap case" }));
    await user.click(screen.getByRole("button", { name: "Start review for Investment evidence gap case" }));
    await user.click(screen.getByRole("button", { name: "Accept Stop Rule for Investment evidence gap case" }));
    await user.click(screen.getByRole("button", { name: "Complete Investment evidence gap case" }));

    expect(screen.getAllByText("Complete").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Rubric match 88%").length).toBeGreaterThan(0);
    expect(screen.getByText("Skip additional assessment")).toBeInTheDocument();
    expect(screen.getAllByText(/backend-case-v2\.zip/).length).toBeGreaterThan(0);

    await user.click(screen.getByRole("button", { name: "Applications" }));
    expect(screen.getByText("Assessment completed")).toBeInTheDocument();
    expect(screen.getAllByText(/Investment evidence gap case/).length).toBeGreaterThan(0);

    await user.click(screen.getByRole("button", { name: /open application for sophia chen/i }));
    expect(screen.getAllByText("Assessment completed").length).toBeGreaterThan(0);
    expect(screen.getByText(/HR calibrated rubric and accepted the stop rule/)).toBeInTheDocument();
  });
});
