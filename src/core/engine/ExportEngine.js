/**
 * ExportEngine — CSV/JSON export.
 * CSV HARUS UTF-8 + BOM untuk kompatibilitas Excel.
 */

/**
 * Mengekspor respons ke format CSV dengan BOM.
 * @param {Array<{responseId: string, submittedAt: string, durationSeconds: number, answers: Array<{questionId: string, questionType: string, value: *}>}>} responses
 * @param {Array<{questionId: string, title: string, type: string}>} questions
 * @returns {string} CSV string
 */
export function exportToCsv(responses, questions) {
  const activeQuestions = questions.filter((q) => q.type !== 'section_header');

  const headers = [
    'Response ID',
    'Submitted At',
    'Duration (s)',
    ...activeQuestions.map((q) => `"${escapeCsvField(q.title || 'Pertanyaan')}"`),
  ];

  const rows = responses.map((r) => {
    const ansMap = {};
    (r.answers || []).forEach((a) => {
      ansMap[a.questionId] = formatAnswerValue(a);
    });

    return [
      r.responseId,
      r.submittedAt,
      r.durationSeconds || 0,
      ...activeQuestions.map((q) => `"${escapeCsvField(ansMap[q.questionId] ?? '')}"`),
    ];
  });

  const bom = '\uFEFF';
  const csvRows = [headers.join(','), ...rows.map((r) => r.join(','))];
  return bom + csvRows.join('\n') + '\n';
}

/**
 * Mengekspor respons ke format JSON.
 * @param {Array} data
 * @returns {string} JSON string
 */
export function exportToJson(data) {
  return JSON.stringify(data, null, 2);
}

/**
 * Mengekspor definisi form ke JSON.
 * @param {Object} formDefinition
 * @returns {string} JSON string
 */
export function exportFormToJson(formDefinition) {
  return JSON.stringify(formDefinition, null, 2);
}

function formatAnswerValue(answer) {
  if (answer.value == null) return '';
  if (Array.isArray(answer.value)) return answer.value.join('; ');
  return String(answer.value);
}

function escapeCsvField(value) {
  return String(value).replace(/"/g, '""');
}
