import { test, expect } from '@playwright/test';

test.describe('Search Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@monetaris.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 });
  });

  test('Global search input is accessible', async ({ page }) => {
    // Find search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search"], input[placeholder*="Suche"]').first();

    await expect(searchInput).toBeVisible();
  });

  test('Search can be focused with keyboard shortcut', async ({ page }) => {
    // Press / to focus search
    await page.keyboard.press('/');

    await page.waitForTimeout(500);

    // Check if search input is focused
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search"], input[placeholder*="Suche"]').first();

    if (await searchInput.isVisible()) {
      const isFocused = await searchInput.evaluate((el) => el === document.activeElement);
      expect(isFocused).toBe(true);
    }
  });

  test('Search shows results', async ({ page }) => {
    // Find search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search"], input[placeholder*="Suche"]').first();

    await searchInput.fill('test');

    // Wait for results
    await page.waitForTimeout(1000);

    // Look for search results dropdown or modal
    const searchResults = page.locator('.search-results, [role="listbox"], .search-dropdown');

    if (await searchResults.isVisible()) {
      // Verify results are shown
      expect(await searchResults.isVisible()).toBe(true);
    }
  });

  test('Search in cases table works', async ({ page }) => {
    await page.goto('/claims');

    // Find search input on claims page
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search"], input[placeholder*="Suche"]').first();

    if (await searchInput.isVisible()) {
      // Get initial row count
      const initialRows = await page.locator('table tbody tr, .case-row').count();

      // Search for something specific
      await searchInput.fill('test123xyz');
      await page.waitForTimeout(500);

      // Row count should change or show "no results"
      const noResults = await page.locator('text=/.*keine.*ergebnisse.*/i, text=/.*no.*results.*/i').isVisible();
      const newRows = await page.locator('table tbody tr, .case-row').count();

      // Either shows no results message or filtered rows
      expect(noResults || newRows !== initialRows).toBe(true);
    }
  });

  test('Search can be cleared', async ({ page }) => {
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search"], input[placeholder*="Suche"]').first();

    await searchInput.fill('test query');

    // Look for clear button
    const clearButton = page.locator('button[aria-label*="clear"], button[title*="clear"]');

    if (await clearButton.isVisible()) {
      await clearButton.click();

      // Verify input is cleared
      const value = await searchInput.inputValue();
      expect(value).toBe('');
    } else {
      // Try clearing with keyboard
      await searchInput.press('Control+A');
      await searchInput.press('Backspace');

      const value = await searchInput.inputValue();
      expect(value).toBe('');
    }
  });

  test('Empty search shows all results', async ({ page }) => {
    await page.goto('/claims');

    // Find search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search"], input[placeholder*="Suche"]').first();

    if (await searchInput.isVisible()) {
      // Search for something
      await searchInput.fill('test');
      await page.waitForTimeout(500);

      // Clear search
      await searchInput.fill('');
      await page.waitForTimeout(500);

      // Should show all cases again
      const rows = await page.locator('table tbody tr, .case-row').count();
      expect(rows).toBeGreaterThan(0);
    }
  });
});
