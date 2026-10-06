# AGENTS.md

## Project focus
This repo is a Playwright + TypeScript test framework for TTACart. Follow the project architecture and automation conventions.

## Rules
- Use `src/pages` for page objects.
- Use `src/fixtures/test-base.ts` for fixtures.
- Use `src/tests` for test specs.
- Use `src/utils` for helper logic and reporters.
- Use `.env` and `src/config/env.ts` for environment values.
- Keep selectors reliable and the test flow realistic.

## Required behaviors
- Prefer reusable fixtures over ad-hoc setup.
- Prefer page objects over inline selectors.
- Prefer real UI assertions over mocks.
- Use `npx playwright test` and trace/report artifacts for debugging.

## CI note
- Do not commit secrets.
- Keep CI headless and use GitHub Actions secrets for required env values.
