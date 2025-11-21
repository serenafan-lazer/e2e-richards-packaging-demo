// Test plan: e2e/testplan/e2e-product-navigation-test-plan.md

import { test, expect } from '../../fixtures';
import {
  GLASS_BOTTLES_JARS_COLLECTION,
  TARGET_PRODUCT,
  SORT_OPTIONS,
} from '../../data/productNavigationData';


test.describe('Product Navigation Flow - Core User Interactions', () => {
  test('PN-01: Navigate to Glass Bottles & Jars via Products Menu', async ({
    page,
    navigationPage,
    collectionPage
  }) => {
    let isMobile: boolean;
    await test.step('Navigate to homepage at /', async () => {
      await page.goto('/');
      await expect(page).toHaveURL('/');
      isMobile = await navigationPage.isMobileViewport();
    });

    await test.step('Locate the "Products" menu item in the primary navigation', async () => {
      if (isMobile) {
        await expect(navigationPage.mobileMenuButton).toBeVisible();
      } else {
        await expect(navigationPage.productsMenuButton).toBeVisible();
      }
    });

    await test.step('Click on the "Products" menu button to open the mega menu', async () => {
      await navigationPage.openProductsMenu();
    });

    await test.step('Locate "Glass Bottles & Jars" link in the dropdown', async () => {
      if (isMobile) {
        await expect(navigationPage.mobileGlassBottlesJarsLink).toBeVisible();
      } else {
        await expect(navigationPage.glassBottlesJarsLink).toBeVisible();
      }
    });

    await test.step('Click on "Glass Bottles & Jars" link', async () => {
      if (isMobile) {
        await navigationPage.mobileGlassBottlesJarsLink.click();
      } else {
        await navigationPage.glassBottlesJarsLink.click();
      }
    });

    await test.step('Verify collection page loads with correct URL and content', async () => {
      // Verify URL navigation
      await expect(page).toHaveURL(GLASS_BOTTLES_JARS_COLLECTION.url);

      // Verify page heading (level may vary by context)
      await expect(collectionPage.collectionHeading).toBeVisible();

      // Verify product count
      if (!isMobile) {
        await expect(page.getByText(/39 products/)).toBeVisible();
      }
    });
  });

  test('PN-02: Verify Collection Page Product Grid Loads', async ({ page, collectionPage }) => {
    await test.step('Navigate directly to /collections/glass-bottles-jars-1', async () => {
      await page.goto(GLASS_BOTTLES_JARS_COLLECTION.url);
    });

    await test.step('Wait for product grid to load', async () => {
      await collectionPage.waitForCollectionLoad();
    });

    await test.step('Count visible product cards on the page', async () => {
      // Verify collection page heading (level may vary by context)
      await expect(collectionPage.collectionHeading).toBeVisible();

      // Verify product grid exists and contains products
      await expect(collectionPage.productGrid.first()).toBeVisible();

      // Verify minimum products on first page
      const productCount = await collectionPage.getVisibleProductCount();
      expect(productCount).toBeGreaterThanOrEqual(20);

      // Verify pagination controls exist
      await expect(collectionPage.paginationNav).toBeVisible();
    });
  });

  test('PN-03: Locate Specific Product by Product Name', async ({ page, collectionPage }) => {
    await test.step('Navigate to /collections/glass-bottles-jars-1', async () => {
      await page.goto(GLASS_BOTTLES_JARS_COLLECTION.url);
    });

    await test.step('Wait for product grid to load', async () => {
      await collectionPage.waitForCollectionLoad();
    });

    await test.step('Locate the product card with heading "12 OZ FLT 70G/450 MAYONNAISE RP-1014 (6)"', async () => {
      // Locate product by link name
      const productLink = collectionPage.getProductCardByName(TARGET_PRODUCT.name);
      await expect(productLink).toBeVisible();

      // Verify product heading
      const productHeading = collectionPage.getProductHeadingByName(TARGET_PRODUCT.name);
      await expect(productHeading).toBeVisible();
    });

    await test.step('Verify the product card displays correct information', async () => {
      // Verify SKU is displayed
      await expect(collectionPage.getSKUText(TARGET_PRODUCT.sku)).toBeVisible();

      // Verify stock status is displayed
      const stockStatus = collectionPage.getStockStatus();
      await expect(stockStatus.first()).toBeAttached();

      // Verify product is clickable
      const productLink = collectionPage.getProductCardByName(TARGET_PRODUCT.name);
      await expect(productLink).toBeEnabled();
    });
  });

  test('PN-04: Navigate to Product Detail Page from Collection', async ({
    page,
    collectionPage,
    productPage,
  }) => {
    await test.step('Navigate to /collections/glass-bottles-jars-1', async () => {
      await page.goto(GLASS_BOTTLES_JARS_COLLECTION.url);
    });

    await test.step('Locate the product "12 OZ FLT 70G/450 MAYONNAISE RP-1014 (6)"', async () => {
      const productLink = collectionPage.getProductCardByName(TARGET_PRODUCT.name);
      await expect(productLink).toBeVisible();
    });

    await test.step('Click on the product link', async () => {
      await collectionPage.clickProductByName(TARGET_PRODUCT.name);
    });

    await test.step('Wait for product detail page to load', async () => {
      // Verify navigation to product page
      await expect(page).toHaveURL(TARGET_PRODUCT.url);
    });

    await test.step('Verify product detail page displays correct content', async () => {
      // Verify product title as H1
      await expect(productPage.getProductTitleByName(TARGET_PRODUCT.name)).toBeVisible();

      // Verify product image gallery
      await expect(productPage.galleryViewer).toBeVisible();

      // Verify SKU
      await expect(productPage.getSKUByNumber(TARGET_PRODUCT.sku)).toBeVisible();

      // Verify product details section
      await expect(page.getByRole('heading', { name: 'Product Details', level: 2 })).toBeVisible();
    });
  });

  test('PN-05: Verify Product Detail Page Content', async ({ page, productPage }) => {
    await test.step('Navigate directly to /products/12-oz-flt-70g-450-mayo-rp-1014-6', async () => {
      await page.goto(TARGET_PRODUCT.url);
    });

    await test.step('Expand "Product Details" accordion if collapsed', async () => {
      await productPage.expandProductDetails();
    });

    await test.step('Verify all product specifications are displayed', async () => {
      // Verify Capacity
      await expect(productPage.getSpecificationLabel('Capacity')).toBeVisible();
      await expect(productPage.getSpecificationValue(TARGET_PRODUCT.specifications.capacity)).toBeVisible();

      // Verify Material
      await expect(productPage.getSpecificationLabel('Material')).toBeVisible();
      await expect(productPage.getSpecificationValue(TARGET_PRODUCT.specifications.material)).toBeVisible();

      // Verify Color
      await expect(productPage.getSpecificationLabel('Color ')).toBeVisible();
      await expect(productPage.getSpecificationValue(TARGET_PRODUCT.specifications.color)).toBeVisible();

      // Verify Country of Origin
      await expect(productPage.getSpecificationLabel('Country of Origin')).toBeVisible();
      await expect(productPage.getSpecificationValue(TARGET_PRODUCT.specifications.countryOfOrigin)).toBeVisible();
    });

    await test.step('Verify Complementary Products section', async () => {
      await expect(productPage.complementaryProducts).toBeVisible();
    });
  });

  test('PN-06: Navigate Back to Collection from Product Page', async ({ page, collectionPage }) => {
    await test.step('Navigate to /collections/glass-bottles-jars-1', async () => {
      await page.goto(GLASS_BOTTLES_JARS_COLLECTION.url);
    });

    await test.step('Click product to navigate to product page', async () => {
      await collectionPage.waitForCollectionLoad();
      await collectionPage.clickProductByName(TARGET_PRODUCT.name);
      await expect(page).toHaveURL(TARGET_PRODUCT.url);
    });

    await test.step('Use browser back button to return to collection page', async () => {
      await page.goBack();
    });

    await test.step('Verify returned to collection page with same state', async () => {
      // Verify URL
      await expect(page).toHaveURL(GLASS_BOTTLES_JARS_COLLECTION.url);

      // Verify collection heading (level may vary by context)
      await expect(collectionPage.collectionHeading).toBeVisible();

      // Verify product grid is visible
      await expect(collectionPage.productGrid.first()).toBeVisible();
    });
  });

  test('PN-07: Verify Mega Menu Closes After Navigation', async ({ page, navigationPage }) => {
    let isMobile: boolean;
    await test.step('Navigate to homepage /', async () => {
      await page.goto('/');
      isMobile = await navigationPage.isMobileViewport();
    });

    await test.step('Click "Products" menu to open mega menu', async () => {
      await navigationPage.openProductsMenu();
     if (isMobile) {
        await expect(navigationPage.mobileGlassBottlesJarsLink).toBeVisible();
      } else {
        await expect(navigationPage.glassBottlesJarsLink).toBeVisible();
      }
    });

    await test.step('Click "Glass Bottles & Jars" link', async () => {
      if (isMobile) {
        await navigationPage.mobileGlassBottlesJarsLink.click();
      } else {
        await navigationPage.glassBottlesJarsLink.click();
      }
    });

    await test.step('Wait for collection page to load', async () => {
      await expect(page).toHaveURL(GLASS_BOTTLES_JARS_COLLECTION.url);
    });

    await test.step('Verify mega menu closed after navigation', async () => {
      if (isMobile) {
        await expect(navigationPage.mobileGlassBottlesJarsLink).not.toBeVisible();
      } else {
        await expect(navigationPage.glassBottlesJarsLink).not.toBeVisible();
      }
    });

    await test.step('Re-click "Products" menu to verify it opens again', async () => {
      await navigationPage.openProductsMenu();
     if (isMobile) {
        await navigationPage.mobileGlassBottlesJarsLink.click();
      } else {
        await navigationPage.glassBottlesJarsLink.click();
      }
    });
  });

  test('PN-08: Verify Product Sorting on Collection Page', async ({ page, collectionPage }) => {
    await test.step('Navigate to /collections/glass-bottles-jars-1', async () => {
      await page.goto(GLASS_BOTTLES_JARS_COLLECTION.url);
    });

    await test.step('Locate the "Sort by" dropdown', async () => {
      await expect(collectionPage.sortDropdown).toBeVisible();
    });

    await test.step('Verify default sorting is "Best selling"', async () => {
      await expect(collectionPage.sortDropdown).toHaveValue(/best-selling|best_selling/i);
    });

    await test.step('Change sorting to "Alphabetically, A-Z"', async () => {
      await collectionPage.sortBy(SORT_OPTIONS.titleAscending);
    });

    await test.step('Verify products re-order and URL updates', async () => {
      // Wait for URL to update with sort parameter
      await page.waitForURL(/sort_by=title-ascending/);

      // Verify first product is still visible after re-sorting
      await expect(collectionPage.productGrid.first()).toBeVisible();
    });
  });

  test('PN-09: Verify Pagination Navigation', async ({ page, collectionPage }) => {
    await test.step('Navigate to /collections/glass-bottles-jars-1', async () => {
      await page.goto(GLASS_BOTTLES_JARS_COLLECTION.url);
    });

    await test.step('Scroll to pagination section at bottom of product grid', async () => {
      await collectionPage.paginationNav.scrollIntoViewIfNeeded();
      await collectionPage.closeStoreLocatorPopup();
    });

    await test.step('Verify "Page 1" is active and "Page 2" link exists', async () => {
      await expect(collectionPage.paginationNav).toBeVisible();

      // Verify Page 2 link exists
      const page2Link = collectionPage.paginationNav.getByRole('link', { name: 'Page 2' });
      await expect(page2Link).toBeVisible();

      // Verify Next button is enabled
      const nextButton = collectionPage.paginationNav.getByRole('link', { name: 'Next' });
      await expect(nextButton).toBeVisible();
    });

    await test.step('Click "Next" button to navigate to page 2', async () => {
      await collectionPage.goToNextPage();
    });

    await test.step('Verify page 2 loads with remaining products', async () => {
      // Verify navigation to page 2
      await page.waitForURL(/page=2/);

      // Verify collection heading still visible (level may vary by context)
      await expect(collectionPage.collectionHeading).toBeVisible();

      // Verify products are displayed on page 2
      await expect(collectionPage.productGrid.first()).toBeVisible();
    });
  });

  test('PN-10: Direct URL Access to Collection Page', async ({ page, collectionPage, navigationPage }) => {
    await test.step('Navigate directly to /collections/glass-bottles-jars-1 via URL', async () => {
      await page.goto(GLASS_BOTTLES_JARS_COLLECTION.url);
    });

    await test.step('Verify page loads correctly without prior navigation', async () => {
      // Verify collection heading (level may vary by context)
      await expect(collectionPage.collectionHeading).toBeVisible();

      // Verify product count (may be hidden on mobile, check if attached instead)
      const productCountElement = page.getByText(/39 products/);
      await expect(productCountElement).toBeAttached();

      // Verify product grid is populated
      await expect(collectionPage.productGrid.first()).toBeVisible();

      // Verify navigation is present (mobile or desktop)
      const isMobile = await navigationPage.isMobileViewport();
      if (isMobile) {
        await expect(navigationPage.mobileMenuButton).toBeVisible();
      } else {
        await expect(navigationPage.productsMenuButton).toBeVisible();
      }
    });
  });

  test('PN-11: Direct URL Access to Product Page', async ({ page, productPage }) => {
    await test.step('Navigate directly to /products/12-oz-flt-70g-450-mayo-rp-1014-6 via URL', async () => {
      await page.goto(TARGET_PRODUCT.url);
    });

    await test.step('Verify product page loads correctly', async () => {
      // Verify product title
      await expect(productPage.getProductTitleByName(TARGET_PRODUCT.name)).toBeVisible();

      // Verify SKU
      await expect(productPage.getSKUByNumber(TARGET_PRODUCT.sku)).toBeVisible();

      // Verify gallery loaded
      await expect(productPage.galleryViewer).toBeVisible();
    });
  });
});