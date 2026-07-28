# HireOS Domain Glossary

HireOS is an Email-first AI-native recruiting operating system for Founder and HR teams.

## Terms

- Candidate: A reusable person record. It stores identity, contact information, CV history, duplicate-review results, and cross-job recruiting history.
- Job: A hiring need. It stores the role goal, JD, scorecard, screening criteria, assessment plan, workflow defaults, owner defaults, and SLA defaults.
- Hiring Workflow: A job-level process template. It defines stages, interview rounds, participants, evaluation criteria, owner defaults, SLA rules, and pass criteria.
- Application: The operational unit for one Candidate applying to one Job. It owns status, current owner, process owner, next action, SLA, timeline, evidence, interviews, assessments, communication, and decision history.
- Email Thread: A recruiting email conversation and its attachments. It is the MVP's primary external data source.
- Evidence Event: A structured record that can influence workflow progress, risk, evaluation, or decision-making. The original source must remain traceable.
- Current Owner: The person or actor responsible for the immediate next action on an Application.
- Process Owner: The HR-side owner accountable for ensuring an Application keeps moving even when the Current Owner is someone else.
- Next Action: The concrete action required to move an Application forward.
- SLA: The expected time window for completing a stage, action, or review.
- Blocked Application: An Application that cannot progress because it is overdue, ambiguous, missing an owner, missing evidence, waiting on a person, or blocked by policy.
- Founder Inbox: A decision queue for high-value founder actions such as scorecard confirmation, assessment review, final interview decisions, risk escalations, and offer decisions.
- AI Email Agent: The controlled AI actor that reads recruiting mail, extracts candidates and evidence, recommends matches and status changes, drafts replies, and routes ambiguous items for human approval.
- Offer Decision: The MVP endpoint for deciding whether to move a candidate into offer. It is not full offer management, negotiation, contract, or onboarding.
- Inbox Item: A work item requiring human or AI handling, such as low-confidence email matching, candidate duplicate review, status update approval, assessment review, founder decision, or blocked resolution.
- AI Action: A recorded AI-generated extraction, match, summary, draft, recommendation, or writeback attempt with input references, output, evidence references, confidence, approval status, and audit history.
- Blocked Root Cause: The primary reason an Application cannot progress, such as missing owner, missing next action, waiting candidate, waiting interviewer, evidence gap, low-confidence match, approval pending, or mailbox error.
- Decision Type: The business choice recorded for an Application, such as Continue, Request More Evidence, Final Interview, Reject, Offer Decision, or Hold.
