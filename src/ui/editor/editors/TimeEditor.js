export class TimeEditor {
  static render(question, container) {
    container.textContent = '';

    const field = document.createElement('div');
    field.className = 'dfb-field dfb-q-card-mock-input-wrap';

    const input = document.createElement('input');
    input.type = 'text';
    input.disabled = true;
    input.placeholder = 'Waktu';
    input.className = 'dfb-q-card-mock-input dfb-q-card-mock-time';
    field.appendChild(input);

    const icon = document.createElement('span');
    icon.className = 'dfb-q-card-mock-icon';
    icon.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
      </svg>
    `;
    field.appendChild(icon);

    container.appendChild(field);
  }
}
