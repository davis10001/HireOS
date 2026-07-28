import { describe, expect, it } from "vitest";
import { countNeedsReviewThreads, reviewInboxItem, seedEmailThreads, seedInboxItems } from "./inbox";

describe("Inbox seam domain", () => {
  it("counts only low-confidence email threads for human review", () => {
    expect(countNeedsReviewThreads(seedEmailThreads)).toBe(1);
  });

  it("keeps Candidate and Application writes blocked in the B-owned review seam", () => {
    const result = reviewInboxItem(seedInboxItems[0], "approved", "Identity still waits for Candidate domain.");

    expect(result).toMatchObject({
      itemId: "inbox-agency-forward",
      status: "approved",
      candidateApplicationWriteBlocked: true
    });
  });
});
