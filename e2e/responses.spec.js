import { test, expect } from '@playwright/test';
import { TEST_FORM_ID, makeTestForm, seedForm, seedResponse } from './helpers.js';

test.describe('Response Viewer — P0 flows', () => {
  test.beforeEach(async ({ page }) => {
    const form = makeTestForm();
    await seedForm(page, form);
    await seedResponse(page, TEST_FORM_ID);
  });

  test('loads response dashboard', async ({ page }) => {
    await page.goto(`/responses.html?formId=${TEST_FORM_ID}`);
    await expect(page.locator('.dfb-tab--active')).toHaveText('Ringkasan');
  });

  test('shows response count', async ({ page }) => {
    await page.goto(`/responses.html?formId=${TEST_FORM_ID}`);
    await expect(page.locator('text=1').first()).toBeVisible();
  });
});
