# Copilot instructions for this repo

## Project layout
- Use `src/pages` for page objects.
- Use `src/fixtures/test-base.ts` for reusable fixture state.
- Use `src/tests` for test specs.
- Use `src/utils` for logging, reporters, and utilities.
- Use `src/config/env.ts` and `.env` for environment values.

## Coding standards
- Prefer reusable fixtures and page objects over inline selectors.
- Align with the existing code style in this repo.
- Keep action methods clear and specific.
- Validate real UI state and app flow instead of asserting on mocks.
- Use `dotenv` and env helpers for secrets.

## CI and environment rules
- Do not commit secrets.
- Use GitHub Actions secrets in CI.
- Keep browser runs headless in CI.
- Prefer `npx playwright test` with project config and artifact capture.

## Workflow expectations
- When changing a page object, also make sure the related test still passes.
- When adding a new flow, prefer a fixture or page object abstraction.
- When a locator is uncertain, mark it and validate before finalizing.
