import { test, expect } from '@playwright/test';

test.describe('Case Workflow Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as agent before each test
    await page.goto('/login');
    await page.fill('input[type="email"]', 'max@monetaris.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 });
  });

  test('Agent can navigate to cases page', async ({ page }) => {
    // Click on Claims/Forderungen in sidebar
    await page.click('a[href*="/claims"]').catch(async () => {
      // Fallback: look for text
      await page.click('text=/.*forderungen.*/i');
    });

    await expect(page).toHaveURL(/.*claims/);

    // Verify cases table is visible
    await expect(page.locator('table, .case-list, .case-row')).toBeVisible();
  });

  test('Agent can view case details', async ({ page }) => {
    // Navigate to cases
    await page.goto('/claims');

    // Wait for cases to load
    await page.waitForSelector('table tbody tr, .case-row', { timeout: 10000 });

    // Click first case row
    await page.click('table tbody tr:first-child, .case-row:first-child');

    // Verify modal or detail page opens
    await expect(
      page.locator('.modal, [role="dialog"], .case-detail')
    ).toBeVisible({ timeout: 5000 });
  });

  test('Agent can filter cases by status', async ({ page }) => {
    await page.goto('/claims');

    // Wait for page to load
    await page.waitForTimeout(1000);

    // Look for status filter dropdown
    const statusFilter = page.locator('select[name*="status"], select:has-text("Status")').first();

    if (await statusFilter.isVisible()) {
      // Select a specific status
      await statusFilter.selectOption({ index: 1 });

      // Wait for filtered results
      await page.waitForTimeout(500);

      // Verify table still has content
      const rows = page.locator('table tbody tr, .case-row');
      await expect(rows.first()).toBeVisible();
    }
  });

  test('Agent can search for cases', async ({ page }) => {
    await page.goto('/claims');

    // Find search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search"], input[placeholder*="Suche"]').first();

    if (await searchInput.isVisible()) {
      await searchInput.fill('test');
      await page.waitForTimeout(500);

      // Results should update
      await expect(page.locator('table, .case-list')).toBeVisible();
    }
  });

  test('Agent can view case history/audit log', async ({ page }) => {
    await page.goto('/claims');

    // Wait for cases to load
    await page.waitForSelector('table tbody tr, .case-row', { timeout: 10000 });

    // Click first case
    await page.click('table tbody tr:first-child, .case-row:first-child');

    // Wait for modal
    await page.waitForSelector('.modal, [role="dialog"]', { timeout: 5000 });

    // Look for history/audit tab
    const historyTab = page.locator('button:has-text("Verlauf"), button:has-text("History"), button:has-text("Audit")').first();

    if (await historyTab.isVisible()) {
      await historyTab.click();

      // Verify history entries are visible
      await expect(
        page.locator('.history-entry, .audit-entry, .timeline-item')
      ).toBeVisible({ timeout: 5000 });
    }
  });

  test('Agent can view case documents', async ({ page }) => {
    await page.goto('/claims');

    // Wait for cases to load
    await page.waitForSelector('table tbody tr, .case-row', { timeout: 10000 });

    // Click first case
    await page.click('table tbody tr:first-child, .case-row:first-child');

    // Wait for modal
    await page.waitForSelector('.modal, [role="dialog"]', { timeout: 5000 });

    // Look for documents tab
    const docsTab = page.locator('button:has-text("Dokumente"), button:has-text("Documents"), button:has-text("Files")').first();

    if (await docsTab.isVisible()) {
      await docsTab.click();

      // Verify documents section is visible
      await expect(
        page.locator('.document-list, .file-list, text=/.*dokument.*/i')
      ).toBeVisible({ timeout: 3000 });
    }
  });

  test('Case detail modal shows financial information', async ({ page }) => {
    await page.goto('/claims');

    // Wait for cases to load
    await page.waitForSelector('table tbody tr, .case-row', { timeout: 10000 });

    // Click first case
    await page.click('table tbody tr:first-child, .case-row:first-child');

    // Wait for modal
    await page.waitForSelector('.modal, [role="dialog"]', { timeout: 5000 });

    // Verify financial fields are visible
    await expect(
      page.locator('text=/.*hauptforderung.*/i, text=/.*principal.*/i')
    ).toBeVisible();

    await expect(
      page.locator('text=/.*gesamt.*/i, text=/.*total.*/i')
    ).toBeVisible();
  });

  test('Agent can close case detail modal', async ({ page }) => {
    await page.goto('/claims');

    // Wait for cases to load
    await page.waitForSelector('table tbody tr, .case-row', { timeout: 10000 });

    // Click first case
    await page.click('table tbody tr:first-child, .case-row:first-child');

    // Wait for modal
    await page.waitForSelector('.modal, [role="dialog"]', { timeout: 5000 });

    // Close modal (X button, close button, or escape)
    await page.click('button:has-text("Schließen"), button:has-text("Close"), button[aria-label="Close"]').catch(async () => {
      // Fallback: press Escape
      await page.keyboard.press('Escape');
    });

    // Verify modal is closed
    await expect(page.locator('.modal, [role="dialog"]')).not.toBeVisible();
  });

  test('Cases table shows key columns', async ({ page }) => {
    await page.goto('/claims');

    // Wait for table to load
    await page.waitForSelector('table', { timeout: 10000 });

    // Verify key columns exist
    await expect(page.locator('th:has-text("Fall"), th:has-text("Case")')).toBeVisible();
    await expect(page.locator('th:has-text("Schuldner"), th:has-text("Debtor")')).toBeVisible();
    await expect(page.locator('th:has-text("Status")')).toBeVisible();
    await expect(page.locator('th:has-text("Betrag"), th:has-text("Amount")')).toBeVisible();
  });

  test('Agent can access debtors page', async ({ page }) => {
    // Navigate to debtors
    await page.click('a[href*="/debtors"]').catch(async () => {
      await page.click('text=/.*schuldner.*/i');
    });

    await expect(page).toHaveURL(/.*debtors/);

    // Verify debtors list is visible
    await expect(page.locator('table, .debtor-list')).toBeVisible();
  });
});
