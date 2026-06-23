export class ShortAnswerEditor {
  static render(question, container) {
    container.textContent = '';

    const field = document.createElement('div');
    field.className = 'dfb-field';

    const input = document.createElement('input');
    input.type = 'text';
    input.disabled = true;
    input.placeholder = 'Teks jawaban singkat';
    input.className = 'dfb-q-card-mock-input';
    field.appendChild(input);

    container.appendChild(field);
  }
}
