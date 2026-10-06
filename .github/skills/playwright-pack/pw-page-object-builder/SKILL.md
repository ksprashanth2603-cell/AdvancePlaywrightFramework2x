---
name: pw-page-object-builder
description: >-
  Builds a Playwright Page Object Model class for this repo, using the existing
  structure in src/pages, BasePage.ts, and @fixtures/test-base.ts. Use when a
  developer says "make a page object for the login page", "build a POM for the
  cart", or "move locators out of the test into src/pages". Prefers resilient
  selectors and reusable action methods aligned with this framework.
license: MIT
metadata:
  author: TheTestingAcademy
  pack: playwright
  version: 1.0.0
---

# PW Page Object Builder

You draft a Page Object Model class for this repo, but you do not pretend it is final without review. The goal is to match the project conventions already used in the framework: `BasePage` for shared logic, page-specific classes under `src/pages`, and fixture-driven tests in `src/tests`.

## When to use
- A page or URL needs a reusable page object.
- Inline selectors should be extracted into a class under `src/pages`.
- A spec needs a cleaner action model such as `loginAs()`, `addToCart()`, or `checkout()`.

## Repo conventions
- Shared base logic lives in `src/pages/BasePage.ts`.
- Page classes live under `src/pages/*.ts`.
- Tests import from `@fixtures/test-base` and use fixture state when possible.
- Prefer `data-test` selectors and `getByRole` / `getByLabel` / `getByTestId` patterns when possible.

## Workflow
1. Identify the page and its route path. Add `static readonly PATH` using the framework’s route style, for example `/playwright/ttacart/login.html` or `/playwright/ttacart/inventory.html`.
2. Review the necessary user flows and group selectors into logical sections: header, form, cart, checkout, success screen.
3. Add methods that return `Locator` values lazily, rather than storing resolved elements. Keep selectors private and stable.
4. Add action methods that orchestrate clicks and fills, but do not mix assertions into the page object unless it is a direct page-load verification like `assertLoaded()`.
5. Use `BasePage` for navigation and common helper logic; do not duplicate it.
6. Mark any guessed selector with `// TODO: confirm`.

## Output shape
```ts
import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  static readonly PATH = '/playwright/ttacart/index.html';

  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;

  constructor(page: Page) {
    super(page, 'LoginPage');
    this.usernameInput = page.locator('[data-test="username"]');
    this.passwordInput = page.locator('[data-test="password"]');
    this.loginButton = page.locator('[data-test="login-button"]');
  }

  async open(): Promise<void> {
    await this.goto(LoginPage.PATH);
  }

  async loginAs(username: string, password: string): Promise<void> {
    await this.el.fill(this.usernameInput, username);
    await this.el.fill(this.passwordInput, password);
    await this.el.click(this.loginButton);
  }
}
```

## Guardrails
- Prefer the project’s conventions: `BasePage`, `this.el`, `this.page`, and `data-test` selectors.
- Never use brittle CSS class selectors or `nth-child` patterns when a better semantic selector exists.
- Keep one page object focused on one page or one logical section.
- Do not invent test IDs or accessible names that were not confirmed.
- Use `assertLoaded()` for page readiness checks and keep tests clean.
