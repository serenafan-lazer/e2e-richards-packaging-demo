import type { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * CollectionPage - Handles collection listing page interactions
 *
 * This page object encapsulates interactions with product collection pages,
 * including product grid, sorting, pagination, and product search.
 */
export class CollectionPage extends BasePage {
  readonly collectionHeading: Locator;
  readonly productCount: Locator;
  readonly productGrid: Locator;
  readonly sortDropdown: Locator;
  readonly paginationNav: Locator;

  constructor(page: Page) {
    super(page);
    // Collection heading can be level 2 or 3 depending on context - don't specify level
    this.collectionHeading = page.getByRole('heading', { name: 'Glass Bottles & Jars', level: 2});
    this.productCount = page.getByText(/\d+ products/);
    // Target product cards using the product-card class or link with product URLs
    this.productGrid = page.locator('.product-card, li:has(a[href*="/products/"])').filter({ has: page.locator('a[href*="/products/"]') });
    this.sortDropdown = page.getByRole('combobox', { name: /Sort by/i });
    this.paginationNav = page.getByRole('navigation', { name: 'Pagination' });
  }

  /**
   * Gets a product card locator by product name
   * @param productName - The exact product name to locate
   * @returns Locator for the product link (first match if multiple exist)
   */
  getProductCardByName(productName: string): Locator {
    return this.page.getByRole('link', { name: productName }).first();
  }

  /**
   * Gets a product heading locator by product name
   * @param productName - The exact product name to locate
   * @param level - Heading level (default: 3)
   * @returns Locator for the product heading
   */
  getProductHeadingByName(productName: string, level: number = 3): Locator {
    return this.page.getByRole('heading', { name: productName, level });
  }

  /**
   * Clicks on a product card to navigate to the product detail page
   * @param productName - The exact product name to click
   */
  async clickProductByName(productName: string): Promise<void> {
    const productLink = this.getProductCardByName(productName);
    await productLink.scrollIntoViewIfNeeded();
    await this.closeStoreLocatorPopup();
    await productLink.click();
  }

  /**
   * Gets the SKU text locator for a specific SKU
   * @param sku - The SKU number to locate
   * @returns Locator for the SKU text
   */
  getSKUText(sku: string): Locator {
    return this.page.getByText(`SKU:${sku}`);
  }

  /**
   * Gets the stock status locator (In stock or Out of stock)
   * @returns Locator for stock status text
   */
  getStockStatus(): Locator {
    return this.page.locator('text=/In stock|Out of stock/');
  }

  /**
   * Sorts the collection by a specific option
   * @param sortOption - The sort option value (e.g., 'title-ascending', 'best-selling')
   */
  async sortBy(sortOption: string): Promise<void> {
    await this.sortDropdown.selectOption(sortOption);
    // Auto-wait for URL to update with sort parameter
    await this.page.waitForURL(/sort_by=/);
  }

  /**
   * Clicks the "Next" button in pagination
   * Closes any interfering popups before clicking
   */
  async goToNextPage(): Promise<void> {
    const nextButton = this.paginationNav.getByRole('link', { name: 'Next' });
    await nextButton.click();
  }

  /**
   * Gets the total count of product cards visible on the page
   * @returns Promise resolving to the number of products visible
   */
  async getVisibleProductCount(): Promise<number> {
    return await this.productGrid.count();
  }

  /**
   * Waits for the collection page to fully load
   * Waits for product grid to be populated
   */
  async waitForCollectionLoad(): Promise<void> {
    await this.productGrid.first().waitFor({ state: 'visible' });
  }
}
