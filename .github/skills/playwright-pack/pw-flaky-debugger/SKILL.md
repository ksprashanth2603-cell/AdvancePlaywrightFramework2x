---
name: pw-flaky-debugger
description: >-
  Diagnoses flaky Playwright tests in this repo by checking timing, selectors,
  state transitions, and trace artifacts for unstable behavior.
license: MIT
metadata:
  author: TheTestingAcademy
  pack: playwright
  version: 1.0.0
---

# PW Flaky Debugger

Use this skill when a Playwright test is intermittently failing or appears non-deterministic.

## Workflow
1. Check whether the failure is caused by timing or a race condition.
2. Inspect the flow in `src/fixtures/test-base.ts` and the relevant page object in `src/pages`.
3. Confirm whether an app state is ready before the next step is executed.
4. Review the trace, screenshots, and videos from `test-results`.
5. Reduce the number of hidden assumptions in the test.

## Repo-specific suspects
- login flows not fully complete before inventory assertions
- badge count or item state not yet updated
- checkout steps progressing before page load is complete
- selectors depending on dynamic app state

## Guardrails
- Prefer stable waits and app-state verification over arbitrary delays.
- Do not hide flakiness with broad sleeps.
- Fix the root cause in the page object or fixture state, not the symptom in a single test.
