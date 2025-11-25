import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('Admin can login and access dashboard', async ({ page }) => {
    await page.goto('/');

    // Navigate to login
    await page.click('text=Login');
    await expect(page).toHaveURL(/.*login/);

    // Fill credentials (from mockData: admin@monetaris.com / password)
    await page.fill('input[type="email"]', 'admin@monetaris.com');
    await page.fill('input[type="password"]', 'password');

    // Submit form
    await page.click('button[type="submit"]');

    // Verify redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 });

    // Verify admin is logged in (check for user name)
    await expect(page.locator('text=System Administrator')).toBeVisible();
  });

  test('Agent can login with valid credentials', async ({ page }) => {
    await page.goto('/login');

    // Login as agent (max@monetaris.com / password)
    await page.fill('input[type="email"]', 'max@monetaris.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');

    // Verify successful login
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 });
    await expect(page.locator('text=Max Mustermann')).toBeVisible();
  });

  test('Invalid credentials show error', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[type="email"]', 'wrong@email.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Verify error message
    await expect(page.locator('text=/.*ungültige.*zugangsdaten.*/i')).toBeVisible();

    // Verify still on login page
    await expect(page).toHaveURL(/.*login/);
  });

  test('User can logout', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@monetaris.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 });

    // Click user menu in header
    await page.click('[data-testid="user-menu"]').catch(async () => {
      // Fallback: click on user name/avatar area
      await page.click('text=System Administrator');
    });

    // Click logout button
    await page.click('text=/.*logout.*/i');

    // Verify redirect to landing or login page
    await expect(page).toHaveURL(/.*(\/$|\/login)/);
  });

  test('Client can login via client portal', async ({ page }) => {
    await page.goto('/client-login');

    // Login as client (client@techsolutions.de / password)
    await page.fill('input[type="email"]', 'client@techsolutions.de');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');

    // Verify redirect to client portal
    await expect(page).toHaveURL(/.*portal\/client/, { timeout: 10000 });
  });

  test('Session persists on page reload', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@monetaris.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 });

    // Reload page
    await page.reload();

    // Verify still logged in
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator('text=System Administrator')).toBeVisible();
  });

  test('Protected routes redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/dashboard');

    // Should redirect to login
    await expect(page).toHaveURL(/.*login/);
  });
});
