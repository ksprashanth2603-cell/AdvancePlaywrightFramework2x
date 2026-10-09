# Advance Playwright Framework 2X

A Playwright + TypeScript automation framework for UI and API testing. It uses page objects, reusable fixtures, environment-driven configuration, test data, structured logging, and custom HTML reporting.

## Features

- End-to-end UI tests for TTACart
- API tests for Restful Booker
- Page Object Model and reusable fixtures
- Environment-based configuration with dotenv
- JSON schema and JSONPath validation examples
- Faker-generated test data
- Winston-based logging
- Custom HTML reports with screenshots, videos, traces, logs, and API JSON responses
- CI configuration for GitHub Actions

## Project structure

```text
.
├── .github/
│   └── workflows/
│       └── playwright.yml
├── src/
│   ├── api/
│   ├── config/
│   ├── fixtures/
│   ├── pages/
│   ├── testdata/
│   ├── tests/
│   │   ├── apisTests/
│   │   ├── e2e/
│   │   └── login/
│   └── utils/
├── docs/
├── rules/
├── playwright-report/
├── test-results/
├── tta-report/
├── .env
├── .gitignore
├── package.json
├── playwright.config.ts
├── tsconfig.json
├── README.md
└── package-lock.json
```

## Requirements

- Node.js LTS
- npm
- Git
- Playwright browsers

## Installation

```bash
npm install
npx playwright install
```

On Linux or CI systems, use:

```bash
npx playwright install --with-deps
```

## Configuration

Create a local `.env` file in the project root:

```env
TTA_ENV=qa
BASE_URL=https://app.thetestingacademy.com
QA_BASE_URL=https://app.thetestingacademy.com
STG_BASE_URL=https://stage.thetestingacademy.com
PROD_BASE_URL=https://app.thetestingacademy.com
DEV_BASE_URL=http://localhost:3000
API_BASE_URL=https://restful-booker.herokuapp.com
LOG_LEVEL=info
ATTACH_SCREENSHOTS=true
TEST_ENV=QA
TEST_AUTHOR=Your Name
STANDARD_USER=standard_user
TTA_SECRET=tta_secret
USERNAME=standard_user
PASSWORD=tta_secret
CHECKOUT_ITEM_ID=test-allthethings-tshirt-red
CHECKOUT_FIRST_NAME=John
CHECKOUT_LAST_NAME=Doe
CHECKOUT_POSTAL_CODE=560001
```

Do not commit `.env` or other secrets. Required values are validated through the environment helpers in `src/config/env.ts`.

## Run tests

Run the complete suite:

```bash
npx playwright test
```

Run a specific test file:

```bash
npx playwright test src/tests/apisTests/03_restfulbooker_fixture_e2e_api/booking-crud.e2e.spec.ts
```

Run a specific browser/project:

```bash
npx playwright test --project=chromium
```

Run in headed mode:

```bash
npx playwright test --headed
```

Run tests matching a title:

```bash
npx playwright test -g "logs in with valid credentials"
```

## Reports

Playwright generates:

- HTML reports in `playwright-report/`
- custom reports in `tta-report/`
- traces in `test-results/**/trace.zip`
- screenshots and videos in `test-results/**`

Open the latest custom report:

```bash
npx playwright show-report
```

Open a specific trace:

```bash
npx playwright show-trace "test-results/<folder>/trace.zip"
```

## Type checking

```bash
npx tsc --noEmit
```

## Git and branch workflow

```bash
# switch to main
git checkout main

# merge the current branch
git merge cucumber

# push main
git push origin main
```

## Project conventions

- Place page objects in `src/pages`
- Place reusable fixtures in `src/fixtures`
- Place tests in `src/tests`
- Place helpers under `src/utils`
- Place test data under `src/testdata`
- Keep selectors stable and favor real UI behavior assertions
- Use `.env` and GitHub Actions secrets for configuration and credentials

## AI agent factory and prompt architecture

This repository also includes a lightweight AI layer that augments the Playwright automation flow with structured, validated LLM outputs.

### What the agent factory does

The core is `src/ai/agentFactory.ts`. It centralizes the logic for:

- loading the active AI provider configuration from environment values
- instantiating the provider client
- generating a prompt from agent input
- sending the prompt to the LLM
- parsing the model response as JSON
- validating the output with Ajv against a schema
- retrying once when validation fails
- returning a clean `available` or `unavailable` result

This pattern makes every AI feature reliable and predictable instead of relying on raw model output.

### Architecture in order

1. `src/ai/config/providers.ts` selects the provider, base URL, and API key.
2. `src/ai/llmClient.ts` sends the request to the provider and normalizes the response.
3. `src/ai/agentFactory.ts` turns a prompt plus schema into a typed agent.
4. Agent implementations in `src/ai/agents/` handle specific automation tasks.
5. Playwright tests or reporting flows consume the returned structured data.

### Current agent examples

- `flakyAnalyzer.ts` summarizes flaky test status changes.
- `rcaAgents.ts` performs root-cause analysis on failed assertions.
- `testDataGenerator.ts` creates realistic API payloads using schema validation.
- `SelfHealDemo.spec.ts` demonstrates selector fallback logic and attaches AI analysis output.

### Prompting pattern

The project uses a strict design pattern for all prompts:

- a clear task description
- controlled input data
- a valid JSON schema
- machine-readable output only
- validation before trusting the result

This keeps AI behavior deterministic and easy to integrate into an automation framework.

### Example flow

```ts
const agent = createAgent({
  name: 'test-data-generator',
  prompt: ({ scenario }) => `Create a realistic booking payload for ${scenario}`,
  schema: bookingSchema,
});

const result = await agent({ scenario: 'checkout with guest user' });
```

The agent returns either:

- `{ status: 'available', data: ... }`
- `{ status: 'unavailable', reason: 'missing_api_key' | 'provider_error' | 'invalid_output' }`

That gives the rest of the framework a consistent contract for working with AI features.

## License

This project uses the ISC license declared in `package.json`.
