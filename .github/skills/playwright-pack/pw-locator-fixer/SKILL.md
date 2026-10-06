---
name: pw-locator-fixer
description: >-
  Fixes broken or flaky locators in this Playwright framework using page objects,
  semantic selectors, and the repo’s existing data-test conventions. Use when a
  button, field, or item in TTACart cannot be found reliably.
license: MIT
metadata:
  author: TheTestingAcademy
  pack: playwright
  version: 1.0.0
---

# PW Locator Fixer

Fix broken locators while staying aligned with this project’s conventions. In this repo, page objects are the source of truth. The app already uses stable selectors like `data-test` attributes, and the framework expects selectors to live in `src/pages` rather than tests.

## Repo conventions
- Prefer selectors such as `[data-test="username"]`, `[data-test="login-button"]`, `[data-test="shopping-cart-badge"]`.
- Use `page.locator()` and `Locator` abstraction, not raw `document.querySelector` logic.
- Keep locators in the relevant page object, not directly in the spec file.

## Workflow
1. Identify the broken element and the page object that owns it.
2. Inspect whether the selector depends on a dynamic label, stale CSS class, or unstable DOM structure.
3. Prefer semantic selectors (`getByRole`, `getByLabel`, `getByTestId`) or the project’s existing stable `data-test` attributes.
4. Fix the locator in the page class and keep the action method contract unchanged if possible.
5. Verify the page still loads and the action works with the real app state.

## Example
```ts
private readonly checkoutButton: Locator;

constructor(page: Page) {
  super(page, 'CartPage');
  this.checkoutButton = page.locator('[data-test="checkout"]');
}
```

## Guardrails
- Avoid brittle selectors such as `nth-child`, CSS class chains, or text matching on dynamic layout text.
- If the selector is not stable enough, first verify whether the page object should be split or refactored.
- Keep locator fixes minimal and targeted.
