import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('Step 1: Navigate to login page...');
    await page.goto('http://localhost:4001/#/login');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-results/step1-navigate.png', fullPage: true });

    console.log('Step 2: Wait for login form...');
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.screenshot({ path: 'test-results/step2-form-loaded.png', fullPage: true });

    console.log('Step 3: Fill email...');
    await page.fill('input[type="email"]', 'admin@monetaris.com');
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'test-results/step3-email-filled.png', fullPage: true });

    console.log('Step 4: Fill password...');
    await page.fill('input[type="password"]', 'admin123');
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'test-results/step4-password-filled.png', fullPage: true });

    console.log('Step 5: Click login button...');
    
    // Listen for console messages
    page.on('console', msg => console.log('Browser console:', msg.text()));
    
    await page.click('button[type="submit"]');
    
    // Wait for navigation or error
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'test-results/step5-after-submit.png', fullPage: true });

    console.log('Step 6: Check URL after login...');
    const finalUrl = page.url();
    console.log('Final URL:', finalUrl);

    // Check for dashboard content
    const pageText = await page.textContent('body');
    console.log('\n=== PAGE CONTENT CHECK ===');
    console.log('Contains "Cockpit":', pageText.includes('Cockpit'));
    console.log('Contains "Dashboard":', pageText.includes('Dashboard'));
    console.log('Contains "System Administrator":', pageText.includes('System Administrator'));
    
    // Check localStorage
    const authToken = await page.evaluate(() => localStorage.getItem('auth_token'));
    console.log('\n=== AUTH STATE ===');
    console.log('Auth token exists:', !!authToken);
    
    if (finalUrl.includes('#/dashboard')) {
      console.log('\n✅ TEST PASSED: Login successful, redirected to dashboard');
    } else {
      console.log('\n❌ TEST FAILED: Login did not redirect to dashboard');
      console.log('Expected URL to contain: #/dashboard');
      console.log('Actual URL:', finalUrl);
    }

    await page.waitForTimeout(2000);
  } catch (error) {
    console.error('Error during test:', error);
    await page.screenshot({ path: 'test-results/error-screenshot.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();
