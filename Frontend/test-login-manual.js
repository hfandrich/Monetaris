const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('Step 1: Navigate to login page...');
  await page.goto('http://localhost:4001/#/login');
  await page.screenshot({ path: 'test-results/step1-navigate.png', fullPage: true });

  console.log('Step 2: Wait for login form...');
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });
  await page.screenshot({ path: 'test-results/step2-form-loaded.png', fullPage: true });

  console.log('Step 3: Fill email...');
  await page.fill('input[type="email"]', 'admin@monetaris.com');
  await page.screenshot({ path: 'test-results/step3-email-filled.png', fullPage: true });

  console.log('Step 4: Fill password...');
  await page.fill('input[type="password"]', 'admin123');
  await page.screenshot({ path: 'test-results/step4-password-filled.png', fullPage: true });

  console.log('Step 5: Click login button...');
  await page.click('button[type="submit"]');
  
  // Wait a bit for navigation
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'test-results/step5-after-submit.png', fullPage: true });

  console.log('Step 6: Check URL after login...');
  const currentUrl = page.url();
  console.log('Current URL:', currentUrl);

  // Wait for potential redirect
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'test-results/step6-final-page.png', fullPage: true });
  
  const finalUrl = page.url();
  console.log('Final URL:', finalUrl);

  // Check for dashboard content
  const pageContent = await page.content();
  console.log('Page contains "Cockpit":', pageContent.includes('Cockpit'));
  console.log('Page contains "Dashboard":', pageContent.includes('Dashboard'));

  await browser.close();
})();
