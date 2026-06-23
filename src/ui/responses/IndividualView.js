import { QUESTION_TYPES } from '../../core/form/QuestionTypes.js';

export class IndividualView {
  /**
   * @param {Array} responses
   * @param {number} currentIndex
   * @param {Array} questions
   * @param {Function} onNavigate
   * @param {Function} onDelete
   * @returns {HTMLElement}
   */
  static create(responses, currentIndex, questions, onNavigate, onDelete) {
    const container = document.createElement('div');
    container.className = 'dfb-individual-view';

    if (responses.length === 0) {
      const p = document.createElement('p');
      p.style.cssText = 'padding:24px;text-align:center;color:var(--dfb-text-secondary,#5F6368);';
      p.textContent = 'Belum ada jawaban.';
      container.appendChild(p);
      return container;
    }

    const response = responses[currentIndex];

    // Navigation bar (Material 3 style)
    const nav = document.createElement('div');
    nav.className = 'dfb-individual-nav';

    const navGroup = document.createElement('div');
    navGroup.className = 'dfb-individual-nav-group';

    const prevBtn = document.createElement('button');
    prevBtn.className = 'dfb-btn-icon dfb-btn-nav-prev';
    prevBtn.title = 'Sebelumnya';
    prevBtn.setAttribute('aria-label', 'Sebelumnya');
    prevBtn.disabled = currentIndex <= 0;
    prevBtn.innerHTML = `
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="15 18 9 12 15 6"/>
      </svg>
    `;
    prevBtn.addEventListener('click', () => {
      if (currentIndex > 0) onNavigate(currentIndex - 1);
    });

    const info = document.createElement('span');
    info.className = 'dfb-individual-info';
    info.textContent = `${currentIndex + 1} dari ${responses.length}`;

    const nextBtn = document.createElement('button');
    nextBtn.className = 'dfb-btn-icon dfb-btn-nav-next';
    nextBtn.title = 'Berikutnya';
    nextBtn.setAttribute('aria-label', 'Berikutnya');
    nextBtn.disabled = currentIndex >= responses.length - 1;
    nextBtn.innerHTML = `
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    `;
    nextBtn.addEventListener('click', () => {
      if (currentIndex < responses.length - 1) onNavigate(currentIndex + 1);
    });

    navGroup.appendChild(prevBtn);
    navGroup.appendChild(info);
    navGroup.appendChild(nextBtn);
    nav.appendChild(navGroup);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'dfb-btn-icon dfb-btn-delete-response';
    deleteBtn.title = 'Hapus jawaban';
    deleteBtn.setAttribute('aria-label', 'Hapus jawaban');
    deleteBtn.innerHTML = `
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="3 6 5 6 21 6"/>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
        <line x1="10" y1="11" x2="10" y2="17"/>
        <line x1="14" y1="11" x2="14" y2="17"/>
      </svg>
    `;
    deleteBtn.addEventListener('click', () => {
      if (onDelete) onDelete();
    });
    const isReadOnly = new URLSearchParams(window.location.search).has('readOnly');
    if (!isReadOnly) {
      nav.appendChild(deleteBtn);
    }
    container.appendChild(nav);

    // Map answers for quick lookup
    const ansMap = {};
    (response.answers || []).forEach((a) => {
      ansMap[a.questionId] = a;
    });

    // Render questions
    questions.forEach((q) => {
      if (q.type === QUESTION_TYPES.SECTION_HEADER) {
        // Render section divider / header card
        const sectionBanner = document.createElement('div');
        sectionBanner.className = 'dfb-individual-section-banner';

        const title = document.createElement('h2');
        title.className = 'dfb-individual-section-title';
        title.textContent = q.title || 'Bagian Tanpa Judul';
        sectionBanner.appendChild(title);

        if (q.description) {
          const desc = document.createElement('p');
          desc.className = 'dfb-individual-section-desc';
          desc.textContent = q.description;
          sectionBanner.appendChild(desc);
        }
        container.appendChild(sectionBanner);
        return;
      }

      // Render standard question card
      const card = document.createElement('div');
      card.className = 'dfb-individual-qcard';

      const titleWrap = document.createElement('div');
      titleWrap.className = 'dfb-individual-qtitle-wrap';

      const qTitle = document.createElement('span');
      qTitle.className = 'dfb-individual-qtitle';
      qTitle.textContent = q.title || 'Pertanyaan';
      titleWrap.appendChild(qTitle);

      if (q.required) {
        const reqSpan = document.createElement('span');
        reqSpan.className = 'dfb-individual-qrequired';
        reqSpan.textContent = ' *';
        titleWrap.appendChild(reqSpan);
      }
      card.appendChild(titleWrap);

      const answer = ansMap[q.questionId];
      const answerVal = answer ? answer.value : null;

      const fieldArea = document.createElement('div');
      fieldArea.className = 'dfb-individual-field-area';

      // Render field based on type
      switch (q.type) {
        case QUESTION_TYPES.SHORT_ANSWER: {
          const input = document.createElement('input');
          input.type = 'text';
          input.className = 'dfb-individual-text-field';
          input.value = answerVal != null ? String(answerVal) : '';
          input.disabled = true;
          if (answerVal == null || answerVal === '') {
            input.placeholder = 'Tidak dijawab';
          }
          fieldArea.appendChild(input);
          break;
        }
        case QUESTION_TYPES.PARAGRAPH: {
          const textarea = document.createElement('textarea');
          textarea.className = 'dfb-individual-textarea-field';
          textarea.value = answerVal != null ? String(answerVal) : '';
          textarea.disabled = true;
          if (answerVal == null || answerVal === '') {
            textarea.placeholder = 'Tidak dijawab';
          }
          fieldArea.appendChild(textarea);
          break;
        }
        case QUESTION_TYPES.MULTIPLE_CHOICE: {
          const choices = q.options?.choices || ['Opsi 1'];
          const includeOther = q.options?.includeOther;

          choices.forEach((choice) => {
            const row = document.createElement('label');
            row.className = 'dfb-individual-option-row';

            const input = document.createElement('input');
            input.type = 'radio';
            input.className = 'dfb-individual-radio';
            input.disabled = true;
            if (choice === answerVal) input.checked = true;

            const visual = document.createElement('span');
            visual.className = 'dfb-individual-radio-visual';

            const text = document.createElement('span');
            text.className = 'dfb-individual-option-text';
            text.textContent = choice;

            row.appendChild(input);
            row.appendChild(visual);
            row.appendChild(text);
            fieldArea.appendChild(row);
          });

          if (includeOther) {
            const isOtherSelected = answerVal && !choices.includes(answerVal);
            const row = document.createElement('label');
            row.className = 'dfb-individual-option-row';

            const input = document.createElement('input');
            input.type = 'radio';
            input.className = 'dfb-individual-radio';
            input.disabled = true;
            if (isOtherSelected) input.checked = true;

            const visual = document.createElement('span');
            visual.className = 'dfb-individual-radio-visual';

            const text = document.createElement('span');
            text.className = 'dfb-individual-option-text';
            text.textContent = 'Lainnya: ';

            const otherText = document.createElement('span');
            otherText.className = 'dfb-individual-other-text';
            otherText.textContent = isOtherSelected ? String(answerVal) : '—';

            row.appendChild(input);
            row.appendChild(visual);
            row.appendChild(text);
            row.appendChild(otherText);
            fieldArea.appendChild(row);
          }
          break;
        }
        case QUESTION_TYPES.CHECKBOXES: {
          const choices = q.options?.choices || ['Opsi 1'];
          const includeOther = q.options?.includeOther;
          const answerArray = Array.isArray(answerVal) ? answerVal : [];

          choices.forEach((choice) => {
            const row = document.createElement('label');
            row.className = 'dfb-individual-option-row';

            const input = document.createElement('input');
            input.type = 'checkbox';
            input.className = 'dfb-individual-checkbox';
            input.disabled = true;
            if (answerArray.includes(choice)) input.checked = true;

            const visual = document.createElement('span');
            visual.className = 'dfb-individual-checkbox-visual';

            const text = document.createElement('span');
            text.className = 'dfb-individual-option-text';
            text.textContent = choice;

            row.appendChild(input);
            row.appendChild(visual);
            row.appendChild(text);
            fieldArea.appendChild(row);
          });

          if (includeOther) {
            const otherAnswers = answerArray.filter((v) => !choices.includes(v));
            const isOtherSelected = otherAnswers.length > 0;

            const row = document.createElement('label');
            row.className = 'dfb-individual-option-row';

            const input = document.createElement('input');
            input.type = 'checkbox';
            input.className = 'dfb-individual-checkbox';
            input.disabled = true;
            if (isOtherSelected) input.checked = true;

            const visual = document.createElement('span');
            visual.className = 'dfb-individual-checkbox-visual';

            const text = document.createElement('span');
            text.className = 'dfb-individual-option-text';
            text.textContent = 'Lainnya: ';

            const otherText = document.createElement('span');
            otherText.className = 'dfb-individual-other-text';
            otherText.textContent = isOtherSelected ? otherAnswers.join(', ') : '—';

            row.appendChild(input);
            row.appendChild(visual);
            row.appendChild(text);
            row.appendChild(otherText);
            fieldArea.appendChild(row);
          }
          break;
        }
        case QUESTION_TYPES.DROPDOWN: {
          const select = document.createElement('select');
          select.className = 'dfb-individual-select';
          select.disabled = true;

          const defaultOpt = document.createElement('option');
          defaultOpt.textContent = answerVal != null ? String(answerVal) : 'Pilih';
          select.appendChild(defaultOpt);
          fieldArea.appendChild(select);
          break;
        }
        case QUESTION_TYPES.LINEAR_SCALE: {
          const min = q.options?.minVal ?? 1;
          const max = q.options?.maxVal ?? 5;
          const minLabel = q.options?.minLabel || '';
          const maxLabel = q.options?.maxLabel || '';

          const scaleContainer = document.createElement('div');
          scaleContainer.className = 'dfb-individual-scale-container';

          if (minLabel) {
            const lLabel = document.createElement('span');
            lLabel.className = 'dfb-individual-scale-text-label';
            lLabel.textContent = minLabel;
            scaleContainer.appendChild(lLabel);
          }

          const colsWrap = document.createElement('div');
          colsWrap.className = 'dfb-individual-scale-cols';

          for (let val = min; val <= max; val++) {
            const col = document.createElement('div');
            col.className = 'dfb-individual-scale-col';

            const colNum = document.createElement('span');
            colNum.className = 'dfb-individual-scale-num';
            colNum.textContent = val;

            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.className = 'dfb-individual-radio';
            radio.disabled = true;
            if (Number(answerVal) === val) radio.checked = true;

            const visual = document.createElement('span');
            visual.className = 'dfb-individual-radio-visual';

            col.appendChild(colNum);
            col.appendChild(radio);
            col.appendChild(visual);
            colsWrap.appendChild(col);
          }
          scaleContainer.appendChild(colsWrap);

          if (maxLabel) {
            const rLabel = document.createElement('span');
            rLabel.className = 'dfb-individual-scale-text-label';
            rLabel.textContent = maxLabel;
            scaleContainer.appendChild(rLabel);
          }

          fieldArea.appendChild(scaleContainer);
          break;
        }
        case QUESTION_TYPES.MULTIPLE_CHOICE_GRID:
        case QUESTION_TYPES.CHECKBOX_GRID: {
          fieldArea.appendChild(renderIndividualGrid(q, answerVal));
          break;
        }
        case QUESTION_TYPES.DATE: {
          const input = document.createElement('input');
          input.type = 'date';
          input.className = 'dfb-individual-text-field';
          input.value = answerVal || '';
          input.disabled = true;
          fieldArea.appendChild(input);
          break;
        }
        case QUESTION_TYPES.TIME: {
          const input = document.createElement('input');
          input.type = 'time';
          input.className = 'dfb-individual-text-field';
          input.value = answerVal || '';
          input.disabled = true;
          fieldArea.appendChild(input);
          break;
        }
        case QUESTION_TYPES.RATING: {
          const maxStars = q.options?.maxStars ?? 5;
          const starsVal = answerVal ? Number(answerVal) : 0;
          const starsWrapper = document.createElement('div');
          starsWrapper.style.cssText = 'display:flex; gap:6px; font-size:24px; color:#DADCE0;';
          for (let i = 0; i < maxStars; i++) {
            const star = document.createElement('span');
            if (i < starsVal) {
              star.innerHTML = '&#9733;';
              star.style.color = '#FFB900';
            } else {
              star.innerHTML = '&#9734;';
              star.style.color = '#DADCE0';
            }
            starsWrapper.appendChild(star);
          }
          fieldArea.appendChild(starsWrapper);
          break;
        }
        case QUESTION_TYPES.FILE_UPLOAD: {
          let fileObj = null;
          if (answerVal) {
            if (typeof answerVal === 'string') {
              try {
                fileObj = JSON.parse(answerVal);
              } catch (e) {
                // Ignore invalid JSON
              }
            } else if (typeof answerVal === 'object') {
              fileObj = answerVal;
            }
          }
          if (fileObj && fileObj.name) {
            const wrapper = document.createElement('div');
            wrapper.style.cssText = 'display:flex; flex-direction:column; gap:8px;';

            const link = document.createElement('a');
            link.href = fileObj.base64 || '#';
            link.target = '_blank';
            link.className = 'dfb-individual-file-link';
            link.style.cssText =
              'font-size:13px; font-weight:500; color:var(--dfb-primary-color,#4285F4); text-decoration:none; display:inline-flex; align-items:center; gap:6px;';
            link.innerHTML = `
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              <span>${fileObj.name} (${(fileObj.size / 1024).toFixed(1)} KB)</span>
            `;
            wrapper.appendChild(link);

            if (fileObj.base64 && fileObj.type && fileObj.type.startsWith('image/')) {
              const img = document.createElement('img');
              img.src = fileObj.base64;
              img.alt = fileObj.name;
              img.style.cssText =
                'max-width:200px; max-height:200px; border-radius:4px; border:1px solid #DADCE0; margin-top:8px;';
              wrapper.appendChild(img);
            }

            fieldArea.appendChild(wrapper);
          } else {
            const p = document.createElement('p');
            p.className = 'dfb-individual-fallback';
            p.style.fontStyle = 'italic';
            p.textContent = 'Tidak ada file diunggah';
            fieldArea.appendChild(p);
          }
          break;
        }
        default: {
          const p = document.createElement('p');
          p.className = 'dfb-individual-fallback';
          p.textContent = answerVal != null ? String(answerVal) : '—';
          fieldArea.appendChild(p);
        }
      }

      card.appendChild(fieldArea);
      container.appendChild(card);
    });

    return container;
  }
}

function renderIndividualGrid(question, value) {
  const rows = question.options?.rows || [];
  const cols = question.options?.columns || [];
  const isMc = question.type === QUESTION_TYPES.MULTIPLE_CHOICE_GRID;

  const table = document.createElement('table');
  table.className = 'dfb-individual-grid-table';

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
    tdLabel.className = 'dfb-individual-grid-row-label';
    tdLabel.textContent = r;
    tr.appendChild(tdLabel);

    const rowVal = value ? value[String(ri)] : null;
    cols.forEach((c) => {
      const td = document.createElement('td');
      td.style.textAlign = 'center';
      td.style.position = 'relative';

      const input = document.createElement('input');
      input.type = isMc ? 'radio' : 'checkbox';
      input.className = isMc ? 'dfb-individual-radio' : 'dfb-individual-checkbox';
      input.disabled = true;

      if (isMc) {
        if (rowVal === c) input.checked = true;
      } else {
        if (Array.isArray(rowVal) && rowVal.includes(c)) input.checked = true;
      }

      const visual = document.createElement('span');
      visual.className = isMc ? 'dfb-individual-radio-visual' : 'dfb-individual-checkbox-visual';
      visual.style.position = 'static';
      visual.style.display = 'inline-block';
      visual.style.margin = '0 auto';

      td.appendChild(input);
      td.appendChild(visual);
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);

  return table;
}
