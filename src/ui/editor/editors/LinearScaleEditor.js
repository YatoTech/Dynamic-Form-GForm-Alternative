import { debounce } from '../../../core/utils/debounce.js';

export class LinearScaleEditor {
  static render(question, container) {
    container.textContent = '';

    const fieldset = document.createElement('div');
    fieldset.className = 'dfb-editor-fieldset';

    const rangeWrapper = document.createElement('div');
    rangeWrapper.className = 'dfb-editor-range-row';

    const minField = document.createElement('label');
    minField.className = 'dfb-editor-field';
    const minSpan = document.createElement('span');
    minSpan.className = 'dfb-editor-field-label';
    minSpan.textContent = 'Nilai minimal';
    minField.appendChild(minSpan);

    const minSelect = document.createElement('select');
    minSelect.className = 'dfb-editor-input';
    const minValues = [0, 1];
    minValues.forEach((v) => {
      const opt = document.createElement('option');
      opt.value = v;
      opt.textContent = v;
      if ((question.options?.minScale ?? 1) === v) opt.selected = true;
      minSelect.appendChild(opt);
    });
    minSelect.addEventListener('change', () => {
      if (!question.options) question.options = {};
      question.options.minScale = Number(minSelect.value);
    });
    minField.appendChild(minSelect);
    rangeWrapper.appendChild(minField);

    const maxField = document.createElement('label');
    maxField.className = 'dfb-editor-field';
    const maxSpan = document.createElement('span');
    maxSpan.className = 'dfb-editor-field-label';
    maxSpan.textContent = 'Nilai maksimal';
    maxField.appendChild(maxSpan);

    const maxSelect = document.createElement('select');
    maxSelect.className = 'dfb-editor-input';
    const maxValues = [3, 4, 5, 6, 7, 8, 9, 10];
    maxValues.forEach((v) => {
      const opt = document.createElement('option');
      opt.value = v;
      opt.textContent = v;
      if ((question.options?.maxScale ?? 5) === v) opt.selected = true;
      maxSelect.appendChild(opt);
    });
    maxSelect.addEventListener('change', () => {
      if (!question.options) question.options = {};
      question.options.maxScale = Number(maxSelect.value);
    });
    maxField.appendChild(maxSelect);
    rangeWrapper.appendChild(maxField);

    fieldset.appendChild(rangeWrapper);

    const labelFields = [
      { key: 'leftLabel', label: 'Label kiri (opsional)', placeholder: 'Sangat tidak setuju' },
      { key: 'rightLabel', label: 'Label kanan (opsional)', placeholder: 'Sangat setuju' },
    ];

    labelFields.forEach(({ key, label, placeholder }) => {
      const wrapper = document.createElement('label');
      wrapper.className = 'dfb-editor-field';

      const span = document.createElement('span');
      span.className = 'dfb-editor-field-label';
      span.textContent = label;
      wrapper.appendChild(span);

      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'dfb-editor-input';
      input.placeholder = placeholder;
      if (question.options?.[key]) input.value = question.options[key];
      input.addEventListener('input', debounce(() => {
        if (!question.options) question.options = {};
        question.options[key] = input.value;
      }, 300));
      wrapper.appendChild(input);

      fieldset.appendChild(wrapper);
    });

    container.appendChild(fieldset);
  }
}
