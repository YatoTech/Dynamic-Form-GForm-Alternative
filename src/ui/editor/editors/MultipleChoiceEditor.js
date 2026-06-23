import { debounce } from '../../../core/utils/debounce.js';

export class MultipleChoiceEditor {
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

      const radio = document.createElement('span');
      radio.textContent = '\u25C9';
      radio.style.cssText = 'color:var(--dfb-text-secondary,#5F6368);font-size:14px;';
      row.appendChild(radio);

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
    fieldset.appendChild(choicesWrapper);
    container.appendChild(fieldset);

    function renderChoices() {
      container.textContent = '';
      MultipleChoiceEditor.render(question, container);
    }
  }
}
