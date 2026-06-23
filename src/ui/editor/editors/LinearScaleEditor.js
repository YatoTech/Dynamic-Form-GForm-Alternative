import { debounce } from '../../../core/utils/debounce.js';

export class LinearScaleEditor {
  static render(question, container) {
    container.textContent = '';

    const fieldset = document.createElement('div');
    fieldset.className = 'dfb-editor-fieldset';

    const rangeRow = document.createElement('div');
    rangeRow.className = 'dfb-editor-scale-range-row';

    const minSelect = document.createElement('select');
    minSelect.className = 'dfb-q-card-type-select dfb-editor-scale-select';
    const minValues = [0, 1];
    minValues.forEach((v) => {
      const opt = document.createElement('option');
      opt.value = v;
      opt.textContent = v;
      if ((question.options?.minScale ?? 1) === v) opt.selected = true;
      minSelect.appendChild(opt);
    });
    rangeRow.appendChild(minSelect);

    const keSpan = document.createElement('span');
    keSpan.textContent = 'ke';
    keSpan.className = 'dfb-editor-scale-to-text';
    rangeRow.appendChild(keSpan);

    const maxSelect = document.createElement('select');
    maxSelect.className = 'dfb-q-card-type-select dfb-editor-scale-select';
    const maxValues = [3, 4, 5, 6, 7, 8, 9, 10];
    maxValues.forEach((v) => {
      const opt = document.createElement('option');
      opt.value = v;
      opt.textContent = v;
      if ((question.options?.maxScale ?? 5) === v) opt.selected = true;
      maxSelect.appendChild(opt);
    });
    rangeRow.appendChild(maxSelect);

    fieldset.appendChild(rangeRow);

    const labelsContainer = document.createElement('div');
    labelsContainer.className = 'dfb-editor-scale-labels-container';

    // Left label row
    const leftRow = document.createElement('div');
    leftRow.className = 'dfb-editor-scale-label-row';

    const leftNum = document.createElement('span');
    leftNum.className = 'dfb-editor-scale-label-num';
    leftNum.textContent = String(question.options?.minScale ?? 1);
    leftRow.appendChild(leftNum);

    const leftInput = document.createElement('input');
    leftInput.type = 'text';
    leftInput.className = 'dfb-editor-choice-input dfb-editor-scale-label-input';
    leftInput.placeholder = 'Label (opsional)';
    leftInput.value = question.options?.leftLabel || '';
    leftInput.addEventListener(
      'input',
      debounce(() => {
        if (!question.options) question.options = {};
        question.options.leftLabel = leftInput.value;
      }, 300),
    );
    leftRow.appendChild(leftInput);
    labelsContainer.appendChild(leftRow);

    // Right label row
    const rightRow = document.createElement('div');
    rightRow.className = 'dfb-editor-scale-label-row';

    const rightNum = document.createElement('span');
    rightNum.className = 'dfb-editor-scale-label-num';
    rightNum.textContent = String(question.options?.maxScale ?? 5);
    rightRow.appendChild(rightNum);

    const rightInput = document.createElement('input');
    rightInput.type = 'text';
    rightInput.className = 'dfb-editor-choice-input dfb-editor-scale-label-input';
    rightInput.placeholder = 'Label (opsional)';
    rightInput.value = question.options?.rightLabel || '';
    rightInput.addEventListener(
      'input',
      debounce(() => {
        if (!question.options) question.options = {};
        question.options.rightLabel = rightInput.value;
      }, 300),
    );
    rightRow.appendChild(rightInput);
    labelsContainer.appendChild(rightRow);

    fieldset.appendChild(labelsContainer);
    container.appendChild(fieldset);

    minSelect.addEventListener('change', () => {
      const val = Number(minSelect.value);
      if (!question.options) question.options = {};
      question.options.minScale = val;
      leftNum.textContent = String(val);
    });

    maxSelect.addEventListener('change', () => {
      const val = Number(maxSelect.value);
      if (!question.options) question.options = {};
      question.options.maxScale = val;
      rightNum.textContent = String(val);
    });
  }
}
