---
name: pw-flaky-debugger
description: >-
  Debugs flaky Playwright tests for this repo by reviewing retries, app state,
  trace evidence, timing assumptions, and fixture design. Use when tests pass
  locally but fail intermittently.
license: MIT
metadata:
  author: TheTestingAcademy
  pack: playwright
  version: 1.0.0
---

# PW Flaky Debugger

Flaky tests in this repo usually come from improper assumptions about app state, timing, or selectors. Use traces and fixtures to localize the cause before modifying a test or page object.

## Workflow
1. Confirm whether the issue is an app-state race, selector instability, or missing waiting logic.
2. Inspect the relevant fixture and page object for assumptions about load order.
3. Use trace artifacts to see the exact sequence of steps before failure.
4. Reproduce with a focused run and fix only the root cause.
5. If the flow is expected to be stateful, prefer a fixture that sets it up cleanly.

## Common causes here
- login step not fully complete before continuing
- missing inventory item or cart badge assertion
- a page object method not waiting for the correct state
- test relying on a stale state from previous flow

## Guardrails
- Do not mask flakiness with long arbitrary waits unless the root cause is a genuine page timing issue.
- Prefer deterministic state setup via fixtures or page objects.
- Always verify the real app behavior after the fix.
