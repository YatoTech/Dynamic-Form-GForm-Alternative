export class ParagraphField {
  static create(question, value = '', hasError = false) {
    const wrapper = document.createElement('div');

    const textarea = document.createElement('textarea');
    textarea.className = 'gf-textarea' + (hasError ? ' gf-input--error' : '');
    textarea.id = `q-${question.questionId}`;
    textarea.placeholder = 'Jawaban Anda';
    textarea.value = value;
    textarea.rows = 1;
    textarea.maxLength = question.validation?.maxLength || 5000;
    if (question.required) textarea.setAttribute('aria-required', 'true');

    textarea.addEventListener('input', function () {
      this.style.height = 'auto';
      this.style.height = this.scrollHeight + 'px';
    });

    requestAnimationFrame(() => {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    });

    wrapper.appendChild(textarea);
    return wrapper;
  }
}
