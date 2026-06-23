import { test, expect } from '@playwright/test';
import { TEST_FORM_ID, makeTestForm, seedForm, seedResponse } from './helpers.js';

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

  test('renders and submits "Other" option in multiple choice and checkboxes', async ({ page }) => {
    const form = makeTestForm();
    form.questions[1].options.includeOther = true; // q2
    form.questions[3].options.includeOther = true; // q4
    await seedForm(page, form);

    await page.goto(`/form.html?formId=${TEST_FORM_ID}`);
    
    // Fill required Name
    const input = page.locator('.gf-input').first();
    await input.fill('Budi');

    // Click "Lainnya" radio in multiple choice
    const otherRadio = page.locator('input[type="radio"][value="__other__"]');
    await otherRadio.check({ force: true });
    
    // Fill custom multiple choice answer
    const otherTextRadio = page.locator('.gf-other-input').first();
    await expect(otherTextRadio).toBeVisible();
    await otherTextRadio.fill('Gender Custom');

    await page.locator('button:has-text("Berikutnya")').click();
    await page.waitForTimeout(500);

    // Click "Lainnya" checkbox in checkboxes
    const otherCheck = page.locator('input[type="checkbox"][value="__other__"]');
    await otherCheck.check({ force: true });

    // Fill custom checkbox answer
    const otherTextCheck = page.locator('.gf-other-input').first();
    await expect(otherTextCheck).toBeVisible();
    await otherTextCheck.fill('Produk Custom');

    await page.locator('button:has-text("Kirim")').click();
    await expect(page.locator('text=Terima kasih!')).toBeVisible();

    // Check responses in localStorage
    const responses = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('dfb:responses') || '[]');
    });
    expect(responses.length).toBe(1);
    const answers = responses[0].answers;
    expect(answers.find(a => a.questionId === 'q2').value).toBe('Gender Custom');
    expect(answers.find(a => a.questionId === 'q4').value).toContain('Produk Custom');
  });

  test('navigates forward and backward preserving answers', async ({ page }) => {
    await page.goto(`/form.html?formId=${TEST_FORM_ID}`);
    const input = page.locator('.gf-input').first();
    await input.fill('Budi');

    const radio = page.locator('.gf-radio-input').first();
    await radio.check({ force: true });

    // Navigate to next section
    await page.locator('button:has-text("Berikutnya")').click();
    await page.waitForTimeout(500);

    // Check we are on section 2
    await expect(page.locator('button:has-text("Sebelumnya")')).toBeVisible();

    // Navigate back
    await page.locator('button:has-text("Sebelumnya")').click();
    await page.waitForTimeout(500);

    // Verify section 1 values are preserved
    await expect(page.locator('.gf-input').first()).toHaveValue('Budi');
    await expect(page.locator('.gf-radio-input').first()).toBeChecked();
  });

  test('respects maxResponses limit', async ({ page }) => {
    const form = makeTestForm();
    form.metadata.maxResponses = 1;
    await seedForm(page, form);

    // Seed one response
    await seedResponse(page, TEST_FORM_ID);

    // Visit the form page
    await page.goto(`/form.html?formId=${TEST_FORM_ID}`);

    // Verify it shows the maxResponses limit reached message
    const closedCard = page.locator('.gf-closed-card');
    await expect(closedCard).toBeVisible();
    await expect(closedCard).toContainText('maksimal respons');
  });
});
