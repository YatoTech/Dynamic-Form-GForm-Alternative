export class DateEditor {
  static render(question, container) {
    container.textContent = '';

    const field = document.createElement('div');
    field.className = 'dfb-field dfb-q-card-mock-input-wrap';

    const input = document.createElement('input');
    input.type = 'text';
    input.disabled = true;
    input.placeholder = 'Hari, bulan, tahun';
    input.className = 'dfb-q-card-mock-input dfb-q-card-mock-date';
    field.appendChild(input);

    const icon = document.createElement('span');
    icon.className = 'dfb-q-card-mock-icon';
    icon.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
      </svg>
    `;
    field.appendChild(icon);

    container.appendChild(field);
  }
}
