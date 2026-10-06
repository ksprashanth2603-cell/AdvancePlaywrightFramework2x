---
applyTo: "**/*.ts"
description: "Playwright TypeScript standards for this repo: prefer page objects, fixtures, safe env loading, and real app-state assertions."
---

# Playwright Framework Instructions

Use these rules for all Playwright work in this repo.

## Core repo conventions
- Keep page locators and actions in `src/pages`.
- Use the fixture pattern from `src/fixtures/test-base.ts` instead of repeating login or app-state setup.
- Reuse `BasePage` for common navigation or helper logic.
- Prefer `data-test` attributes and semantic selectors when possible.
- Keep tests readable and business-focused.

## Environment handling
- Read secrets from `.env` or GitHub Actions secrets.
- Never hardcode credentials into tests or source files.
- Use `src/config/env.ts` helpers when env values are required.

## Assertions and flakiness
- Prefer assertions against real UI state.
- Do not add random waits; prefer explicit waits and app-state verification.
- Use traces/screenshots/videos to debug failures.

## File placement
- Page objects: `src/pages`
- Fixture state: `src/fixtures`
- Test scenarios: `src/tests`
- Shared helpers: `src/utils`
- Config values: `src/config`
