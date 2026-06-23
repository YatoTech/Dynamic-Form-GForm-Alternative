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
      empty.className = 'dfb-response-empty';
      empty.textContent = 'Belum ada jawaban untuk ditampilkan.';
      container.appendChild(empty);
      return container;
    }

    if (activeQuestions.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'dfb-response-empty';
      empty.textContent = 'Tidak ada pertanyaan aktif.';
      container.appendChild(empty);
      return container;
    }

    let activeIndex = 0;

    // Header selector card
    const selectorCard = document.createElement('div');
    selectorCard.className = 'dfb-qview-selector-card';

    const navGroup = document.createElement('div');
    navGroup.className = 'dfb-qview-nav-group';

    const prevBtn = document.createElement('button');
    prevBtn.className = 'dfb-qview-btn';
    prevBtn.innerHTML = `
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="15 18 9 12 15 6"/>
      </svg>
    `;
    prevBtn.title = 'Pertanyaan Sebelumnya';
    prevBtn.setAttribute('aria-label', 'Pertanyaan Sebelumnya');

    const select = document.createElement('select');
    select.className = 'dfb-qview-select';
    activeQuestions.forEach((q, idx) => {
      const opt = document.createElement('option');
      opt.value = idx;
      opt.textContent = `${idx + 1}. ${q.title || 'Pertanyaan tanpa judul'}`;
      select.appendChild(opt);
    });

    const nextBtn = document.createElement('button');
    nextBtn.className = 'dfb-qview-btn';
    nextBtn.innerHTML = `
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    `;
    nextBtn.title = 'Pertanyaan Berikutnya';
    nextBtn.setAttribute('aria-label', 'Pertanyaan Berikutnya');

    navGroup.appendChild(prevBtn);
    navGroup.appendChild(select);
    navGroup.appendChild(nextBtn);
    selectorCard.appendChild(navGroup);
    container.appendChild(selectorCard);

    // Question content area
    const contentArea = document.createElement('div');
    contentArea.className = 'dfb-qview-content-area';
    container.appendChild(contentArea);

    function updateView() {
      select.value = activeIndex;
      prevBtn.disabled = activeIndex <= 0;
      nextBtn.disabled = activeIndex >= activeQuestions.length - 1;

      contentArea.innerHTML = '';
      const q = activeQuestions[activeIndex];

      const qCard = document.createElement('div');
      qCard.className = 'dfb-qview-card';

      const qTitle = document.createElement('h3');
      qTitle.className = 'dfb-qview-title';
      qTitle.textContent = q.title || 'Pertanyaan';
      qCard.appendChild(qTitle);

      const answersList = document.createElement('div');
      answersList.className = 'dfb-qview-answers';

      // Group answers
      const groups = new Map();
      let emptyCount = 0;

      responses.forEach((r) => {
        const ans = (r.answers || []).find((a) => a.questionId === q.questionId);
        if (
          !ans ||
          ans.value == null ||
          ans.value === '' ||
          (Array.isArray(ans.value) && ans.value.length === 0)
        ) {
          emptyCount++;
          return;
        }

        let formatted = '';
        if (Array.isArray(ans.value)) {
          formatted = ans.value.join(', ');
        } else if (typeof ans.value === 'object') {
          formatted = Object.entries(ans.value)
            .map(([k, v]) => {
              const vStr = Array.isArray(v) ? v.join(', ') : String(v);
              return `${k}: ${vStr}`;
            })
            .join(' | ');
        } else {
          formatted = String(ans.value);
        }

        groups.set(formatted, (groups.get(formatted) || 0) + 1);
      });

      if (groups.size === 0 && emptyCount === 0) {
        const emptyDiv = document.createElement('p');
        emptyDiv.className = 'dfb-qview-empty';
        emptyDiv.textContent = 'Belum ada jawaban untuk pertanyaan ini.';
        answersList.appendChild(emptyDiv);
      } else {
        const sortedGroups = [...groups.entries()].sort((a, b) => b[1] - a[1]);

        sortedGroups.forEach(([val, count]) => {
          const row = document.createElement('div');
          row.className = 'dfb-qview-row';

          const valSpan = document.createElement('span');
          valSpan.className = 'dfb-qview-row-val';
          valSpan.textContent = val;

          const countSpan = document.createElement('span');
          countSpan.className = 'dfb-qview-row-count';
          countSpan.textContent = `${count} jawaban`;

          row.appendChild(valSpan);
          row.appendChild(countSpan);
          answersList.appendChild(row);
        });

        if (emptyCount > 0) {
          const row = document.createElement('div');
          row.className = 'dfb-qview-row dfb-qview-row-empty';

          const valSpan = document.createElement('span');
          valSpan.className = 'dfb-qview-row-val dfb-qview-val-empty';
          valSpan.textContent = 'Tidak menjawab';

          const countSpan = document.createElement('span');
          countSpan.className = 'dfb-qview-row-count';
          countSpan.textContent = `${emptyCount} jawaban`;

          row.appendChild(valSpan);
          row.appendChild(countSpan);
          answersList.appendChild(row);
        }
      }

      qCard.appendChild(answersList);
      contentArea.appendChild(qCard);
    }

    select.addEventListener('change', () => {
      activeIndex = parseInt(select.value, 10);
      updateView();
    });

    prevBtn.addEventListener('click', () => {
      if (activeIndex > 0) {
        activeIndex--;
        updateView();
      }
    });

    nextBtn.addEventListener('click', () => {
      if (activeIndex < activeQuestions.length - 1) {
        activeIndex++;
        updateView();
      }
    });

    updateView();
    return container;
  }
}
