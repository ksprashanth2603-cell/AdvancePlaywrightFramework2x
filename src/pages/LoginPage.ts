import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * TTACart login screen.
 *
 *   const login = new LoginPage(page);
 *   await login.open();
 *   await login.loginAs('standard_user', 'tta_secret');
 */



export class LoginPage extends BasePage {

    static readonly PATH = '/playwright/ttacart/index.html';

    private readonly usernameInput: Locator;
    private readonly passwordInput: Locator;
    private readonly loginButton: Locator;
    private readonly errorBox: Locator;
    private readonly loginCredentialsHint: Locator;

    constructor(page: Page) {
        super(page, 'LoginPage');
        this.usernameInput = page.locator('[data-test="username"]');
        this.passwordInput = page.locator('[data-test="password"]');
        this.loginButton = page.locator('[data-test="login-button"]');
        this.errorBox = page.locator('[data-test="error"]');
        this.loginCredentialsHint = page.locator('[data-test="login-credentials"]');
    }

    async open(): Promise<void> {
        this.log.info("Open login pgae");
        await this.goto(LoginPage.PATH);
    }

    async loginAs(username: string, password: string): Promise<void> {
        this.log.info(`loginAs ${username}`);
        await this.el.fill(this.usernameInput, username);
        await this.el.fill(this.passwordInput, password);
        await this.el.click(this.loginButton);

        await Promise.race([
            this.page.waitForURL(/\/inventory(?:\.html)?(?:\?|$)/, { timeout: 15000 }),
            this.errorBox.waitFor({ state: 'visible', timeout: 15000 }),
        ]).catch(() => {
            // The app may take a moment to resolve, but the test should continue as long as
            // the link landed on inventory or the error box became visible.
        });

        await expect.poll(async () => {
            const urlOk = this.page.url().includes('/inventory');
            const errorOk = await this.errorBox.isVisible().catch(() => false);
            return urlOk || errorOk;
        }, { timeout: 15000 }).toBe(true);
    }

    async expectError(expectedMessage: string): Promise<void> {
        await expect(this.errorBox).toBeVisible();
        await expect(this.errorBox).toHaveText(expectedMessage);
    }

    async waitForLoginButtonHidden(): Promise<void> {
        await this.el.waitForHidden(this.loginButton);
    }

}