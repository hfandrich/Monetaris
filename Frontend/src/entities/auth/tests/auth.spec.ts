import { test, expect } from '@playwright/test';

test.describe('Auth Entity', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('http://localhost:3000');
    await page.evaluate(() => localStorage.clear());
  });

  test('should login with valid credentials', async ({ page }) => {
    await page.goto('http://localhost:3000/#/login');

    // Fill in login form
    await page.fill('input[type="email"]', 'admin@monetaris.de');
    await page.fill('input[type="password"]', 'Test1234!');

    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('http://localhost:3000/#/login');

    // Fill in wrong credentials
    await page.fill('input[type="email"]', 'wrong@email.com');
    await page.fill('input[type="password"]', 'wrongpass');

    // Submit form
    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator('text=Fehler')).toBeVisible();
  });

  test('should logout user', async ({ page }) => {
    // First login
    await page.goto('http://localhost:3000/#/login');
    await page.fill('input[type="email"]', 'admin@monetaris.de');
    await page.fill('input[type="password"]', 'Test1234!');
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard/);

    // Click user menu
    await page.click('[data-testid="user-menu"]');

    // Click logout
    await page.click('text=Abmelden');

    // Should redirect to login
    await expect(page).toHaveURL(/.*login/);
  });

  test('should login debtor with invoice number and zip code', async ({ page }) => {
    await page.goto('http://localhost:3000/#/login');

    // Switch to debtor login tab (if exists)
    const debtorTab = page.locator('text=Schuldner Login');
    if (await debtorTab.isVisible()) {
      await debtorTab.click();

      // Fill in debtor credentials
      await page.fill('input[name="invoiceNumber"]', 'INV-12345');
      await page.fill('input[name="zipCode"]', '10115');

      // Submit form
      await page.click('button[type="submit"]');

      // Should redirect to debtor portal
      await expect(page).toHaveURL(/.*debtor-portal/);
    }
  });

  test('should persist authentication across page reloads', async ({ page }) => {
    // Login first
    await page.goto('http://localhost:3000/#/login');
    await page.fill('input[type="email"]', 'admin@monetaris.de');
    await page.fill('input[type="password"]', 'Test1234!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard/);

    // Reload page
    await page.reload();

    // Should still be on dashboard (not redirected to login)
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('should show session timeout warning', async ({ page }) => {
    // Login first
    await page.goto('http://localhost:3000/#/login');
    await page.fill('input[type="email"]', 'admin@monetaris.de');
    await page.fill('input[type="password"]', 'Test1234!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard/);

    // Set last activity to trigger warning (25 minutes ago for 30min timeout)
    await page.evaluate(() => {
      const now = Date.now();
      const twentyFiveMinutesAgo = now - (25 * 60 * 1000);
      localStorage.setItem('monetaris_last_activity', twentyFiveMinutesAgo.toString());
    });

    // Wait a bit and check for warning modal
    await page.waitForTimeout(2000);

    // Warning should be visible
    const warningModal = page.locator('text=/Session.*expire/i');
    await expect(warningModal).toBeVisible({ timeout: 10000 });
  });
});
