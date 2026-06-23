export class TimeField {
  static create(question, value = '', hasError = false) {
    const wrapper = document.createElement('div');

    const input = document.createElement('input');
    input.type = 'time';
    input.className = 'gf-input gf-input-time' + (hasError ? ' gf-input--error' : '');
    input.id = `q-${question.questionId}`;
    input.value = value;
    if (question.required) input.setAttribute('aria-required', 'true');

    wrapper.appendChild(input);
    return wrapper;
  }
}
