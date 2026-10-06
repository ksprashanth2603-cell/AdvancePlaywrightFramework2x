---
name: pw-ci-configurator
description: >-
  Configures the GitHub Actions or CI pipeline for this Playwright framework,
  including dependencies, browser setup, env variables, and artifact upload.
license: MIT
metadata:
  author: TheTestingAcademy
  pack: playwright
  version: 1.0.0
---

# PW CI Configurator

This project runs Playwright tests with GitHub Actions. The CI workflow should install dependencies, install browsers, pass environment secrets, and upload the report artifact.

## Repo-specific patterns
- Workflow file: `.github/workflows/playwright.yml`
- Browser setup: `npx playwright install --with-deps`
- Secrets are expected for env-based tests such as `STANDARD_USER`, `TTA_SECRET`, and checkout values.
- Local `.env` is intentionally not committed.

## Workflow
1. Confirm the repo uses Node.js and `npm ci`.
2. Install Playwright browsers and OS dependencies.
3. Pass required env variables using GitHub secrets.
4. Run the test suite and upload `playwright-report` as an artifact.
5. Keep CI logs readable and focused on failure details.

## Guardrails
- Do not hardcode secrets in YAML.
- Keep CI configuration simple and deterministic.
- Ensure the headless browser mode is correct for the runner environment.
