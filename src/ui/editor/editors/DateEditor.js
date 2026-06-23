import { debounce } from '../../../core/utils/debounce.js';

export class DateEditor {
  static render(question, container) {
    container.textContent = '';

    const fieldset = document.createElement('div');
    fieldset.className = 'dfb-editor-fieldset';

    const dateFields = [
      { key: 'minDate', label: 'Tanggal minimal', placeholder: 'YYYY-MM-DD' },
      { key: 'maxDate', label: 'Tanggal maksimal', placeholder: 'YYYY-MM-DD' },
    ];

    dateFields.forEach(({ key, label, placeholder }) => {
      const wrapper = document.createElement('label');
      wrapper.className = 'dfb-editor-field';

      const span = document.createElement('span');
      span.className = 'dfb-editor-field-label';
      span.textContent = label;
      wrapper.appendChild(span);

      const input = document.createElement('input');
      input.type = 'date';
      input.className = 'dfb-editor-input';
      input.placeholder = placeholder;
      if (question.validation?.[key]) input.value = question.validation[key];
      input.addEventListener('input', debounce(() => {
        if (!question.validation) question.validation = {};
        question.validation[key] = input.value || null;
      }, 300));
      wrapper.appendChild(input);

      fieldset.appendChild(wrapper);
    });

    container.appendChild(fieldset);
  }
}
