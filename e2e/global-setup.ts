// themes/typewind/frontend/tests/global-setup.ts
import { chromium } from '@playwright/test';
import { PREVIEW_URL } from './helpers/constant';
import * as path from 'path';
import * as fs from 'fs';
import { PasswordPage } from './pages/PasswordPage';

async function globalSetup() {
  console.log('Starting global setup...');
  const browser = await chromium.launch();
  const page = await browser.newPage();

  console.log(`Navigating to ${PREVIEW_URL}...`);
  const passwordPage = new PasswordPage(page);
  await passwordPage.navigateWithPasswordCheck('/');

   // Check if we're on the password page
  await page.waitForLoadState('networkidle');

  // Store the state for future use
  const storageStatePath = path.resolve('./e2e/storageState.json');
  console.log(`Saving storage state to ${storageStatePath}...`);
  await page.context().storageState({ path: storageStatePath });

  // Verify the file was created
  if (fs.existsSync(storageStatePath)) {
    console.log('Storage state file created successfully');
  } else {
    console.error('Failed to create storage state file');
  }

  await browser.close();
  console.log('Global setup completed');
}

export default globalSetup;
