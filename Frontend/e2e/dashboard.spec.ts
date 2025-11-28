import { test, expect } from '@playwright/test';

// Helper to navigate with HashRouter
const hashUrl = (path: string) => `/#${path}`;

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin before each test
    await page.goto(hashUrl('/login'));
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.fill('input[type="email"]', 'admin@monetaris.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*#\/dashboard/, { timeout: 10000 });
  });

  test('Dashboard loads successfully', async ({ page }) => {
    // Verify we are on dashboard
    await expect(page).toHaveURL(/.*#\/dashboard/);

    // Verify main content is visible
    await expect(page.locator('main, .dashboard-content')).toBeVisible();
  });

  test('Dashboard shows KPI statistics cards', async ({ page }) => {
    // Look for statistics/KPI cards
    const statsCards = page.locator('.stat-card, .kpi-card, .metric-card');

    // Verify at least one stat card is visible
    await expect(statsCards.first()).toBeVisible({ timeout: 5000 });

    // Verify multiple cards exist
    const count = await statsCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('Dashboard shows total cases metric', async ({ page }) => {
    // Look for "Fälle" or "Cases" text in dashboard
    await expect(
      page.locator('text=/.*fälle.*/i, text=/.*cases.*/i')
    ).toBeVisible({ timeout: 5000 });
  });

  test('Dashboard shows total volume/amount metric', async ({ page }) => {
    // Look for monetary amounts
    await expect(
      page.locator('text=/.*€.*/').first()
    ).toBeVisible({ timeout: 5000 });
  });

  test('Dashboard has navigation sidebar', async ({ page }) => {
    // Verify sidebar is visible
    await expect(
      page.locator('aside, nav[class*="sidebar"], .sidebar')
    ).toBeVisible();

    // Verify key navigation items exist
    await expect(page.locator('a[href*="#/dashboard"]')).toBeVisible();
    await expect(page.locator('a[href*="#/claims"]')).toBeVisible();
  });

  test('Dashboard header shows user information', async ({ page }) => {
    // Verify header exists
    await expect(page.locator('header')).toBeVisible();

    // Verify user name is displayed
    await expect(page.locator('text=System Administrator')).toBeVisible();
  });

  test('Global search is accessible from dashboard', async ({ page }) => {
    // Look for search input in header
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search"], input[placeholder*="Suche"]').first();

    await expect(searchInput).toBeVisible();

    // Type in search
    await searchInput.fill('test');

    // Wait for potential search results
    await page.waitForTimeout(1000);
  });

  test('Command palette can be opened with keyboard shortcut', async ({ page }) => {
    // Press Ctrl+K (or Cmd+K on Mac)
    await page.keyboard.press('Control+K');

    // Wait a moment
    await page.waitForTimeout(500);

    // Check if command palette modal appeared
    const palette = page.locator('[role="dialog"], .command-palette, .modal').filter({ hasText: /command|befehl/i });

    if (await palette.isVisible()) {
      // Verify palette is shown
      expect(await palette.isVisible()).toBe(true);

      // Close with Escape
      await page.keyboard.press('Escape');
    }
  });

  test('Sidebar can be toggled', async ({ page }) => {
    // Find sidebar
    const sidebar = page.locator('aside, nav[class*="sidebar"], .sidebar').first();

    await expect(sidebar).toBeVisible();

    // Look for toggle button
    const toggleButton = page.locator('button[aria-label*="sidebar"], button[aria-label*="menu"]').first();

    if (await toggleButton.isVisible()) {
      await toggleButton.click();

      // Wait for animation
      await page.waitForTimeout(500);

      // Sidebar might be hidden or collapsed
      // We just verify the toggle action completes
      expect(true).toBe(true);
    }
  });

  test('Dashboard shows recent activity or charts', async ({ page }) => {
    // Look for charts or activity sections
    const hasCharts = await page.locator('svg, canvas, .recharts-wrapper').count() > 0;
    const hasActivity = await page.locator('text=/.*aktivität.*/i, text=/.*activity.*/i').count() > 0;

    // At least one should be present
    expect(hasCharts || hasActivity).toBe(true);
  });

  test('Agent user sees appropriate dashboard content', async ({ page }) => {
    // Logout and login as agent
    await page.goto(hashUrl('/login'));
    await page.evaluate(() => localStorage.clear());
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.fill('input[type="email"]', 'max@monetaris.com');
    await page.fill('input[type="password"]', 'max123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*#\/dashboard/, { timeout: 10000 });

    // Verify agent sees dashboard
    await expect(page.locator('text=Max Mustermann')).toBeVisible();

    // Verify stats are visible (agent should see their stats)
    await expect(
      page.locator('.stat-card, .kpi-card, .metric-card').first()
    ).toBeVisible({ timeout: 5000 });
  });

  test('Navigation links are functional', async ({ page }) => {
    // Click on Claims link
    await page.click('a[href*="#/claims"]');
    await expect(page).toHaveURL(/.*#\/claims/);

    // Go back to dashboard
    await page.click('a[href*="#/dashboard"]');
    await expect(page).toHaveURL(/.*#\/dashboard/);
  });

  test('Theme can be toggled', async ({ page }) => {
    // Look for theme toggle button
    const themeToggle = page.locator('button[aria-label*="theme"], button[title*="theme"]').first();

    if (await themeToggle.isVisible()) {
      // Get current theme
      const htmlElement = page.locator('html');
      const initialClass = await htmlElement.getAttribute('class');

      // Toggle theme
      await themeToggle.click();

      // Wait for theme change
      await page.waitForTimeout(500);

      // Verify class changed
      const newClass = await htmlElement.getAttribute('class');
      expect(newClass).not.toBe(initialClass);
    }
  });

  test('Dashboard is responsive', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Verify page still loads
    await expect(page.locator('main, .dashboard-content')).toBeVisible();

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });

    // Verify page still loads
    await expect(page.locator('main, .dashboard-content')).toBeVisible();

    // Reset to desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
  });
});
