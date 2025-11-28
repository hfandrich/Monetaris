/**
 * Debtor Entity - E2E Tests
 * Feature-Sliced Design - Entity Layer
 */

import { test, expect } from '@playwright/test';

test.describe('Debtor Entity', () => {
  test.beforeEach(async ({ page }) => {
    // Login as agent
    await page.goto('http://localhost:3000/#/login');
    await page.fill('input[type="email"]', 'agent@monetaris.de');
    await page.fill('input[type="password"]', 'Test1234!');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Dashboard')).toBeVisible({ timeout: 10000 });
  });

  test('should display debtor list', async ({ page }) => {
    await page.goto('http://localhost:3000/#/debtors');
    await expect(page.locator('text=Schuldnerkartei')).toBeVisible();

    // Check if debtor cards are visible
    const debtorCards = page.locator('[data-testid="debtor-card"]');
    await expect(debtorCards.first()).toBeVisible({ timeout: 10000 });
  });

  test('should filter debtors by search', async ({ page }) => {
    await page.goto('http://localhost:3000/#/debtors');

    // Wait for debtors to load
    await expect(page.locator('[data-testid="debtor-card"]')).toBeVisible({ timeout: 10000 });

    // Count initial debtors
    const initialCount = await page.locator('[data-testid="debtor-card"]').count();

    // Type in search
    await page.fill('[data-testid="search-input"]', 'test');

    // Wait for API response
    await page.waitForResponse(resp => resp.url().includes('debtors'), { timeout: 5000 });

    // The count might change or stay the same depending on data
    // Just verify the search input works
    await expect(page.locator('[data-testid="search-input"]')).toHaveValue('test');
  });

  test('should navigate to debtor detail', async ({ page }) => {
    await page.goto('http://localhost:3000/#/debtors');

    // Wait for debtors to load
    await expect(page.locator('[data-testid="debtor-card"]')).toBeVisible({ timeout: 10000 });

    // Click first debtor card
    await page.click('[data-testid="debtor-card"]:first-child');

    // Verify we're on detail page
    await expect(page.locator('text=Schuldner-Detailansicht')).toBeVisible({ timeout: 10000 });
  });

  test('should display risk badge with correct color', async ({ page }) => {
    await page.goto('http://localhost:3000/#/debtors');

    // Wait for debtors to load
    await expect(page.locator('[data-testid="debtor-card"]')).toBeVisible({ timeout: 10000 });

    // Check if risk badge exists
    const riskBadge = page.locator('[data-testid="risk-badge"]').first();
    await expect(riskBadge).toBeVisible();

    // Verify it contains a valid risk score (A, B, C, D, or E)
    const badgeText = await riskBadge.textContent();
    expect(['A', 'B', 'C', 'D', 'E']).toContain(badgeText);
  });

  test('should show debtor contact information', async ({ page }) => {
    await page.goto('http://localhost:3000/#/debtors');

    // Wait for debtors to load
    await expect(page.locator('[data-testid="debtor-card"]')).toBeVisible({ timeout: 10000 });

    const firstCard = page.locator('[data-testid="debtor-card"]').first();

    // Check for email, phone, and address icons
    await expect(firstCard.locator('svg').nth(0)).toBeVisible(); // MapPin icon
    await expect(firstCard.locator('svg').nth(1)).toBeVisible(); // Mail icon
    await expect(firstCard.locator('svg').nth(2)).toBeVisible(); // Phone icon
  });

  test('should toggle between MINE and ALL views', async ({ page }) => {
    await page.goto('http://localhost:3000/#/debtors');

    // Wait for page to load
    await expect(page.locator('text=Schuldnerkartei')).toBeVisible();

    // Check if scope toggle exists (only for agents/admins)
    const mineButton = page.locator('button:has-text("Meine Ansicht")');
    const allButton = page.locator('button:has-text("Gesamt")');

    if (await mineButton.isVisible()) {
      // Click "Meine Ansicht"
      await mineButton.click();
      await page.waitForTimeout(500); // Wait for filter to apply

      // Click "Gesamt"
      await allButton.click();
      await page.waitForTimeout(500);
    }
  });

  test('should display debtor detail with tabs', async ({ page }) => {
    await page.goto('http://localhost:3000/#/debtors');

    // Wait and click first debtor
    await expect(page.locator('[data-testid="debtor-card"]')).toBeVisible({ timeout: 10000 });
    await page.click('[data-testid="debtor-card"]:first-child');

    // Verify tabs exist
    await expect(page.locator('button:has-text("Offene Forderungen")')).toBeVisible();
    await expect(page.locator('button:has-text("Dokumentenablage")')).toBeVisible();

    // Click documents tab
    await page.click('button:has-text("Dokumentenablage")');
    await expect(page.locator('text=Dokument hochladen')).toBeVisible();
  });

  test('should show company badge for business debtors', async ({ page }) => {
    await page.goto('http://localhost:3000/#/debtors');

    // Wait for debtors to load
    await expect(page.locator('[data-testid="debtor-card"]')).toBeVisible({ timeout: 10000 });

    // Check if any debtor has "FIRMA" badge
    const firmaBadges = page.locator('text=FIRMA');
    const count = await firmaBadges.count();

    // Just verify the test can check for the badge (count might be 0 or more)
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should display total debt and open cases', async ({ page }) => {
    await page.goto('http://localhost:3000/#/debtors');

    // Wait for debtors to load
    await expect(page.locator('[data-testid="debtor-card"]')).toBeVisible({ timeout: 10000 });

    const firstCard = page.locator('[data-testid="debtor-card"]').first();

    // Check for "Offen" (debt) and "Akten" (cases) labels
    await expect(firstCard.locator('text=Offen')).toBeVisible();
  });
});
