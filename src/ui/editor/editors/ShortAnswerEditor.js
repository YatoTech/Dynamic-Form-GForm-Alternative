import { debounce } from '../../../core/utils/debounce.js';

export class ShortAnswerEditor {
  static render(question, container) {
    container.textContent = '';

    const fieldset = document.createElement('div');
    fieldset.className = 'dfb-editor-fieldset';

    const patternFields = [
      { key: 'minLength', label: 'Min. karakter', type: 'number', placeholder: 'Tidak ada batas' },
      { key: 'maxLength', label: 'Maks. karakter', type: 'number', placeholder: 'Tidak ada batas' },
    ];

    patternFields.forEach(({ key, label, type, placeholder }) => {
      const wrapper = document.createElement('label');
      wrapper.className = 'dfb-editor-field';

      const span = document.createElement('span');
      span.className = 'dfb-editor-field-label';
      span.textContent = label;
      wrapper.appendChild(span);

      const input = document.createElement('input');
      input.type = type;
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

    const patternLabel = document.createElement('label');
    patternLabel.className = 'dfb-editor-field';
    const patternSpan = document.createElement('span');
    patternSpan.className = 'dfb-editor-field-label';
    patternSpan.textContent = 'Validasi format';
    patternLabel.appendChild(patternSpan);

    const patternSelect = document.createElement('select');
    patternSelect.className = 'dfb-editor-input';
    const patterns = [
      { value: 'none', label: 'Tidak ada' },
      { value: 'email', label: 'Email' },
      { value: 'url', label: 'URL' },
      { value: 'number', label: 'Angka' },
      { value: 'integer', label: 'Bilangan bulat' },
    ];
    patterns.forEach(({ value, label }) => {
      const opt = document.createElement('option');
      opt.value = value;
      opt.textContent = label;
      if ((question.validation?.pattern || 'none') === value) opt.selected = true;
      patternSelect.appendChild(opt);
    });
    patternSelect.addEventListener('change', () => {
      if (!question.validation) question.validation = {};
      question.validation.pattern = patternSelect.value;
    });
    patternLabel.appendChild(patternSelect);
    fieldset.appendChild(patternLabel);

    container.appendChild(fieldset);
  }
}
