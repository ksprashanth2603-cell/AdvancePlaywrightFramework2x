---
name: pw-network-mocker
description: >-
  Mocks or intercepts network requests in Playwright tests for this repo so the UI
  flow can be validated without depending on external backend variability.
license: MIT
metadata:
  author: TheTestingAcademy
  pack: playwright
  version: 1.0.0
---

# PW Network Mocker

This skill helps when the UI flow needs controlled network behavior. Use it to simulate responses, validate request shapes, or isolate the test from unstable backend behavior.

## Workflow
1. Identify the request or response you need to control.
2. Mock the network route at the correct `page.route()` or `context.route()` point.
3. Keep the mock realistic and aligned to the app contract.
4. Verify both the request and the visible UI outcome.
5. Clean up the mock route when it is no longer needed.

## Repo-specific guidance
- For app flow tests, prefer page objects and real UI assertions.
- Use the runner’s trace and report outputs to confirm the request timing and browser behavior.
- Do not replace business validation with a mock-only test.

## Guardrails
- Mock at the lowest realistic layer.
- Preserve the real app behavior as much as possible.
- Do not over-mock the test to the point that it tests only the mock itself.
