import type { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * ProductPage - Handles product detail page interactions
 *
 * This page object encapsulates interactions with product detail pages,
 * including product information, specifications, gallery, and related products.
 */
export class ProductPage extends BasePage {
  readonly productTitle: Locator;
  readonly galleryViewer: Locator;
  readonly productDetailsButton: Locator;
  readonly complementaryProducts: Locator;

  constructor(page: Page) {
    super(page);
    this.productTitle = page.getByRole('heading', { level: 1 });
    this.galleryViewer = page.getByRole('region', { name: 'Gallery Viewer' });
    this.productDetailsButton = page.getByRole('button', { name: 'Product Details' });
    this.complementaryProducts = page.getByRole('heading', { name: 'Complementary Products', level: 2 });
  }

  /**
   * Gets the product title by exact name
   * @param productName - The exact product name
   * @returns Locator for the product H1 heading
   */
  getProductTitleByName(productName: string): Locator {
    return this.page.getByRole('heading', { name: productName, level: 1 });
  }

  /**
   * Gets the SKU text by specific SKU number
   * @param sku - The SKU number to locate
   * @returns Locator for the SKU text
   */
  getSKUByNumber(sku: string): Locator {
    return this.page.getByText(`SKU: ${sku}`);
  }

  /**
   * Expands the Product Details accordion section if collapsed
   * Waits for the content to be visible after expanding
   */
  async expandProductDetails(): Promise<void> {
    // Check if the accordion/details element is present
    const detailsElement = this.page.locator('details:has-text("Product Details")').first();

    // If details element exists and is not open, click to expand it
    if (await detailsElement.count() > 0) {
      const isOpen = await detailsElement.getAttribute('aria-expanded');
      if (!isOpen) {
        // Click the summary/button within the details element
        const summaryButton = detailsElement.locator('summary, button');
        if (await summaryButton.count() > 0) {
          await summaryButton.first().click();
        } else {
          // Click the details element itself as fallback
          await detailsElement.click();
        }
        // Wait for content to be visible after expansion
        await this.page.locator('details[open]:has-text("Product Details")').waitFor({ state: 'visible', timeout: 3000 }).catch(() => {});
      }
    }
  }

  /**
   * Gets a specification locator by name
   * @param specName - The specification label (e.g., 'Capacity:', 'Material:')
   * @returns Locator for the specification text
   */
  getSpecificationLabel(specName: string): Locator {
    return this.page.getByText(`${specName}:`);
  }

  /**
   * Gets a specification value locator by the value text
   * @param value - The specification value text
   * @returns Locator for the value text within the product details section
   */
  getSpecificationValue(value: string): Locator {
    // Target specification values within details/summary accordion context
    return this.page.locator('#Details---attributes').getByText(value).first();
  }
}
