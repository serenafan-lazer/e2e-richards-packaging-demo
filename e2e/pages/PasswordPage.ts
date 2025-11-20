import type { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { STORE_PASSWORD, TEST_THEME_ID } from '../helpers/constant';

/**
 * Page Object for Shopify store password page
 * Handles password-protected store access
 */
export class PasswordPage extends BasePage {
  readonly enterUsingPassword: Locator
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly form: Locator;

  constructor(page: Page) {
    super(page);
    // Use accessible selectors
    this.enterUsingPassword = page.locator('#Details-main-password-header');
    this.passwordInput = page.locator('#Password');
    this.form = page.locator('form[action="/password"]');
    this.submitButton = this.form.getByRole('button', { name: /enter|submit/i });
  }

  /**
   * Checks if we're currently on the password page
   */
  async isPasswordPage(): Promise<boolean> {
    return await this.passwordInput.isVisible().catch(() => false);
  }

  /**
   * Enters the store password and submits the form
   * @param password - The password to enter (defaults to STORE_PASSWORD from config)
   */
  async enterPassword(
    password: string = STORE_PASSWORD
  ): Promise<void> {
    await this.enterUsingPassword.click();
    const isPasswordPage = await this.isPasswordPage();
    if (isPasswordPage) {
      await this.passwordInput.fill(password);
      console.log('[PasswordPage] Password filled');
      await this.submitButton.click();
      await this.passwordInput.waitFor({ state: 'hidden' }).catch(() => {
      });
    }
  }

  /**
   * Navigates to a path and automatically handles password if needed
   * @param path - The path to navigate to
   */
  async navigateWithPasswordCheck(
    path: string
  ): Promise<void> {
    const passwordProtectedUrl = path + `?preview_theme_id=${TEST_THEME_ID}`
    await this.goto(passwordProtectedUrl);
    await this.enterPassword(STORE_PASSWORD);
  }
}
