---
name: pw-network-mocker
description: >-
  Mocks or intercepts network traffic for a Playwright flow in this repository to
  validate frontend behavior without depending on the full backend state. Use when
  testing failure states, delayed responses, or API-driven UI.
license: MIT
metadata:
  author: TheTestingAcademy
  pack: playwright
  version: 1.0.0
---

# PW Network Mocker

Use network interception to isolate front-end behavior or create repeatable conditions for a specific app interaction. This is helpful when the backend or app state is flaky, but the UI flow still needs validation.

## Workflow
1. Identify the route or API request that drives the flow.
2. Intercept the request or payload using Playwright `route` or `waitForRequest` patterns.
3. Return a controlled response that matches the expected contract.
4. Validate the page behavior and UI state that should change after the mocked response.
5. Ensure the test still reflects the real user journey as closely as possible.

## Guardrails
- Mock only the external boundary you need.
- Do not hide unsupported UI behavior inside a mock.
- Keep the mocked response realistic and aligned to the app contract.
