import { describe, expect, it } from "vitest";
import { seedApplications } from "./applications";
import { seedAssessments } from "./assessments";
import { markAssessmentReady, parseAssessmentSubmission, recordAssessmentSubmission, sendAssessment, startAssessmentReview, acceptStopRule } from "./assessments";
import { completeInterview, createInterviewForApplication } from "./interviews";
import { seedJobs } from "./jobs";
import { buildRecruitingTasks, completeTask, filterTasks } from "./tasks";

describe("task contract", () => {
  it("derives cross-module task views and records completion metadata", () => {
    const tasks = buildRecruitingTasks({ applications: seedApplications, assessments: seedAssessments, jobs: seedJobs });

    expect(filterTasks(tasks, "Critical", { name: "Linh Tran", role: "HR" }).map((task) => task.title)).toEqual([
      "Founder final interview approval",
      "Agency-forwarded duplicate review",
      "Platform Engineer workflow defaults"
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
});
