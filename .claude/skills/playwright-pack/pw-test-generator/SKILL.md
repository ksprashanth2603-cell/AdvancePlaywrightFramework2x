---
name: pw-test-generator
description: >-
  Creates a Playwright test for this repo using the framework conventions in
  src/tests, @fixtures/test-base, and the page objects under src/pages. Use when
  a tester says "write a login spec", "create e2e checkout test", or "generate
  a new Playwright test for this flow".
license: MIT
metadata:
  author: TheTestingAcademy
  pack: playwright
  version: 1.0.0
---

# PW Test Generator

Generate a Playwright test that matches this repo’s structure and style. This project uses custom fixtures, page objects, and visual step logging instead of inlined raw browser actions.

## Repo pattern
- Tests live in `src/tests`.
- Reusable browser state is defined in `src/fixtures/test-base.ts`.
- Page actions come from `src/pages`.
- Logging and step breakdown use `src/utils/visualStep.ts` and `src/utils/logger.ts`.
- If env values are required, use `src/config/env.ts` and `.env`.

## Workflow
1. Identify the scenario: login, checkout, invalid login, or inventory flow.
2. Decide whether the test should use a plain page object or a fixture state (`validLogin`, `loginWithInventory`, `loginWithSelectedItem`, `checkoutReady`).
3. Keep the test readable and business-focused. Prefer scenario names like `should complete checkout successfully`.
4. Use `test.step` or `visualStep()` around key actions so the flow is easy to debug.
5. Assert the real application state, not mock outcomes.
6. Avoid direct `page.locator(...)` logic in the test when a page object is already available.

## Example output
```ts
import { test, expect } from '@fixtures/test-base';
import { visualStep } from '@utils/visualStep';

test.describe('@P0 Checkout', () => {
  test('should complete checkout successfully', async ({ page, cartPage, checkoutStepOnePage, checkoutStepTwoPage, checkoutCompletePage, loginWithSelectedItem }) => {
    await visualStep(page, 'Open the cart', async () => {
      await cartPage.open();
      expect(await cartPage.rowCount()).toBe(1);
    });

    await visualStep(page, 'Fill guest details', async () => {
      await cartPage.checkout();
      await checkoutStepOnePage.assertLoaded();
      await checkoutStepOnePage.fillGuest({
        firstName: 'John',
        lastName: 'Doe',
        postalCode: '560001',
      });
      await checkoutStepOnePage.continue();
    });

    await visualStep(page, 'Finish the order', async () => {
      await checkoutStepTwoPage.assertLoaded();
      await checkoutStepTwoPage.finish();
    });

    await visualStep(page, 'Verify completion', async () => {
      await checkoutCompletePage.assertOrderComplete();
    });
  });
});
```

## Guardrails
- Match this repo’s naming style and folder placement.
- Prefer fixtures and page objects before creating ad-hoc selectors.
- Keep assertions focused on business outcomes and UI state.
- Use `.env` for credentials and configuration values, not hard-coded secrets.
