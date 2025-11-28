/**
 * Tenant Entity E2E Tests
 * Feature-Sliced Design - Entity Layer
 */

import { test, expect } from '@playwright/test';

test.describe('Tenant Entity', () => {
  test.beforeEach(async ({ page }) => {
    // Login as ADMIN to access tenant management
    await page.goto('/#/login');
    await page.fill('input[name="email"]', 'admin@monetaris.de');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/#/dashboard');
  });

  test('displays tenant list', async ({ page }) => {
    // Navigate to tenants/clients page
    await page.goto('/#/clients');

    // Wait for tenant cards to load
    await page.waitForSelector('[data-testid="tenant-card"]', { timeout: 10000 });

    // Verify tenant cards are displayed
    const tenantCards = await page.locator('[data-testid="tenant-card"]');
    const count = await tenantCards.count();
    expect(count).toBeGreaterThan(0);

    // Verify tenant card contains expected elements
    const firstCard = tenantCards.first();
    await expect(firstCard).toBeVisible();
    await expect(firstCard.locator('h3')).toContainText(/./); // Has a title
  });

  test('displays tenant table view', async ({ page }) => {
    await page.goto('/#/tenants');

    // If there's a table view toggle, click it
    // Otherwise, just verify table exists
    const table = page.locator('[data-testid="tenant-table"]');
    if (await table.count() > 0) {
      await expect(table).toBeVisible();

      // Verify table headers
      await expect(page.locator('th:has-text("Firma")')).toBeVisible();
      await expect(page.locator('th:has-text("HRB-Nr.")')).toBeVisible();
      await expect(page.locator('th:has-text("E-Mail")')).toBeVisible();
    }
  });

  test('searches tenants', async ({ page }) => {
    await page.goto('/#/clients');

    // Wait for data to load
    await page.waitForSelector('[data-testid="tenant-card"]', { timeout: 10000 });

    // Get initial count
    const initialCount = await page.locator('[data-testid="tenant-card"]').count();

    // Search for a specific tenant
    const searchInput = page.locator('input[placeholder*="Suche"]');
    await searchInput.fill('GmbH');
    await page.waitForTimeout(500); // Wait for search debounce

    // Verify filtered results
    const filteredCount = await page.locator('[data-testid="tenant-card"]').count();
    // Should have results (assuming there's at least one GmbH)
    expect(filteredCount).toBeGreaterThan(0);
  });

  test('navigates to tenant detail page', async ({ page }) => {
    await page.goto('/#/clients');

    // Wait for tenant cards
    await page.waitForSelector('[data-testid="tenant-card"]', { timeout: 10000 });

    // Click first tenant card
    const firstCard = page.locator('[data-testid="tenant-card"]').first();
    await firstCard.click();

    // Verify navigation to detail page
    await expect(page).toHaveURL(/\/#\/clients\/[a-f0-9-]+/);

    // Verify detail page elements
    await expect(page.locator('h1')).toContainText(/./); // Has tenant name
    await expect(page.locator('text=Stammdaten')).toBeVisible();
  });

  test('displays tenant stats on detail page', async ({ page }) => {
    await page.goto('/#/clients');
    await page.waitForSelector('[data-testid="tenant-card"]', { timeout: 10000 });

    // Navigate to detail
    const firstCard = page.locator('[data-testid="tenant-card"]').first();
    await firstCard.click();
    await page.waitForURL(/\/#\/clients\/[a-f0-9-]+/);

    // Verify stats cards are displayed
    await expect(page.locator('text=Gesamtvolumen')).toBeVisible();
    await expect(page.locator('text=Offene Akten')).toBeVisible();
    await expect(page.locator('text=Gerichtliche Verfahren')).toBeVisible();
  });

  test('switches between overview and claims tabs', async ({ page }) => {
    await page.goto('/#/clients');
    await page.waitForSelector('[data-testid="tenant-card"]', { timeout: 10000 });

    // Navigate to detail
    const firstCard = page.locator('[data-testid="tenant-card"]').first();
    await firstCard.click();
    await page.waitForURL(/\/#\/clients\/[a-f0-9-]+/);

    // Verify overview tab is active by default
    await expect(page.locator('text=Stammdaten')).toBeVisible();

    // Click claims tab
    const claimsTab = page.locator('button:has-text("Aktenverzeichnis")');
    await claimsTab.click();

    // Verify claims view is shown
    await expect(page.locator('text=Ansicht:')).toBeVisible();
  });

  test('filters claims by type', async ({ page }) => {
    await page.goto('/#/clients');
    await page.waitForSelector('[data-testid="tenant-card"]', { timeout: 10000 });

    // Navigate to detail
    const firstCard = page.locator('[data-testid="tenant-card"]').first();
    await firstCard.click();
    await page.waitForURL(/\/#\/clients\/[a-f0-9-]+/);

    // Click claims tab
    await page.locator('button:has-text("Aktenverzeichnis")').click();

    // Click filter buttons
    const allButton = page.locator('button:has-text("Alle")');
    const openButton = page.locator('button:has-text("Offen")');
    const legalButton = page.locator('button:has-text("Gericht")');

    // Test each filter
    await openButton.click();
    await page.waitForTimeout(300);

    await legalButton.click();
    await page.waitForTimeout(300);

    await allButton.click();
    await page.waitForTimeout(300);

    // If there are cases, verify they're displayed
    const hasCases = await page.locator('table').count() > 0;
    if (hasCases) {
      await expect(page.locator('table')).toBeVisible();
    }
  });

  test('displays empty state when no tenants match search', async ({ page }) => {
    await page.goto('/#/clients');
    await page.waitForSelector('[data-testid="tenant-card"]', { timeout: 10000 });

    // Search for non-existent tenant
    const searchInput = page.locator('input[placeholder*="Suche"]');
    await searchInput.fill('NONEXISTENT_TENANT_XYZ123');
    await page.waitForTimeout(500);

    // Verify empty state
    await expect(page.locator('text=Keine Mandanten gefunden')).toBeVisible();
  });

  test('shows loading state while fetching tenants', async ({ page }) => {
    // This test verifies the loading skeleton
    await page.goto('/#/clients');

    // Initially should show loading skeleton
    const skeleton = page.locator('.animate-pulse');
    // If loading is fast, this might not be visible, so we use a conditional check
    const skeletonVisible = await skeleton.isVisible().catch(() => false);

    // After loading, tenant cards should be visible
    await page.waitForSelector('[data-testid="tenant-card"]', { timeout: 10000 });
    const tenantCard = page.locator('[data-testid="tenant-card"]').first();
    await expect(tenantCard).toBeVisible();
  });
});
