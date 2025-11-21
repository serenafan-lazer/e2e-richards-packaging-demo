import { test as base } from '@playwright/test';
import { PasswordPage } from './pages/PasswordPage';
import { NavigationPage } from './pages/NavigationPage';
import { CollectionPage } from './pages/CollectionPage';
import { ProductPage } from './pages/ProductPage';

/**
 * Custom fixtures for Playwright tests
 * Provides pre-initialized Page Objects to avoid repetitive instantiation in tests
 *
 * Usage in tests:
 * ```typescript
 * import { test, expect } from './fixtures';
 *
 * test('my test', async ({ passwordPage, navigationPage, collectionPage, productPage }) => {
 *   await passwordPage.navigateWithPasswordCheck('/');
 *   await navigationPage.openProductsMenu();
 *   // No need for: new NavigationPage(page) or new CollectionPage(page)
 * });
 * ```
 */

type PageFixtures = {
  passwordPage: PasswordPage;
  navigationPage: NavigationPage;
  collectionPage: CollectionPage;
  productPage: ProductPage;
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

  /**
   * Navigation page fixture
   * Handles main navigation and mega menu interactions
   */
  navigationPage: async ({ page }, use) => {
    const navigationPage = new NavigationPage(page);
    await use(navigationPage);
  },

  /**
   * Collection page fixture
   * Handles product collection listing page interactions
   */
  collectionPage: async ({ page }, use) => {
    const collectionPage = new CollectionPage(page);
    await use(collectionPage);
  },

  /**
   * Product page fixture
   * Handles product detail page interactions
   */
  productPage: async ({ page }, use) => {
    const productPage = new ProductPage(page);
    await use(productPage);
  },
});

// Re-export expect for convenience
export { expect } from '@playwright/test';
