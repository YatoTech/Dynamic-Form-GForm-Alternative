export class FileUploadEditor {
  static render(question, container) {
    container.textContent = '';

    const fieldset = document.createElement('div');
    fieldset.className = 'dfb-editor-fieldset';

    const row = document.createElement('div');
    row.style.cssText = 'display:flex; flex-direction:column; gap:8px; margin-top:8px;';

    const label = document.createElement('span');
    label.textContent = 'Jenis file yang diizinkan:';
    label.style.cssText =
      'font-size:13px; color:var(--dfb-text-secondary,#5F6368); font-weight:500;';
    row.appendChild(label);

    const typeSelect = document.createElement('select');
    typeSelect.className = 'dfb-q-card-type-select';
    typeSelect.style.cssText = 'max-width:200px;';
    const types = [
      { value: 'any', label: 'Semua Jenis File' },
      { value: 'image', label: 'Gambar saja' },
      { value: 'document', label: 'Dokumen saja' },
      { value: 'pdf', label: 'PDF saja' },
    ];
    types.forEach((t) => {
      const opt = document.createElement('option');
      opt.value = t.value;
      opt.textContent = t.label;
      if ((question.options?.fileType ?? 'any') === t.value) opt.selected = true;
      typeSelect.appendChild(opt);
    });
    row.appendChild(typeSelect);

    fieldset.appendChild(row);

    // Mock dropzone preview
    const dropzone = document.createElement('div');
    dropzone.className = 'dfb-editor-mock-dropzone';
    dropzone.style.cssText =
      'border:2px dashed var(--dfb-border-color,#DADCE0); border-radius:8px; padding:20px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; margin-top:16px; background:#F8F9FA; color:var(--dfb-text-secondary,#5F6368); font-size:13px;';
    dropzone.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="17 8 12 3 7 8"></polyline>
        <line x1="12" y1="3" x2="12" y2="15"></line>
      </svg>
      <span>Unggah File (Mockup Editor)</span>
    `;
    fieldset.appendChild(dropzone);

    container.appendChild(fieldset);

    typeSelect.addEventListener('change', () => {
      question.options = question.options || {};
      question.options.fileType = typeSelect.value;
      const changeEvent = new Event('change', { bubbles: true });
      typeSelect.dispatchEvent(changeEvent);
    });
  }
}
