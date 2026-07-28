import { describe, expect, it } from "vitest";
import { validateLogin } from "./auth";
import {
  buildJobMetrics,
  createEmptyJobDraft,
  createJobFromDraft,
  validateJobStep
} from "./jobs";

describe("auth and job domain helpers", () => {
  it("validates login input", () => {
    expect(validateLogin("bad", "123").ok).toBe(false);
    expect(validateLogin("linh@hireos.vn", "secret1").ok).toBe(true);
  });

  it("builds job metrics from job status", () => {
    const jobs = [
      createJobFromDraft({
        ...createEmptyJobDraft(),
        title: "Backend",
        department: "Engineering",
        location: "Ho Chi Minh",
        employmentType: "Full-time",
        owner: "Linh Tran",
        requirements: "APIs",
        headcount: 2,
        status: "active"
      }),
      createJobFromDraft({
        ...createEmptyJobDraft(),
        title: "Designer",
        department: "Design",
        location: "Remote",
        employmentType: "Contract",
        owner: "Mai Ho",
        requirements: "Portfolio",
        headcount: 1,
        status: "draft"
      })
    ];

    expect(buildJobMetrics(jobs)).toMatchObject({
      total: 2,
      active: 1,
      draft: 1
    });
  });

  it("requires title before leaving job creation step one", () => {
    const errors = validateJobStep(0, createEmptyJobDraft());
    expect(errors.title).toBe("Job title is required");
  });
});
