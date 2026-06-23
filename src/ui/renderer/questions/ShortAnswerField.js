export class ShortAnswerField {
  static create(question, value = '', hasError = false) {
    const wrapper = document.createElement('div');

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'gf-input' + (hasError ? ' gf-input--error' : '');
    input.id = `q-${question.questionId}`;
    input.value = value;
    input.placeholder = 'Jawaban Anda';
    input.maxLength = question.validation?.maxLength || 500;
    if (question.required) input.setAttribute('aria-required', 'true');
    wrapper.appendChild(input);

    return wrapper;
  }
}
