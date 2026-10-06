---
name: pw-trace-analyzer
description: >-
  Analyzes a Playwright trace for this framework and identifies slow steps,
  failed interactions, or locator timing issues. Use when a test is flaky or when
  a flow needs debugging with trace.zip files in test-results.
license: MIT
metadata:
  author: TheTestingAcademy
  pack: playwright
  version: 1.0.0
---

# PW Trace Analyzer

Use trace artifacts to debug a failing or slow Playwright run in this repo. This project captures traces, screenshots, videos, and HTML reports by default from `playwright.config.ts`.

## Repo behavior
- Trace is enabled in the config: `trace: 'on'`
- Screenshots and video are also captured
- Trace output is created under `test-results/**/trace.zip`

## Workflow
1. Open the failed test’s artifact folder under `test-results`.
2. Run `npx playwright show-trace "test-results/<folder>/trace.zip"` or `npx playwright show-trace`.
3. Inspect the action timeline for the slowest step or the failing interaction.
4. Check whether the failure was caused by a locator issue, timing issue, page not ready, or app state mismatch.
5. Cross-check the same flow with the corresponding page object and fixture state.

## Common root causes in this repo
- page not fully loaded before click
- cart count not updated as expected
- login step not completed before inventory page check
- missing item in cart because `expectInCart` or badge assertion is wrong
- flaky locator due to dynamic UI state

## Output guidance
When reporting a trace issue, include:
- failing step name
- last successful action
- slowest action before failure
- expected state vs actual state
- any page object or fixture chain involved

## Guardrails
- Do not guess; use trace evidence before changing selectors.
- Prefer debugging the app state rather than increasing arbitrary timeouts.
- When a trace shows a slow or repeated action, inspect the page object and wait strategy.
