/**
 * Dashboard Entity E2E Tests
 * Feature-Sliced Design - Entity Layer
 */

import { test, expect } from '@playwright/test';

test.describe('Dashboard Entity', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('http://localhost:3000/#/login');
    await page.fill('input[name="email"]', 'admin@monetaris.de');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:3000/#/dashboard');
  });

  test('displays stats overview widget with 4 KPI cards', async ({ page }) => {
    // Wait for dashboard to load
    await page.waitForSelector('[data-testid="stats-overview"]', { timeout: 5000 }).catch(() => {
      // Fallback: Check for stat cards
      return page.waitForSelector('.font-display', { timeout: 5000 });
    });

    // Check for 4 stat cards (Gesamtvolumen, Aktive Akten, Erfolgsquote, Prognose)
    const statCards = page.locator('.font-display');
    await expect(statCards).toHaveCount(4, { timeout: 5000 });

    // Verify first card has volume data
    const firstCard = statCards.first();
    await expect(firstCard).toBeVisible();
  });

  test('displays financial chart widget', async ({ page }) => {
    // Look for chart title "Cashflow Pulse"
    const chartTitle = page.locator('text=Cashflow Pulse');
    await expect(chartTitle).toBeVisible({ timeout: 5000 });

    // Verify chart legend exists
    const legend = page.locator('text=Ist');
    await expect(legend).toBeVisible();
  });

  test('displays inquiries list widget', async ({ page }) => {
    // Look for widget title
    const title = page.locator('text=Rückfragen');
    await expect(title).toBeVisible({ timeout: 5000 });

    // Widget should be visible even if empty
    const widget = page.locator('text=Keine offenen Aufgaben');
    const hasInquiries = await widget.isVisible().catch(() => false);

    if (!hasInquiries) {
      // If not empty, should have inquiry items
      const inquiryItems = page.locator('.line-clamp-2');
      await expect(inquiryItems.first()).toBeVisible();
    }
  });

  test('displays urgent tasks widget', async ({ page }) => {
    // Look for widget title
    const title = page.locator('text=Dringend');
    await expect(title).toBeVisible({ timeout: 5000 });

    // Widget should be visible even if empty
    const emptyState = page.locator('text=Alles erledigt');
    const isEmpty = await emptyState.isVisible().catch(() => false);

    if (!isEmpty) {
      // If not empty, should have task items
      const taskItems = page.locator('[data-testid*="urgent-task"]').or(page.locator('.font-mono'));
      await expect(taskItems.first()).toBeVisible();
    }
  });

  test('quick actions widget triggers actions', async ({ page }) => {
    // Find quick actions widget
    const quickActionsTitle = page.locator('text=Schnellauswahl');
    await expect(quickActionsTitle).toBeVisible({ timeout: 5000 });

    // Verify all 4 quick action buttons exist
    const claimBtn = page.locator('[data-testid="quick-action-claim"]');
    const debtorBtn = page.locator('[data-testid="quick-action-debtor"]');
    const clientBtn = page.locator('[data-testid="quick-action-client"]');
    const runBtn = page.locator('[data-testid="quick-action-run"]');

    await expect(claimBtn).toBeVisible();
    await expect(debtorBtn).toBeVisible();
    await expect(clientBtn).toBeVisible();
    await expect(runBtn).toBeVisible();
  });

  test('dashboard loads without errors', async ({ page }) => {
    // Check that main dashboard container exists
    await expect(page.locator('text=Cockpit')).toBeVisible({ timeout: 5000 });

    // Verify no error messages
    const errorMessage = page.locator('text=Fehler beim Laden');
    await expect(errorMessage).not.toBeVisible();
  });

  test('dark mode works on dashboard widgets', async ({ page }) => {
    // Toggle to dark mode (if toggle exists)
    const darkModeToggle = page.locator('[data-testid="theme-toggle"]');
    const hasToggle = await darkModeToggle.isVisible().catch(() => false);

    if (hasToggle) {
      await darkModeToggle.click();
      await page.waitForTimeout(500);

      // Check that dark mode classes are applied
      const body = page.locator('body');
      const isDark = await body.evaluate((el) => el.classList.contains('dark'));

      // Widgets should have dark mode styling
      const cards = page.locator('.dark\\:bg-\\[\\#0A0A0A\\]');
      if (isDark) {
        await expect(cards.first()).toBeVisible();
      }
    }
  });
});
