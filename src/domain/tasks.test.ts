import { describe, expect, it } from "vitest";
import { seedApplications } from "./applications";
import { seedAssessments } from "./assessments";
import { seedJobs } from "./jobs";
import {
  buildRecruitingTasks,
  completeTask,
  filterFounderTasks,
  filterSettingsGovernanceTasks,
  filterTasks
} from "./tasks";

describe("task contract", () => {
  it("derives cross-module task views and records completion metadata", () => {
    const tasks = buildRecruitingTasks({ applications: seedApplications, assessments: seedAssessments, jobs: seedJobs });

    expect(filterTasks(tasks, "Critical", { name: "Linh Tran", role: "HR" }).map((task) => task.title)).toEqual([
      "Founder final interview approval",
      "Founder offer decision risk",
      "Agency-forwarded duplicate review",
      "Platform Engineer workflow defaults",
      "Confirm offer decision writeback"
    ]);
    expect(filterTasks(tasks, "Waiting on Others", { name: "Linh Tran", role: "HR" }).map((task) => task.title)).toEqual([
      "Assessment submission follow-up",
      "Senior Backend Engineer workflow defaults"
    ]);

    const founderTask = tasks.find((task) => task.title === "Founder final interview approval");
    expect(founderTask?.sourceModule).toBe("Applications");
    expect(founderTask?.relatedObjects).toEqual([
      { module: "Applications", id: "application-trang-backend", label: "Trang Nguyen · Senior Backend Engineer" }
    ]);

    expect(completeTask(founderTask!, "Approve final interview", "Linh Tran", "2026-07-28T09:30:00.000Z")).toEqual({
      completedAction: "Approve final interview",
      completedAt: "2026-07-28T09:30:00.000Z",
      completedBy: "Linh Tran",
      id: "task-application-application-trang-backend",
      status: "Completed"
    });
  });

  it("filters Founder Inbox to decision and risk tasks without HR operational work", () => {
    const tasks = buildRecruitingTasks({ applications: seedApplications, assessments: seedAssessments, jobs: seedJobs });
    const founderTasks = filterFounderTasks(tasks);

    expect(founderTasks.map((task) => [task.title, task.ownerRole, task.sourceModule, task.allowedActions.map((action) => action.label)])).toEqual([
      ["Founder final interview approval", "Founder", "Applications", ["Continue", "Request More Evidence", "Final Interview", "Reject", "Offer Decision"]],
      ["Founder offer decision risk", "Founder", "Applications", ["Request More Evidence", "Reject", "Offer Decision"]]
    ]);
    expect(founderTasks.map((task) => task.title)).not.toContain("Agency-forwarded duplicate review");
    expect(founderTasks.map((task) => task.title)).not.toContain("Assessment submission follow-up");
  });

  it("emits Settings alerts and sensitive AI writebacks as governance tasks", () => {
    const tasks = buildRecruitingTasks({ applications: seedApplications, assessments: seedAssessments, jobs: seedJobs });
    const governanceTasks = filterSettingsGovernanceTasks(tasks);

    expect(governanceTasks.map((task) => [task.title, task.sourceModule, task.ownerRole, task.aiAutomationLevel, task.nextAction])).toEqual([
      ["Review SLA defaults and automation levels", "Settings", "HR Admin", "L2", "Confirm SLA defaults and automation levels"],
      ["Approve AI candidate merge writeback", "Inbox", "HR Admin", "L3", "Approve or reject candidate merge"],
      ["Confirm offer decision writeback", "Settings", "HR Admin", "L4", "Human-confirm offer decision"]
    ]);
    expect(governanceTasks.filter((task) => task.aiApprovalRequired).map((task) => task.title)).toEqual([
      "Approve AI candidate merge writeback",
      "Confirm offer decision writeback"
    ]);
  });
});
