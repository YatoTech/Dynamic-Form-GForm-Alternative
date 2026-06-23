export const TEST_FORM_ID = 'test-form-e2e';

export function makeTestForm() {
  const now = new Date().toISOString();
  return {
    formId: TEST_FORM_ID,
    metadata: {
      title: 'Form E2E Test',
      description: 'Form untuk pengujian E2E',
      createdAt: now,
      updatedAt: now,
      isAcceptingResponses: true,
      showProgressBar: true,
      confirmationMessage: 'Terima kasih!',
    },
    sections: [
      { sectionId: 's1', title: 'Data Diri', description: '', questionIds: ['q1', 'q2'] },
      { sectionId: 's2', title: 'Feedback', description: '', questionIds: ['q3', 'q4'] },
    ],
    questions: [
      {
        questionId: 'q1',
        type: 'short_answer',
        title: 'Nama Lengkap',
        description: '',
        required: true,
        order: 0,
        validation: { required: true },
        options: {},
      },
      {
        questionId: 'q2',
        type: 'multiple_choice',
        title: 'Jenis Kelamin',
        description: '',
        required: true,
        order: 1,
        validation: { required: true },
        options: { choices: ['Laki-laki', 'Perempuan'] },
      },
      {
        questionId: 'q3',
        type: 'paragraph',
        title: 'Kritik & Saran',
        description: '',
        required: false,
        order: 2,
        validation: {},
        options: {},
      },
      {
        questionId: 'q4',
        type: 'checkboxes',
        title: 'Layanan yang digunakan',
        description: '',
        required: false,
        order: 3,
        validation: {},
        options: { choices: ['Produk A', 'Produk B', 'Produk C'] },
      },
    ],
    theme: { preset: 'default' },
  };
}

export async function seedForm(page, form) {
  await page.goto('/');
  await page.evaluate((f) => {
    localStorage.setItem('dfb:form_index', JSON.stringify([{ formId: f.formId, responseCount: 0 }]));
    localStorage.setItem(`dfb:form:${f.formId}`, JSON.stringify(f));
  }, form);
}

export async function seedResponse(page, formId) {
  await page.evaluate((fid) => {
    const responses = [
      {
        responseId: 'resp-e2e-1',
        formId: fid,
        submittedAt: new Date().toISOString(),
        startedAt: new Date(Date.now() - 120000).toISOString(),
        durationSeconds: 120,
        respondentId: 'anon-test-1',
        answers: [
          { questionId: 'q1', questionType: 'short_answer', value: 'Budi' },
          { questionId: 'q2', questionType: 'multiple_choice', value: 'Laki-laki' },
          { questionId: 'q3', questionType: 'paragraph', value: 'Bagus!' },
          { questionId: 'q4', questionType: 'checkboxes', value: ['Produk A', 'Produk C'] },
        ],
      },
    ];
    localStorage.setItem('dfb:responses', JSON.stringify(responses));
  }, formId);
}
