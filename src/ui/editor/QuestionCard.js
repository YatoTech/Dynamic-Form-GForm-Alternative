import { QUESTION_TYPES, QUESTION_TYPE_LABELS } from '../../core/form/QuestionTypes.js';
import { sanitizeText } from '../../core/utils/sanitize.js';
import { SectionDivider } from './SectionDivider.js';

const TEXT_TYPES = [QUESTION_TYPES.SHORT_ANSWER, QUESTION_TYPES.PARAGRAPH];
const CHOICE_TYPES = [QUESTION_TYPES.MULTIPLE_CHOICE, QUESTION_TYPES.CHECKBOXES, QUESTION_TYPES.DROPDOWN];

export class QuestionCard {
  static create(question, number, handlers = {}) {
    if (question.type === QUESTION_TYPES.SECTION_HEADER) {
      return SectionDivider.create(question, number, handlers);
    }

    const isChoice = CHOICE_TYPES.includes(question.type);
    const isText = TEXT_TYPES.includes(question.type);
    const isCheckbox = question.type === QUESTION_TYPES.CHECKBOXES;

    const card = document.createElement('div');
    card.className = 'dfb-question-card';
    card.dataset.dfbQuestionId = question.questionId;

    /* ── Header ── */
    const header = document.createElement('div');
    header.className = 'dfb-q-card-header';

    const dragHandle = document.createElement('span');
    dragHandle.className = 'dfb-drag-handle';
    dragHandle.textContent = '\u22EE';
    header.appendChild(dragHandle);

    const headerRight = document.createElement('div');
    headerRight.style.flex = '1';

    const topRow = document.createElement('div');
    topRow.className = 'dfb-flex-center dfb-gap-sm';

    const numberSpan = document.createElement('span');
    numberSpan.className = 'dfb-q-card-number';
    numberSpan.textContent = `${number}.`;
    topRow.appendChild(numberSpan);

    const typeSpan = document.createElement('span');
    typeSpan.className = 'dfb-q-card-type';
    typeSpan.textContent = QUESTION_TYPE_LABELS[question.type] || question.type;
    topRow.appendChild(typeSpan);

    headerRight.appendChild(topRow);

    const titleInput = document.createElement('input');
    titleInput.className = 'dfb-q-card-title-input';
    titleInput.type = 'text';
    titleInput.value = question.title;
    titleInput.placeholder = 'Pertanyaan';
    titleInput.maxLength = 500;
    headerRight.appendChild(titleInput);

    header.appendChild(headerRight);

    /* ── 3-dot Menu ── */
    const menu = document.createElement('div');
    menu.className = 'dfb-q-card-menu';
    const menuBtn = document.createElement('button');
    menuBtn.className = 'dfb-q-card-menu-btn';
    menuBtn.innerHTML = '\u22EE';
    menuBtn.setAttribute('aria-label', 'Opsi pertanyaan');
    menu.appendChild(menuBtn);

    const dropdown = document.createElement('div');
    dropdown.className = 'dfb-q-card-dropdown';

    const descOpt = document.createElement('button');
    descOpt.textContent = 'Deskripsi';
    dropdown.appendChild(descOpt);

    const validOpt = document.createElement('button');
    validOpt.textContent = 'Validasi';
    dropdown.appendChild(validOpt);

    let shuffleOpt;
    if (isChoice) {
      shuffleOpt = document.createElement('button');
      shuffleOpt.textContent = 'Acak urutan';
      dropdown.appendChild(shuffleOpt);
    }

    let branchOpt;
    if (isChoice) {
      branchOpt = document.createElement('button');
      branchOpt.textContent = 'Loncat ke seksi';
      dropdown.appendChild(branchOpt);
    }

    const sep = document.createElement('hr');
    sep.className = 'dfb-q-card-dropdown-sep';
    dropdown.appendChild(sep);

    const dupOpt = document.createElement('button');
    dupOpt.textContent = 'Duplikasi';
    dupOpt.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.remove('dfb-q-card-dropdown--open');
      handlers.onDuplicate?.(question.questionId);
    });
    dropdown.appendChild(dupOpt);

    const delOpt = document.createElement('button');
    delOpt.textContent = 'Hapus';
    delOpt.className = 'dfb-q-card-dropdown-danger';
    delOpt.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.remove('dfb-q-card-dropdown--open');
      handlers.onDelete?.(question.questionId);
    });
    dropdown.appendChild(delOpt);

    menu.appendChild(dropdown);
    header.appendChild(menu);
    card.appendChild(header);

    /* ── Description Section ── */
    const descSection = document.createElement('div');
    descSection.className = 'dfb-q-card-section';
    descSection.hidden = !question.description;

    const descInput = document.createElement('textarea');
    descInput.className = 'dfb-q-card-desc-input';
    descInput.placeholder = 'Deskripsi pertanyaan (opsional)';
    descInput.maxLength = 2000;
    descInput.value = question.description || '';
    descSection.appendChild(descInput);

    card.appendChild(descSection);

    /* ── Options / Preview ── */
    const optionsDiv = document.createElement('div');
    optionsDiv.className = 'dfb-q-card-options';
    const previewEl = createTypePreview(question);
    if (previewEl) optionsDiv.appendChild(previewEl);
    card.appendChild(optionsDiv);

    /* ── Shuffle Section ── */
    let shuffleSection;
    if (isChoice) {
      shuffleSection = document.createElement('div');
      shuffleSection.className = 'dfb-q-card-section dfb-q-card-shuffle';
      shuffleSection.hidden = !question.options?.shuffleOptions;

      const shuffleLabel = document.createElement('label');
      shuffleLabel.className = 'dfb-flex-center';
      shuffleLabel.style.cssText = 'gap:10px;cursor:pointer;padding:4px 0;';

      const shuffleCheck = document.createElement('input');
      shuffleCheck.type = 'checkbox';
      shuffleCheck.className = 'dfb-q-card-shuffle-check';
      shuffleCheck.checked = !!question.options?.shuffleOptions;
      shuffleLabel.appendChild(shuffleCheck);

      const shuffleText = document.createElement('span');
      shuffleText.style.fontSize = '13px';
      shuffleText.textContent = 'Acak urutan pilihan';
      shuffleLabel.appendChild(shuffleText);

      shuffleSection.appendChild(shuffleLabel);
      card.appendChild(shuffleSection);

      shuffleCheck.addEventListener('change', () => {
        question.options = question.options || {};
        question.options.shuffleOptions = shuffleCheck.checked;
        handlers.onSave?.();
      });
    }

    /* ── Branching Section ── */
    let branchSection;
    if (isChoice) {
      branchSection = document.createElement('div');
      branchSection.className = 'dfb-q-card-section dfb-q-card-branching';
      branchSection.hidden = true;

      const branchTitle = document.createElement('p');
      branchTitle.textContent = 'Loncat ke seksi berdasarkan jawaban';
      branchTitle.style.cssText = 'font-size:12px;font-weight:500;color:var(--dfb-text-secondary,#5F6368);margin-bottom:8px;';
      branchSection.appendChild(branchTitle);

      card.appendChild(branchSection);
    }

    /* ── Validation Section ── */
    const validSection = document.createElement('div');
    validSection.className = 'dfb-q-card-section dfb-q-card-validation-section';
    validSection.hidden = true;

    if (isText) {
      const row1 = document.createElement('div');
      row1.className = 'dfb-validation-row';

      const minLabel = document.createElement('label');
      minLabel.textContent = 'Min. karakter';
      row1.appendChild(minLabel);

      const minInput = document.createElement('input');
      minInput.type = 'number';
      minInput.className = 'dfb-q-card-valid-min';
      minInput.min = 0;
      minInput.value = question.validation?.minLength || '';
      minInput.style.width = '80px';
      row1.appendChild(minInput);
      validSection.appendChild(row1);

      const row2 = document.createElement('div');
      row2.className = 'dfb-validation-row';

      const maxLabel = document.createElement('label');
      maxLabel.textContent = 'Maks. karakter';
      row2.appendChild(maxLabel);

      const maxInput = document.createElement('input');
      maxInput.type = 'number';
      maxInput.className = 'dfb-q-card-valid-max';
      maxInput.min = 0;
      maxInput.value = question.validation?.maxLength || '';
      maxInput.style.width = '80px';
      row2.appendChild(maxInput);
      validSection.appendChild(row2);

      const row3 = document.createElement('div');
      row3.className = 'dfb-validation-row';

      const patLabel = document.createElement('label');
      patLabel.textContent = 'Pola';
      row3.appendChild(patLabel);

      const patSelect = document.createElement('select');
      patSelect.className = 'dfb-q-card-valid-pattern';
      patSelect.style.flex = '1';
      const patterns = [
        { value: 'none', label: 'Tidak ada' },
        { value: 'email', label: 'Email' },
        { value: 'url', label: 'URL' },
        { value: 'number', label: 'Angka' },
        { value: 'regex', label: 'Regex kustom' },
      ];
      patterns.forEach((p) => {
        const opt = document.createElement('option');
        opt.value = p.value;
        opt.textContent = p.label;
        if (question.validation?.pattern === p.value) opt.selected = true;
        patSelect.appendChild(opt);
      });
      row3.appendChild(patSelect);
      validSection.appendChild(row3);

      minInput.addEventListener('change', () => {
        question.validation = question.validation || {};
        question.validation.minLength = minInput.value ? Number(minInput.value) : undefined;
        handlers.onSave?.();
      });
      maxInput.addEventListener('change', () => {
        question.validation = question.validation || {};
        question.validation.maxLength = maxInput.value ? Number(maxInput.value) : undefined;
        handlers.onSave?.();
      });
      patSelect.addEventListener('change', () => {
        question.validation = question.validation || {};
        question.validation.pattern = patSelect.value === 'none' ? undefined : patSelect.value;
        handlers.onSave?.();
      });
    } else if (isCheckbox) {
      const row1 = document.createElement('div');
      row1.className = 'dfb-validation-row';

      const minLabel = document.createElement('label');
      minLabel.textContent = 'Min. pilihan';
      row1.appendChild(minLabel);

      const minInput = document.createElement('input');
      minInput.type = 'number';
      minInput.className = 'dfb-q-card-valid-min';
      minInput.min = 1;
      minInput.value = question.validation?.minSelect || '';
      minInput.style.width = '80px';
      row1.appendChild(minInput);
      validSection.appendChild(row1);

      const row2 = document.createElement('div');
      row2.className = 'dfb-validation-row';

      const maxLabel = document.createElement('label');
      maxLabel.textContent = 'Maks. pilihan';
      row2.appendChild(maxLabel);

      const maxInput = document.createElement('input');
      maxInput.type = 'number';
      maxInput.className = 'dfb-q-card-valid-max';
      maxInput.min = 1;
      maxInput.value = question.validation?.maxSelect || '';
      maxInput.style.width = '80px';
      row2.appendChild(maxInput);
      validSection.appendChild(row2);

      minInput.addEventListener('change', () => {
        question.validation = question.validation || {};
        question.validation.minSelect = minInput.value ? Number(minInput.value) : undefined;
        handlers.onSave?.();
      });
      maxInput.addEventListener('change', () => {
        question.validation = question.validation || {};
        question.validation.maxSelect = maxInput.value ? Number(maxInput.value) : undefined;
        handlers.onSave?.();
      });
    }

    card.appendChild(validSection);

    /* ── Required Toggle / Bottom Bar ── */
    const validationDiv = document.createElement('div');
    validationDiv.className = 'dfb-q-card-validation';

    const validationRow = document.createElement('div');
    validationRow.className = 'dfb-flex-center';
    validationRow.style.justifyContent = 'space-between';

    const reqLabel = document.createElement('label');
    reqLabel.className = 'dfb-required-toggle';

    const reqCheck = document.createElement('input');
    reqCheck.type = 'checkbox';
    reqCheck.className = 'dfb-q-required-toggle';
    reqCheck.checked = question.required;
    reqCheck.ariaLabel = 'Wajib diisi';
    reqLabel.appendChild(reqCheck);
    reqLabel.appendChild(document.createTextNode(' Wajib'));
    validationRow.appendChild(reqLabel);

    validationDiv.appendChild(validationRow);
    card.appendChild(validationDiv);

    /* ── Update toggle states ── */
    const updateToggleIndicators = () => {
      descOpt.innerHTML = (question.description ? '\u2713 ' : '') + 'Deskripsi';
      validOpt.innerHTML = (isSectionVisible(validSection) ? '\u2713 ' : '') + 'Validasi';
      if (shuffleOpt) {
        shuffleOpt.innerHTML = (question.options?.shuffleOptions ? '\u2713 ' : '') + 'Acak urutan';
      }
    };

    /* ── Menu event handlers ── */
    descOpt.addEventListener('click', (e) => {
      e.stopPropagation();
      descSection.hidden = !descSection.hidden;
      if (!descSection.hidden) descInput.focus();
      updateToggleIndicators();
      dropdown.classList.remove('dfb-q-card-dropdown--open');
    });

    validOpt.addEventListener('click', (e) => {
      e.stopPropagation();
      validSection.hidden = !validSection.hidden;
      updateToggleIndicators();
      dropdown.classList.remove('dfb-q-card-dropdown--open');
    });

    if (shuffleOpt) {
      shuffleOpt.addEventListener('click', (e) => {
        e.stopPropagation();
        shuffleSection.hidden = !shuffleSection.hidden;
        updateToggleIndicators();
        dropdown.classList.remove('dfb-q-card-dropdown--open');
      });
    }

    const toggleMenu = (e) => {
      e.stopPropagation();
      updateToggleIndicators();
      document.querySelectorAll('.dfb-q-card-dropdown--open').forEach((d) => {
        if (d !== dropdown) d.classList.remove('dfb-q-card-dropdown--open');
      });
      dropdown.classList.toggle('dfb-q-card-dropdown--open');
    };

    menuBtn.addEventListener('click', toggleMenu);

    /* ── Event handlers ── */
    descInput.addEventListener('blur', () => {
      const val = sanitizeText(descInput.value);
      question.description = val;
      if (!val) descSection.hidden = true;
      updateToggleIndicators();
      handlers.onSave?.();
    });

    titleInput.addEventListener('blur', () => {
      question.title = sanitizeText(titleInput.value);
    });

    const requiredToggle = card.querySelector('.dfb-q-required-toggle');
    if (requiredToggle) {
      requiredToggle.addEventListener('change', () => {
        handlers.onRequiredToggle?.(question.questionId, requiredToggle.checked);
      });
    }

    card.addEventListener('click', (e) => {
      if (!e.target.closest('button') && !e.target.closest('input') && !e.target.closest('textarea') && !e.target.closest('select') && !e.target.closest('.dfb-drag-handle')) {
        handlers.onEdit?.(question.questionId);
      }
    });

    return card;
  }
}

function isSectionVisible(el) {
  return el && !el.hidden;
}

function createTypePreview(question) {
  switch (question.type) {
    case QUESTION_TYPES.SHORT_ANSWER: {
      const wrapper = document.createElement('div');
      wrapper.className = 'dfb-field';
      const input = document.createElement('input');
      input.type = 'text';
      input.disabled = true;
      input.placeholder = 'Jawaban singkat';
      input.style.width = '60%';
      input.style.background = '#f8f9fa';
      wrapper.appendChild(input);
      return wrapper;
    }
    case QUESTION_TYPES.PARAGRAPH: {
      const wrapper = document.createElement('div');
      wrapper.className = 'dfb-field';
      const textarea = document.createElement('textarea');
      textarea.disabled = true;
      textarea.placeholder = 'Jawaban panjang';
      textarea.rows = 3;
      textarea.style.cssText = 'background:#f8f9fa;resize:none;';
      wrapper.appendChild(textarea);
      return wrapper;
    }
    case QUESTION_TYPES.MULTIPLE_CHOICE:
      return createChoicePreview(question, 'radio');
    case QUESTION_TYPES.CHECKBOXES:
      return createChoicePreview(question, 'checkbox');
    case QUESTION_TYPES.DROPDOWN:
      return createDropdownPreview(question);
    case QUESTION_TYPES.LINEAR_SCALE:
      return createScalePreview(question);
    case QUESTION_TYPES.DATE: {
      const wrapper = document.createElement('div');
      wrapper.className = 'dfb-field';
      const input = document.createElement('input');
      input.type = 'date';
      input.disabled = true;
      input.style.background = '#f8f9fa';
      wrapper.appendChild(input);
      return wrapper;
    }
    case QUESTION_TYPES.TIME: {
      const wrapper = document.createElement('div');
      wrapper.className = 'dfb-field';
      const input = document.createElement('input');
      input.type = 'time';
      input.disabled = true;
      input.style.background = '#f8f9fa';
      wrapper.appendChild(input);
      return wrapper;
    }
    case QUESTION_TYPES.MULTIPLE_CHOICE_GRID:
    case QUESTION_TYPES.CHECKBOX_GRID:
      return createGridPreview(question);
    default: {
      const p = document.createElement('p');
      p.style.cssText = 'font-size:13px;color:var(--dfb-text-secondary,#5F6368);font-style:italic;';
      p.textContent = 'Pratinjau tidak tersedia';
      return p;
    }
  }
}

function createChoicePreview(question, inputType) {
  const choices = question.options?.choices || ['Opsi 1'];
  const other = question.options?.includeOther;
  const container = document.createElement('div');

  choices.forEach((c, i) => {
    const label = document.createElement('label');
    label.className = 'dfb-choice-row';
    const radio = document.createElement('input');
    radio.type = inputType;
    radio.disabled = true;
    if (i === 0) radio.checked = true;
    label.appendChild(radio);
    const span = document.createElement('span');
    span.className = 'dfb-choice-label';
    span.textContent = c;
    label.appendChild(span);
    container.appendChild(label);
  });

  if (other) {
    const label = document.createElement('label');
    label.className = 'dfb-choice-row';
    const input = document.createElement('input');
    input.type = inputType;
    input.disabled = true;
    label.appendChild(input);
    const span = document.createElement('span');
    span.className = 'dfb-choice-label';
    span.style.cssText = 'font-style:italic;color:var(--dfb-text-secondary,#5F6368);';
    span.textContent = 'Lainnya...';
    label.appendChild(span);
    container.appendChild(label);
  }

  return container;
}

function createDropdownPreview(_question) {
  const div = document.createElement('div');
  div.className = 'dfb-field';
  div.style.cssText = 'max-width:300px;background:#f8f9fa;padding:8px 12px;display:flex;justify-content:space-between;align-items:center;color:var(--dfb-text-secondary,#5F6368);';
  const span = document.createElement('span');
  span.textContent = 'Pilih';
  div.appendChild(span);
  const arrow = document.createElement('span');
  arrow.style.fontSize = '12px';
  arrow.textContent = '\u25BC';
  div.appendChild(arrow);
  return div;
}

function createScalePreview(question) {
  const min = question.options?.minScale ?? 1;
  const max = question.options?.maxScale ?? 5;
  const leftLabel = question.options?.leftLabel || '';
  const rightLabel = question.options?.rightLabel || '';

  const wrapper = document.createElement('div');

  const row = document.createElement('div');
  row.className = 'dfb-scale-row';

  for (let i = min; i <= max; i++) {
    const col = document.createElement('div');
    col.className = 'dfb-scale-col';

    const label = document.createElement('div');
    label.className = 'dfb-scale-label';
    label.style.pointerEvents = 'none';

    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.className = 'dfb-scale-radio';
    radio.disabled = true;
    radio.style.cssText = 'background:#f8f9fa;border-color:var(--dfb-border-color,#DADCE0);';
    label.appendChild(radio);

    const valSpan = document.createElement('span');
    valSpan.textContent = String(i);
    label.appendChild(valSpan);

    col.appendChild(label);
    row.appendChild(col);
  }

  wrapper.appendChild(row);

  if (leftLabel || rightLabel) {
    const labels = document.createElement('div');
    labels.className = 'dfb-scale-labels';
    const left = document.createElement('span');
    left.textContent = leftLabel;
    labels.appendChild(left);
    const right = document.createElement('span');
    right.textContent = rightLabel;
    labels.appendChild(right);
    wrapper.appendChild(labels);
  }

  return wrapper;
}

function createGridPreview(question) {
  const rows = question.options?.rows || ['Baris 1'];
  const cols = question.options?.columns || ['Kolom 1', 'Kolom 2'];
  const isMc = question.type === QUESTION_TYPES.MULTIPLE_CHOICE_GRID;
  const inputType = isMc ? 'radio' : 'checkbox';

  const table = document.createElement('table');
  table.className = 'dfb-grid-table';
  table.style.fontSize = '13px';

  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  const thEmpty = document.createElement('th');
  thEmpty.style.textAlign = 'left';
  headerRow.appendChild(thEmpty);
  cols.forEach((c) => {
    const th = document.createElement('th');
    th.textContent = c;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  rows.forEach((r, ri) => {
    const tr = document.createElement('tr');
    const tdLabel = document.createElement('td');
    tdLabel.textContent = r;
    tr.appendChild(tdLabel);
    cols.forEach((_c, ci) => {
      const td = document.createElement('td');
      const label = document.createElement('label');
      label.className = isMc ? 'dfb-grid-label' : 'dfb-grid-cb-label';
      const input = document.createElement('input');
      input.type = inputType;
      input.className = 'dfb-grid-input';
      input.disabled = true;
      if (ri === 0 && ci === 0) input.checked = true;
      label.appendChild(input);
      td.appendChild(label);
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);

  return table;
}
