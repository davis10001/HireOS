import { describe, expect, it } from "vitest";
import type { Application } from "./applications";
import { seedApplications } from "./applications";
import { seedAssessments } from "./assessments";
import { seedJobs } from "./jobs";
import { buildRecruitingTasks, completeTask, filterTasks } from "./tasks";

describe("task contract", () => {
  it("derives cross-module task views and records completion metadata", () => {
    const tasks = buildRecruitingTasks({ applications: seedApplications, assessments: seedAssessments, jobs: seedJobs });

    expect(filterTasks(tasks, "Critical", { name: "Linh Tran", role: "HR" }).map((task) => task.title)).toEqual(
      expect.arrayContaining([
        "Founder final interview approval",
        "Agency-forwarded duplicate review",
        "Platform Engineer workflow defaults"
      ])
    );
    expect(filterTasks(tasks, "Waiting on Others", { name: "Linh Tran", role: "HR" }).map((task) => task.title)).toEqual([
      "Assessment submission follow-up",
      "Senior Backend Engineer workflow defaults"
    ]);

    const founderTask = tasks.find((task) => task.title === "Founder final interview approval");
    expect(founderTask?.sourceModule).toBe("Applications");
    expect(founderTask?.relatedObjects).toEqual([
      { module: "Candidates", id: "candidate-trang-nguyen", label: "Trang Nguyen" },
      { module: "Jobs", id: "job-backend", label: "Senior Backend Engineer" },
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

  it("emits application next action and risk tasks without collapsing candidate and application context", () => {
    const unhealthyApplication: Application = {
      ...seedApplications[0],
      id: "application-risky",
      candidateId: "candidate-risky",
      jobId: "job-risky",
      candidateName: "Risky Candidate",
      jobTitle: "Platform Engineer",
      currentOwner: "",
      nextAction: "",
      dueAt: "",
      slaStatus: "Overdue"
    };

    const tasks = buildRecruitingTasks({ applications: [unhealthyApplication], assessments: [], jobs: [] });

    const applicationTasks = tasks.filter((task) => task.sourceModule === "Applications");

    expect(applicationTasks.map((task) => task.title)).toEqual([
      "Risky Candidate application next action",
      "Missing owner for Risky Candidate",
      "Missing next action for Risky Candidate",
      "Missing due date for Risky Candidate",
      "Overdue application for Risky Candidate"
    ]);
    expect(applicationTasks[0].relatedObjects).toEqual([
      { module: "Candidates", id: "candidate-risky", label: "Risky Candidate" },
      { module: "Jobs", id: "job-risky", label: "Platform Engineer" },
      { module: "Applications", id: "application-risky", label: "Risky Candidate · Platform Engineer" }
    ]);
    expect(applicationTasks.slice(1).every((task) => task.priority === "Critical")).toBe(true);
  });

  it("emits inbox review, low-confidence, duplicate, and AI action approval tasks while preserving inbox context", () => {
    const tasks = buildRecruitingTasks({ applications: [], assessments: [], jobs: [] });
    const inboxTasks = tasks.filter((task) => task.sourceModule === "Inbox");

    expect(inboxTasks.map((task) => task.title)).toEqual([
      "Agency-forwarded duplicate review",
      "Low-confidence inbox review: Forwarded profile from agency",
      "Duplicate review: Quang Do / Q. Do",
      "AI Action approval: Match"
    ]);
    expect(inboxTasks.find((task) => task.title.startsWith("Low-confidence"))?.relatedObjects).toEqual([
      { module: "Inbox", id: "thread-agency-forward", label: "Forwarded profile from agency" }
    ]);
    expect(inboxTasks.find((task) => task.title.startsWith("Duplicate review"))?.evidenceRefs).toEqual([
      "Phone exact match",
      "Agency source differs",
      "CV overlap 89%"
    ]);
    expect(inboxTasks.find((task) => task.title.startsWith("AI Action approval"))?.allowedActions).toEqual([
      { label: "Approve AI action", kind: "complete", targetStatus: "Completed" },
      { label: "Route AI action for review", kind: "route", targetStatus: "Routed" }
    ]);
  });
});
