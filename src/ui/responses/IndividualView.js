import { QUESTION_TYPES } from '../../core/form/QuestionTypes.js';

export class IndividualView {
  static create(responses, currentIndex, questions, onNavigate, onDelete) {
    const container = document.createElement('div');
    container.className = 'dfb-individual-view';

    if (responses.length === 0) {
      const p = document.createElement('p');
      p.style.cssText = 'padding:24px;text-align:center;color:var(--dfb-text-secondary,#5F6368);';
      p.textContent = 'Belum ada respons.';
      container.appendChild(p);
      return container;
    }

    const response = responses[currentIndex];

    const nav = document.createElement('div');
    nav.className = 'dfb-individual-nav';

    const navGroup = document.createElement('div');
    navGroup.style.cssText = 'display:flex;align-items:center;gap:8px;';

    const prevBtn = document.createElement('button');
    prevBtn.textContent = '\u25C0 Sebelumnya';
    prevBtn.className = 'dfb-btn--nav';
    prevBtn.disabled = currentIndex <= 0;
    prevBtn.addEventListener('click', () => {
      if (currentIndex > 0) onNavigate(currentIndex - 1);
    });

    const info = document.createElement('span');
    info.className = 'dfb-individual-info';
    info.textContent = `${currentIndex + 1} dari ${responses.length}`;

    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Berikutnya \u25B6';
    nextBtn.className = 'dfb-btn--nav';
    nextBtn.disabled = currentIndex >= responses.length - 1;
    nextBtn.addEventListener('click', () => {
      if (currentIndex < responses.length - 1) onNavigate(currentIndex + 1);
    });

    navGroup.appendChild(prevBtn);
    navGroup.appendChild(info);
    navGroup.appendChild(nextBtn);
    nav.appendChild(navGroup);

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Hapus';
    deleteBtn.className = 'dfb-btn--delete';
    deleteBtn.addEventListener('click', () => {
      if (onDelete) onDelete();
    });
    nav.appendChild(deleteBtn);
    container.appendChild(nav);

    const ansMap = {};
    (response.answers || []).forEach((a) => {
      ansMap[a.questionId] = a;
    });

    const activeQuestions = questions.filter((q) => q.type !== 'section_header');

    activeQuestions.forEach((q) => {
      const card = document.createElement('div');
      card.className = 'dfb-individual-card';

      const answer = ansMap[q.questionId];
      const qTitle = document.createElement('p');
      qTitle.className = 'dfb-in-q-title';
      qTitle.textContent = q.title || 'Pertanyaan';

      card.appendChild(qTitle);

      if (!answer || answer.value == null) {
        const qValue = document.createElement('p');
        qValue.className = 'dfb-in-q-value dfb-in-q-empty';
        qValue.textContent = '-';
        card.appendChild(qValue);
      } else if (q.type === QUESTION_TYPES.MULTIPLE_CHOICE_GRID || q.type === QUESTION_TYPES.CHECKBOX_GRID) {
        card.appendChild(renderGridAnswer(q, answer));
      } else if (Array.isArray(answer.value)) {
        const list = document.createElement('ul');
        list.className = 'dfb-in-q-list';
        answer.value.forEach((v) => {
          const li = document.createElement('li');
          li.textContent = v;
          list.appendChild(li);
        });
        card.appendChild(list);
      } else if (typeof answer.value === 'object') {
        const list = document.createElement('ul');
        list.className = 'dfb-in-q-list';
        Object.entries(answer.value).forEach(([key, val]) => {
          const li = document.createElement('li');
          if (Array.isArray(val)) {
            li.textContent = `${key}: ${val.join(', ')}`;
          } else {
            li.textContent = `${key}: ${val}`;
          }
          list.appendChild(li);
        });
        card.appendChild(list);
      } else {
        const qValue = document.createElement('p');
        qValue.className = 'dfb-in-q-value';
        qValue.textContent = String(answer.value);
        card.appendChild(qValue);
      }

      container.appendChild(card);
    });

    return container;
  }
}

function renderGridAnswer(question, answer) {
  const rows = question.options?.rows || [];
  const cols = question.options?.columns || [];
  const isMc = question.type === QUESTION_TYPES.MULTIPLE_CHOICE_GRID;

  const table = document.createElement('table');
  table.className = 'dfb-in-q-grid';

  const thead = document.createElement('thead');
  const headerTr = document.createElement('tr');
  const thEmpty = document.createElement('th');
  headerTr.appendChild(thEmpty);
  cols.forEach((c) => {
    const th = document.createElement('th');
    th.textContent = c;
    headerTr.appendChild(th);
  });
  thead.appendChild(headerTr);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  rows.forEach((r, ri) => {
    const tr = document.createElement('tr');
    const tdLabel = document.createElement('td');
    tdLabel.textContent = r;
    tr.appendChild(tdLabel);

    const rowVal = answer.value ? answer.value[String(ri)] : null;
    cols.forEach((c) => {
      const td = document.createElement('td');
      if (isMc) {
        td.textContent = rowVal === c ? '\u2713' : '';
      } else if (Array.isArray(rowVal) && rowVal.includes(c)) {
        td.textContent = '\u2713';
      }
      td.style.textAlign = 'center';
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);

  return table;
}
