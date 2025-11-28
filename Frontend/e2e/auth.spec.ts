import { test, expect } from '@playwright/test';

// Helper to navigate with HashRouter
const hashUrl = (path: string) => `/#${path}`;

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('Admin can login and access dashboard', async ({ page }) => {
    // Navigate directly to login page (more reliable than dropdown)
    await page.goto(hashUrl('/login'));

    // Wait for login page to load
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });

    // Fill credentials (admin@monetaris.com / admin123)
    await page.fill('input[type="email"]', 'admin@monetaris.com');
    await page.fill('input[type="password"]', 'admin123');

    // Submit form
    await page.click('button[type="submit"]');

    // Verify redirect to dashboard (HashRouter uses /#/dashboard)
    await expect(page).toHaveURL(/.*#\/dashboard/, { timeout: 10000 });

    // Verify admin is logged in (check for user name)
    await expect(page.locator('text=System Administrator')).toBeVisible();
  });

  test('Agent can login with valid credentials', async ({ page }) => {
    // Navigate directly to login page (HashRouter)
    await page.goto(hashUrl('/login'));

    // Wait for login form
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });

    // Login as agent (max@monetaris.com / max123)
    await page.fill('input[type="email"]', 'max@monetaris.com');
    await page.fill('input[type="password"]', 'max123');
    await page.click('button[type="submit"]');

    // Verify successful login
    await expect(page).toHaveURL(/.*#\/dashboard/, { timeout: 10000 });
    await expect(page.locator('text=Max Mustermann')).toBeVisible();
  });

  test('Invalid credentials show error', async ({ page }) => {
    await page.goto(hashUrl('/login'));

    await page.waitForSelector('input[type="email"]', { timeout: 10000 });

    await page.fill('input[type="email"]', 'wrong@email.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Wait for error to appear - error message is "Ungültige Zugangsdaten."
    // Try multiple selectors for robustness
    await expect(
      page.locator('text=Ungültige Zugangsdaten')
        .or(page.locator('.text-red-500'))
        .or(page.locator('[class*="error"]'))
    ).toBeVisible({ timeout: 10000 });

    // Verify still on login page
    await expect(page).toHaveURL(/.*#\/login/);
  });

  test('User can logout', async ({ page }) => {
    // Login first
    await page.goto(hashUrl('/login'));
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });

    await page.fill('input[type="email"]', 'admin@monetaris.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*#\/dashboard/, { timeout: 10000 });

    // Wait for sidebar to be fully loaded
    await page.waitForSelector('aside', { timeout: 5000 });

    // Click logout button in sidebar (it's a button with LogOut icon in the footer)
    // The logout button is the last button in the sidebar footer area
    const logoutButton = page.locator('aside button').last();
    await logoutButton.click();

    // Verify redirect to landing page (not logged in = redirect to /)
    await expect(page).toHaveURL(/.*(\/$|#\/$|#$)/, { timeout: 5000 });
  });

  test('Client can login via client portal', async ({ page }) => {
    await page.goto(hashUrl('/client-login'));

    await page.waitForSelector('input[type="email"]', { timeout: 10000 });

    // Login as client (client@techsolutions.de / client123)
    await page.fill('input[type="email"]', 'client@techsolutions.de');
    await page.fill('input[type="password"]', 'client123');
    await page.click('button[type="submit"]');

    // Verify redirect to client portal
    await expect(page).toHaveURL(/.*#\/portal\/client/, { timeout: 10000 });
  });

  test('Debtor can login via Resolution Center', async ({ page }) => {
    await page.goto(hashUrl('/resolve'));

    await page.waitForSelector('input[type="email"]', { timeout: 10000 });

    // Login as debtor (max@muster.de / debtor123)
    await page.fill('input[type="email"]', 'max@muster.de');
    await page.fill('input[type="password"]', 'debtor123');
    await page.click('button[type="submit"]');

    // Verify redirect to debtor portal
    await expect(page).toHaveURL(/.*#\/portal\/debtor/, { timeout: 10000 });
  });

  test('Session persists on page reload', async ({ page }) => {
    // Login
    await page.goto(hashUrl('/login'));
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });

    await page.fill('input[type="email"]', 'admin@monetaris.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*#\/dashboard/, { timeout: 10000 });

    // Reload page
    await page.reload();

    // Verify still logged in
    await expect(page).toHaveURL(/.*#\/dashboard/);
    await expect(page.locator('text=System Administrator')).toBeVisible();
  });

  test('Protected routes redirect to landing when not authenticated', async ({ page }) => {
    // Try to access dashboard without being logged in
    await page.goto(hashUrl('/dashboard'));

    // Should redirect to landing page (/) - not /login
    // App.tsx line 98: !user ? <Navigate to="/" replace />
    await expect(page).toHaveURL(/.*(\/$|#\/$|#$)/, { timeout: 5000 });
  });
});
