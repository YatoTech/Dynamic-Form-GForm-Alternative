export class DateField {
  static create(question, value = '', hasError = false) {
    const wrapper = document.createElement('div');

    const input = document.createElement('input');
    input.type = 'date';
    input.className = 'gf-input gf-input-date' + (hasError ? ' gf-input--error' : '');
    input.id = `q-${question.questionId}`;
    input.value = value;
    if (question.required) input.setAttribute('aria-required', 'true');

    const v = question.validation || {};
    if (v.minDate) input.setAttribute('min', v.minDate);
    if (v.maxDate) input.setAttribute('max', v.maxDate);

    wrapper.appendChild(input);
    return wrapper;
  }
}
