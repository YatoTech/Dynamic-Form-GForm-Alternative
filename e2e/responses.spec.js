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
    await expect(page.locator('.dfb-response-tabs .dfb-tab--active')).toHaveText('Ringkasan');
  });

  test('shows response count', async ({ page }) => {
    await page.goto(`/responses.html?formId=${TEST_FORM_ID}`);
    await expect(page.locator('text=1').first()).toBeVisible();
  });

  test('navigates and verifies question view selector and answer grouping', async ({ page }) => {
    await page.goto(`/responses.html?formId=${TEST_FORM_ID}`);
    
    // Click on "Pertanyaan" sub-tab specifically within .dfb-response-tabs
    await page.click('.dfb-response-tabs button[data-view="question"]');
    await expect(page.locator('.dfb-response-tabs .dfb-tab--active')).toHaveText('Pertanyaan');

    // Verify selector elements are visible
    await expect(page.locator('.dfb-qview-select')).toBeVisible();
    await expect(page.locator('.dfb-qview-title')).toHaveText('Nama Lengkap');

    // Verify grouped answer is visible
    await expect(page.locator('.dfb-qview-row-val')).toHaveText('Budi');
    await expect(page.locator('.dfb-qview-row-count')).toHaveText('1 jawaban');
  });

  test('navigates and verifies individual view question pre-filling', async ({ page }) => {
    await page.goto(`/responses.html?formId=${TEST_FORM_ID}`);

    // Click on "Individual" sub-tab specifically within .dfb-response-tabs
    await page.click('.dfb-response-tabs button[data-view="individual"]');
    await expect(page.locator('.dfb-response-tabs .dfb-tab--active')).toHaveText('Individual');

    // Verify navigation details
    await expect(page.locator('.dfb-individual-info')).toHaveText('1 dari 1');

    // Verify visual elements of individual view card
    await expect(page.locator('.dfb-individual-qtitle').first()).toHaveText('Nama Lengkap');
    
    // The input should be disabled and contain Budi
    const input = page.locator('.dfb-individual-text-field').first();
    await expect(input).toBeDisabled();
    await expect(input).toHaveValue('Budi');
  });
});

