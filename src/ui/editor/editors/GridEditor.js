import { debounce } from '../../../core/utils/debounce.js';

export class GridEditor {
  static render(question, container) {
    container.textContent = '';

    const isMc = question.type === 'mc_grid';
    const fieldset = document.createElement('div');
    fieldset.className = 'dfb-editor-fieldset';

    const rows = question.options?.rows || ['Baris 1'];
    const cols = question.options?.columns || ['Kolom 1', 'Kolom 2'];

    const rowsWrapper = document.createElement('div');
    rowsWrapper.className = 'dfb-editor-choices';
    const rowsTitle = document.createElement('span');
    rowsTitle.className = 'dfb-editor-field-label';
    rowsTitle.textContent = 'Baris';
    rowsWrapper.appendChild(rowsTitle);

    rows.forEach((row, i) => {
      const rowEl = document.createElement('div');
      rowEl.className = 'dfb-editor-choice-row';

      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'dfb-editor-input dfb-editor-choice-input';
      input.value = row;
      input.placeholder = `Baris ${i + 1}`;
      input.addEventListener('input', debounce(() => {
        if (!question.options) question.options = {};
        if (!question.options.rows) question.options.rows = [];
        question.options.rows[i] = input.value;
      }, 300));
      rowEl.appendChild(input);

      if (rows.length > 1) {
        const removeBtn = document.createElement('button');
        removeBtn.className = 'dfb-editor-choice-remove';
        removeBtn.textContent = '\u00D7';
        removeBtn.addEventListener('click', () => {
          question.options.rows.splice(i, 1);
          renderGrid();
        });
        rowEl.appendChild(removeBtn);
      }

      rowsWrapper.appendChild(rowEl);
    });

    const addRowBtn = document.createElement('button');
    addRowBtn.className = 'dfb-btn dfb-btn--ghost dfb-btn--sm';
    addRowBtn.textContent = '+ Tambah baris';
    addRowBtn.addEventListener('click', () => {
      if (!question.options) question.options = {};
      if (!question.options.rows) question.options.rows = [];
      question.options.rows.push(`Baris ${question.options.rows.length + 1}`);
      renderGrid();
    });
    rowsWrapper.appendChild(addRowBtn);
    fieldset.appendChild(rowsWrapper);

    const colsWrapper = document.createElement('div');
    colsWrapper.className = 'dfb-editor-choices';
    const colsTitle = document.createElement('span');
    colsTitle.className = 'dfb-editor-field-label';
    colsTitle.textContent = isMc ? 'Kolom (pilihan ganda)' : 'Kolom (kotak centang)';
    colsWrapper.appendChild(colsTitle);

    cols.forEach((col, i) => {
      const colEl = document.createElement('div');
      colEl.className = 'dfb-editor-choice-row';

      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'dfb-editor-input dfb-editor-choice-input';
      input.value = col;
      input.placeholder = `Kolom ${i + 1}`;
      input.addEventListener('input', debounce(() => {
        if (!question.options) question.options = {};
        if (!question.options.columns) question.options.columns = [];
        question.options.columns[i] = input.value;
      }, 300));
      colEl.appendChild(input);

      if (cols.length > 1) {
        const removeBtn = document.createElement('button');
        removeBtn.className = 'dfb-editor-choice-remove';
        removeBtn.textContent = '\u00D7';
        removeBtn.addEventListener('click', () => {
          question.options.columns.splice(i, 1);
          renderGrid();
        });
        colEl.appendChild(removeBtn);
      }

      colsWrapper.appendChild(colEl);
    });

    const addColBtn = document.createElement('button');
    addColBtn.className = 'dfb-btn dfb-btn--ghost dfb-btn--sm';
    addColBtn.textContent = '+ Tambah kolom';
    addColBtn.addEventListener('click', () => {
      if (!question.options) question.options = {};
      if (!question.options.columns) question.options.columns = [];
      question.options.columns.push(`Kolom ${question.options.columns.length + 1}`);
      renderGrid();
    });
    colsWrapper.appendChild(addColBtn);
    fieldset.appendChild(colsWrapper);

    container.appendChild(fieldset);

    function renderGrid() {
      container.textContent = '';
      GridEditor.render(question, container);
    }
  }
}
