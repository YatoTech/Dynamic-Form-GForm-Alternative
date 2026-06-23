import { QUESTION_TYPES, QUESTION_TYPE_LABELS } from '../../core/form/QuestionTypes.js';
import { sanitizeText } from '../../core/utils/sanitize.js';
import { SectionDivider } from './SectionDivider.js';
import { eventBus } from '../../core/utils/eventBus.js';

// Import choice/input editors
import { ShortAnswerEditor } from './editors/ShortAnswerEditor.js';
import { ParagraphEditor } from './editors/ParagraphEditor.js';
import { MultipleChoiceEditor } from './editors/MultipleChoiceEditor.js';
import { CheckboxesEditor } from './editors/CheckboxesEditor.js';
import { DropdownEditor } from './editors/DropdownEditor.js';
import { LinearScaleEditor } from './editors/LinearScaleEditor.js';
import { GridEditor } from './editors/GridEditor.js';
import { DateEditor } from './editors/DateEditor.js';
import { TimeEditor } from './editors/TimeEditor.js';
import { FileUploadEditor } from './editors/FileUploadEditor.js';
import { RatingEditor } from './editors/RatingEditor.js';
import { QuestionTypeSelector } from './QuestionTypeSelector.js';

const TEXT_TYPES = [QUESTION_TYPES.SHORT_ANSWER, QUESTION_TYPES.PARAGRAPH];
const CHOICE_TYPES = [
  QUESTION_TYPES.MULTIPLE_CHOICE,
  QUESTION_TYPES.CHECKBOXES,
  QUESTION_TYPES.DROPDOWN,
];

function renderTypeEditor(question, container, handlers, sections = []) {
  switch (question.type) {
    case QUESTION_TYPES.SHORT_ANSWER:
      ShortAnswerEditor.render(question, container);
      break;
    case QUESTION_TYPES.PARAGRAPH:
      ParagraphEditor.render(question, container);
      break;
    case QUESTION_TYPES.MULTIPLE_CHOICE:
      MultipleChoiceEditor.render(question, container, sections);
      break;
    case QUESTION_TYPES.CHECKBOXES:
      CheckboxesEditor.render(question, container);
      break;
    case QUESTION_TYPES.DROPDOWN:
      DropdownEditor.render(question, container);
      break;
    case QUESTION_TYPES.LINEAR_SCALE:
      LinearScaleEditor.render(question, container);
      break;
    case QUESTION_TYPES.MULTIPLE_CHOICE_GRID:
    case QUESTION_TYPES.CHECKBOX_GRID:
      GridEditor.render(question, container);
      break;
    case QUESTION_TYPES.DATE:
      DateEditor.render(question, container);
      break;
    case QUESTION_TYPES.TIME:
      TimeEditor.render(question, container);
      break;
    case QUESTION_TYPES.FILE_UPLOAD:
      FileUploadEditor.render(question, container);
      break;
    case QUESTION_TYPES.RATING:
      RatingEditor.render(question, container);
      break;
    default:
      container.textContent = 'Editor tidak tersedia';
  }

  // Listen to input and change events inside the options container to trigger saves
  container.querySelectorAll('input, select, textarea').forEach((input) => {
    input.addEventListener('change', () => handlers.onSave?.());
    input.addEventListener('input', () => handlers.onSave?.());
  });
}

export class QuestionCard {
  static create(question, number, handlers = {}, isActive = false, sections = []) {
    if (question.type === QUESTION_TYPES.SECTION_HEADER) {
      return SectionDivider.create(question, number, handlers, isActive);
    }

    const isChoice = CHOICE_TYPES.includes(question.type);
    const isText = TEXT_TYPES.includes(question.type);
    const isCheckbox = question.type === QUESTION_TYPES.CHECKBOXES;

    const card = document.createElement('div');
    card.className = 'dfb-question-card' + (isActive ? ' dfb-question-card--active' : '');
    card.dataset.dfbQuestionId = question.questionId;

    /* ── Drag Handle (Visible centered on top) ── */
    const dragHandle = document.createElement('div');
    dragHandle.className = 'dfb-drag-handle';
    dragHandle.innerHTML = `
      <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
        <circle cx="8" cy="8" r="1.5"/><circle cx="12" cy="8" r="1.5"/><circle cx="16" cy="8" r="1.5"/>
        <circle cx="8" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="16" cy="12" r="1.5"/>
      </svg>
    `;
    card.appendChild(dragHandle);

    /* ── Header: Title row (title input + type selector inline like GForms) ── */
    const header = document.createElement('div');
    header.className = 'dfb-q-card-header';

    const headerMain = document.createElement('div');
    headerMain.className = 'dfb-q-card-header-main';
    headerMain.style.cssText = 'flex:1;min-width:0;';

    // Title + type selector row (GForms: title input left, type select right)
    const topRow = document.createElement('div');
    topRow.style.cssText = 'display:flex;align-items:flex-start;gap:12px;';

    const titleInput = document.createElement('input');
    titleInput.className = 'dfb-q-card-title-input';
    titleInput.type = 'text';
    titleInput.value = question.title;
    titleInput.placeholder = 'Pertanyaan';
    titleInput.maxLength = 500;
    titleInput.setAttribute('aria-label', 'Judul pertanyaan');
    if (!isActive) {
      titleInput.disabled = true;
    }
    topRow.appendChild(titleInput);

    // Image Upload button (GForms image symbol)
    if (isActive) {
      const imageUploadBtn = document.createElement('button');
      imageUploadBtn.className = 'dfb-q-card-image-btn';
      imageUploadBtn.type = 'button';
      imageUploadBtn.title = 'Sematkan gambar ke pertanyaan';
      imageUploadBtn.style.cssText =
        'background:none;border:none;cursor:pointer;padding:6px;color:var(--dfb-text-secondary,#5f6368);display:flex;align-items:center;justify-content:center;border-radius:4px;flex-shrink:0;';
      imageUploadBtn.innerHTML = `
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <circle cx="9" cy="9" r="2"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
      `;

      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.style.display = 'none';

      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
          question.imageUrl = evt.target.result;
          handlers.onSave?.();
          eventBus.emit('form:updated');
          renderImagePreview();
        };
        reader.readAsDataURL(file);
      });

      imageUploadBtn.appendChild(fileInput);
      imageUploadBtn.addEventListener('click', () => fileInput.click());
      topRow.appendChild(imageUploadBtn);
    }

    // Type selector (only shown when active)
    let typeElement;
    if (isActive) {
      typeElement = QuestionTypeSelector.create(question.type, (newType) => {
        const oldType = question.type;
        if (oldType === newType) return;
        question.type = newType;
        if (CHOICE_TYPES.includes(newType) && !CHOICE_TYPES.includes(oldType)) {
          question.options = { choices: ['Opsi 1'] };
        } else if (newType === QUESTION_TYPES.LINEAR_SCALE) {
          question.options = { minScale: 1, maxScale: 5, leftLabel: '', rightLabel: '' };
        } else if (
          newType === QUESTION_TYPES.MULTIPLE_CHOICE_GRID ||
          newType === QUESTION_TYPES.CHECKBOX_GRID
        ) {
          question.options = { rows: ['Baris 1'], columns: ['Kolom 1', 'Kolom 2'] };
        }
        handlers.onSave?.();
        eventBus.emit('form:updated');
      });
      topRow.appendChild(typeElement);
    } else {
      // Inactive: show type as subtle badge
      typeElement = document.createElement('span');
      typeElement.className = 'dfb-q-card-type-badge';
      typeElement.textContent = QUESTION_TYPE_LABELS[question.type] || question.type;
      topRow.appendChild(typeElement);
    }

    headerMain.appendChild(topRow);
    header.appendChild(headerMain);
    card.appendChild(header);

    /* ── Image Preview Section ── */
    const imagePreviewWrap = document.createElement('div');
    imagePreviewWrap.className = 'dfb-q-card-image-preview-wrap';
    imagePreviewWrap.style.cssText = 'margin: 12px 24px; display: none; position: relative; max-width: calc(100% - 48px);';
    card.appendChild(imagePreviewWrap);

    function renderImagePreview() {
      imagePreviewWrap.innerHTML = '';
      if (question.imageUrl) {
        imagePreviewWrap.style.display = 'block';

        const img = document.createElement('img');
        img.src = question.imageUrl;
        img.style.cssText =
          'max-width: 100%; max-height: 250px; border-radius: 8px; border: 1px solid var(--dfb-border-color,#dadce0); object-fit: contain;';
        imagePreviewWrap.appendChild(img);

        if (isActive) {
          const removeBtn = document.createElement('button');
          removeBtn.type = 'button';
          removeBtn.className = 'dfb-btn dfb-btn-remove-image';
          removeBtn.textContent = 'Hapus Gambar';
          removeBtn.style.cssText =
            'position: absolute; bottom: 8px; left: 8px; background: rgba(0,0,0,0.7); color: #fff; border: none; padding: 6px 12px; border-radius: 4px; font-size: 12px; cursor: pointer; backdrop-filter: blur(4px);';
          removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            question.imageUrl = null;
            handlers.onSave?.();
            eventBus.emit('form:updated');
            renderImagePreview();
          });
          imagePreviewWrap.appendChild(removeBtn);
        }
      } else {
        imagePreviewWrap.style.display = 'none';
      }
    }

    renderImagePreview();

    /* ── Description Section ── */
    const descSection = document.createElement('div');
    descSection.className = 'dfb-q-card-section';
    descSection.hidden = !question.description;

    const descInput = document.createElement('textarea');
    descInput.className = 'dfb-q-card-desc-input';
    descInput.placeholder = 'Deskripsi pertanyaan (opsional)';
    descInput.maxLength = 2000;
    descInput.value = question.description || '';
    if (!isActive) {
      descInput.disabled = true;
    }
    descSection.appendChild(descInput);
    card.appendChild(descSection);

    /* ── Options / Preview ── */
    const optionsDiv = document.createElement('div');
    optionsDiv.className = 'dfb-q-card-options';

    if (isActive) {
      renderTypeEditor(question, optionsDiv, handlers, sections);
    } else {
      const previewEl = createTypePreview(question);
      if (previewEl) optionsDiv.appendChild(previewEl);
    }
    card.appendChild(optionsDiv);

    /* ── Shuffle Section (MC/Choice only, active only) ── */
    let shuffleSection;
    if (isChoice && isActive) {
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
    if (isChoice && isActive) {
      branchSection = document.createElement('div');
      branchSection.className = 'dfb-q-card-section dfb-q-card-branching';
      branchSection.hidden = true;

      const branchTitle = document.createElement('p');
      branchTitle.textContent = 'Loncat ke seksi berdasarkan jawaban';
      branchTitle.style.cssText =
        'font-size:12px;font-weight:500;color:var(--dfb-text-secondary,#5F6368);margin-bottom:8px;';
      branchSection.appendChild(branchTitle);

      card.appendChild(branchSection);
    }

    /* ── Validation Section (Active only) ── */
    function hasValidation(q) {
      if (!q.validation) return false;
      return (
        q.validation.minLength != null ||
        q.validation.maxLength != null ||
        q.validation.pattern != null ||
        q.validation.minSelect != null ||
        q.validation.maxSelect != null ||
        q.validation.minDate != null ||
        q.validation.maxDate != null ||
        q.validation.minTime != null ||
        q.validation.maxTime != null
      );
    }

    const validSection = document.createElement('div');
    validSection.className = 'dfb-q-card-section dfb-q-card-validation-section';
    validSection.hidden = !hasValidation(question);

    if (isActive) {
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

        const regexRow = document.createElement('div');
        regexRow.className = 'dfb-validation-row dfb-regex-row';
        regexRow.style.display = question.validation?.pattern === 'regex' ? 'flex' : 'none';

        const regexLabel = document.createElement('label');
        regexLabel.textContent = 'Pola regex';
        regexRow.appendChild(regexLabel);

        const regexInput = document.createElement('input');
        regexInput.type = 'text';
        regexInput.className = 'dfb-q-card-valid-regex-input';
        regexInput.placeholder = 'e.g. ^[A-Z]{3}$';
        regexInput.value = question.validation?.customRegex || '';
        regexInput.style.flex = '1';
        regexRow.appendChild(regexInput);
        validSection.appendChild(regexRow);

        const errorRow = document.createElement('div');
        errorRow.className = 'dfb-validation-row dfb-error-row';
        errorRow.style.display = hasValidation(question) ? 'flex' : 'none';

        const errorLabel = document.createElement('label');
        errorLabel.textContent = 'Pesan error kustom';
        errorRow.appendChild(errorLabel);

        const errorInput = document.createElement('input');
        errorInput.type = 'text';
        errorInput.className = 'dfb-q-card-valid-error-input';
        errorInput.placeholder = 'Pesan kustom jika tidak valid';
        errorInput.value = question.validation?.customError || '';
        errorInput.style.flex = '1';
        errorRow.appendChild(errorInput);
        validSection.appendChild(errorRow);

        const updateErrorRowVisibility = () => {
          errorRow.style.display = hasValidation(question) ? 'flex' : 'none';
        };

        minInput.addEventListener('change', () => {
          question.validation = question.validation || {};
          question.validation.minLength = minInput.value ? Number(minInput.value) : undefined;
          updateErrorRowVisibility();
          handlers.onSave?.();
        });
        maxInput.addEventListener('change', () => {
          question.validation = question.validation || {};
          question.validation.maxLength = maxInput.value ? Number(maxInput.value) : undefined;
          updateErrorRowVisibility();
          handlers.onSave?.();
        });
        patSelect.addEventListener('change', () => {
          question.validation = question.validation || {};
          question.validation.pattern = patSelect.value === 'none' ? undefined : patSelect.value;
          regexRow.style.display = patSelect.value === 'regex' ? 'flex' : 'none';
          updateErrorRowVisibility();
          handlers.onSave?.();
        });
        regexInput.addEventListener('input', () => {
          question.validation = question.validation || {};
          question.validation.customRegex = regexInput.value || undefined;
          handlers.onSave?.();
        });
        errorInput.addEventListener('input', () => {
          question.validation = question.validation || {};
          question.validation.customError = errorInput.value || undefined;
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
      } else if (question.type === QUESTION_TYPES.DATE) {
        const row1 = document.createElement('div');
        row1.className = 'dfb-validation-row';

        const minLabel = document.createElement('label');
        minLabel.textContent = 'Tanggal min.';
        row1.appendChild(minLabel);

        const minInput = document.createElement('input');
        minInput.type = 'date';
        minInput.className = 'dfb-q-card-valid-date-min';
        minInput.value = question.validation?.minDate || '';
        row1.appendChild(minInput);
        validSection.appendChild(row1);

        const row2 = document.createElement('div');
        row2.className = 'dfb-validation-row';

        const maxLabel = document.createElement('label');
        maxLabel.textContent = 'Tanggal maks.';
        row2.appendChild(maxLabel);

        const maxInput = document.createElement('input');
        maxInput.type = 'date';
        maxInput.className = 'dfb-q-card-valid-date-max';
        maxInput.value = question.validation?.maxDate || '';
        row2.appendChild(maxInput);
        validSection.appendChild(row2);

        minInput.addEventListener('change', () => {
          question.validation = question.validation || {};
          question.validation.minDate = minInput.value || undefined;
          handlers.onSave?.();
        });
        maxInput.addEventListener('change', () => {
          question.validation = question.validation || {};
          question.validation.maxDate = maxInput.value || undefined;
          handlers.onSave?.();
        });
      } else if (question.type === QUESTION_TYPES.TIME) {
        const row1 = document.createElement('div');
        row1.className = 'dfb-validation-row';

        const minLabel = document.createElement('label');
        minLabel.textContent = 'Waktu min.';
        row1.appendChild(minLabel);

        const minInput = document.createElement('input');
        minInput.type = 'time';
        minInput.className = 'dfb-q-card-valid-time-min';
        minInput.value = question.validation?.minTime || '';
        row1.appendChild(minInput);
        validSection.appendChild(row1);

        const row2 = document.createElement('div');
        row2.className = 'dfb-validation-row';

        const maxLabel = document.createElement('label');
        maxLabel.textContent = 'Waktu maks.';
        row2.appendChild(maxLabel);

        const maxInput = document.createElement('input');
        maxInput.type = 'time';
        maxInput.className = 'dfb-q-card-valid-time-max';
        maxInput.value = question.validation?.maxTime || '';
        row2.appendChild(maxInput);
        validSection.appendChild(row2);

        minInput.addEventListener('change', () => {
          question.validation = question.validation || {};
          question.validation.minTime = minInput.value || undefined;
          handlers.onSave?.();
        });
        maxInput.addEventListener('change', () => {
          question.validation = question.validation || {};
          question.validation.maxTime = maxInput.value || undefined;
          handlers.onSave?.();
        });
      }
    }
    card.appendChild(validSection);

    /* ── Required Toggle / Bottom Footer Bar (Active only) ── */
    if (isActive) {
      const validationDiv = document.createElement('div');
      validationDiv.className = 'dfb-q-card-validation';
      validationDiv.style.cssText =
        'border-top:1px solid var(--dfb-border-color,#DADCE0); margin-top:20px; padding-top:16px;';

      const validationRow = document.createElement('div');
      validationRow.className = 'dfb-flex-center';
      validationRow.style.justifyContent = 'flex-end';
      validationRow.style.gap = '12px';

      // Duplicate icon button
      const dupBtn = document.createElement('button');
      dupBtn.className = 'dfb-q-card-toolbar-btn dfb-q-btn-duplicate';
      dupBtn.title = 'Duplikasi';
      dupBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
      `;
      dupBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        handlers.onDuplicate?.(question.questionId);
      });
      validationRow.appendChild(dupBtn);

      // Delete icon button
      const delBtn = document.createElement('button');
      delBtn.className = 'dfb-q-card-toolbar-btn dfb-q-card-toolbar-btn--danger dfb-q-btn-delete';
      delBtn.title = 'Hapus';
      delBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          <line x1="10" y1="11" x2="10" y2="17"></line>
          <line x1="14" y1="11" x2="14" y2="17"></line>
        </svg>
      `;
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        handlers.onDelete?.(question.questionId);
      });
      validationRow.appendChild(delBtn);

      // Separator line
      const footerSep = document.createElement('span');
      footerSep.style.cssText = 'height:24px; width:1px; background:#DADCE0; margin:0 8px;';
      validationRow.appendChild(footerSep);

      // Required toggle
      const reqLabelContainer = document.createElement('div');
      reqLabelContainer.className = 'dfb-required-toggle';

      const reqText = document.createElement('span');
      reqText.textContent = 'Wajib diisi';
      reqLabelContainer.appendChild(reqText);

      const toggleLabel = document.createElement('label');
      toggleLabel.className = 'dfb-toggle';

      const reqCheck = document.createElement('input');
      reqCheck.type = 'checkbox';
      reqCheck.className = 'dfb-q-required-toggle';
      reqCheck.checked = question.required;
      reqCheck.ariaLabel = 'Wajib diisi';
      toggleLabel.appendChild(reqCheck);

      const reqSlider = document.createElement('span');
      reqSlider.className = 'dfb-toggle-slider';
      toggleLabel.appendChild(reqSlider);

      reqLabelContainer.appendChild(toggleLabel);
      validationRow.appendChild(reqLabelContainer);

      // 3-dot Menu
      const menu = document.createElement('div');
      menu.className = 'dfb-q-card-menu';
      const menuBtn = document.createElement('button');
      menuBtn.className = 'dfb-q-card-menu-btn';
      menuBtn.style.cssText =
        'width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:none; background:transparent; cursor:pointer; color:#5F6368;';
      menuBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="1"></circle>
          <circle cx="12" cy="5" r="1"></circle>
          <circle cx="12" cy="19" r="1"></circle>
        </svg>
      `;
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
      if (question.type === QUESTION_TYPES.MULTIPLE_CHOICE) {
        branchOpt = document.createElement('button');
        branchOpt.textContent = 'Buka seksi berdasarkan jawaban';
        dropdown.appendChild(branchOpt);
      }

      menu.appendChild(dropdown);
      validationRow.appendChild(menu);

      validationDiv.appendChild(validationRow);
      card.appendChild(validationDiv);

      /* ── Update toggle states ── */
      const updateToggleIndicators = () => {
        descOpt.innerHTML = (question.description ? '\u2713 ' : '') + 'Deskripsi';
        validOpt.innerHTML = (isSectionVisible(validSection) ? '\u2713 ' : '') + 'Validasi';
        if (shuffleOpt) {
          shuffleOpt.innerHTML =
            (question.options?.shuffleOptions ? '\u2713 ' : '') + 'Acak urutan';
        }
        if (branchOpt) {
          branchOpt.innerHTML =
            (question.options?.showBranching ? '\u2713 ' : '') + 'Buka seksi berdasarkan jawaban';
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

      if (branchOpt) {
        branchOpt.addEventListener('click', (e) => {
          e.stopPropagation();
          question.options = question.options || {};
          question.options.showBranching = !question.options.showBranching;
          if (!question.options.showBranching) {
            delete question.options.branching;
          }
          handlers.onSave?.();
          eventBus.emit('form:updated');
          dropdown.classList.remove('dfb-q-card-dropdown--open');
        });
      }

      menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        updateToggleIndicators();
        document.querySelectorAll('.dfb-q-card-dropdown--open').forEach((d) => {
          if (d !== dropdown) d.classList.remove('dfb-q-card-dropdown--open');
        });
        dropdown.classList.toggle('dfb-q-card-dropdown--open');
      });

      reqCheck.addEventListener('change', () => {
        handlers.onRequiredToggle?.(question.questionId, reqCheck.checked);
      });
    }

    /* ── Event handlers ── */
    descInput.addEventListener('blur', () => {
      const val = sanitizeText(descInput.value);
      question.description = val;
      if (!val) descSection.hidden = true;
      handlers.onSave?.();
    });

    titleInput.addEventListener('blur', () => {
      question.title = sanitizeText(titleInput.value);
      handlers.onSave?.();
    });

    // Activating card when clicked (if currently inactive)
    if (!isActive) {
      card.addEventListener('click', (e) => {
        if (!e.target.closest('.dfb-drag-handle') && !e.target.closest('button')) {
          handlers.onEdit?.(question.questionId);
        }
      });
    }

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
    case QUESTION_TYPES.FILE_UPLOAD: {
      const wrapper = document.createElement('div');
      wrapper.className = 'dfb-field';
      wrapper.style.cssText =
        'border: 1px dashed #DADCE0; border-radius: 4px; padding: 12px; font-size: 13px; color: #5F6368; display: inline-flex; align-items: center; gap: 8px;';
      wrapper.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="17 8 12 3 7 8"></polyline>
          <line x1="12" y1="3" x2="12" y2="15"></line>
        </svg>
        <span>Pilih File</span>
      `;
      return wrapper;
    }
    case QUESTION_TYPES.RATING: {
      const wrapper = document.createElement('div');
      wrapper.style.cssText = 'display: flex; gap: 4px; color: #DADCE0; font-size: 20px;';
      const max = question.options?.maxStars ?? 5;
      for (let i = 0; i < max; i++) {
        const star = document.createElement('span');
        star.innerHTML = '&#9734;';
        wrapper.appendChild(star);
      }
      return wrapper;
    }
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
  div.style.cssText =
    'max-width:300px;background:#f8f9fa;padding:8px 12px;display:flex;justify-content:space-between;align-items:center;color:var(--dfb-text-secondary,#5F6368);';
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
