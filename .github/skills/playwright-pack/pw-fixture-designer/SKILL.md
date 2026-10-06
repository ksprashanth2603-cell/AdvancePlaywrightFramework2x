---
name: pw-fixture-designer
description: >-
  Designs reusable Playwright fixtures for this project using src/fixtures/test-base.ts,
  app state setup, and page-object dependencies. Use when a test needs a logged-in
  state, a selected item in cart, or a reusable environment setup flow.
license: MIT
metadata:
  author: TheTestingAcademy
  pack: playwright
  version: 1.0.0
---

# PW Fixture Designer

This repo uses custom fixture-based setup to avoid repeating login and state creation in every spec. The pattern is implemented in `src/fixtures/test-base.ts`, using `base.extend` and page objects from `src/pages`.

## Repo pattern
- `loginPage` is the basic page object.
- `invalidLogin` tests the locked-out error case.
- `validLogin` handles successful authentication.
- `loginWithInventory` ensures inventory is loaded.
- `loginWithSelectedItem` adds an item to the cart.
- `checkoutReady` reaches the checkout step.

## Workflow
1. Define the scenario: invalid login, valid login, selected item, or checkout-ready state.
2. Start from a lower-level fixture and build on it. Do not duplicate the login flow in multiple fixtures.
3. Use the `base.extend` pattern and keep each fixture focused on a single responsibility.
4. Assert the state within the fixture before returning it.
5. Return only the values the test actually needs, not the entire app state.

## Example output
```ts
export type SelectedItemState = {
  inventoryPage: InventoryPage;
  itemId: string;
};

loginWithSelectedItem: async ({ loginWithInventory }, use) => {
  await loginWithInventory.addToCart('test-allthethings-tshirt-red');
  await loginWithInventory.expectInCart('test-allthethings-tshirt-red');

  await use({
    inventoryPage: loginWithInventory,
    itemId: 'test-allthethings-tshirt-red',
  });
},
```

## Guardrails
- Reuse existing fixtures instead of creating redundant ones.
- Keep the fixture chain hierarchical and simple.
- Avoid hidden side effects; every fixture should make the app state explicit.
- Do not place selectors or business logic into fixtures if a page object already owns them.
