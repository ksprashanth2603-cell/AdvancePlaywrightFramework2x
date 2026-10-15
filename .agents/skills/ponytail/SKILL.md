---
name: ponytail
description: Find redundant state, logs, attachments, or reports that duplicate information already recorded elsewhere in the same test run. Use before opening or updating a pull request.
---

# Ponytail Gate

Check whether changed code records the same run fact more than once without a distinct consumer or purpose.

## Review

- Identify each source of truth for changed test, API, fixture, and report state.
- Trace new logging, test attachments, report fields, generated files, and fixture state to their consumers.
- Flag duplicate persistence or repeated recording of the same fact when it provides no separate diagnostic, audit, or user-facing value.
- Preserve intentional copies that serve distinct consumers, such as a concise summary plus a detailed trace; explain the distinct purpose.
- Prefer reusing existing run state and reporting helpers over adding another recording path.

## Result

Report `PASS` only when each new record has a clear owner and consumer, or is intentionally duplicated for a documented distinct purpose. Otherwise report `FAIL` with file references and the redundant record to remove or consolidate. Include concise evidence suitable for the PR quality-gate checklist.