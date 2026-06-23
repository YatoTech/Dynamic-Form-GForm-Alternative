export class CheckboxesField {
  static create(question, value = []) {
    const wrapper = document.createElement('div');
    wrapper.className = 'gf-options-list';

    const selected = Array.isArray(value) ? value : [];
    const choices = question.options?.choices || ['Opsi 1'];
    const includeOther = question.options?.includeOther;
    let otherInput = null;

    choices.forEach((choice) => {
      const row = document.createElement('label');
      row.className = 'gf-option-row';

      const input = document.createElement('input');
      input.type = 'checkbox';
      input.className = 'gf-checkbox-input';
      input.value = choice;
      if (selected.includes(choice)) input.checked = true;

      const visual = document.createElement('div');
      visual.className = 'gf-checkbox-visual';
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
      input.type = 'checkbox';
      input.className = 'gf-checkbox-input';
      input.value = '__other__';

      const visual = document.createElement('div');
      visual.className = 'gf-checkbox-visual';
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
      otherInput.style.display = 'none';

      const otherWrap = document.createElement('div');
      otherWrap.className = 'gf-other-wrap';
      const spacer = document.createElement('div');
      spacer.style.cssText = 'width:28px;flex-shrink:0';
      otherWrap.appendChild(spacer);
      otherWrap.appendChild(otherInput);
      wrapper.appendChild(otherWrap);

      input.addEventListener('change', () => {
        if (input.checked) {
          otherInput.style.display = 'inline-block';
          otherInput.focus();
        } else {
          otherInput.style.display = 'none';
          otherInput.value = '';
        }
      });
    }

    return wrapper;
  }
}
