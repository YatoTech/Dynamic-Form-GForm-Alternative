export class ColorPicker {
  /**
   * @param {string} label
   * @param {string} value - Hex color
   * @param {(color: string) => void} onChange
   * @returns {HTMLElement}
   */
  static create(label, value, onChange) {
    const container = document.createElement('div');
    container.className = 'dfb-color-row';

    const labelEl = document.createElement('label');
    labelEl.textContent = label;
    labelEl.className = 'dfb-color-label';

    const input = document.createElement('input');
    input.type = 'color';
    input.value = value || '#4285F4';
    input.className = 'dfb-color-input';
    input.addEventListener('input', () => onChange(input.value));

    container.appendChild(labelEl);
    container.appendChild(input);
    return container;
  }
}
