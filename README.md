# E2E Testing for Shopify Theme

Playwright-based end-to-end testing suite for a Shopify theme with an intelligent test generation workflow.

## Features

- **Three-Phase Test Workflow**: Automated test planning, generation, and healing
- **Page Object Model**: Clean, maintainable test architecture
- **Multi-Browser Support**: Chrome, Firefox, Safari, and mobile emulation
- **Auto-Authentication**: Handles Shopify password protection automatically
- **Intelligent Test Healing**: Automatically fixes common test failures

## Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

```bash
npm install
```

### Environment Setup

Create a `.env` file in the root directory:

```env
TEST_URL=https://your-store.myshopify.com
STORE_PASSWORD=your-password-here
TEST_THEME_ID=your-theme-id
```

### Running Tests

```bash
# Run all tests
npm run test:all

# Run tests with UI mode (interactive)
npm run test:ui

# Run tests in debug mode
npm run test:debug

# View test report
npm run test:report
```

## Project Structure

```
e2e/
├── playwright.config.ts      # Playwright configuration
├── tsconfig.json             # TypeScript configuration
├── global-setup.ts           # Authentication and global setup
├── fixtures.ts               # Custom test fixtures
├── storageState.json         # Saved auth state (auto-generated)
├── pages/                    # Page Object Model classes
│   ├── BasePage.ts          # Base class with common functionality
│   └── PasswordPage.ts      # Shopify password page handler
├── helpers/                  # Reusable utilities
│   └── constant.ts          # Environment variables and constants
├── testplan/                 # Test plans (auto-generated)
│   └── e2e-*-test-plan.md
└── tests/                    # Test files (*.spec.ts)
```

## Test Generation Workflow

This project uses Claude Code's `/playwright-test-writer` command for automated test creation:

### Usage

```bash
# Generate tests for a component
/playwright-test-writer frontend/js/islands/country-switcher.ts

# Generate tests by description
/playwright-test-writer product gallery functionality
/playwright-test-writer checkout flow
```

### How It Works

**Phase 1: Test Planning**
- Explores component functionality in live preview
- Creates detailed test plan with scenarios and edge cases
- Outputs to `e2e/testplan/e2e-{feature}-test-plan.md`

**Phase 2: Test Generation**
- Reads test plan and generates test files
- Creates Page Object Model classes
- Uses semantic selectors and best practices

**Phase 3: Test Healing**
- Runs generated tests
- Automatically fixes failures (up to 5 attempts)
- Provides comprehensive failure reports

## Writing Tests

### Test File Structure

```typescript
import { test, expect } from '@playwright/test';
import { ProductPage } from '@pages/ProductPage';

test.describe('Product Page', () => {
  let productPage: ProductPage;

  test.beforeEach(async ({ page }) => {
    productPage = new ProductPage(page);
    await productPage.goto('/products/example-product');
  });

  test('should add product to cart', async ({ page }) => {
    await productPage.addToCart(1);
    await expect(productPage.cartCount).toHaveText('1');
  });
});
```

### Page Object Example

```typescript
import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProductPage extends BasePage {
  readonly addToCartButton: Locator;
  readonly productTitle: Locator;

  constructor(page: Page) {
    super(page);
    this.addToCartButton = page.getByRole('button', { name: 'Add to cart' });
    this.productTitle = page.getByRole('heading', { level: 1 });
  }

  async addToCart(quantity: number = 1) {
    await this.addToCartButton.click();
  }
}
```

## Browser Configuration

Tests run across multiple browsers:

- **Desktop**: Chrome, Firefox, Safari
- **Mobile**: Pixel 5 (Chrome), iPhone 12 (Safari)

Configure in `e2e/playwright.config.ts` to run specific browsers:

```bash
# Run tests on specific browser
npx playwright test --config e2e/playwright.config.ts --project=chromium
```

## Best Practices

### Selector Priority

1. Role-based: `page.getByRole('button', { name: 'Submit' })`
2. Label-based: `page.getByLabel('Email address')`
3. Text-based: `page.getByText('Success')`
4. Test ID: `page.getByTestId('product-price')`
5. CSS selectors (last resort)

### Waiting Strategy

- Rely on Playwright's auto-waiting for actions
- Use web-first assertions: `expect(element).toBeVisible()`
- Wait for network responses when needed
- **Avoid** `waitForTimeout()` or `waitForLoadState('networkidle')`

### Test Isolation

Each test should be:
- Independent and self-contained
- Able to run in any order
- Properly cleaned up after execution