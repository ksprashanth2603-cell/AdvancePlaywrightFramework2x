---
name: pw-accessibility-auditor
description: >-
  Reviews an existing Playwright flow for accessibility issues in this repo using
  semantic selectors, keyboard flows, and browser accessibility checks. Use when
  someone says "check this page for a11y" or "make this flow accessible".
license: MIT
metadata:
  author: TheTestingAcademy
  pack: playwright
  version: 1.0.0
---

# PW Accessibility Auditor

Review a page or flow for accessibility issues before a release. This repo uses semantic page objects and real browser flows, so accessibility checks should align with how the app is actually exercised.

## Workflow
1. Identify the page or flow under review.
2. Check for keyboard accessibility, visible labels, focus order, and readable text.
3. Audit the page object and selectors for stable semantics.
4. Prefer `getByRole`, `getByLabel`, and meaningful accessible names.
5. Report findings with page, selector, and suggested remediation.

## Repo-specific focus
- Pages should be navigated through page objects in `src/pages`.
- Validation should align with user actions such as login, cart, checkout, and order completion.
- Use real browser runs and trace artifacts when needed to inspect actual focus behavior.

## Guardrails
- Do not only rely on visual inspection; validate actual keyboard and label behavior.
- Avoid hidden or inaccessible interactions.
- Treat missing labels and focus traps as release blockers when they block common flows.
