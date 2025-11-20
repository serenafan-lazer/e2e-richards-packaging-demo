# Playwright E2E Testing Patterns

This document outlines the patterns and best practices for writing end-to-end tests with Playwright in this Shopify theme project.

## Testing Focus

**Our E2E tests focus exclusively on:**
- ✅ Core positive user flows (happy paths)
- ✅ Negative test scenarios (error handling, validation failures)
- ✅ Data flow and state management
- ✅ Functional user interactions

**We do NOT test:**
- ❌ Responsive behavior or viewport-specific functionality
- ❌ Accessibility compliance (ARIA, WCAG)
- ❌ Loading states and debounce behavior
- ❌ Edge cases and boundary conditions

This focused approach ensures maintainable, reliable tests that validate core business functionality.

## Test Framework

**Playwright** - Modern E2E testing framework
- Cross-browser testing (Chromium, Firefox, WebKit)
- Mobile device emulation
- Auto-waiting for elements
- Network interception
- Screenshot and video recording
- Trace viewer for debugging

## Project Structure

```
e2e/
├── global-setup.ts           # Authentication and global setup
├── playwright.config.ts      # Playwright configuration
├── pages/                    # Page Object Model classes
│   ├── HomePage.ts
│   ├── ProductPage.ts
│   └── CheckoutPage.ts
├── helpers/                  # Reusable test utilities
│   ├── auth.ts
│   └── navigation.ts
├── fixtures/                 # Test data and fixtures
│   └── productData.ts
├── components/               # Component-specific tests
│   ├── country-switcher.spec.ts
│   └── product-gallery.spec.ts
└── pages/                    # Page-level tests
    └── checkout.spec.ts
```

## Test File Naming

- Component tests: `<component-name>.spec.ts`
- Page tests: `<page-name>.spec.ts`
- Visual tests: `<feature-name>.visual.spec.ts`

**Important:** Use `.spec.ts` for E2E tests (NOT `.test.ts` which is reserved for unit tests)

## Page Object Model (POM)

### POM Structure

The Page Object Model encapsulates page elements and interactions:

```typescript
// e2e/pages/ProductPage.ts
import { Page, Locator } from '@playwright/test';

export class ProductPage {
  readonly page: Page;
  readonly addToCartButton: Locator;
  readonly productTitle: Locator;
  readonly priceElement: Locator;
  readonly quantityInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.addToCartButton = page.getByRole('button', { name: 'Add to cart' });
    this.productTitle = page.getByRole('heading', { level: 1 });
    this.priceElement = page.getByTestId('product-price');
    this.quantityInput = page.getByLabel('Quantity');
  }

  async goto(productHandle: string) {
    await this.page.goto(`/products/${productHandle}`);
    await this.page.waitForLoadState('load');
  }

  async addToCart(quantity: number = 1) {
    if (quantity > 1) {
      await this.quantityInput.fill(quantity.toString());
    }
    await this.addToCartButton.click();

    // Wait for cart drawer to appear
    await this.page.getByRole('dialog', { name: 'Cart' }).waitFor();
  }

  async getPrice(): Promise<string> {
    return await this.priceElement.textContent() || '';
  }

  async selectVariant(optionName: string, value: string) {
    await this.page
      .getByRole('group', { name: optionName })
      .getByRole('radio', { name: value })
      .click();
  }
}
```

### POM Best Practices

1. **Locators as Properties** - Define locators as readonly class properties
2. **Action Methods** - Encapsulate user actions (click, fill, select)
3. **Getter Methods** - Provide methods to retrieve page data
4. **Wait Strategies** - Include appropriate waits in action methods
5. **Type Safety** - Use TypeScript types for method parameters and returns
6. **JSDoc Comments** - Document complex methods

```typescript
/**
 * Selects a product variant by option name and value
 * @param optionName - The variant option name (e.g., "Size", "Color")
 * @param value - The option value to select (e.g., "Large", "Red")
 */
async selectVariant(optionName: string, value: string): Promise<void> {
  await this.page
    .getByRole('group', { name: optionName })
    .getByRole('radio', { name: value })
    .click();
}
```

## Test Patterns by Type

### 1. Component Interaction Tests

**Characteristics:**
- Test single component behavior
- Focus on user interactions
- Verify state changes
- Test core functionality

**Template:**
```typescript
import { test, expect } from '@playwright/test';

test.describe('Country Switcher', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should open dropdown on button click', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Country selector' });
    const dropdown = page.getByRole('menu', { name: 'Countries' });

    // Initially hidden
    await expect(dropdown).toBeHidden();

    // Click to open
    await trigger.click();
    await expect(dropdown).toBeVisible();

    // Check ARIA attributes
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  test('should select country and update currency', async ({ page }) => {
    await page.getByRole('button', { name: 'Country selector' }).click();

    await page
      .getByRole('menuitem', { name: 'United Kingdom' })
      .click();

    // Wait for page reload and currency update
    await page.waitForLoadState('load');

    // Verify currency updated
    const priceElement = page.getByTestId('product-price');
    await expect(priceElement).toContainText('£');
  });

  test('should close on Escape key', async ({ page }) => {
    const dropdown = page.getByRole('menu', { name: 'Countries' });

    await page.getByRole('button', { name: 'Country selector' }).click();
    await expect(dropdown).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(dropdown).toBeHidden();
  });
});
```

**Focus:**
- Semantic selectors (getByRole, getByLabel, getByText)
- User interactions (click, keyboard, form input)
- State verification (visibility, attributes, content)
- Proper waits (auto-waiting is preferred)

### 2. User Flow Tests

**Characteristics:**
- Multi-step user journeys
- Crosses multiple pages
- Uses Page Objects
- Tests critical paths

**Template:**
```typescript
import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { ProductPage } from '../pages/ProductPage';
import { CartPage } from '../pages/CartPage';

test.describe('Add to Cart Flow', () => {
  let homePage: HomePage;
  let productPage: ProductPage;
  let cartPage: CartPage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    productPage = new ProductPage(page);
    cartPage = new CartPage(page);

    await homePage.goto();
  });

  test('should add product to cart and proceed to checkout', async ({ page }) => {
    await test.step('Navigate to product page', async () => {
      await homePage.clickFeaturedProduct(0);
      await expect(page).toHaveURL(/\/products\/.+/);
    });

    await test.step('Select variant and add to cart', async () => {
      await productPage.selectVariant('Size', 'Large');
      await productPage.addToCart(2);

      await expect(page.getByText('Added to cart')).toBeVisible();
    });

    await test.step('View cart and verify items', async () => {
      await cartPage.goto();

      const itemCount = await cartPage.getItemCount();
      expect(itemCount).toBe(2);

      const total = await cartPage.getTotal();
      expect(parseFloat(total)).toBeGreaterThan(0);
    });

    await test.step('Proceed to checkout', async () => {
      await cartPage.proceedToCheckout();
      await expect(page).toHaveURL(/\/checkouts\/.+/);
    });
  });
});
```

**Focus:**
- Use test.step() for complex flows
- Page Objects for maintainability
- Clear step descriptions
- Assertions at each critical point

### 3. Island Component Tests

**Characteristics:**
- Tests conditionally loaded components
- Waits for hydration
- Tests loading strategies

**Template:**
```typescript
import { test, expect } from '@playwright/test';

test.describe('Navigation Component (Island)', () => {
  test('should lazy load and be interactive', async ({ page }) => {
    await page.goto('/');

    // Wait for custom element to be defined
    await page.waitForFunction(() => {
      return window.customElements.get('navigation-menu') !== undefined;
    });

    const navMenu = page.locator('navigation-menu');
    await expect(navMenu).toBeAttached();
  });

  test('should open menu on button click', async ({ page }) => {
    await page.goto('/');

    const menuButton = page.getByRole('button', { name: 'Menu' });
    const drawer = page.getByRole('dialog', { name: 'Menu' });

    await menuButton.click();

    await expect(drawer).toBeVisible();
    await expect(drawer).toHaveClass(/open/);
  });

  test('should close menu on close button', async ({ page }) => {
    await page.goto('/');

    const menuButton = page.getByRole('button', { name: 'Menu' });
    await menuButton.click();

    const closeButton = page.getByRole('button', { name: 'Close menu' });
    await closeButton.click();

    const drawer = page.getByRole('dialog', { name: 'Menu' });
    await expect(drawer).toBeHidden();
  });
});
```

**Focus:**
- Wait for custom element registration
- Test core interactive functionality
- Verify state changes

## Selector Strategies

### Priority Order

1. **Role-based (Preferred)** - Most accessible and stable
```typescript
page.getByRole('button', { name: 'Add to cart' })
page.getByRole('heading', { level: 1 })
page.getByRole('navigation', { name: 'Main' })
```

2. **Label-based** - Good for form elements
```typescript
page.getByLabel('Email address')
page.getByLabel('Quantity')
```

3. **Text-based** - For unique text content
```typescript
page.getByText('Free shipping on orders over $50')
page.getByText('Out of stock')
```

4. **Test ID** - For elements without good semantic selectors
```typescript
page.getByTestId('product-price')
page.getByTestId('cart-count')
```

5. **CSS Selectors (Last Resort)** - Brittle, avoid when possible
```typescript
page.locator('.product-card__title')
page.locator('[data-product-id="123"]')
```

### Selector Best Practices

```typescript
// ✅ GOOD - Accessible, semantic
await page.getByRole('button', { name: 'Add to cart' }).click();

// ✅ GOOD - Uses label relationship
await page.getByLabel('Email').fill('test@example.com');

// ⚠️ OK - Text is unique and stable
await page.getByText('View cart').click();

// ⚠️ OK - When no semantic alternative exists
await page.getByTestId('featured-collection').click();

// ❌ BAD - Brittle class names
await page.locator('.btn-primary-lg-variant-2').click();

// ❌ BAD - Implementation detail
await page.locator('button:nth-child(3)').click();
```

## Waiting Strategies

**Core Principle:** Let Playwright do the waiting for you! Most explicit waits are unnecessary and make tests brittle.

### Priority Order

#### 1. Rely on Auto-Waiting for Actions (Best - Preferred)

Playwright automatically waits for elements to be actionable:

```typescript
// ✅ GOOD - Playwright auto-waits for:
// - Element to be attached to DOM
// - Element to be visible
// - Element to be stable (not animating)
// - Element to receive events (not obscured)
// - Element to be enabled

await page.getByRole('button', { name: 'Submit' }).click();
await page.getByLabel('Email').fill('test@example.com');
await page.getByRole('checkbox', { name: 'Accept terms' }).check();
// No explicit waits needed!
```

#### 2. Use Web-First Assertions (Best - Preferred)

Assertions have built-in auto-waiting and retry logic:

```typescript
// ✅ GOOD - Waits until condition is met (default 5s timeout)
await expect(page.getByText('Success')).toBeVisible();
await expect(page).toHaveURL(/\/cart/);
await expect(page.getByRole('dialog')).toHaveAttribute('aria-hidden', 'false');
await expect(page.getByTestId('cart-count')).toHaveText('3');
await expect(page.getByRole('button', { name: 'Submit' })).toBeEnabled();
```

#### 3. Wait for Specific Elements (Good - When Needed)

Use locator.waitFor() to wait for element states:

```typescript
// ✅ GOOD - Wait for specific element state changes
await page.getByRole('dialog', { name: 'Cart' }).waitFor({ state: 'visible' });
await page.getByText('Loading...').waitFor({ state: 'hidden' });
await page.getByRole('button', { name: 'Submit' }).waitFor({ state: 'enabled' });

// Wait for custom element to be registered (Island Architecture)
await page.waitForFunction(() => {
  return window.customElements.get('product-gallery') !== undefined;
});
```

#### 4. Wait for Specific Network Events (Good - When Needed)

Wait for specific API responses instead of arbitrary timeouts:

```typescript
// ✅ GOOD - Wait for specific API call
const responsePromise = page.waitForResponse(
  response => response.url().includes('/cart/add') && response.ok()
);

await page.getByRole('button', { name: 'Add to cart' }).click();
const response = await responsePromise;

// Verify the response
const data = await response.json();
expect(data.success).toBe(true);
```

### What NOT to Use

```typescript
// ❌ BAD - Arbitrary timeout (flaky, slow)
await page.waitForTimeout(2000);

// ❌ BAD - networkidle is discouraged and unreliable
await page.waitForLoadState('networkidle');

// ❌ BAD - Usually unnecessary, use web-first assertions instead
await page.waitForLoadState('load');
await page.click('button');

// ✅ GOOD - Just click, auto-waits for page to load
await page.goto('/products/test');
await page.getByRole('button', { name: 'Add to cart' }).click();
```

### Practical Examples - Good vs Bad

```typescript
// ❌ BAD - Checking visibility with timeout
await page.waitForTimeout(1000);
const isVisible = await page.getByText('Success').isVisible();
expect(isVisible).toBe(true);

// ✅ GOOD - Web-first assertion with auto-retry
await expect(page.getByText('Success')).toBeVisible();

// ❌ BAD - Waiting for load state before interaction
await page.getByRole('button', { name: 'Load more' }).click();
await page.waitForLoadState('load');
const count = await page.getByRole('article').count();

// ✅ GOOD - Wait for specific network response
await page.getByRole('button', { name: 'Load more' }).click();
await page.waitForResponse(r => r.url().includes('/products') && r.ok());
await expect(page.getByRole('article')).toHaveCount(10);
```

### Island Hydration Waits

```typescript
// For client:idle components
test('idle-loaded component', async ({ page }) => {
  await page.goto('/');

  // ✅ Wait for idle loading
  await page.waitForLoadState('domcontentloaded');

  // ✅ Web-first assertion
  await expect(page.locator('analytics-tracker')).toBeAttached();
});

// For client:visible components
test('visible-loaded component', async ({ page }) => {
  await page.goto('/');

  const gallery = page.locator('product-gallery');

  // ✅ Scroll into view
  await gallery.scrollIntoViewIfNeeded();

  // ✅ Wait for custom element registration
  await page.waitForFunction(() => {
    return window.customElements.get('product-gallery') !== undefined;
  });

  // ✅ Web-first assertion
  await expect(gallery).toBeAttached();
});
```

## Network Interception

### Mock API Responses

```typescript
test('should handle cart add failure', async ({ page }) => {
  // Intercept and mock failure
  await page.route('**/cart/add.js', route => {
    route.fulfill({
      status: 422,
      contentType: 'application/json',
      body: JSON.stringify({
        status: 422,
        message: 'Product is out of stock',
      }),
    });
  });

  await page.goto('/products/test-product');
  await page.getByRole('button', { name: 'Add to cart' }).click();

  await expect(page.getByText('Product is out of stock')).toBeVisible();
});
```

### Wait for Requests

```typescript
test('should fetch product recommendations', async ({ page }) => {
  const recommendationsPromise = page.waitForResponse(
    resp => resp.url().includes('/recommendations/products') && resp.ok()
  );

  await page.goto('/products/test-product');

  const response = await recommendationsPromise;
  const data = await response.json();

  expect(data.products.length).toBeGreaterThan(0);
});
```

## Common Patterns

### Authentication Setup

Tests use global setup for authentication:

```typescript
// e2e/global-setup.ts (already configured)
import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Perform authentication
  await page.goto(process.env.TEST_URL || '');
  // ... login steps ...

  // Save authentication state
  await page.context().storageState({ path: 'storageState.json' });
  await browser.close();
}

export default globalSetup;
```

### Custom Fixtures

```typescript
// e2e/fixtures/customFixtures.ts
import { test as base } from '@playwright/test';
import { ProductPage } from '../pages/ProductPage';

type MyFixtures = {
  productPage: ProductPage;
};

export const test = base.extend<MyFixtures>({
  productPage: async ({ page }, use) => {
    const productPage = new ProductPage(page);
    await use(productPage);
  },
});

export { expect } from '@playwright/test';

// Use in tests
import { test, expect } from '../fixtures/customFixtures';

test('should work', async ({ productPage }) => {
  await productPage.goto('test-product');
  // ...
});
```

### Component State Testing

```typescript
import { test, expect } from '@playwright/test';

test('component state changes', async ({ page }) => {
  await page.goto('/');

  // Test initial state
  const component = page.getByTestId('interactive-component');
  await expect(component).toHaveAttribute('data-state', 'closed');

  // Trigger state change
  await page.getByRole('button', { name: 'Open' }).click();

  // Verify new state
  await expect(component).toHaveAttribute('data-state', 'open');
  await expect(component).toBeVisible();
});
```

### Debugging

```typescript
// Add pause for debugging
await page.pause();

// Take screenshot
await page.screenshot({ path: 'debug.png', fullPage: true });

// Print HTML
console.log(await page.content());

// Print element text
const text = await page.getByRole('heading').textContent();
console.log('Heading:', text);

// Verbose logging
await page.evaluate(() => console.log('Page state:', document.readyState));
```

## Anti-Patterns to Avoid

### ❌ Arbitrary Timeouts

```typescript
// BAD - Brittle, slows tests
await page.waitForTimeout(2000);
await page.click('button');
```

```typescript
// GOOD - Use auto-waiting
await page.getByRole('button').click();
```

### ❌ Brittle Selectors

```typescript
// BAD - Implementation details
await page.locator('div > div:nth-child(2) > button').click();
```

```typescript
// GOOD - Semantic, accessible
await page.getByRole('button', { name: 'Add to cart' }).click();
```

### ❌ Testing Implementation Details

```typescript
// BAD - Checking internal state
const hasClass = await page.locator('.product').getAttribute('class');
expect(hasClass).toContain('active');
```

```typescript
// GOOD - Testing user-visible behavior
await expect(page.getByRole('article')).toBeVisible();
```

### ❌ Shared State Between Tests

```typescript
// BAD - Tests depend on each other
test('add item', async ({ page }) => {
  await page.goto('/cart');
  await page.getByRole('button', { name: 'Add' }).click();
});

test('remove item', async ({ page }) => {
  // Assumes previous test ran!
  await page.goto('/cart');
  await page.getByRole('button', { name: 'Remove' }).click();
});
```

```typescript
// GOOD - Each test is independent
test('remove item', async ({ page }) => {
  await page.goto('/cart');

  // Setup: Add item first
  await page.getByRole('button', { name: 'Add' }).click();

  // Test: Remove item
  await page.getByRole('button', { name: 'Remove' }).click();
  await expect(page.getByText('Cart is empty')).toBeVisible();
});
```

### ❌ Not Waiting for Network

```typescript
// BAD - Race condition
await page.getByRole('button', { name: 'Load more' }).click();
const items = await page.getByRole('article').count();
// Might count before new items load!
```

```typescript
// GOOD - Wait for network
await page.getByRole('button', { name: 'Load more' }).click();
await page.waitForResponse(resp => resp.url().includes('/products'));
const items = await page.getByRole('article').count();
```

## Test Organization

### Group Related Tests

```typescript
test.describe('Product Gallery', () => {
  test.describe('Image Navigation', () => {
    test('should navigate with arrow buttons', async ({ page }) => {
      // ...
    });

    test('should navigate with keyboard', async ({ page }) => {
      // ...
    });
  });

  test.describe('Zoom Functionality', () => {
    test('should zoom on click', async ({ page }) => {
      // ...
    });

    test('should pan zoomed image', async ({ page }) => {
      // ...
    });
  });
});
```

### Setup and Teardown

```typescript
test.describe('Shopping Cart', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: Fresh cart for each test
    await page.goto('/cart');
    await page.getByRole('button', { name: 'Clear cart' }).click();
  });

  test.afterEach(async ({ page }) => {
    // Cleanup if needed
    // Usually not necessary - Playwright isolates contexts
  });

  test('should add item to cart', async ({ page }) => {
    // Test starts with empty cart
    // ...
  });
});
```

## Running Tests

```bash
# Run all E2E tests
npm run test:all

# Run with UI mode
npm run test:ui

# Run in debug mode
npm run test:debug

# Run specific test file
npm run test -- country-switcher.spec.ts

# Run visual regression tests
npm run test:visual

# Update visual snapshots
npm run test:visual:update

# Run specific component tests
npm run test:country-switcher

# View test report
npm run test:report
```

## Best Practices

1. **Use Page Object Model** - Encapsulate page interactions
2. **Prefer Semantic Selectors** - Use getByRole, getByLabel, getByText
3. **Let Playwright Auto-Wait** - Avoid arbitrary timeouts
4. **Test User Behavior** - Not implementation details
5. **Isolate Tests** - Each test should be independent
6. **Use test.step()** - For complex multi-step flows
7. **Handle Island Architecture** - Wait for component hydration
8. **Focus on Core Flows** - Test positive paths and negative scenarios
9. **Debug with Traces** - Use --trace on flag for debugging
10. **Keep Tests Simple** - Avoid over-complicating test logic

## Island Architecture Considerations

### Loading Directives

Components may use different loading strategies:

```html
<!-- client:idle - Loads when browser is idle -->
<analytics-tracker client:idle></analytics-tracker>

<!-- client:visible - Loads when element enters viewport -->
<product-gallery client:visible></product-gallery>

<!-- client:media - Loads when media query matches -->
<mobile-menu client:media="(max-width: 768px)"></mobile-menu>
```

### Testing Strategies

```typescript
// For client:idle components
test('idle-loaded component', async ({ page }) => {
  await page.goto('/');

  // Wait for idle loading
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(100); // Brief wait for idle callback

  // Verify component is loaded
  await expect(page.locator('analytics-tracker')).toBeAttached();
});

// For client:visible components
test('visible-loaded component', async ({ page }) => {
  await page.goto('/');

  const gallery = page.locator('product-gallery');

  // Scroll into view to trigger loading
  await gallery.scrollIntoViewIfNeeded();

  // Wait for component to load
  await page.waitForFunction(() => {
    return window.customElements.get('product-gallery') !== undefined;
  });

  await expect(gallery).toBeAttached();
});
```

## Environment Configuration

Tests run against preview theme:

```env
# .env file
TEST_URL=https://your-store.myshopify.com
TEST_THEME_ID=123456789
SHOPIFY_STORE=your-store
```

Access in tests:
```typescript
const testUrl = process.env.TEST_URL || 'http://localhost:3000';
await page.goto(testUrl);
```

## Troubleshooting

### Flaky Tests

1. **Check for race conditions** - Add proper waits
2. **Ensure test isolation** - Tests shouldn't depend on each other
3. **Wait for animations** - Use `page.waitForLoadState()`
4. **Check network timing** - Use `waitForResponse()`

### Element Not Found

1. **Check selector** - Use Playwright inspector
2. **Wait for element** - Use `waitFor({ state: 'visible' })`
3. **Check iframe context** - Use `page.frameLocator()` if needed
4. **Verify element exists** - Check in browser DevTools

### Timeout Errors

1. **Increase timeout** - Configure in playwright.config.ts
2. **Improve selectors** - Use more specific locators
3. **Add explicit waits** - For slow operations
4. **Check network** - Ensure test environment is responsive

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Page Object Model Guide](https://playwright.dev/docs/pom)
- [Accessibility Testing](https://playwright.dev/docs/accessibility-testing)
- [Visual Comparisons](https://playwright.dev/docs/test-snapshots)
