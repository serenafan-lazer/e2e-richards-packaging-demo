import type { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * NavigationPage - Handles main navigation and mega menu interactions
 *
 * This page object encapsulates interactions with the primary navigation menu,
 * including the mega menu dropdown for product categories.
 */
export class NavigationPage extends BasePage {
  readonly productsMenuButton: Locator;
  readonly mobileMenuButton: Locator;
  readonly glassBottlesJarsLink: Locator;
  readonly mobileGlassBottlesJarsLink: Locator;
  readonly mobileProductsItem: Locator;

  constructor(page: Page) {
    super(page);
    // Desktop: Target the Products menu item within the Primary navigation
    this.productsMenuButton = page.locator('#Mega-menu-item-card_list_fmikiL')
    // Mobile: Target the hamburger menu button
    this.mobileMenuButton = page.getByRole('button', { name: 'Menu' });
    // Target Glass Bottles & Jars link specifically within Primary navigation to avoid duplicates
    this.glassBottlesJarsLink = page.getByLabel('Primary').getByRole('link', { name: 'Glass Bottles & Jars' });
    this.mobileGlassBottlesJarsLink = page.getByRole('link', { name: 'Glass Bottles & Jars' }).first()
    this.mobileProductsItem = page.locator('#MenuDrawer').getByText('Products', { exact: true }).first()
  }

  /**
   * Opens the Products mega menu dropdown
   * Handles both desktop (mega menu) and mobile (hamburger menu) navigation
   * Waits for the mega menu to be visible after clicking
   */
  async openProductsMenu(): Promise<void> {
    const isMobile = await this.isMobileViewport();

    if (isMobile) {
      // Mobile: Open hamburger menu first
      await this.mobileMenuButton.click({ timeout: 10000 });
      // Find the Products menu item
      await this.mobileProductsItem.click({ timeout: 10000 });
      await this.mobileGlassBottlesJarsLink.waitFor({ state: 'visible' });
    } else {
      // Desktop: Click mega menu button
      await this.productsMenuButton.click({ timeout: 10000 });
      // Auto-wait for mega menu to appear by checking for a known link
      await this.glassBottlesJarsLink.waitFor({ state: 'visible' });
    }
  }

  /**
   * Navigates to the Glass Bottles & Jars collection page via mega menu
   * Opens the Products menu and clicks the Glass Bottles & Jars link
   */
  async navigateToGlassBottlesJars(): Promise<void> {
    await this.openProductsMenu();
    await this.glassBottlesJarsLink.click();
  }
}
