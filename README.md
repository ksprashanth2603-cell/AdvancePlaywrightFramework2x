# Advance Playwright Framework 2X

A TypeScript-based Playwright test automation framework with environment configuration, reusable framework layers, data utilities, reporting, and GitHub Actions support.

## Features

- Playwright Test with TypeScript
- Page Object Model support through `src/pages`
- API client layer through `src/api`
- Custom fixtures through `src/fixtures`
- Environment-specific configuration through `.env`
- Test data support for CSV, XLSX, JSONPath, and Faker
- Logging with Winston
- JSON schema validation with AJV and `ajv-formats`
- HTML and list test reporters
- Screenshot, video, and trace capture
- GitHub Actions CI workflow

## Requirements

- Node.js LTS
- npm
- Git

## Project Structure

```text
.
├── .github/workflows/       # GitHub Actions workflows
├── docs/                    # Project documentation
├── rules/                   # Project rules and conventions
├── src/
│   ├── api/                 # API clients
│   ├── config/              # Environment and framework configuration
│   ├── fixtures/            # Custom Playwright fixtures
│   ├── pages/               # Page Object Model classes
│   ├── testdata/            # CSV, XLSX, JSON, and other test data
│   ├── tests/               # Playwright test cases
│   └── utils/               # Reusable helpers and utilities
├── .env                    # Local environment values; not committed
├── package.json             # Dependencies and npm metadata
├── playwright.config.ts    # Playwright configuration
├── tsconfig.json            # TypeScript configuration
└── playwright-report/       # Generated HTML report output
```

## Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/ksprashanth2603-cell/AdvancePlaywrightFramework2x.git
cd AdvancePlaywrightFramework2x
npm install
npx playwright install
```

For Linux CI environments, install browsers and operating-system dependencies with:

```bash
npx playwright install --with-deps
```

## Environment Configuration

Create a local `.env` file in the project root. Do not commit this file because it can contain credentials or environment-specific values.

Example structure:

```dotenv
TTA_ENV=qa
BASE_URL=https://your-test-environment.example.com
QA_BASE_URL=https://your-qa-environment.example.com
STG_BASE_URL=https://your-stage-environment.example.com
PROD_BASE_URL=https://your-production-environment.example.com
DEV_BASE_URL=http://localhost:3000
API_BASE_URL=https://your-api.example.com
LOG_LEVEL=info
ATTACH_SCREENSHOTS=false
TEST_ENV=QA
TEST_AUTHOR=Your Name
USERNAME=your-test-user
PASSWORD=your-test-password
```

`playwright.config.ts` loads `.env` with `dotenv`. The active `BASE_URL` is used by Playwright tests. Keep credentials local or provide them through CI secrets.

## Running Tests

Run all Playwright tests:

```bash
npx playwright test
```

Run tests with the browser visible:

```bash
npx playwright test --headed
```

Run a specific test file or test title:

```bash
npx playwright test src/tests/example.spec.ts
npx playwright test -g "test title"
```

Run the TypeScript check without generating JavaScript:

```bash
npx tsc --noEmit
```

Open the most recent HTML report:

```bash
npx playwright show-report
```

The configured test run uses Chromium, a 60-second test timeout, a 10-second assertion timeout, and captures screenshots on failure, video, and traces.

## Installed Framework Libraries

- `@playwright/test`: browser automation and test runner
- `@faker-js/faker`: generated test data
- `csv-parse`: CSV parsing
- `xlsx`: spreadsheet reading and writing
- `jsonpath-plus`: JSONPath queries
- `ajv` and `ajv-formats`: JSON schema validation
- `winston`: application and test logging
- `dotenv`: environment variable loading
- `allure-playwright`: optional Allure reporting integration

## Reports and Artifacts

Playwright writes the HTML report to `playwright-report/`. Test artifacts such as results, traces, videos, and screenshots are generated during test execution. These generated directories and local environment files are excluded from Git by `.gitignore`.

The GitHub Actions workflow uploads `playwright-report/` as a CI artifact after test execution, including when the test job is cancelled or fails after producing a report.

## Continuous Integration

The workflow in `.github/workflows/playwright.yml` runs on pushes and pull requests targeting `main` or `master`. It:

1. Checks out the repository.
2. Installs the Node.js LTS version.
3. Runs `npm ci`.
4. Installs Playwright browsers and Linux dependencies.
5. Runs the Playwright test suite.
6. Uploads the HTML report as an artifact.

Configure environment variables and credentials as GitHub Actions secrets or repository variables before tests that require authenticated environments run in CI.

## Development Guidelines

- Keep page-specific selectors and actions in `src/pages`.
- Keep API operations in `src/api`.
- Keep shared setup and teardown in `src/fixtures`.
- Keep reusable logic in `src/utils`.
- Keep environment and test data out of committed source when it contains secrets.
- Run `npx tsc --noEmit` and the relevant Playwright tests before opening a pull request.

## License

This project currently uses the ISC license metadata declared in `package.json`.

OOPs Concept:
OOPs in the Base Page (easy explanation)
The main OOP idea in this Playwright framework is the Page Object Model. The idea is simple:

A page in the app is treated like an object
Its actions and elements are grouped in a class
Common logic is written once in a base class
Each specific page gets its own class

1) Class
A class is like a blueprint.

For example:

BasePage is the blueprint for common page behavior
LoginPage, InventoryPage, CartPage, etc. are page-specific blueprints
So instead of writing the same code again and again, we create one common class.

2) Inheritance
This is one of the biggest OOP concepts here.

The idea is:

BasePage contains common methods like open page, wait for page load, click element, enter text
LoginPage extends BasePage
InventoryPage extends BasePage
Checkout pages also extend BasePage
So child pages inherit the common features without rewriting them.
Example in plain words:

All pages need to wait for page load
All pages may need to click buttons
So we write that logic once in BasePage
Then all page classes reuse it

3) Encapsulation
Encapsulation means keeping things together in one place.

In a page object:

selectors are kept inside the page class
page actions are kept inside methods
the test does not need to know how the click is implemented
So the test uses:

loginPage.login()
instead of writing raw browser steps again and again.

This makes code cleaner and easier to maintain.


4) Reusability
This is the most useful part in automation.

If many pages need:

open URL
wait for page to load
verify page title
click some common button
Then we put those in BasePage once. That saves time and avoids duplication.


5) Abstraction
Abstraction means hiding complexity.

The test writer does not need to know:

which locator is used
how the page waits
what steps are inside the method
The test just calls a simple method like:

login()
addToCart()
checkout()
This keeps test code simple and readable


6) Polymorphism (conceptually)
Even though this project may not use heavy override patterns, the same idea is present:

Different pages may use the same method name
But each page may implement it slightly differently
Example:

a common method called open() may behave slightly differently for login page vs inventory page
same method name, different page-specific behavior
