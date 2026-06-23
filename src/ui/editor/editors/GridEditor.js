import { debounce } from '../../../core/utils/debounce.js';

export class GridEditor {
  static render(question, container) {
    container.textContent = '';

    const isMc = question.type === 'mc_grid';
    const fieldset = document.createElement('div');
    fieldset.className = 'dfb-editor-fieldset';

    const rows = question.options?.rows || ['Baris 1'];
    const cols = question.options?.columns || ['Kolom 1', 'Kolom 2'];

    const flexContainer = document.createElement('div');
    flexContainer.className = 'dfb-editor-grid-flex';

    /* ── Rows Column ── */
    const rowsCol = document.createElement('div');
    rowsCol.className = 'dfb-editor-grid-col';

    const rowsTitle = document.createElement('span');
    rowsTitle.className = 'dfb-editor-field-label';
    rowsTitle.textContent = 'Baris';
    rowsCol.appendChild(rowsTitle);

    const rowsWrapper = document.createElement('div');
    rowsWrapper.className = 'dfb-editor-choices-grid';

    rows.forEach((row, i) => {
      const rowEl = document.createElement('div');
      rowEl.className = 'dfb-editor-choice-row';

      const bullet = document.createElement('span');
      bullet.textContent = `${i + 1}.`;
      bullet.style.cssText =
        'color:var(--dfb-text-secondary,#5F6368);font-size:13px;min-width:20px;';
      rowEl.appendChild(bullet);

      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'dfb-editor-input dfb-editor-choice-input';
      input.value = row;
      input.placeholder = `Baris ${i + 1}`;
      input.addEventListener(
        'input',
        debounce(() => {
          if (!question.options) question.options = {};
          if (!question.options.rows) question.options.rows = [];
          question.options.rows[i] = input.value;
        }, 300),
      );
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

    // Inline Add Row Option
    const addRowEl = document.createElement('div');
    addRowEl.className = 'dfb-editor-choice-row dfb-editor-choice-add-row';

    const addRowBullet = document.createElement('span');
    addRowBullet.textContent = `${rows.length + 1}.`;
    addRowBullet.style.cssText =
      'color:var(--dfb-text-secondary,#5F6368);font-size:13px;min-width:20px;opacity:0.5;';
    addRowEl.appendChild(addRowBullet);

    const addRowBtn = document.createElement('button');
    addRowBtn.className = 'dfb-btn-add-option-inline';
    addRowBtn.textContent = 'Tambahkan baris';
    addRowBtn.addEventListener('click', () => {
      if (!question.options) question.options = {};
      if (!question.options.rows) question.options.rows = [];
      question.options.rows.push(`Baris ${question.options.rows.length + 1}`);
      renderGrid();
    });
    addRowEl.appendChild(addRowBtn);
    rowsWrapper.appendChild(addRowEl);

    rowsCol.appendChild(rowsWrapper);
    flexContainer.appendChild(rowsCol);

    /* ── Columns Column ── */
    const colsCol = document.createElement('div');
    colsCol.className = 'dfb-editor-grid-col';

    const colsTitle = document.createElement('span');
    colsTitle.className = 'dfb-editor-field-label';
    colsTitle.textContent = isMc ? 'Kolom (pilihan ganda)' : 'Kolom (kotak centang)';
    colsCol.appendChild(colsTitle);

    const colsWrapper = document.createElement('div');
    colsWrapper.className = 'dfb-editor-choices-grid';

    cols.forEach((col, i) => {
      const colEl = document.createElement('div');
      colEl.className = 'dfb-editor-choice-row';

      const bullet = document.createElement('div');
      bullet.className = isMc
        ? 'dfb-editor-choice-indicator'
        : 'dfb-editor-choice-indicator dfb-editor-choice-indicator--checkbox';
      colEl.appendChild(bullet);

      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'dfb-editor-input dfb-editor-choice-input';
      input.value = col;
      input.placeholder = `Kolom ${i + 1}`;
      input.addEventListener(
        'input',
        debounce(() => {
          if (!question.options) question.options = {};
          if (!question.options.columns) question.options.columns = [];
          question.options.columns[i] = input.value;
        }, 300),
      );
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

    // Inline Add Column Option
    const addColEl = document.createElement('div');
    addColEl.className = 'dfb-editor-choice-row dfb-editor-choice-add-row';

    const addColBullet = document.createElement('div');
    addColBullet.className = isMc
      ? 'dfb-editor-choice-indicator'
      : 'dfb-editor-choice-indicator dfb-editor-choice-indicator--checkbox';
    addColBullet.style.opacity = '0.5';
    addColEl.appendChild(addColBullet);

    const addColBtn = document.createElement('button');
    addColBtn.className = 'dfb-btn-add-option-inline';
    addColBtn.textContent = 'Tambahkan kolom';
    addColBtn.addEventListener('click', () => {
      if (!question.options) question.options = {};
      if (!question.options.columns) question.options.columns = [];
      question.options.columns.push(`Kolom ${question.options.columns.length + 1}`);
      renderGrid();
    });
    addColEl.appendChild(addColBtn);
    colsWrapper.appendChild(addColEl);

    colsCol.appendChild(colsWrapper);
    flexContainer.appendChild(colsCol);

    fieldset.appendChild(flexContainer);
    container.appendChild(fieldset);

    function renderGrid() {
      container.textContent = '';
      GridEditor.render(question, container);
    }
  }
}
