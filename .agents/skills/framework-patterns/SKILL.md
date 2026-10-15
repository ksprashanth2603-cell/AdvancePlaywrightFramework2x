---
name: framework-patterns
description: Review changes against this repository's Playwright, TypeScript, fixture, page-object, environment, and reporting conventions. Use before opening or updating a pull request.
---

# Framework Patterns Gate

Check that changes fit this repository's established Playwright and TypeScript architecture.

## Review

- Keep page objects in `src/pages`, reusable fixtures in `src/fixtures`, tests in `src/tests`, helpers in `src/utils`, and test data in `src/testdata`.
- Reuse `src/fixtures/test-base.ts` and existing page objects instead of repeating setup or placing selectors and UI actions in specs.
- Prefer stable `data-test` selectors and assertions against real application state. Avoid arbitrary waits and mock-only assertions for user-facing behavior.
- Read configuration through `src/config/env.ts` and `.env`; never add credentials or secrets to source, test data, or committed workflow files.
- Reuse existing API, logging, reporting, and test helpers where they own the behavior. Keep CI headless and preserve its artifact conventions.
- Verify that changed tests cover the behavior and that changed framework abstractions have appropriate callers.

## Result

Report `PASS` only when the diff follows the applicable conventions or documents a justified exception. Otherwise report `FAIL` with file references and the convention to restore. Include concise evidence suitable for the PR quality-gate checklist.