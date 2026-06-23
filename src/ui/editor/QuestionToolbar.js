import { QUESTION_TYPES, QUESTION_TYPE_LABELS } from '../../core/form/QuestionTypes.js';

const TYPE_MENU = [
  { type: QUESTION_TYPES.SHORT_ANSWER, icon: 'Aa' },
  { type: QUESTION_TYPES.PARAGRAPH, icon: '¶' },
  { type: QUESTION_TYPES.MULTIPLE_CHOICE, icon: '◉' },
  { type: QUESTION_TYPES.CHECKBOXES, icon: '☑' },
  { type: QUESTION_TYPES.DROPDOWN, icon: '▼' },
  { type: QUESTION_TYPES.LINEAR_SCALE, icon: '\uD83D\uDCCF' },
  { type: QUESTION_TYPES.DATE, icon: '📅' },
  { type: QUESTION_TYPES.TIME, icon: '⏰' },
  { type: QUESTION_TYPES.MULTIPLE_CHOICE_GRID, icon: '⊞' },
  { type: QUESTION_TYPES.CHECKBOX_GRID, icon: '⊟' },
  { type: QUESTION_TYPES.SECTION_HEADER, icon: '─' },
];

export class QuestionToolbar {
  static render(container, onSelect) {
    const section = document.createElement('div');
    section.className = 'dfb-q-toolbar-section';

    const title = document.createElement('p');
    title.className = 'dfb-q-toolbar-title';
    title.textContent = 'TAMBAH PERTANYAAN';
    section.appendChild(title);

    const grid = document.createElement('div');
    grid.className = 'dfb-q-toolbar-grid';
    section.appendChild(grid);

    container.textContent = '';
    container.appendChild(section);

    TYPE_MENU.forEach((item) => {
      const btn = document.createElement('button');
      btn.className = 'dfb-q-toolbar-btn';
      btn.dataset.type = item.type;

      const iconSpan = document.createElement('span');
      iconSpan.className = 'dfb-q-toolbar-btn-icon';
      iconSpan.textContent = item.icon;
      btn.appendChild(iconSpan);

      const labelSpan = document.createElement('span');
      labelSpan.textContent = QUESTION_TYPE_LABELS[item.type];
      btn.appendChild(labelSpan);

      btn.addEventListener('click', () => onSelect(item.type));
      grid.appendChild(btn);
    });
  }
}
