import { debounce } from '../../../core/utils/debounce.js';

export class CheckboxesEditor {
  static render(question, container) {
    container.textContent = '';

    const fieldset = document.createElement('div');
    fieldset.className = 'dfb-editor-fieldset';

    const choices = question.options?.choices || ['Opsi 1'];
    const choicesWrapper = document.createElement('div');
    choicesWrapper.className = 'dfb-editor-choices';

    const titleSpan = document.createElement('span');
    titleSpan.className = 'dfb-editor-field-label';
    titleSpan.textContent = 'Opsi jawaban';
    choicesWrapper.appendChild(titleSpan);

    choices.forEach((choice, i) => {
      const row = document.createElement('div');
      row.className = 'dfb-editor-choice-row';

      const box = document.createElement('span');
      box.textContent = '\u2610';
      box.style.cssText = 'color:var(--dfb-text-secondary,#5F6368);font-size:14px;';
      row.appendChild(box);

      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'dfb-editor-input dfb-editor-choice-input';
      input.value = choice;
      input.placeholder = `Opsi ${i + 1}`;
      input.addEventListener('input', debounce(() => {
        if (!question.options) question.options = {};
        if (!question.options.choices) question.options.choices = [];
        question.options.choices[i] = input.value;
      }, 300));
      row.appendChild(input);

      if (choices.length > 1) {
        const removeBtn = document.createElement('button');
        removeBtn.className = 'dfb-editor-choice-remove';
        removeBtn.textContent = '\u00D7';
        removeBtn.addEventListener('click', () => {
          question.options.choices.splice(i, 1);
          renderChoices();
        });
        row.appendChild(removeBtn);
      }

      choicesWrapper.appendChild(row);
    });

    const addBtn = document.createElement('button');
    addBtn.className = 'dfb-btn dfb-btn--ghost dfb-btn--sm';
    addBtn.textContent = '+ Tambah opsi';
    addBtn.addEventListener('click', () => {
      if (!question.options) question.options = {};
      if (!question.options.choices) question.options.choices = [];
      question.options.choices.push(`Opsi ${question.options.choices.length + 1}`);
      renderChoices();
    });
    choicesWrapper.appendChild(addBtn);

    const otherLabel = document.createElement('label');
    otherLabel.className = 'dfb-editor-field dfb-editor-check-row';

    const otherCheck = document.createElement('input');
    otherCheck.type = 'checkbox';
    otherCheck.checked = question.options?.includeOther || false;
    otherCheck.addEventListener('change', () => {
      if (!question.options) question.options = {};
      question.options.includeOther = otherCheck.checked;
    });
    otherLabel.appendChild(otherCheck);

    const otherSpan = document.createElement('span');
    otherSpan.textContent = ' Tambah opsi "Lainnya"';
    otherLabel.appendChild(otherSpan);

    choicesWrapper.appendChild(otherLabel);

    const selectWrapper = document.createElement('div');
    selectWrapper.className = 'dfb-editor-select-group';

    const minField = document.createElement('label');
    minField.className = 'dfb-editor-field';
    const minSpan = document.createElement('span');
    minSpan.className = 'dfb-editor-field-label';
    minSpan.textContent = 'Min. pilihan';
    minField.appendChild(minSpan);
    const minInput = document.createElement('input');
    minInput.type = 'number';
    minInput.className = 'dfb-editor-input';
    minInput.placeholder = 'Tidak ada';
    if (question.options?.minSelect != null) minInput.value = question.options.minSelect;
    minInput.addEventListener('input', debounce(() => {
      if (!question.options) question.options = {};
      question.options.minSelect = minInput.value ? Number(minInput.value) : null;
    }, 300));
    minField.appendChild(minInput);
    selectWrapper.appendChild(minField);

    const maxField = document.createElement('label');
    maxField.className = 'dfb-editor-field';
    const maxSpan = document.createElement('span');
    maxSpan.className = 'dfb-editor-field-label';
    maxSpan.textContent = 'Maks. pilihan';
    maxField.appendChild(maxSpan);
    const maxInput = document.createElement('input');
    maxInput.type = 'number';
    maxInput.className = 'dfb-editor-input';
    maxInput.placeholder = 'Tidak ada';
    if (question.options?.maxSelect != null) maxInput.value = question.options.maxSelect;
    maxInput.addEventListener('input', debounce(() => {
      if (!question.options) question.options = {};
      question.options.maxSelect = maxInput.value ? Number(maxInput.value) : null;
    }, 300));
    maxField.appendChild(maxInput);
    selectWrapper.appendChild(maxField);

    fieldset.appendChild(choicesWrapper);
    fieldset.appendChild(selectWrapper);
    container.appendChild(fieldset);

    function renderChoices() {
      container.textContent = '';
      CheckboxesEditor.render(question, container);
    }
  }
}
