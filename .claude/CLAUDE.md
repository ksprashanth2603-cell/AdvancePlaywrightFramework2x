# Claude instructions for this repo

## Mission
Work with the Playwright framework in this repository using the project’s page-object, fixture-based patterns.

## Project rules
- Prefer `src/pages` for page logic.
- Prefer `src/fixtures/test-base.ts` for reusable state.
- Prefer `src/tests` for tests.
- Use `.env` and `src/config/env.ts` for environment values.
- Keep selectors stable and aligned with `data-test` attributes.
- Validate real application behavior rather than mock-only behavior.

## Workflow
- If a page needs a new abstraction, create or update the relevant page object.
- If state is reused across specs, add or update a fixture.
- If there is a missing env var, fail fast with a clear error.
- If there is a flaky issue, inspect the trace and state transitions before changing waits.

## Important
Do not add secrets directly to committed files. Use `.env` locally or GitHub Actions secrets in CI.
