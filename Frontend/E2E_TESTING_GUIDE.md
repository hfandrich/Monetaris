# Playwright E2E Testing Guide for Monetaris

## Overview

End-to-end tests validate complete user journeys through the Monetaris debt collection management application using real browser automation with Playwright.

## Installation

Playwright is already installed as part of the project dependencies. If you need to reinstall or set up on a new machine:

```bash
cd Frontend
npm install
npx playwright install chromium
```

## Running Tests

### All Tests
```bash
npm run test:e2e
```

Runs all E2E tests in headless mode (no visible browser window).

### Interactive Mode (UI)
```bash
npm run test:e2e:ui
```

Opens Playwright's interactive UI where you can:
- Select specific tests to run
- See test execution in real-time
- Debug failing tests
- View traces and screenshots

### Debug Mode
```bash
npm run test:e2e:debug
```

Runs tests in debug mode with Playwright Inspector:
- Step through tests line by line
- Pause execution
- Inspect page state
- Generate test code from interactions

### Headed Mode (Visible Browser)
```bash
npm run test:e2e:headed
```

Runs tests with a visible browser window so you can see what's happening.

### View Test Report
```bash
npm run test:e2e:report
```

Opens the HTML test report showing results, screenshots, and videos from the last test run.

## Prerequisites

Before running E2E tests:

1. **Frontend Dev Server**: The tests automatically start the dev server at `http://localhost:3000` (configured in `playwright.config.ts`)
2. **Clean State**: Tests use localStorage for data persistence, so each test suite clears storage in `beforeEach` hooks
3. **Test Data**: Tests use the mock data defined in `services/mockData.ts`

## Test Suites

### 1. Authentication (`e2e/auth.spec.ts`)

Tests login, logout, and session management:
- ✅ Admin login with valid credentials
- ✅ Agent login with valid credentials
- ✅ Invalid credentials show error message
- ✅ User can logout successfully
- ✅ Client can login via client portal
- ✅ Session persists on page reload
- ✅ Protected routes redirect to login when not authenticated

**Test Accounts:**
- Admin: `admin@monetaris.com` / `password`
- Agent: `max@monetaris.com` / `password`
- Client: `client@techsolutions.de` / `password`

### 2. Case Workflow (`e2e/case-workflow.spec.ts`)

Tests case management and workflow features:
- ✅ Navigate to cases page
- ✅ View case details
- ✅ Filter cases by status
- ✅ Search for cases
- ✅ View case history/audit log
- ✅ View case documents
- ✅ Case detail modal shows financial information
- ✅ Close case detail modal
- ✅ Cases table shows key columns
- ✅ Access debtors page

### 3. Dashboard (`e2e/dashboard.spec.ts`)

Tests dashboard functionality and layout:
- ✅ Dashboard loads successfully
- ✅ Shows KPI statistics cards
- ✅ Shows total cases metric
- ✅ Shows total volume/amount metric
- ✅ Navigation sidebar is visible
- ✅ Header shows user information
- ✅ Global search is accessible
- ✅ Command palette can be opened with Ctrl+K
- ✅ Sidebar can be toggled
- ✅ Shows recent activity or charts
- ✅ Agent user sees appropriate content
- ✅ Navigation links are functional
- ✅ Theme can be toggled
- ✅ Dashboard is responsive

### 4. Navigation (`e2e/navigation.spec.ts`)

Tests routing and navigation:
- ✅ Navigate to all main sections
- ✅ Browser back button works correctly
- ✅ Direct URL navigation works
- ✅ 404 page handling
- ✅ Active navigation item is highlighted

### 5. Search (`e2e/search.spec.ts`)

Tests search functionality:
- ✅ Global search input is accessible
- ✅ Search can be focused with `/` keyboard shortcut
- ✅ Search shows results
- ✅ Search in cases table works
- ✅ Search can be cleared
- ✅ Empty search shows all results

## Writing New Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: Login or navigate to starting point
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@monetaris.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 });
  });

  test('should do something', async ({ page }) => {
    // Arrange: Navigate to the feature
    await page.goto('/some-page');

    // Act: Perform user actions
    await page.click('button[data-testid="submit"]');

    // Assert: Verify expected outcome
    await expect(page.locator('text=Success')).toBeVisible();
  });
});
```

### Best Practices

1. **Use Specific Selectors**
   - Prefer `data-testid`: `[data-testid="element"]` (most stable)
   - Text selectors: `text=Exact Text` or `text=/regex/i`
   - CSS selectors: `.css-class` (use sparingly, can be fragile)

2. **Login Once in beforeEach**
   - Reuse login flow across tests
   - Clear localStorage in beforeEach for clean state

3. **Use Unique IDs for Test Data**
   ```typescript
   const uniqueId = `TEST-${Date.now()}`;
   await page.fill('input[name="caseNumber"]', uniqueId);
   ```

4. **Wait for Elements**
   ```typescript
   await expect(page.locator('selector')).toBeVisible({ timeout: 5000 });
   ```

5. **Handle Optional Elements**
   ```typescript
   const button = page.locator('button:has-text("Submit")');
   if (await button.isVisible()) {
     await button.click();
   }
   ```

6. **Take Screenshots on Failure**
   - Automatic in Playwright config: `screenshot: 'only-on-failure'`

## Selector Strategies

### Priority Order
1. `[data-testid="element"]` - Most stable (add these to components)
2. `text=Exact Text` - Good for labels and buttons
3. `role` attributes: `button[role="submit"]`
4. Form inputs: `input[name="email"]`
5. CSS classes: `.button-primary` (fragile, avoid if possible)

### German UI Text
Many tests use German text for selectors (e.g., "Forderungen", "Schuldner"). When writing tests:
- Use regex for case-insensitive matching: `text=/.*forderungen.*/i`
- Provide fallbacks for English: `text=/claims|forderungen/i`

## CI/CD Integration

Tests can run automatically in GitHub Actions or other CI systems:

```yaml
- name: Install dependencies
  run: npm ci

- name: Install Playwright browsers
  run: npx playwright install chromium --with-deps

- name: Run E2E tests
  run: npm run test:e2e
```

The `playwright.config.ts` enables CI mode automatically when `process.env.CI` is set:
- 2 retries for flaky tests
- Single worker (no parallelization)
- HTML reporter for artifacts

## Troubleshooting

### Tests Timeout
- Increase timeout in playwright.config.ts: `timeout: 60000`
- Or per-test: `test('name', async ({ page }) => { ... }, { timeout: 60000 })`

### Frontend Not Starting
- Check if port 3000 is available: `lsof -i :3000` (Mac/Linux) or `netstat -ano | findstr :3000` (Windows)
- Kill existing process or use a different port

### Flaky Tests
- Add explicit waits: `await expect(locator).toBeVisible()`
- Wait for network idle: `await page.waitForLoadState('networkidle')`
- Use longer timeouts for slow operations

### Element Not Found
- Check if element exists with: `await page.locator('selector').count()`
- Use `page.locator('selector').first()` if multiple matches
- Add `.catch()` handlers for optional elements

### Different Behavior in Headless vs Headed
- Some animations or timing issues may only appear in headless mode
- Test both modes to catch these issues

## Test Data Management

### Using Mock Data
Tests rely on `services/mockData.ts`:
- SEED_USERS: Test user accounts
- SEED_CASES: Sample collection cases
- SEED_DEBTORS: Sample debtors
- SEED_TENANTS: Sample clients/tenants

### Clearing State
```typescript
test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
});
```

## Common Patterns

### Login Helper
```typescript
async function login(page, email, password) {
  await page.goto('/login');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 });
}
```

### Wait for Table to Load
```typescript
await page.waitForSelector('table tbody tr', { timeout: 10000 });
```

### Check if Element Exists Without Failing
```typescript
const count = await page.locator('selector').count();
if (count > 0) {
  // Element exists
}
```

## Performance Tips

1. **Run Tests in Parallel**: Playwright runs tests in parallel by default
2. **Use `fullyParallel: true`**: Already configured in playwright.config.ts
3. **Skip Unnecessary Animations**: Add CSS to disable animations in test mode
4. **Reuse Browser Context**: Playwright optimizes this automatically

## Debugging Tips

1. **Use `page.pause()`** to stop execution and inspect
2. **Add `--debug` flag** to run with Playwright Inspector
3. **Check screenshots** in `test-results/` folder after failures
4. **View trace files** with `npx playwright show-trace trace.zip`
5. **Console logs**: `page.on('console', msg => console.log(msg.text()))`

## Test Coverage Goals

Current coverage: **5 test suites, 48+ E2E tests**

### Future Test Additions
- Case creation wizard workflow
- Document upload functionality
- Workflow status advancement
- Debtor portal specific flows
- Client portal specific flows
- Import batch cases
- Template management
- Compliance monitoring
- Settings management

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Tests](https://playwright.dev/docs/debug)
