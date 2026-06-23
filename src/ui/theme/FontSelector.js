export class FontSelector {
  /**
   * @param {string} value
   * @param {(font: string) => void} onChange
   * @returns {HTMLElement}
   */
  static create(value, onChange) {
    const container = document.createElement('div');
    container.className = 'dfb-font-row';

    const label = document.createElement('label');
    label.textContent = 'Font';
    label.className = 'dfb-font-label';

    const select = document.createElement('select');
    select.className = 'dfb-font-select';
    const fonts = ['Sans Serif', 'Serif', 'Monospace', 'Decorative'];
    fonts.forEach((f) => {
      const opt = document.createElement('option');
      opt.value = f;
      opt.textContent = f;
      if (f === value) opt.selected = true;
      select.appendChild(opt);
    });
    select.addEventListener('change', () => onChange(select.value));

    container.appendChild(label);
    container.appendChild(select);
    return container;
  }
}
