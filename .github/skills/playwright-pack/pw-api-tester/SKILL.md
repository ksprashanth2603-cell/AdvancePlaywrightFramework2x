---
name: pw-api-tester
description: >-
  Tests the API layer or backend contract used alongside the Playwright UI flow.
  Use when a developer wants to validate HTTP responses, payloads, or request
  flows that support the TTACart app.
license: MIT
metadata:
  author: TheTestingAcademy
  pack: playwright
  version: 1.0.0
---

# PW API Tester

Use this skill when the UI flow is not enough and a backend contract or API behavior needs validation. This repo includes an `src/api` layer, but frontend tests should still prefer end-to-end UI assertions for user-facing behavior.

## Workflow
1. Identify the API contract or endpoint involved.
2. Validate request shape and expected response status.
3. Assert business-critical response fields and payload structure.
4. Keep tests independent and focused on one behavior.
5. If the UI relies on API data, verify both the UI and API contract when needed.

## Repo-specific guidance
- Keep API logic in `src/api` where possible.
- Use env values and config utilities when API credentials or base URLs are needed.
- Prefer real API responses over mocked ones for validation of contract behavior.

## Guardrails
- Do not hide UI problems by relying only on the API contract.
- Keep the API checks lightweight and relevant to the workflow under test.
