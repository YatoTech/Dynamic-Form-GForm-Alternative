import { debounce } from '../../../core/utils/debounce.js';

export class ParagraphEditor {
  static render(question, container) {
    container.textContent = '';

    const fieldset = document.createElement('div');
    fieldset.className = 'dfb-editor-fieldset';

    const lengthFields = [
      { key: 'minLength', label: 'Min. karakter', placeholder: 'Tidak ada batas' },
      { key: 'maxLength', label: 'Maks. karakter', placeholder: 'Tidak ada batas' },
    ];

    lengthFields.forEach(({ key, label, placeholder }) => {
      const wrapper = document.createElement('label');
      wrapper.className = 'dfb-editor-field';

      const span = document.createElement('span');
      span.className = 'dfb-editor-field-label';
      span.textContent = label;
      wrapper.appendChild(span);

      const input = document.createElement('input');
      input.type = 'number';
      input.className = 'dfb-editor-input';
      input.placeholder = placeholder;
      if (question.validation?.[key] != null) input.value = question.validation[key];
      input.addEventListener('input', debounce(() => {
        if (!question.validation) question.validation = {};
        question.validation[key] = input.value ? Number(input.value) : null;
      }, 300));
      wrapper.appendChild(input);

      fieldset.appendChild(wrapper);
    });

    container.appendChild(fieldset);
  }
}
