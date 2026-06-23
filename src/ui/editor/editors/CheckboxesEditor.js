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

      const dragHandle = document.createElement('span');
      dragHandle.className = 'dfb-choice-drag-handle';
      dragHandle.innerHTML = '&#8286;';
      row.appendChild(dragHandle);

      const box = document.createElement('div');
      box.className = 'dfb-editor-choice-indicator dfb-editor-choice-indicator--checkbox';
      row.appendChild(box);

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

    // If "Other" option is included, show it
    if (question.options?.includeOther) {
      const otherRow = document.createElement('div');
      otherRow.className = 'dfb-editor-choice-row dfb-editor-choice-other-row';

      const otherIndicator = document.createElement('div');
      otherIndicator.className =
        'dfb-editor-choice-indicator dfb-editor-choice-indicator--checkbox';
      otherRow.appendChild(otherIndicator);

      const otherInput = document.createElement('input');
      otherInput.type = 'text';
      otherInput.className = 'dfb-editor-input dfb-editor-choice-input';
      otherInput.value = 'Lainnya...';
      otherInput.disabled = true;
      otherInput.style.fontStyle = 'italic';
      otherRow.appendChild(otherInput);

      const removeOtherBtn = document.createElement('button');
      removeOtherBtn.className = 'dfb-editor-choice-remove';
      removeOtherBtn.textContent = '\u00D7';
      removeOtherBtn.addEventListener('click', () => {
        question.options.includeOther = false;
        renderChoices();
      });
      otherRow.appendChild(removeOtherBtn);

      choicesWrapper.appendChild(otherRow);
    }

    // Inline Add Option Row
    const addRow = document.createElement('div');
    addRow.className = 'dfb-editor-choice-row dfb-editor-choice-add-row';

    const addIndicator = document.createElement('div');
    addIndicator.className = 'dfb-editor-choice-indicator dfb-editor-choice-indicator--checkbox';
    addIndicator.style.opacity = '0.5';
    addRow.appendChild(addIndicator);

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

    if (!question.options?.includeOther) {
      const orSpan = document.createElement('span');
      orSpan.textContent = ' atau ';
      orSpan.style.cssText = 'font-size: 13px; color: var(--dfb-text-secondary); margin: 0 4px;';
      addRow.appendChild(orSpan);

      const addOtherBtn = document.createElement('button');
      addOtherBtn.className = 'dfb-btn-add-other-inline';
      addOtherBtn.textContent = 'tambahkan "Lainnya"';
      addOtherBtn.addEventListener('click', () => {
        if (!question.options) question.options = {};
        question.options.includeOther = true;
        renderChoices();
      });
      addRow.appendChild(addOtherBtn);
    }
    choicesWrapper.appendChild(addRow);

    fieldset.appendChild(choicesWrapper);
    container.appendChild(fieldset);

    function renderChoices() {
      container.textContent = '';
      CheckboxesEditor.render(question, container);
    }
  }
}
