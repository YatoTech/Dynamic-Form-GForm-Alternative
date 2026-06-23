import { debounce } from '../../../core/utils/debounce.js';

export class MultipleChoiceEditor {
  static render(question, container, sections = []) {
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

      const radio = document.createElement('div');
      radio.className = 'dfb-editor-choice-indicator';
      row.appendChild(radio);

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
          const oldVal = question.options.choices[i];
          const newVal = input.value;
          question.options.choices[i] = newVal;

          if (question.options.branching && question.options.branching[oldVal] !== undefined) {
            question.options.branching[newVal] = question.options.branching[oldVal];
            delete question.options.branching[oldVal];
          }
        }, 300),
      );
      row.appendChild(input);

      if (question.options?.showBranching) {
        const select = document.createElement('select');
        select.className = 'dfb-editor-branch-select';
        select.style.cssText =
          'font-size:12px; max-width:200px; padding:4px 8px; margin-left:8px; border:1px solid #DADCE0; border-radius:4px; outline:none;';

        const optNext = document.createElement('option');
        optNext.value = '__next__';
        optNext.textContent = 'Lanjut ke bagian berikutnya';
        select.appendChild(optNext);

        const optSubmit = document.createElement('option');
        optSubmit.value = '__submit__';
        optSubmit.textContent = 'Kirim formulir';
        select.appendChild(optSubmit);

        sections.forEach((sec, idx) => {
          const opt = document.createElement('option');
          opt.value = sec.sectionId;
          opt.textContent = `Buka bagian ${idx + 1}: ${sec.title || 'Tanpa Judul'}`;
          select.appendChild(opt);
        });

        const currentTarget = question.options.branching?.[choice] || '__next__';
        select.value = currentTarget;

        select.addEventListener('change', () => {
          question.options.branching = question.options.branching || {};
          question.options.branching[choice] = select.value;
          const changeEvent = new Event('change', { bubbles: true });
          select.dispatchEvent(changeEvent);
        });

        row.appendChild(select);
      }

      if (choices.length > 1) {
        const removeBtn = document.createElement('button');
        removeBtn.className = 'dfb-editor-choice-remove';
        removeBtn.textContent = '\u00D7';
        removeBtn.addEventListener('click', () => {
          const valToRemove = question.options.choices[i];
          question.options.choices.splice(i, 1);
          if (question.options.branching) {
            delete question.options.branching[valToRemove];
          }
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
      otherIndicator.className = 'dfb-editor-choice-indicator';
      otherRow.appendChild(otherIndicator);

      const otherInput = document.createElement('input');
      otherInput.type = 'text';
      otherInput.className = 'dfb-editor-input dfb-editor-choice-input';
      otherInput.value = 'Lainnya...';
      otherInput.disabled = true;
      otherInput.style.fontStyle = 'italic';
      otherRow.appendChild(otherInput);

      if (question.options?.showBranching) {
        const select = document.createElement('select');
        select.className = 'dfb-editor-branch-select';
        select.style.cssText =
          'font-size:12px; max-width:200px; padding:4px 8px; margin-left:8px; border:1px solid #DADCE0; border-radius:4px; outline:none;';

        const optNext = document.createElement('option');
        optNext.value = '__next__';
        optNext.textContent = 'Lanjut ke bagian berikutnya';
        select.appendChild(optNext);

        const optSubmit = document.createElement('option');
        optSubmit.value = '__submit__';
        optSubmit.textContent = 'Kirim formulir';
        select.appendChild(optSubmit);

        sections.forEach((sec, idx) => {
          const opt = document.createElement('option');
          opt.value = sec.sectionId;
          opt.textContent = `Buka bagian ${idx + 1}: ${sec.title || 'Tanpa Judul'}`;
          select.appendChild(opt);
        });

        const currentTarget = question.options.branching?.['__other__'] || '__next__';
        select.value = currentTarget;

        select.addEventListener('change', () => {
          question.options.branching = question.options.branching || {};
          question.options.branching['__other__'] = select.value;
          const changeEvent = new Event('change', { bubbles: true });
          select.dispatchEvent(changeEvent);
        });

        otherRow.appendChild(select);
      }

      const removeOtherBtn = document.createElement('button');
      removeOtherBtn.className = 'dfb-editor-choice-remove';
      removeOtherBtn.textContent = '\u00D7';
      removeOtherBtn.addEventListener('click', () => {
        question.options.includeOther = false;
        if (question.options.branching) {
          delete question.options.branching['__other__'];
        }
        renderChoices();
      });
      otherRow.appendChild(removeOtherBtn);

      choicesWrapper.appendChild(otherRow);
    }

    // Inline Add Option Row
    const addRow = document.createElement('div');
    addRow.className = 'dfb-editor-choice-row dfb-editor-choice-add-row';

    const addIndicator = document.createElement('div');
    addIndicator.className = 'dfb-editor-choice-indicator';
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
      MultipleChoiceEditor.render(question, container, sections);
    }
  }
}
