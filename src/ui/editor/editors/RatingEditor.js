export class RatingEditor {
  static render(question, container) {
    container.textContent = '';

    const fieldset = document.createElement('div');
    fieldset.className = 'dfb-editor-fieldset';

    const row = document.createElement('div');
    row.className = 'dfb-editor-scale-range-row';
    row.style.cssText = 'display:flex; align-items:center; gap:12px; margin-top:8px;';

    const label = document.createElement('span');
    label.textContent = 'Tingkat bintang maksimal:';
    label.style.cssText = 'font-size:13px; color:var(--dfb-text-secondary,#5F6368);';
    row.appendChild(label);

    const maxSelect = document.createElement('select');
    maxSelect.className = 'dfb-q-card-type-select';
    maxSelect.style.cssText = 'max-width:120px;';
    const values = [3, 4, 5, 10];
    values.forEach((v) => {
      const opt = document.createElement('option');
      opt.value = v;
      opt.textContent = `${v} Bintang`;
      if ((question.options?.maxStars ?? 5) === v) opt.selected = true;
      maxSelect.appendChild(opt);
    });
    row.appendChild(maxSelect);

    fieldset.appendChild(row);

    // Render a mock preview of stars below the dropdown
    const previewRow = document.createElement('div');
    previewRow.style.cssText =
      'display:flex; gap:6px; margin-top:16px; color:#FFB900; font-size:24px; pointer-events:none;';
    const currentMax = question.options?.maxStars ?? 5;
    for (let i = 0; i < currentMax; i++) {
      const star = document.createElement('span');
      star.innerHTML = '&#9733;'; // Unicode Star
      previewRow.appendChild(star);
    }
    fieldset.appendChild(previewRow);

    container.appendChild(fieldset);

    maxSelect.addEventListener('change', () => {
      question.options = question.options || {};
      question.options.maxStars = Number(maxSelect.value);
      // Re-render preview inside
      container.textContent = '';
      RatingEditor.render(question, container);
      // Trigger save
      const changeEvent = new Event('change', { bubbles: true });
      maxSelect.dispatchEvent(changeEvent);
    });
  }
}
