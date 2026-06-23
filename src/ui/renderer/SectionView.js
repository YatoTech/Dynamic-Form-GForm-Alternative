import { ShortAnswerField } from './questions/ShortAnswerField.js';
import { ParagraphField } from './questions/ParagraphField.js';
import { MultipleChoiceField } from './questions/MultipleChoiceField.js';
import { CheckboxesField } from './questions/CheckboxesField.js';
import { DropdownField } from './questions/DropdownField.js';
import { LinearScaleField } from './questions/LinearScaleField.js';
import { DateField } from './questions/DateField.js';
import { TimeField } from './questions/TimeField.js';
import { McGridField } from './questions/McGridField.js';
import { CheckboxGridField } from './questions/CheckboxGridField.js';
import { FileUploadField } from './questions/FileUploadField.js';
import { RatingField } from './questions/RatingField.js';
import { QUESTION_TYPES } from '../../core/form/QuestionTypes.js';
import {
  validateField,
  validateChoices,
  validateGrid,
} from '../../core/engine/ValidationEngine.js';

const FIELD_MAP = {
  [QUESTION_TYPES.SHORT_ANSWER]: ShortAnswerField,
  [QUESTION_TYPES.PARAGRAPH]: ParagraphField,
  [QUESTION_TYPES.MULTIPLE_CHOICE]: MultipleChoiceField,
  [QUESTION_TYPES.CHECKBOXES]: CheckboxesField,
  [QUESTION_TYPES.DROPDOWN]: DropdownField,
  [QUESTION_TYPES.LINEAR_SCALE]: LinearScaleField,
  [QUESTION_TYPES.DATE]: DateField,
  [QUESTION_TYPES.TIME]: TimeField,
  [QUESTION_TYPES.MULTIPLE_CHOICE_GRID]: McGridField,
  [QUESTION_TYPES.CHECKBOX_GRID]: CheckboxGridField,
  [QUESTION_TYPES.FILE_UPLOAD]: FileUploadField,
  [QUESTION_TYPES.RATING]: RatingField,
};

export class SectionView {
  static create(section, questions, answers = {}, errors = {}) {
    const container = document.createElement('div');

    if (section.title) {
      const banner = document.createElement('div');
      banner.className = 'gf-section-banner';

      const name = document.createElement('div');
      name.className = 'gf-section-name';
      name.textContent = section.title;
      banner.appendChild(name);

      if (section.description) {
        const desc = document.createElement('div');
        desc.className = 'gf-section-desc';
        desc.textContent = section.description;
        banner.appendChild(desc);
      }

      container.appendChild(banner);
    }

    questions.forEach((q) => {
      const card = document.createElement('div');
      card.className = 'gf-card' + (errors[q.questionId] ? ' gf-card--error' : '');
      card.id = `q-card-${q.questionId}`;

      const label = document.createElement('div');
      label.className = 'gf-question-label';
      label.textContent = q.title || 'Pertanyaan';

      if (q.required) {
        const star = document.createElement('span');
        star.className = 'gf-required-star';
        star.textContent = '*';
        label.appendChild(star);
      }

      card.appendChild(label);

      if (q.description) {
        const desc = document.createElement('div');
        desc.className = 'gf-question-desc';
        desc.textContent = q.description;
        card.appendChild(desc);
      }

      if (q.imageUrl) {
        const imgContainer = document.createElement('div');
        imgContainer.className = 'gf-question-image-container';
        imgContainer.style.cssText = 'margin: 12px 0; max-width: 100%;';
        const img = document.createElement('img');
        img.src = q.imageUrl;
        img.style.cssText = 'max-width: 100%; max-height: 350px; border-radius: 8px; object-fit: contain; border: 1px solid var(--dfb-border-color,#dadce0);';
        img.alt = q.title || 'Gambar Pertanyaan';
        imgContainer.appendChild(img);
        card.appendChild(imgContainer);
      }

      const fieldWrapper = document.createElement('div');
      fieldWrapper.dataset.qid = q.questionId;
      card.appendChild(fieldWrapper);

      const FieldClass = FIELD_MAP[q.type];
      if (FieldClass) {
        const fieldEl = FieldClass.create(
          q,
          answers[q.questionId]?.value ?? '',
          !!errors[q.questionId],
        );
        fieldWrapper.appendChild(fieldEl);
      }

      if (errors[q.questionId]) {
        const errEl = document.createElement('span');
        errEl.className = 'gf-error-msg';
        errEl.setAttribute('role', 'alert');
        errEl.textContent = errors[q.questionId];
        card.appendChild(errEl);
      }

      container.appendChild(card);
    });

    return container;
  }

  static collectAnswers(sectionEl, questions) {
    const answers = {};
    questions.forEach((q) => {
      const wrapper = sectionEl.querySelector(`[data-qid="${q.questionId}"]`);
      if (!wrapper) return;
      answers[q.questionId] = { questionType: q.type, value: collectFieldValue(wrapper, q) };
    });
    return answers;
  }

  static validate(sectionEl, questions) {
    const errors = {};
    questions.forEach((q) => {
      const wrapper = sectionEl.querySelector(`[data-qid="${q.questionId}"]`);
      if (!wrapper) return;
      const value = collectFieldValue(wrapper, q);
      const validationConfig = Object.assign({ required: q.required }, q.validation);
      const result = validateField(value, validationConfig);
      if (!result.isValid) {
        errors[q.questionId] = result.error;
      }
      if (Array.isArray(value) && q.validation?.minSelect != null) {
        const choiceResult = validateChoices(value, validationConfig);
        if (!choiceResult.isValid) {
          errors[q.questionId] = choiceResult.error;
        }
      }
      if (
        q.type === QUESTION_TYPES.MULTIPLE_CHOICE_GRID ||
        q.type === QUESTION_TYPES.CHECKBOX_GRID
      ) {
        const gridResult = validateGrid(value, validationConfig, q.options?.rows || [], q.type);
        if (!gridResult.isValid) {
          errors[q.questionId] = gridResult.error;
        }
      }
    });
    return errors;
  }
}

function collectFieldValue(wrapper, q) {
  switch (q.type) {
    case QUESTION_TYPES.SHORT_ANSWER: {
      const input = wrapper.querySelector('.gf-input');
      return input ? input.value : '';
    }
    case QUESTION_TYPES.PARAGRAPH: {
      const textarea = wrapper.querySelector('.gf-textarea');
      return textarea ? textarea.value : '';
    }
    case QUESTION_TYPES.MULTIPLE_CHOICE: {
      const selected = wrapper.querySelector('.gf-radio-input:checked');
      if (!selected) return '';
      if (selected.value === '__other__') {
        const other = wrapper.querySelector('.gf-other-input');
        return other ? other.value : '';
      }
      return selected.value;
    }
    case QUESTION_TYPES.CHECKBOXES: {
      const checked = wrapper.querySelectorAll('.gf-checkbox-input:checked');
      const values = [];
      checked.forEach((cb) => {
        if (cb.value === '__other__') {
          const other = wrapper.querySelector('.gf-other-input');
          if (other && other.value) values.push(other.value);
        } else {
          values.push(cb.value);
        }
      });
      return values;
    }
    case QUESTION_TYPES.DROPDOWN: {
      const select = wrapper.querySelector('.gf-select');
      return select ? select.value : '';
    }
    case QUESTION_TYPES.LINEAR_SCALE: {
      const selected = wrapper.querySelector('.gf-scale-input:checked');
      return selected ? selected.value : '';
    }
    case QUESTION_TYPES.DATE: {
      const input = wrapper.querySelector('.gf-input-date');
      return input ? input.value : '';
    }
    case QUESTION_TYPES.TIME: {
      const input = wrapper.querySelector('.gf-input-time');
      return input ? input.value : '';
    }
    case QUESTION_TYPES.MULTIPLE_CHOICE_GRID: {
      const rows = q.options?.rows || [];
      const result = {};
      rows.forEach((_, ri) => {
        const checked = wrapper.querySelector(
          `.gf-grid-radio-input[name="q-${q.questionId}_r${ri}"]:checked`,
        );
        if (checked) result[String(ri)] = checked.value;
      });
      return result;
    }
    case QUESTION_TYPES.CHECKBOX_GRID: {
      const rows = q.options?.rows || [];
      const result = {};
      rows.forEach((_, ri) => {
        const rowInputs = wrapper.querySelectorAll(
          `.gf-grid-checkbox-input[name="q-${q.questionId}_r${ri}[]"]:checked`,
        );
        const vals = [];
        rowInputs.forEach((cb) => vals.push(cb.value));
        if (vals.length > 0) result[String(ri)] = vals;
      });
      return result;
    }
    case QUESTION_TYPES.RATING: {
      const input = wrapper.querySelector('.gf-input-rating');
      return input ? input.value : '';
    }
    case QUESTION_TYPES.FILE_UPLOAD: {
      const input = wrapper.querySelector('.gf-input-file-data');
      if (input && input.value) {
        try {
          return JSON.parse(input.value);
        } catch {
          return null;
        }
      }
      return null;
    }
    default:
      return '';
  }
}
