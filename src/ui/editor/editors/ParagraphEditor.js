export class ParagraphEditor {
  static render(question, container) {
    container.textContent = '';

    const field = document.createElement('div');
    field.className = 'dfb-field';

    const textarea = document.createElement('textarea');
    textarea.disabled = true;
    textarea.placeholder = 'Teks jawaban panjang';
    textarea.className = 'dfb-q-card-mock-input dfb-q-card-mock-textarea';
    textarea.rows = 1;
    field.appendChild(textarea);

    container.appendChild(field);
  }
}
