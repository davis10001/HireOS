import { describe, expect, it } from "vitest";
import type { Application } from "./applications";
import { seedApplications } from "./applications";
import { seedAssessments } from "./assessments";
import { markAssessmentReady, parseAssessmentSubmission, recordAssessmentSubmission, sendAssessment, startAssessmentReview, acceptStopRule } from "./assessments";
import { completeInterview, createInterviewForApplication } from "./interviews";
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

    expect(completeTask(founderTask!, "Final Interview", "Linh Tran", "2026-07-28T09:30:00.000Z")).toEqual({
      completedAction: "Final Interview",
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

    const applicationTasks = tasks.filter((task) => task.sourceModule === "Applications" && task.id !== "task-founder-offer-risk");

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

    expect(inboxTasks.map((task) => task.title)).toEqual(expect.arrayContaining([
      "Agency-forwarded duplicate review",
      "Low-confidence inbox review: Forwarded profile from agency",
      "Duplicate review: Quang Do / Q. Do",
      "AI Action approval: Match",
      "Approve AI candidate merge writeback"
    ]));
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

  it("emits interview scheduling, feedback, and missing-feedback risk tasks from application interviews", () => {
    const scheduled = createInterviewForApplication(seedApplications[0], {
      candidateConfirmationStatus: "Confirmed",
      interviewType: "Technical",
      interviewer: "Mai Ho",
      locationOrLink: "https://meet.hireos.test/trang-tech",
      scheduledStartAt: "2026-07-29T10:00:00.000Z"
    });
    const completed = completeInterview(
      { ...scheduled.application, interviews: [scheduled.interview] },
      scheduled.interview
    );
    const application = { ...completed.application, interviews: [completed.interview] };

    const tasks = buildRecruitingTasks({ applications: [application], assessments: [], jobs: [] });

    expect(tasks).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: `task-interview-feedback-${completed.interview.id}`,
        title: "Trang Nguyen interview feedback overdue",
        sourceModule: "Applications",
        owner: "Mai Ho",
        priority: "Critical",
        status: "Open",
        nextAction: "Submit interview feedback for Trang Nguyen",
        slaState: "Overdue",
        relatedObjects: expect.arrayContaining([
          { module: "Applications", id: "application-trang-backend", label: "Trang Nguyen · Senior Backend Engineer" }
        ])
      })
    ]));
  });

  it("emits assessment workflow tasks for draft, send, submission, review, and stop-rule states", () => {
    const draft = seedAssessments[0];
    const ready = markAssessmentReady(draft);
    const sent = sendAssessment(ready, "email-thread-assessment-send");
    const submitted = recordAssessmentSubmission(sent, {
      attachments: ["backend-case-v2.zip"],
      emailThreadId: "email-thread-assessment-submit",
      submittedAt: "2026-07-28T09:30:00.000Z",
      version: "v2"
    });
    const parsed = parseAssessmentSubmission(submitted);
    const inReview = startAssessmentReview(parsed);
    const stopRule = acceptStopRule(inReview, "Evidence coverage is enough after v2.");

    const tasks = buildRecruitingTasks({
      applications: seedApplications,
      assessments: [draft, ready, sent, submitted, parsed, inReview, stopRule],
      jobs: []
    });

    expect(tasks.map((task) => [task.id, task.nextAction, task.owner ?? task.ownerRole, task.slaState])).toEqual(expect.arrayContaining([
      [`task-assessment-draft-${draft.id}`, "Review assessment draft and rubric", "Linh Tran", "Ready"],
      [`task-assessment-ready-${ready.id}`, "Send assessment instructions to Trang Nguyen", "Linh Tran", "Today"],
      [`task-assessment-sent-${sent.id}`, "Follow up for assessment submission", "Candidate", "Waiting"],
      [`task-assessment-submission-${submitted.id}`, "Parse candidate submission package", "Linh Tran", "Today"],
      [`task-assessment-review-${parsed.id}`, "Start AI assessment review", "Linh Tran", "Ready"],
      [`task-assessment-calibration-${inReview.id}`, "Calibrate assessment result and stop-rule recommendation", "Linh Tran", "Ready"],
      [`task-assessment-stop-rule-${stopRule.id}`, "Confirm Stop Rule on the Application timeline", "Founder", "Ready"]
    ]));
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
      ["AI Action approval: Match", "Inbox", "HR Admin", "L3", "Approve or route the sensitive AI action before write-back"],
      ["Review SLA defaults and automation levels", "Settings", "HR Admin", "L2", "Confirm SLA defaults and automation levels"],
      ["Approve AI candidate merge writeback", "Inbox", "HR Admin", "L3", "Approve or reject candidate merge"],
      ["Confirm offer decision writeback", "Settings", "HR Admin", "L4", "Human-confirm offer decision"]
    ]);
    expect(governanceTasks.filter((task) => task.aiApprovalRequired).map((task) => task.title)).toEqual([
      "AI Action approval: Match",
      "Approve AI candidate merge writeback",
      "Confirm offer decision writeback"
    ]);
  });
});
