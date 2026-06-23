export class LinearScaleField {
  static create(question, value = '') {
    const wrapper = document.createElement('div');
    wrapper.className = 'gf-scale-wrapper';

    const min = question.options?.minScale ?? 1;
    const max = question.options?.maxScale ?? 5;
    const leftLabel = question.options?.leftLabel || '';
    const rightLabel = question.options?.rightLabel || '';
    const name = `q-scale-${question.questionId}`;

    if (leftLabel) {
      const left = document.createElement('div');
      left.className = 'gf-scale-label gf-scale-label-left';
      left.textContent = leftLabel;
      wrapper.appendChild(left);
    }

    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'gf-scale-options-container';

    for (let i = min; i <= max; i++) {
      const col = document.createElement('div');
      col.className = 'gf-scale-option-col';

      const numSpan = document.createElement('span');
      numSpan.className = 'gf-scale-option-num';
      numSpan.textContent = String(i);
      col.appendChild(numSpan);

      const label = document.createElement('label');
      label.className = 'gf-scale-radio-wrap';

      const input = document.createElement('input');
      input.type = 'radio';
      input.className = 'gf-scale-input';
      input.name = name;
      input.value = String(i);
      if (String(i) === String(value)) input.checked = true;
      label.appendChild(input);

      const visual = document.createElement('div');
      visual.className = 'gf-scale-radio-visual';
      label.appendChild(visual);

      col.appendChild(label);
      optionsContainer.appendChild(col);
    }

    wrapper.appendChild(optionsContainer);

    if (rightLabel) {
      const right = document.createElement('div');
      right.className = 'gf-scale-label gf-scale-label-right';
      right.textContent = rightLabel;
      wrapper.appendChild(right);
    }

    return wrapper;
  }
}
