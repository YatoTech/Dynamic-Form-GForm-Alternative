import { sanitizeText } from '../../core/utils/sanitize.js';

export class SectionDivider {
  static create(question, number, handlers = {}) {
    const div = document.createElement('div');
    div.className = 'dfb-section-divider';
    div.dataset.dfbQuestionId = question.questionId;

    const header = document.createElement('div');
    header.className = 'dfb-section-divider-header';

    const dragHandle = document.createElement('span');
    dragHandle.className = 'dfb-drag-handle';
    dragHandle.textContent = '\u22EE';
    header.appendChild(dragHandle);

    const body = document.createElement('div');
    body.className = 'dfb-section-divider-body';

    const label = document.createElement('div');
    label.className = 'dfb-section-label';
    label.textContent = `Seksi ${number}`;
    body.appendChild(label);

    const titleInput = document.createElement('input');
    titleInput.className = 'dfb-section-title-input';
    titleInput.type = 'text';
    titleInput.value = question.title;
    titleInput.placeholder = 'Judul Seksi';
    titleInput.maxLength = 200;
    body.appendChild(titleInput);

    const descInput = document.createElement('input');
    descInput.className = 'dfb-section-desc-input';
    descInput.type = 'text';
    descInput.value = question.description || '';
    descInput.placeholder = 'Deskripsi seksi (opsional)';
    descInput.maxLength = 500;
    descInput.hidden = !question.description;
    body.appendChild(descInput);

    header.appendChild(body);

    const menu = document.createElement('div');
    menu.className = 'dfb-q-card-menu';
    const menuBtn = document.createElement('button');
    menuBtn.className = 'dfb-q-card-menu-btn';
    menuBtn.innerHTML = '\u22EE';
    menuBtn.setAttribute('aria-label', 'Opsi seksi');
    menu.appendChild(menuBtn);

    const dropdown = document.createElement('div');
    dropdown.className = 'dfb-q-card-dropdown';

    const descOpt = document.createElement('button');
    descOpt.innerHTML = (question.description ? '\u2713 ' : '') + 'Deskripsi';
    descOpt.addEventListener('click', (e) => {
      e.stopPropagation();
      descInput.hidden = !descInput.hidden;
      descOpt.innerHTML = (!descInput.hidden ? '\u2713 ' : '') + 'Deskripsi';
      if (!descInput.hidden) descInput.focus();
      dropdown.classList.remove('dfb-q-card-dropdown--open');
    });
    dropdown.appendChild(descOpt);

    const sep = document.createElement('hr');
    sep.className = 'dfb-q-card-dropdown-sep';
    dropdown.appendChild(sep);

    const dupOpt = document.createElement('button');
    dupOpt.textContent = 'Duplikasi';
    dupOpt.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.remove('dfb-q-card-dropdown--open');
      handlers.onDuplicate?.(question.questionId);
    });
    dropdown.appendChild(dupOpt);

    const delOpt = document.createElement('button');
    delOpt.textContent = 'Hapus';
    delOpt.className = 'dfb-q-card-dropdown-danger';
    delOpt.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.remove('dfb-q-card-dropdown--open');
      handlers.onDelete?.(question.questionId);
    });
    dropdown.appendChild(delOpt);

    menu.appendChild(dropdown);
    header.appendChild(menu);
    div.appendChild(header);

    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      descOpt.innerHTML = (!descInput.hidden ? '\u2713 ' : '') + 'Deskripsi';
      document.querySelectorAll('.dfb-q-card-dropdown--open').forEach((d) => {
        if (d !== dropdown) d.classList.remove('dfb-q-card-dropdown--open');
      });
      dropdown.classList.toggle('dfb-q-card-dropdown--open');
    });

    titleInput.addEventListener('blur', () => {
      question.title = sanitizeText(titleInput.value);
    });

    descInput.addEventListener('blur', () => {
      question.description = sanitizeText(descInput.value);
      if (!question.description) descInput.hidden = true;
      if (handlers.onSave) handlers.onSave();
    });

    return div;
  }
}
