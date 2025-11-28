import { test, expect } from '@playwright/test';

// Helper to navigate with HashRouter
const hashUrl = (path: string) => `/#${path}`;

test.describe('Debtor Portal', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());

    // Login as debtor (max@muster.de / debtor123)
    await page.goto(hashUrl('/resolve'));
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.fill('input[type="email"]', 'max@muster.de');
    await page.fill('input[type="password"]', 'debtor123');
    await page.click('button[type="submit"]');

    // Wait for redirect to debtor portal
    await expect(page).toHaveURL(/.*#\/portal\/debtor/, { timeout: 10000 });
  });

  test('Debtor sees welcome message with their name', async ({ page }) => {
    // Wait for the welcome message to appear
    await expect(page.locator('text=Guten Tag, Max')).toBeVisible({ timeout: 10000 });
  });

  test('Debtor sees total balance (Offener Gesamtsaldo)', async ({ page }) => {
    // Wait for the total balance section to appear
    await expect(page.locator('text=Offener Gesamtsaldo')).toBeVisible({ timeout: 10000 });

    // Check that a Euro amount is displayed (e.g., € 2.500,00)
    await expect(page.locator('text=€').first()).toBeVisible();
  });

  test('Debtor sees their cases in the case list', async ({ page }) => {
    // Wait for the "Ihre Akten" section
    await expect(page.locator('text=Ihre Akten')).toBeVisible({ timeout: 10000 });

    // Check that at least one case is displayed with an invoice number
    // The debtor should have cases with invoice numbers like "RE-2024-001234" and "RE-2024-005678"
    await expect(page.locator('text=/RE-2024-\\d+/').first()).toBeVisible({ timeout: 10000 });
  });

  test('Debtor sees case count badge', async ({ page }) => {
    // The debtor has 2 cases seeded
    // Look for the case count badge near "Ihre Akten"
    const casesSection = page.locator('text=Ihre Akten').locator('..').locator('..');

    // Should show a badge with count (could be "2")
    await expect(casesSection.locator('span:has-text("2")')).toBeVisible({ timeout: 10000 });
  });

  test('Debtor sees action cards when they have open cases', async ({ page }) => {
    // Check for the three action cards
    // 1. Payment action
    await expect(
      page.locator('text=Zahlung tätigen')
        .or(page.locator('text=Jetzt zahlen'))
    ).toBeVisible({ timeout: 10000 });

    // 2. Installment plan
    await expect(page.locator('text=Ratenplan')).toBeVisible();

    // 3. Help & Contact
    await expect(page.locator('text=Hilfe & Kontakt')).toBeVisible();
  });

  test('Debtor can click on a case to see details', async ({ page }) => {
    // Wait for cases to load
    await expect(page.locator('text=Ihre Akten')).toBeVisible({ timeout: 10000 });

    // Wait for at least one case card to appear
    const caseCard = page.locator('text=/RE-2024-\\d+/').first();
    await expect(caseCard).toBeVisible({ timeout: 10000 });

    // Click on the case card (the clickable parent element)
    await caseCard.locator('..').locator('..').click();

    // Should navigate to detail view - check for "Zurück zur Übersicht" button
    await expect(page.locator('text=Zurück zur Übersicht')).toBeVisible({ timeout: 5000 });

    // Check that case details are shown
    await expect(page.locator('text=Forderung RE-2024').first()).toBeVisible();
  });

  test('Case detail shows financial breakdown', async ({ page }) => {
    // Wait for cases to load and click on first case
    await expect(page.locator('text=Ihre Akten')).toBeVisible({ timeout: 10000 });
    const caseCard = page.locator('text=/RE-2024-\\d+/').first();
    await expect(caseCard).toBeVisible({ timeout: 10000 });
    await caseCard.locator('..').locator('..').click();

    // Wait for detail view
    await expect(page.locator('text=Zurück zur Übersicht')).toBeVisible({ timeout: 5000 });

    // Check for financial breakdown sections
    await expect(page.locator('text=Rechnungsdatum')).toBeVisible();
    await expect(page.locator('text=Fällig Seit')).toBeVisible();
    await expect(page.locator('text=Hauptforderung')).toBeVisible();
    await expect(page.locator('text=Mahnkosten')).toBeVisible();
    await expect(page.locator('text=Gesamtsumme')).toBeVisible();
  });

  test('Case detail shows action buttons', async ({ page }) => {
    // Wait for cases to load and click on first case
    await expect(page.locator('text=Ihre Akten')).toBeVisible({ timeout: 10000 });
    const caseCard = page.locator('text=/RE-2024-\\d+/').first();
    await expect(caseCard).toBeVisible({ timeout: 10000 });
    await caseCard.locator('..').locator('..').click();

    // Wait for detail view
    await expect(page.locator('text=Zurück zur Übersicht')).toBeVisible({ timeout: 5000 });

    // Check for action buttons in sidebar
    await expect(page.locator('button:has-text("Jetzt bezahlen")')).toBeVisible();
    await expect(page.locator('button:has-text("Ratenzahlung")')).toBeVisible();
    await expect(page.locator('button:has-text("Frage stellen")')).toBeVisible();
  });

  test('Debtor can navigate back from case detail', async ({ page }) => {
    // Wait for cases to load and click on first case
    await expect(page.locator('text=Ihre Akten')).toBeVisible({ timeout: 10000 });
    const caseCard = page.locator('text=/RE-2024-\\d+/').first();
    await expect(caseCard).toBeVisible({ timeout: 10000 });
    await caseCard.locator('..').locator('..').click();

    // Wait for detail view
    const backButton = page.locator('text=Zurück zur Übersicht');
    await expect(backButton).toBeVisible({ timeout: 5000 });

    // Click back button
    await backButton.click();

    // Should be back on dashboard with welcome message
    await expect(page.locator('text=Guten Tag, Max')).toBeVisible({ timeout: 5000 });
  });

  test('Help chat opens when clicking Hilfe & Kontakt', async ({ page }) => {
    // Wait for the help button
    const helpButton = page.locator('text=Hilfe & Kontakt');
    await expect(helpButton).toBeVisible({ timeout: 10000 });

    // Click on help button
    await helpButton.click();

    // Check that chat widget opens - use heading specifically to avoid strict mode violation
    await expect(page.getByRole('heading', { name: 'Support' })).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Willkommen im Support-Chat')).toBeVisible();
  });
});
