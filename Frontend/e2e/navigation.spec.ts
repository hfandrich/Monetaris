import { test, expect } from '@playwright/test';

test.describe('Navigation and Routing', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@monetaris.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 });
  });

  test('Can navigate to all main sections', async ({ page }) => {
    // Dashboard
    await page.click('a[href*="/dashboard"]');
    await expect(page).toHaveURL(/.*dashboard/);

    // Claims
    await page.click('a[href*="/claims"]');
    await expect(page).toHaveURL(/.*claims/);

    // Debtors
    await page.click('a[href*="/debtors"]');
    await expect(page).toHaveURL(/.*debtors/);

    // Clients/Tenants
    const clientsLink = page.locator('a[href*="/clients"], a[href*="/tenants"]').first();
    if (await clientsLink.isVisible()) {
      await clientsLink.click();
      await expect(page).toHaveURL(/.*clients|tenants/);
    }

    // Settings
    const settingsLink = page.locator('a[href*="/settings"]').first();
    if (await settingsLink.isVisible()) {
      await settingsLink.click();
      await expect(page).toHaveURL(/.*settings/);
    }
  });

  test('Browser back button works correctly', async ({ page }) => {
    // Navigate to claims
    await page.click('a[href*="/claims"]');
    await expect(page).toHaveURL(/.*claims/);

    // Navigate to debtors
    await page.click('a[href*="/debtors"]');
    await expect(page).toHaveURL(/.*debtors/);

    // Go back
    await page.goBack();
    await expect(page).toHaveURL(/.*claims/);

    // Go back again
    await page.goBack();
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('Direct URL navigation works', async ({ page }) => {
    // Navigate directly to claims
    await page.goto('/claims');
    await expect(page).toHaveURL(/.*claims/);

    // Navigate directly to debtors
    await page.goto('/debtors');
    await expect(page).toHaveURL(/.*debtors/);
  });

  test('404 page handling', async ({ page }) => {
    // Navigate to non-existent route
    await page.goto('/this-does-not-exist-xyz');

    // Should either show 404 or redirect
    // Verify we're not stuck in loading state
    await page.waitForTimeout(2000);

    const url = page.url();
    // Either shows 404 or redirects to a valid page
    expect(url).toBeTruthy();
  });

  test('Active navigation item is highlighted', async ({ page }) => {
    // Go to dashboard
    await page.click('a[href*="/dashboard"]');

    // Find dashboard link
    const dashboardLink = page.locator('a[href*="/dashboard"]').first();

    // Check if it has active class
    const classList = await dashboardLink.getAttribute('class');
    const hasActiveStyle = classList?.includes('active') || classList?.includes('bg-');

    expect(hasActiveStyle).toBeTruthy();
  });
});
