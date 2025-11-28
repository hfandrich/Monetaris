import { test, expect } from '@playwright/test';

test.describe('Login Page - Security Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/#/login');
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
  });

  test('should have empty email and password fields on page load (no hardcoded credentials)', async ({ page }) => {
    // Find email input
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();

    // Find password input
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();

    // CRITICAL SECURITY TEST: Verify fields are empty (no pre-filled credentials)
    await expect(emailInput).toHaveValue('');
    await expect(passwordInput).toHaveValue('');
  });

  test('should require both email and password fields', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');

    // Check required attributes
    await expect(emailInput).toHaveAttribute('required', '');
    await expect(passwordInput).toHaveAttribute('required', '');
  });

  test('should validate email format', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');

    // Email input should have type="email" for browser validation
    await expect(emailInput).toHaveAttribute('type', 'email');
  });

  test('should mask password input', async ({ page }) => {
    const passwordInput = page.locator('input[type="password"]');

    // Password field should be masked (type="password")
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Type a password and verify it's masked
    await passwordInput.fill('test123');

    // The actual value should be set, but displayed as masked
    await expect(passwordInput).toHaveValue('test123');
  });

  test('should show error message for invalid credentials', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button[type="submit"]');

    // Fill in invalid credentials
    await emailInput.fill('invalid@example.com');
    await passwordInput.fill('wrongpassword');

    // Submit form
    await submitButton.click();

    // Wait for and verify error message appears
    const errorMessage = page.locator('text=/Ungültige Zugangsdaten/i');
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
  });

  test('should disable submit button during login attempt', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button[type="submit"]');

    // Fill in credentials
    await emailInput.fill('test@example.com');
    await passwordInput.fill('password123');

    // Check button is enabled before submit
    await expect(submitButton).toBeEnabled();

    // Submit form
    await submitButton.click();

    // Button should be disabled during processing (loading state)
    // Note: This might be brief, so we check immediately after click
    await expect(submitButton).toBeDisabled();
  });

  test('should have proper labels for accessibility', async ({ page }) => {
    // Check for email label
    const emailLabel = page.locator('text=/E-Mail Adresse/i');
    await expect(emailLabel).toBeVisible();

    // Check for password label
    const passwordLabel = page.locator('text=/Passwort/i');
    await expect(passwordLabel).toBeVisible();
  });

  test('should have autofocus on email field', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');

    // Email field should be focused on page load for better UX
    await expect(emailInput).toBeFocused();
  });
});
