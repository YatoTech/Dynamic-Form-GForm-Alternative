export class DropdownField {
  static create(question, value = '') {
    const wrapper = document.createElement('div');
    wrapper.className = 'gf-select-wrap';

    const select = document.createElement('select');
    select.className = 'gf-select';
    select.id = `q-${question.questionId}`;
    if (question.required) select.setAttribute('aria-required', 'true');

    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = 'Pilih';
    placeholder.disabled = true;
    placeholder.selected = !value;
    select.appendChild(placeholder);

    (question.options?.choices || ['Opsi 1']).forEach((choice) => {
      const opt = document.createElement('option');
      opt.value = choice;
      opt.textContent = choice;
      if (choice === value) opt.selected = true;
      select.appendChild(opt);
    });

    wrapper.appendChild(select);

    const arrow = document.createElement('span');
    arrow.className = 'gf-select-arrow';
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = '\u25BE';
    wrapper.appendChild(arrow);

    return wrapper;
  }
}
