import { debounce } from '../../../core/utils/debounce.js';

export class DropdownEditor {
  static render(question, container) {
    container.textContent = '';

    const fieldset = document.createElement('div');
    fieldset.className = 'dfb-editor-fieldset';

    const choices = question.options?.choices || ['Opsi 1'];
    const choicesWrapper = document.createElement('div');
    choicesWrapper.className = 'dfb-editor-choices';

    const titleSpan = document.createElement('span');
    titleSpan.className = 'dfb-editor-field-label';
    titleSpan.textContent = 'Opsi dropdown';
    choicesWrapper.appendChild(titleSpan);

    choices.forEach((choice, i) => {
      const row = document.createElement('div');
      row.className = 'dfb-editor-choice-row';

      const dragHandle = document.createElement('span');
      dragHandle.className = 'dfb-choice-drag-handle';
      dragHandle.innerHTML = '&#8286;';
      row.appendChild(dragHandle);

      const bullet = document.createElement('span');
      bullet.textContent = `${i + 1}.`;
      bullet.style.cssText =
        'color:var(--dfb-text-secondary,#5F6368);font-size:13px;min-width:20px;';
      row.appendChild(bullet);

      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'dfb-editor-input dfb-editor-choice-input';
      input.value = choice;
      input.placeholder = `Opsi ${i + 1}`;
      input.addEventListener(
        'input',
        debounce(() => {
          if (!question.options) question.options = {};
          if (!question.options.choices) question.options.choices = [];
          question.options.choices[i] = input.value;
        }, 300),
      );
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

    // Inline Add Option Row
    const addRow = document.createElement('div');
    addRow.className = 'dfb-editor-choice-row dfb-editor-choice-add-row';

    const addBullet = document.createElement('span');
    addBullet.textContent = `${choices.length + 1}.`;
    addBullet.style.cssText =
      'color:var(--dfb-text-secondary,#5F6368);font-size:13px;min-width:20px;opacity:0.5;';
    addRow.appendChild(addBullet);

    const addBtn = document.createElement('button');
    addBtn.className = 'dfb-btn-add-option-inline';
    addBtn.textContent = 'Tambahkan opsi';
    addBtn.addEventListener('click', () => {
      if (!question.options) question.options = {};
      if (!question.options.choices) question.options.choices = [];
      question.options.choices.push(`Opsi ${question.options.choices.length + 1}`);
      renderChoices();
    });
    addRow.appendChild(addBtn);
    choicesWrapper.appendChild(addRow);

    fieldset.appendChild(choicesWrapper);
    container.appendChild(fieldset);

    function renderChoices() {
      container.textContent = '';
      DropdownEditor.render(question, container);
    }
  }
}
