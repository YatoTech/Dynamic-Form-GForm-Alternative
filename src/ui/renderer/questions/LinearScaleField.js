export class LinearScaleField {
  static create(question, value = '') {
    const wrapper = document.createElement('div');

    const min = question.options?.minScale ?? 1;
    const max = question.options?.maxScale ?? 5;
    const leftLabel = question.options?.leftLabel || '';
    const rightLabel = question.options?.rightLabel || '';
    const name = `q-scale-${question.questionId}`;

    if (leftLabel || rightLabel) {
      const labels = document.createElement('div');
      labels.className = 'gf-scale-labels-wrap';
      const left = document.createElement('span');
      left.className = 'gf-scale-label-left';
      left.textContent = leftLabel;
      labels.appendChild(left);
      const right = document.createElement('span');
      right.className = 'gf-scale-label-right';
      right.textContent = rightLabel;
      labels.appendChild(right);
      wrapper.appendChild(labels);
    }

    const circles = document.createElement('div');
    circles.className = 'gf-scale-circles';

    for (let i = min; i <= max; i++) {
      const item = document.createElement('div');
      item.className = 'gf-scale-item';

      const input = document.createElement('input');
      input.type = 'radio';
      input.className = 'gf-scale-input';
      input.name = name;
      input.value = String(i);
      if (String(i) === String(value)) input.checked = true;

      const circle = document.createElement('div');
      circle.className = 'gf-scale-circle' + (String(i) === String(value) ? ' gf-scale-circle--selected' : '');
      circle.textContent = String(i);

      item.appendChild(input);
      item.appendChild(circle);
      circles.appendChild(item);

      circle.addEventListener('click', () => {
        input.checked = true;
        circles.querySelectorAll('.gf-scale-circle--selected').forEach((c) => c.classList.remove('gf-scale-circle--selected'));
        circle.classList.add('gf-scale-circle--selected');
      });
    }

    wrapper.appendChild(circles);
    return wrapper;
  }
}
