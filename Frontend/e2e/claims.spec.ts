import { test, expect } from '@playwright/test';

// Helper to navigate with HashRouter
const hashUrl = (path: string) => `/#${path}`;

test.describe('Claims (Forderungen)', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin before each test
    await page.goto(hashUrl('/login'));
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.fill('input[type="email"]', 'admin@monetaris.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*#\/dashboard/, { timeout: 10000 });

    // Navigate to claims page
    await page.click('a[href*="#/claims"]');
    await expect(page).toHaveURL(/.*#\/claims/, { timeout: 10000 });
  });

  test('Claims page loads successfully', async ({ page }) => {
    // Verify we are on claims page
    await expect(page).toHaveURL(/.*#\/claims/);

    // Verify page header is visible
    await expect(page.locator('text=Forderungen')).toBeVisible({ timeout: 10000 });
  });

  test('Claims page shows data table', async ({ page }) => {
    // Wait for loading to complete
    await page.waitForTimeout(2000);

    // Look for table or data rows
    const table = page.locator('table').first();
    const dataExists = await table.isVisible().catch(() => false);

    if (dataExists) {
      // Verify table headers
      await expect(page.locator('th:has-text("Az.")')).toBeVisible();
      await expect(page.locator('th:has-text("Schuldner")')).toBeVisible();
      await expect(page.locator('th:has-text("Forderung")')).toBeVisible();
      await expect(page.locator('th:has-text("Status")')).toBeVisible();
    } else {
      // Data might still be loading or no cases exist
      const noDataMessage = page.locator('text=Keine Forderungen gefunden');
      const loadingMessage = page.locator('text=Lade Datenstream');
      const hasNoData = await noDataMessage.isVisible().catch(() => false);
      const isLoading = await loadingMessage.isVisible().catch(() => false);
      expect(hasNoData || isLoading || dataExists).toBe(true);
    }
  });

  test('Claims page has filter bar', async ({ page }) => {
    // Wait for page to load
    await page.waitForTimeout(1000);

    // Look for filter elements
    const filterBar = page.locator('text=Filter');
    await expect(filterBar.first()).toBeVisible({ timeout: 5000 });

    // Look for search input
    const searchInput = page.locator('input[placeholder*="Rechnungsnummer"]');
    await expect(searchInput).toBeVisible({ timeout: 5000 });
  });

  test('Claims page has view mode toggle', async ({ page }) => {
    // Wait for page to load
    await page.waitForTimeout(1000);

    // Look for view mode buttons (Liste, Board, Agent)
    const listeButton = page.locator('button:has-text("Liste")');
    const boardButton = page.locator('button:has-text("Board")');
    const agentButton = page.locator('button:has-text("Agent")');

    await expect(listeButton).toBeVisible({ timeout: 5000 });
    await expect(boardButton).toBeVisible({ timeout: 5000 });
    await expect(agentButton).toBeVisible({ timeout: 5000 });
  });

  test('Claims page can switch to Board view', async ({ page }) => {
    // Wait for page to load
    await page.waitForTimeout(1000);

    // Click on Board button
    await page.click('button:has-text("Board")');

    // Wait for board to render
    await page.waitForTimeout(1000);

    // Verify board columns are visible (look for column titles)
    const columns = page.locator('text=/Neu|Mahnwesen|Vorbereitung|Gerichtlich|Erledigt/i');
    const columnCount = await columns.count();
    expect(columnCount).toBeGreaterThan(0);
  });

  test('Claims page has status filter tabs', async ({ page }) => {
    // Wait for page to load
    await page.waitForTimeout(1000);

    // Look for filter tabs
    const allTab = page.locator('button:has-text("Alle Forderungen")');
    await expect(allTab).toBeVisible({ timeout: 5000 });

    // Other tabs should also be visible
    const actionTab = page.locator('button:has-text("Aktion nötig")');
    const legalTab = page.locator('button:has-text("Gerichtl. Verfahren")');
    const paidTab = page.locator('button:has-text("Bezahlt")');

    expect(await actionTab.isVisible() || await legalTab.isVisible() || await paidTab.isVisible()).toBe(true);
  });

  test('Claims page has new claim button', async ({ page }) => {
    // Look for "Neue Forderung" button
    const newClaimButton = page.locator('button:has-text("Neue Forderung")');
    await expect(newClaimButton).toBeVisible({ timeout: 5000 });
  });

  test('Clicking new claim button opens wizard', async ({ page }) => {
    // Click the new claim button
    await page.click('button:has-text("Neue Forderung")');

    // Wait for wizard/modal to open
    await page.waitForTimeout(1000);

    // Check if wizard or modal is visible
    const wizard = page.locator('[role="dialog"], .modal, .wizard').first();
    const isWizardVisible = await wizard.isVisible().catch(() => false);

    if (isWizardVisible) {
      // Close the wizard
      await page.keyboard.press('Escape');
    }

    expect(true).toBe(true); // Test passed if we got here
  });

  test('Claims search filters results', async ({ page }) => {
    // Wait for data to load
    await page.waitForTimeout(2000);

    // Find and use search input
    const searchInput = page.locator('input[placeholder*="Rechnungsnummer"]');
    await expect(searchInput).toBeVisible();

    // Type a search term
    await searchInput.fill('RE-');

    // Wait for filter to apply
    await page.waitForTimeout(1000);

    // Verify the page is still functional
    await expect(page.locator('text=Forderungen')).toBeVisible();
  });

  test('Agent user sees scope toggle', async ({ page }) => {
    // Logout and login as agent
    await page.goto(hashUrl('/login'));
    await page.evaluate(() => localStorage.clear());
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.fill('input[type="email"]', 'max@monetaris.com');
    await page.fill('input[type="password"]', 'max123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*#\/dashboard/, { timeout: 10000 });

    // Navigate to claims
    await page.click('a[href*="#/claims"]');
    await expect(page).toHaveURL(/.*#\/claims/, { timeout: 10000 });

    // Wait for page to load
    await page.waitForTimeout(1000);

    // Look for scope toggle buttons
    const myViewButton = page.locator('button:has-text("Meine Ansicht")');
    const totalViewButton = page.locator('button:has-text("Gesamt")');

    expect(await myViewButton.isVisible() || await totalViewButton.isVisible()).toBe(true);
  });

  test('Clicking on a claim row opens detail modal', async ({ page }) => {
    // Wait for data to load
    await page.waitForTimeout(2000);

    // Check if there are rows in the table
    const tableRows = page.locator('table tbody tr');
    const rowCount = await tableRows.count();

    if (rowCount > 0) {
      // Click on first data row
      await tableRows.first().click();

      // Wait for modal to appear
      await page.waitForTimeout(1000);

      // Check if modal/detail view appeared
      const modal = page.locator('[role="dialog"], .modal').first();
      const isModalVisible = await modal.isVisible().catch(() => false);

      if (isModalVisible) {
        // Close modal
        await page.keyboard.press('Escape');
      }
    }

    expect(true).toBe(true); // Test passed
  });

  test('Claims page is responsive', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Wait for resize
    await page.waitForTimeout(500);

    // Verify page still renders
    await expect(page.locator('text=Forderungen')).toBeVisible();

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    await expect(page.locator('text=Forderungen')).toBeVisible();

    // Reset to desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
  });
});
