# Playwright E2E Test Writer Skill

A comprehensive three-phase workflow for creating, generating, and healing end-to-end tests for Shopify theme components using Playwright.

## Overview

This skill orchestrates specialized agents to deliver production-ready E2E tests through an automated pipeline:

```
┌─────────────────────────────────────────────────────┐
│  Phase 1: Test Planning & Research                  │
│  Agent: playwright-test-planner                     │
│  Output: Detailed test plan with scenarios          │
└─────────────────────┬───────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────┐
│  Phase 2: Test Code Generation                      │
│  Agent: playwright-test-generator                   │
│  Output: Test files with Page Object Model          │
└─────────────────────┬───────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────┐
│  Phase 3: Test Execution & Healing                  │
│  Agent: playwright-test-healer                      │
│  Output: Passing tests or failure report            │
└─────────────────────────────────────────────────────┘
```

## Usage

### Slash Command

```
/playwright-test-writer <component-path-or-description>
```

### Examples

**By file path:**
```
/playwright-test-writer frontend/js/islands/country-switcher.ts
/playwright-test-writer frontend/js/components/search-modal.ts
```

**By functionality description:**
```
/playwright-test-writer product gallery with zoom and thumbnails
/playwright-test-writer checkout flow from cart to confirmation
/playwright-test-writer mobile navigation menu
```

## Workflow Phases

### Phase 1: Test Planning (`playwright-test-planner`)

The planner agent:
- Reads component source code to understand functionality
- Navigates the live preview environment using MCP browser tools
- Explores all interactive elements and user flows
- Documents test scenarios with step-by-step instructions
- Creates test plan at `e2e/testplan/e2e-{feature-name}-test-plan.md`

**Test Plan Includes:**
- Component overview and behavior analysis
- 15-30 focused test scenarios
- Core user interactions (positive tests)
- Negative tests and validation scenarios
- Recommended selectors and assertions
- Page Object Model structure recommendations

### Phase 2: Test Generation (`playwright-test-generator`)

The generator agent:
- Reads the test plan from Phase 1
- Creates Page Object classes in `e2e/pages/`
- Generates test files with `.spec.ts` suffix
- Implements all scenarios with `test.step()` blocks
- Registers page objects in `e2e/fixtures.ts`
- Creates helpers and test data as needed

**Generated Structure:**
```
e2e/
├── pages/
│   └── {ComponentName}Page.ts     # Page Object class
├── tests/
│   └── {category}/
│       └── {feature}.spec.ts      # Test file
├── helpers/
│   └── {utility}.ts               # Helper functions
└── data/
    └── {feature}Data.ts           # Test data
```

### Phase 3: Test Healing (`playwright-test-healer`)

The healer agent:
- Executes generated tests (up to 5 attempts)
- Analyzes failures with forensic precision
- Applies intelligent fixes for common issues
- Iterates until 100% pass rate or max attempts
- Provides comprehensive failure report if needed

**Common Issues Healed:**
- Selector mismatches (updates to match actual DOM)
- Timing issues (applies proper waiting strategies)
- State management problems (fixes test isolation)
- Island component loading (handles hydration)
- Assertion failures (refines expectations)

## Test Focus Areas

### What Gets Tested

- Core positive user flows (happy paths)
- Negative scenarios (validation failures, error handling)
- Functional user interactions

### What Does NOT Get Tested

- Responsive behavior or viewport-specific functionality
- Accessibility compliance (ARIA, WCAG)
- Loading states and debounce behavior
- Edge cases and boundary conditions

## Directory Structure

```
e2e/
├── playwright.config.ts      # Playwright configuration
├── global-setup.ts           # Authentication and global setup
├── fixtures.ts               # Page object fixtures
├── storageState.json         # Saved auth state (generated)
├── pages/                    # Page Object Model classes
│   ├── BasePage.ts           # Base class with common functionality
│   └── PasswordPage.ts       # Shopify password page handler
├── helpers/                  # Reusable utilities
│   └── constant.ts           # Environment variables
├── data/                     # Test data files
├── testplan/                 # Generated test plans
│   └── e2e-*-test-plan.md
└── tests/                    # Test files (*.spec.ts)
    ├── search/               # Search-related tests
    ├── cart/                 # Cart-related tests
    ├── pdp/                  # Product detail page tests
    ├── plp/                  # Product listing page tests
    └── navigation/           # Navigation tests
```

## Best Practices Enforced

### Selector Priority
1. Role-based: `page.getByRole('button', { name: 'Submit' })`
2. Label-based: `page.getByLabel('Email address')`
3. Text-based: `page.getByText('Success')`
4. Test ID: `page.getByTestId('product-price')`
5. CSS selectors (last resort)

### Waiting Strategy
- Rely on Playwright's auto-waiting for actions (preferred)
- Use web-first assertions with built-in retry
- Wait for specific elements when needed
- Wait for network responses when required
- **NEVER** use `waitForTimeout()` or `waitForLoadState('networkidle')`

### Test Structure
```typescript
import { test, expect } from '../../fixtures';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/path');
  });

  test('should perform specific action', async ({ page, featurePage }) => {
    await test.step('Step 1 description', async () => {
      // Implementation
    });

    await test.step('Step 2 description', async () => {
      // Assertions
    });
  });
});
```

### Handling Desktop vs Mobile Behavior

When components behave differently between desktop and mobile, tests use Playwright's `isMobile` fixture to handle both within the **same test scenario**:

```typescript
test('should open navigation menu', async ({ page, isMobile }) => {
  await test.step('Open the navigation menu', async () => {
    if (isMobile) {
      // Mobile: Click hamburger menu
      await page.getByRole('button', { name: 'Open menu' }).click();
    } else {
      // Desktop: Hover over navigation
      await page.getByRole('navigation').hover();
    }
  });

  await test.step('Verify menu is visible', async () => {
    // Common assertion for both viewports
    await expect(page.getByRole('link', { name: 'Products' })).toBeVisible();
  });
});
```

**Key Points:**
- Use `isMobile` fixture to detect mobile browser projects (Pixel 5, iPhone 12)
- Keep desktop and mobile logic in the same test scenario
- Use conditional blocks within `test.step()` for viewport-specific actions

## Running Tests

```bash
# Run all E2E tests
npm run test:all

# Run specific test file
npx playwright test --config e2e/playwright.config.ts <test-file>.spec.ts

# Run with UI mode (interactive)
npm run test:ui

# Run in debug mode
npm run test:debug

# View test report
npm run test:report
```

## Environment Configuration

Tests run against a Shopify preview theme. Required `.env` variables:

```env
TEST_URL=https://your-store.myshopify.com
STORE_PASSWORD=your-password-here
TEST_THEME_ID=your-theme-id
```

## Agents Reference

| Agent | Purpose | Invocation |
|-------|---------|------------|
| `playwright-test-planner` | Research and create test plan | Phase 1 |
| `playwright-test-generator` | Generate test code with POM | Phase 2 |
| `playwright-test-healer` | Execute and fix failing tests | Phase 3 |

## Output Summary

After completion, you receive:

1. **Test Plan**: `e2e/testplan/e2e-{feature}-test-plan.md`
2. **Page Objects**: `e2e/pages/{Feature}Page.ts`
3. **Test Files**: `e2e/tests/{category}/{feature}.spec.ts`
4. **Fixtures Update**: `e2e/fixtures.ts` (if new page objects)
5. **Final Report**: Pass/fail status with coverage summary

## Troubleshooting

### Tests Failing Due to Selectors
- Run in UI mode: `npm run test:ui`
- Use Playwright inspector in debug mode
- Check if element is in shadow DOM or iframe

### Authentication Issues
- Delete `e2e/storageState.json` and regenerate
- Verify STORE_PASSWORD in `.env`

### Timeout Errors
- Check if page is loading correctly
- Use `--headed` flag to see what's happening
- Add explicit wait for specific network responses

### Island Component Issues
- Wait for custom element registration
- Scroll into view for `client:visible` components
- Handle lazy loading with proper waits
