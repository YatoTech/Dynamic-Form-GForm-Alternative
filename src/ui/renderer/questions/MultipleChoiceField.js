export class MultipleChoiceField {
  static create(question, value = '') {
    const wrapper = document.createElement('div');
    wrapper.className = 'gf-options-list';

    const choices = question.options?.choices || ['Opsi 1'];
    const includeOther = question.options?.includeOther;
    const name = `q-${question.questionId}`;
    let otherInput = null;

    choices.forEach((choice) => {
      const row = document.createElement('label');
      row.className = 'gf-option-row';

      const input = document.createElement('input');
      input.type = 'radio';
      input.className = 'gf-radio-input';
      input.name = name;
      input.value = choice;
      if (choice === value) input.checked = true;

      const visual = document.createElement('div');
      visual.className = 'gf-radio-visual';
      visual.setAttribute('aria-hidden', 'true');

      const labelSpan = document.createElement('span');
      labelSpan.className = 'gf-option-label';
      labelSpan.textContent = choice;

      row.appendChild(input);
      row.appendChild(visual);
      row.appendChild(labelSpan);
      wrapper.appendChild(row);
    });

    if (includeOther) {
      const row = document.createElement('label');
      row.className = 'gf-option-row';

      const input = document.createElement('input');
      input.type = 'radio';
      input.className = 'gf-radio-input';
      input.name = name;
      input.value = '__other__';
      if (value && !choices.includes(value)) input.checked = true;

      const visual = document.createElement('div');
      visual.className = 'gf-radio-visual';
      visual.setAttribute('aria-hidden', 'true');

      const labelSpan = document.createElement('span');
      labelSpan.className = 'gf-option-label';
      labelSpan.textContent = 'Lainnya';

      row.appendChild(input);
      row.appendChild(visual);
      row.appendChild(labelSpan);
      wrapper.appendChild(row);

      otherInput = document.createElement('input');
      otherInput.type = 'text';
      otherInput.className = 'gf-other-input';
      otherInput.placeholder = 'Isi jawaban Anda';
      otherInput.style.display = input.checked ? 'inline-block' : 'none';
      otherInput.value = value && !choices.includes(value) ? value : '';

      const otherWrap = document.createElement('div');
      otherWrap.className = 'gf-other-wrap';
      const spacer = document.createElement('div');
      spacer.style.cssText = 'width:28px;flex-shrink:0';
      otherWrap.appendChild(spacer);
      otherWrap.appendChild(otherInput);
      wrapper.appendChild(otherWrap);

      input.addEventListener('change', () => {
        otherInput.style.display = 'inline-block';
        otherInput.focus();
      });

      const others = wrapper.querySelectorAll('input[type="radio"]:not([value="__other__"])');
      others.forEach((r) => {
        r.addEventListener('change', () => {
          otherInput.style.display = 'none';
          otherInput.value = '';
        });
      });
    }

    return wrapper;
  }
}
