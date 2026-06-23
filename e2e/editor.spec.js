import { test, expect } from '@playwright/test';
import { TEST_FORM_ID, makeTestForm, seedForm } from './helpers.js';

test.describe('Editor — P0 flows', () => {
  test.beforeEach(async ({ page }) => {
    const form = makeTestForm();
    await seedForm(page, form);
  });

  test('loads editor and shows form title', async ({ page }) => {
    await page.goto(`/editor.html?formId=${TEST_FORM_ID}`);
    const titleInput = page.locator('.dfb-editor-title-input');
    await expect(titleInput).toHaveValue('Form E2E Test');
  });

  test('edits form title', async ({ page }) => {
    await page.goto(`/editor.html?formId=${TEST_FORM_ID}`);
    const titleInput = page.locator('.dfb-editor-title-input');
    await titleInput.fill('Judul Baru');
    await titleInput.blur();
    await page.reload();
    await expect(titleInput).toHaveValue('Judul Baru');
  });

  test('adds a multiple choice question via toolbar', async ({ page }) => {
    await page.goto(`/editor.html?formId=${TEST_FORM_ID}`);
    const toolbarBtn = page.locator('.dfb-q-toolbar-btn[data-type="multiple_choice"]');
    await toolbarBtn.click();
    const cards = page.locator('.dfb-question-card');
    await expect(cards).toHaveCount(5);
  });

  test('duplicates a question', async ({ page }) => {
    await page.goto(`/editor.html?formId=${TEST_FORM_ID}`);
    const duplicateBtn = page.locator('.dfb-q-btn-duplicate').first();
    await duplicateBtn.click({ force: true });
    const cards = page.locator('.dfb-question-card');
    await expect(cards).toHaveCount(5);
  });

  test('deletes a question', async ({ page }) => {
    await page.goto(`/editor.html?formId=${TEST_FORM_ID}`);
    const deleteBtn = page.locator('.dfb-q-btn-delete').first();
    await deleteBtn.click({ force: true });
    const cards = page.locator('.dfb-question-card');
    await expect(cards).toHaveCount(3);
  });
});
