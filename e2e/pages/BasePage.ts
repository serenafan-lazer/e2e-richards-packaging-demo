import { type Page, type Locator, expect } from '@playwright/test';
import { TEST_URL } from '../helpers/constant';

/**
 * Base Page class that all Page Objects should extend.
 * Provides common functionality like navigation, waiting, and URL construction.
 */
export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Constructs a full URL for the test store
   * @param path - The path to append to the base URL
   * @returns The complete URL string
   */
  protected getUrl(path: string): string {
    const url = new URL(path, TEST_URL);
    console.log(url.toString())
    return url.toString();
  }

  /**
   * Navigates to a specific path on the test store
   * @param path - The path to navigate to
   * @param options - Navigation options
   */
  async goto(path: string) {
    await this.page.goto(this.getUrl(path));
  }

  /**
   * Waits for a specific network request to complete
   * @param urlPattern - URL pattern to match
   * @param options - Request matching options
   */
  async waitForApiCall(
    urlPattern: string | RegExp,
    options: { method?: string; status?: number } = {}
  ) {
    const { method, status = 200 } = options;

    return await this.page.waitForResponse((response) => {
      const urlMatches =
        typeof urlPattern === 'string'
          ? response.url().includes(urlPattern)
          : urlPattern.test(response.url());

      const methodMatches = method ? response.request().method() === method : true;
      const statusMatches = response.status() === status;

      return urlMatches && methodMatches && statusMatches;
    });
  }

  /**
   * Gets the current viewport size
   */
  async getViewportSize() {
    return this.page.viewportSize();
  }

  /**
   * Checks if the current viewport is mobile-sized
   */
  async isMobileViewport(): Promise<boolean> {
    return await this.page.evaluate(() => window.innerWidth < 768);
  }

  /**
   * Closes the store locator popup if it's currently open
   * This popup can interfere with clicks on other elements
   */
  async closeStoreLocatorPopup(): Promise<void> {
    const storeLocatorPopuHeading = this.page.getByRole('heading', { name: "Select Your Richards Branch", level: 2 });
    await expect(storeLocatorPopuHeading).toBeVisible()
    await this.page.keyboard.press('Escape');

  }
}
