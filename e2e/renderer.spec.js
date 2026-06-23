import { test, expect } from '@playwright/test';
import { TEST_FORM_ID, makeTestForm, seedForm } from './helpers.js';

test.describe('Renderer — P0 flows', () => {
  test.beforeEach(async ({ page }) => {
    const form = makeTestForm();
    await seedForm(page, form);
  });

  test('loads form and shows title', async ({ page }) => {
    await page.goto(`/form.html?formId=${TEST_FORM_ID}`);
    await expect(page.locator('h1')).toHaveText('Form E2E Test');
  });

  test('fills short answer and navigates to next section', async ({ page }) => {
    await page.goto(`/form.html?formId=${TEST_FORM_ID}`);
    const input = page.locator('.gf-input').first();
    await input.fill('Budi');
    const radio = page.locator('.gf-radio-input').first();
    await radio.check({ force: true });
    await page.locator('button:has-text("Berikutnya")').click();
    await expect(page.locator('h1')).toHaveText('Form E2E Test');
  });

  test('shows error when required field is empty', async ({ page }) => {
    await page.goto(`/form.html?formId=${TEST_FORM_ID}`);
    await page.locator('button:has-text("Berikutnya")').click();
    const error = page.locator('.gf-error-msg').first();
    await expect(error).toBeVisible();
  });

  test('submits form and shows confirmation', async ({ page }) => {
    await page.goto(`/form.html?formId=${TEST_FORM_ID}`);
    const input = page.locator('.gf-input').first();
    await input.fill('Budi');
    const radio = page.locator('.gf-radio-input').first();
    await radio.check({ force: true });
    await page.locator('button:has-text("Berikutnya")').click();
    await page.locator('button:has-text("Kirim")').click();
    await expect(page.locator('text=Terima kasih!')).toBeVisible();
  });
});
