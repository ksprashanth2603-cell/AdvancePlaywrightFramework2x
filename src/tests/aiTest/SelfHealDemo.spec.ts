import { expect, test, type Locator, type Page } from '@playwright/test';
import { credentials } from '@config/credentials';
import { LoginPage } from '@pages/LoginPage';
import { selfHealUsernameSelectors } from './demoState';

async function findVisibleLocator(page: Page, selectors: readonly string[]): Promise<{ locator: Locator; selector: string; attemptedSelectors: string[] }> {
    const attemptedSelectors: string[] = [];
    for (const selector of selectors) {
        attemptedSelectors.push(selector);
        const locator = page.locator(selector).first();
        if (await locator.isVisible().catch(() => false)) {
            return { locator, selector, attemptedSelectors };
        }
    }

    throw new Error(`No visible locator matched: ${selectors.join(', ')}`);
}

test('recovers from a stale username selector and logs in', async ({ page }, testInfo) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();

    const recovery = await findVisibleLocator(page, selfHealUsernameSelectors);
    const usernameInput = recovery.locator;
    await usernameInput.fill(credentials.standardUser);
    await expect(usernameInput).toHaveValue(credentials.standardUser);
    await page.locator('[data-test="password"]').fill(credentials.password);
    await page.locator('[data-test="login-button"]').click();

    await expect(page).toHaveURL(/\/inventory(?:\.html)?(?:\?|$)/);
    await testInfo.attach('self-heal-analysis', {
        body: JSON.stringify({
            strategy: 'ordered-selector-fallback',
            attemptedSelectors: recovery.attemptedSelectors,
            resolvedSelector: recovery.selector,
            outcome: 'login-succeeded',
        }, null, 2),
        contentType: 'application/json',
    });
});