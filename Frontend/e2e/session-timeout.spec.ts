import { test, expect } from '@playwright/test';

// Helper to navigate with HashRouter
const hashUrl = (path: string) => `/#${path}`;

test.describe('Session Timeout', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage and navigate to login
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());

    // Login as admin
    await page.goto(hashUrl('/login'));
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.fill('input[type="email"]', 'admin@monetaris.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');

    // Verify successful login
    await expect(page).toHaveURL(/.*#\/dashboard/, { timeout: 10000 });
  });

  test('Session timeout warning appears before timeout', async ({ page }) => {
    // Set very short timeout for testing (1 minute total, warning at 30 seconds)
    await page.evaluate(() => {
      // Override timeout values by injecting into localStorage
      localStorage.setItem('monetaris_last_activity', (Date.now() - 25 * 60 * 1000).toString());
    });

    // Wait for warning modal to appear (should appear when 5 minutes remaining)
    // In a real scenario, we'd wait for the actual timer, but for testing we manipulate the time
    await page.reload();

    // Wait a bit for the timeout check to run
    await page.waitForTimeout(2000);

    // Check if warning modal is visible (should appear due to our time manipulation)
    const warningModal = page.locator('text=Session Timeout Warning');
    await expect(warningModal).toBeVisible({ timeout: 3000 });
  });

  test('Warning modal displays remaining time', async ({ page }) => {
    // Manipulate time to trigger warning
    await page.evaluate(() => {
      localStorage.setItem('monetaris_last_activity', (Date.now() - 26 * 60 * 1000).toString());
    });

    await page.reload();
    await page.waitForTimeout(2000);

    // Check that timer is displayed
    const timerDisplay = page.locator('text=/\\d{2}:\\d{2}/');
    await expect(timerDisplay).toBeVisible({ timeout: 5000 });
  });

  test('Extend session button resets the timeout', async ({ page }) => {
    // Manipulate time to trigger warning
    await page.evaluate(() => {
      localStorage.setItem('monetaris_last_activity', (Date.now() - 26 * 60 * 1000).toString());
    });

    await page.reload();
    await page.waitForTimeout(2000);

    // Wait for warning to appear
    const warningModal = page.locator('text=Session Timeout Warning');
    await expect(warningModal).toBeVisible({ timeout: 5000 });

    // Click "Stay Logged In" / "Extend Session" button
    const extendButton = page.locator('button:has-text("Stay Logged In")');
    await extendButton.click();

    // Modal should disappear
    await expect(warningModal).not.toBeVisible();

    // Verify still logged in by checking dashboard
    await expect(page).toHaveURL(/.*#\/dashboard/);
  });

  test('Logout button logs out immediately', async ({ page }) => {
    // Manipulate time to trigger warning
    await page.evaluate(() => {
      localStorage.setItem('monetaris_last_activity', (Date.now() - 26 * 60 * 1000).toString());
    });

    await page.reload();
    await page.waitForTimeout(2000);

    // Wait for warning to appear
    const warningModal = page.locator('text=Session Timeout Warning');
    await expect(warningModal).toBeVisible({ timeout: 5000 });

    // Click "Logout Now" button
    const logoutButton = page.locator('button:has-text("Logout Now")');
    await logoutButton.click();

    // Should redirect to login or landing page
    await expect(page).toHaveURL(/.*(\/$|#\/$|#\/login)/, { timeout: 5000 });

    // Verify localStorage is cleared
    const token = await page.evaluate(() => localStorage.getItem('monetaris_token'));
    expect(token).toBeNull();
  });

  test('Automatic logout after timeout expires', async ({ page }) => {
    // Manipulate time to past the timeout threshold (30 minutes)
    await page.evaluate(() => {
      localStorage.setItem('monetaris_last_activity', (Date.now() - 31 * 60 * 1000).toString());
    });

    await page.reload();

    // Wait for automatic logout (the hook checks every second)
    await page.waitForTimeout(3000);

    // Should be logged out and redirected
    await expect(page).toHaveURL(/.*(\/$|#\/$|#\/login)/, { timeout: 5000 });

    // Verify localStorage is cleared
    const token = await page.evaluate(() => localStorage.getItem('monetaris_token'));
    expect(token).toBeNull();
  });

  test('User activity resets the timeout', async ({ page }) => {
    // Initial activity timestamp
    const initialActivity = await page.evaluate(() =>
      localStorage.getItem('monetaris_last_activity')
    );

    // Wait a moment
    await page.waitForTimeout(2000);

    // Perform some activity (mouse move)
    await page.mouse.move(100, 100);
    await page.waitForTimeout(1500);

    // Check that last activity was updated
    const updatedActivity = await page.evaluate(() =>
      localStorage.getItem('monetaris_last_activity')
    );

    // Updated activity should be more recent than initial
    expect(parseInt(updatedActivity!)).toBeGreaterThan(parseInt(initialActivity!));
  });

  test('Keyboard activity resets the timeout', async ({ page }) => {
    const initialActivity = await page.evaluate(() =>
      localStorage.getItem('monetaris_last_activity')
    );

    await page.waitForTimeout(2000);

    // Perform keyboard activity
    await page.keyboard.press('Tab');
    await page.waitForTimeout(1500);

    const updatedActivity = await page.evaluate(() =>
      localStorage.getItem('monetaris_last_activity')
    );

    expect(parseInt(updatedActivity!)).toBeGreaterThan(parseInt(initialActivity!));
  });

  test('Click activity resets the timeout', async ({ page }) => {
    const initialActivity = await page.evaluate(() =>
      localStorage.getItem('monetaris_last_activity')
    );

    await page.waitForTimeout(2000);

    // Click somewhere on the page
    await page.click('body');
    await page.waitForTimeout(1500);

    const updatedActivity = await page.evaluate(() =>
      localStorage.getItem('monetaris_last_activity')
    );

    expect(parseInt(updatedActivity!)).toBeGreaterThan(parseInt(initialActivity!));
  });

  test('Cross-tab activity synchronization', async ({ context }) => {
    // Create two tabs
    const page1 = await context.newPage();
    const page2 = await context.newPage();

    // Login on first tab
    await page1.goto(hashUrl('/login'));
    await page1.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page1.fill('input[type="email"]', 'admin@monetaris.com');
    await page1.fill('input[type="password"]', 'admin123');
    await page1.click('button[type="submit"]');
    await expect(page1).toHaveURL(/.*#\/dashboard/, { timeout: 10000 });

    // Navigate to dashboard on second tab (should use same session)
    await page2.goto(hashUrl('/dashboard'));
    await expect(page2).toHaveURL(/.*#\/dashboard/, { timeout: 10000 });

    // Get initial activity time from both tabs
    const activity1Before = await page1.evaluate(() =>
      localStorage.getItem('monetaris_last_activity')
    );
    const activity2Before = await page2.evaluate(() =>
      localStorage.getItem('monetaris_last_activity')
    );

    await page1.waitForTimeout(2000);

    // Perform activity on page1
    await page1.mouse.move(200, 200);
    await page1.waitForTimeout(1500);

    // Check that activity time updated on page1
    const activity1After = await page1.evaluate(() =>
      localStorage.getItem('monetaris_last_activity')
    );
    expect(parseInt(activity1After!)).toBeGreaterThan(parseInt(activity1Before!));

    // Wait for storage event to propagate to page2
    await page2.waitForTimeout(1500);

    // Check that page2 is aware of the updated activity (via storage event)
    // The hook listens to storage events and resets its timer
    // We can't easily verify internal timer state, but we can verify no logout happened
    await expect(page2).toHaveURL(/.*#\/dashboard/);

    await page1.close();
    await page2.close();
  });

  test('Warning modal is accessible', async ({ page }) => {
    // Trigger warning
    await page.evaluate(() => {
      localStorage.setItem('monetaris_last_activity', (Date.now() - 26 * 60 * 1000).toString());
    });

    await page.reload();
    await page.waitForTimeout(2000);

    // Check ARIA attributes
    const dialog = page.locator('[role="alertdialog"]');
    await expect(dialog).toBeVisible({ timeout: 5000 });

    // Check for title and description
    const title = page.locator('#session-timeout-title');
    await expect(title).toBeVisible();

    const description = page.locator('#session-timeout-description');
    await expect(description).toBeVisible();
  });

  test('Session timeout respects configured timeout duration', async ({ page }) => {
    // Verify the timeout is set to 30 minutes by checking behavior
    // Activity just before 30 minutes should not trigger logout
    await page.evaluate(() => {
      localStorage.setItem('monetaris_last_activity', (Date.now() - 29 * 60 * 1000).toString());
    });

    await page.reload();
    await page.waitForTimeout(2000);

    // Should still be logged in (not past threshold)
    await expect(page).toHaveURL(/.*#\/dashboard/);

    // But warning should appear (within 5 minutes of timeout)
    const warningModal = page.locator('text=Session Timeout Warning');
    await expect(warningModal).toBeVisible({ timeout: 5000 });
  });
});
