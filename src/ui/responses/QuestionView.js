export class QuestionView {
  /**
   * @param {Array} responses
   * @param {Array<{questionId: string, title: string, type: string}>} questions
   * @returns {HTMLElement}
   */
  static create(responses, questions) {
    const container = document.createElement('div');
    container.className = 'dfb-question-view';

    const activeQuestions = questions.filter((q) => q.type !== 'section_header');

    if (responses.length === 0) {
      const empty = document.createElement('div');
      empty.style.cssText = 'text-align:center;padding:48px 24px;color:var(--dfb-text-secondary,#5F6368);';
      empty.textContent = 'Belum ada respons untuk ditampilkan.';
      container.appendChild(empty);
      return container;
    }

    activeQuestions.forEach((q) => {
      const card = document.createElement('div');
      card.className = 'dfb-qview-card';

      const qTitle = document.createElement('h3');
      qTitle.className = 'dfb-qview-title';
      qTitle.textContent = q.title || 'Pertanyaan';
      card.appendChild(qTitle);

      const answerList = document.createElement('div');
      answerList.className = 'dfb-qview-answers';

      responses.forEach((r, ri) => {
        const answer = (r.answers || []).find((a) => a.questionId === q.questionId);
        if (!answer || answer.value == null || answer.value === '') return;

        const row = document.createElement('div');
        row.className = 'dfb-qview-row';

        const num = document.createElement('span');
        num.className = 'dfb-qview-row-num';
        num.textContent = String(ri + 1);
        row.appendChild(num);

        const val = document.createElement('span');
        val.className = 'dfb-qview-row-val';
        val.textContent = formatAnswerValue(answer);
        row.appendChild(val);

        answerList.appendChild(row);
      });

      if (answerList.children.length === 0) {
        const emptyP = document.createElement('p');
        emptyP.className = 'dfb-qview-empty';
        emptyP.textContent = 'Tidak ada jawaban untuk pertanyaan ini.';
        answerList.appendChild(emptyP);
      }

      card.appendChild(answerList);
      container.appendChild(card);
    });

    return container;
  }
}

function formatAnswerValue(answer) {
  const val = answer.value;
  if (val == null) return '-';

  if (typeof val === 'string') return val || '-';

  if (Array.isArray(val)) {
    if (val.length === 0) return '-';
    return val.join(', ');
  }

  if (typeof val === 'object') {
    const parts = Object.entries(val).map(([k, v]) => {
      const vStr = Array.isArray(v) ? v.join(', ') : String(v);
      return `${k}: ${vStr}`;
    });
    return parts.join(' | ');
  }

  return String(val);
}
