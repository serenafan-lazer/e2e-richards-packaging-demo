import { test as base } from '@playwright/test';
import { PasswordPage } from './pages/PasswordPage';

/**
 * Custom fixtures for Playwright tests
 * Provides pre-initialized Page Objects to avoid repetitive instantiation in tests
 *
 * Usage in tests:
 * ```typescript
 * import { test, expect } from './fixtures';
 *
 * test('my test', async ({ passwordPage, searchModalPage }) => {
 *   await passwordPage.navigateWithPasswordCheck('/');
 *   // No need for: new PasswordPage(page) or new SearchModalPage(page)
 * });
 * ```
 */

type PageFixtures = {
  passwordPage: PasswordPage;
};

export const test = base.extend<PageFixtures>({
  /**
   * Password page fixture
   * Handles password-protected store access
   */
  passwordPage: async ({ page }, use) => {
    const passwordPage = new PasswordPage(page);
    await use(passwordPage);
  },
});

// Re-export expect for convenience
export { expect } from '@playwright/test';
