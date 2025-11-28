import { test, expect } from '@playwright/test';

// Helper to navigate with HashRouter
const hashUrl = (path: string) => `/#${path}`;

// Known seeded IDs from DatabaseSeeder
const SEEDED_KREDITOR_ID = '00000000-0000-0000-0000-000000000001';
const SEEDED_DEBTOR_ID = '00000000-0000-0000-0000-000000000099'; // Portal test debtor

test.describe('Detail Page Routing - Direct Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());

    // Login as admin
    await page.goto(hashUrl('/login'));
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.fill('input[type="email"]', 'admin@monetaris.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');

    // Wait for login to complete
    await expect(page).toHaveURL(/.*#\/dashboard/, { timeout: 15000 });
  });

  test('Direct navigation to Client detail page renders content', async ({ page }) => {
    // Navigate directly to client detail page using known seeded ID
    await page.goto(hashUrl(`/clients/${SEEDED_KREDITOR_ID}`));

    // Wait for navigation and API calls to complete
    await page.waitForTimeout(5000);

    // Check URL is correct
    expect(page.url()).toContain(`#/clients/${SEEDED_KREDITOR_ID}`);

    // Page should NOT be blank - check for any content
    const bodyText = await page.locator('body').textContent();
    console.log('Client detail page body content length:', bodyText?.length);

    // Check for one of the expected states:
    // 1. Loading state
    // 2. Error state (client not found)
    // 3. Actual client data
    const loadingText = page.locator('text=Lade Mandantenakte');
    const errorText = page.locator('text=Mandant nicht gefunden');
    const notFoundText = page.locator('text=nicht gefunden');
    const companyName = page.locator('h1');
    const backButton = page.locator('button:has-text("Zurück")');
    const statsCard = page.locator('text=/€/');

    const isLoading = await loadingText.isVisible().catch(() => false);
    const hasError = await errorText.isVisible().catch(() => false);
    const hasNotFound = await notFoundText.isVisible().catch(() => false);
    const hasCompanyName = await companyName.isVisible().catch(() => false);
    const hasBackButton = await backButton.isVisible().catch(() => false);
    const hasStats = await statsCard.first().isVisible().catch(() => false);

    console.log('States:', { isLoading, hasError, hasNotFound, hasCompanyName, hasBackButton, hasStats });

    // Page should render SOMETHING (not blank)
    const hasContent = isLoading || hasError || hasNotFound || hasCompanyName || hasBackButton || hasStats;
    expect(hasContent).toBe(true);
  });

  test('Direct navigation to Debtor detail page renders content', async ({ page }) => {
    // Navigate directly to debtor detail page using known seeded ID
    await page.goto(hashUrl(`/debtors/${SEEDED_DEBTOR_ID}`));

    // Wait for navigation and API calls to complete
    await page.waitForTimeout(5000);

    // Check URL is correct
    expect(page.url()).toContain(`#/debtors/${SEEDED_DEBTOR_ID}`);

    // Page should NOT be blank - check for any content
    const bodyText = await page.locator('body').textContent();
    console.log('Debtor detail page body content length:', bodyText?.length);

    // Check for one of the expected states:
    // 1. Loading state
    // 2. Error state (debtor not found)
    // 3. Actual debtor data
    const loadingText = page.locator('text=Lade Schuldnerakte');
    const errorText = page.locator('text=Schuldner nicht gefunden');
    const notFoundText = page.locator('text=nicht gefunden');
    const debtorName = page.locator('h1');
    const backButton = page.locator('button:has-text("Zurück")');
    const statsCard = page.locator('text=/€/');

    const isLoading = await loadingText.isVisible().catch(() => false);
    const hasError = await errorText.isVisible().catch(() => false);
    const hasNotFound = await notFoundText.isVisible().catch(() => false);
    const hasDebtorName = await debtorName.isVisible().catch(() => false);
    const hasBackButton = await backButton.isVisible().catch(() => false);
    const hasStats = await statsCard.first().isVisible().catch(() => false);

    console.log('States:', { isLoading, hasError, hasNotFound, hasDebtorName, hasBackButton, hasStats });

    // Page should render SOMETHING (not blank)
    const hasContent = isLoading || hasError || hasNotFound || hasDebtorName || hasBackButton || hasStats;
    expect(hasContent).toBe(true);
  });

  test('Client detail page is not completely blank', async ({ page }) => {
    // Navigate directly to client detail page
    await page.goto(hashUrl(`/clients/${SEEDED_KREDITOR_ID}`));
    await page.waitForTimeout(5000);

    // Take screenshot for debugging
    await page.screenshot({ path: 'test-results/client-detail-page.png', fullPage: true });

    // Get all visible text on the page
    const bodyText = await page.locator('body').textContent();

    // Page should have meaningful content (more than just whitespace)
    expect(bodyText?.trim().length).toBeGreaterThan(50);
  });

  test('Debtor detail page is not completely blank', async ({ page }) => {
    // Navigate directly to debtor detail page
    await page.goto(hashUrl(`/debtors/${SEEDED_DEBTOR_ID}`));
    await page.waitForTimeout(5000);

    // Take screenshot for debugging
    await page.screenshot({ path: 'test-results/debtor-detail-page.png', fullPage: true });

    // Get all visible text on the page
    const bodyText = await page.locator('body').textContent();

    // Page should have meaningful content (more than just whitespace)
    expect(bodyText?.trim().length).toBeGreaterThan(50);
  });

  test('Navigation from clients list to client detail works', async ({ page }) => {
    // Go to clients list
    await page.goto(hashUrl('/clients'));
    await page.waitForTimeout(2000);

    // Wait for data to load
    const openButton = page.locator('button:has-text("Akte öffnen")').first();
    const buttonExists = await openButton.isVisible({ timeout: 5000 }).catch(() => false);

    if (buttonExists) {
      await openButton.click();
      await page.waitForTimeout(2000);

      // Should be on detail page
      expect(page.url()).toMatch(/.*#\/clients\/[a-f0-9-]+/);

      // Page should have content
      const bodyText = await page.locator('body').textContent();
      expect(bodyText?.trim().length).toBeGreaterThan(50);
    } else {
      // No clients in database - that's okay, test passes
      console.log('No clients found to test navigation');
    }
  });

  test('Navigation from debtors list to debtor detail works', async ({ page }) => {
    // Go to debtors list
    await page.goto(hashUrl('/debtors'));
    await page.waitForTimeout(2000);

    // Look for debtor cards - they might have "Akte öffnen" button or be clickable
    const openButton = page.locator('button:has-text("Akte öffnen")').first();
    const debtorCard = page.locator('[data-testid="debtor-card"]').first();
    const debtorLink = page.locator('a[href*="/debtors/"]').first();

    const hasOpenButton = await openButton.isVisible({ timeout: 5000 }).catch(() => false);
    const hasDebtorCard = await debtorCard.isVisible().catch(() => false);
    const hasDebtorLink = await debtorLink.isVisible().catch(() => false);

    if (hasOpenButton) {
      await openButton.click();
    } else if (hasDebtorLink) {
      await debtorLink.click();
    } else if (hasDebtorCard) {
      await debtorCard.click();
    } else {
      // No debtors in database - that's okay, test passes
      console.log('No debtors found to test navigation');
      return;
    }

    await page.waitForTimeout(2000);

    // Should be on detail page
    expect(page.url()).toMatch(/.*#\/debtors\/[a-f0-9-]+/);

    // Page should have content
    const bodyText = await page.locator('body').textContent();
    expect(bodyText?.trim().length).toBeGreaterThan(50);
  });
});
