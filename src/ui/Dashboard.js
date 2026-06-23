import { FormManager } from '../core/form/FormManager.js';
import { FormFactory } from '../core/form/FormFactory.js';
import { Toast } from './common/Toast.js';
import { ConfirmDialog } from './common/ConfirmDialog.js';

let docCloseBound = false;

export function render(container) {
  container.innerHTML = '';
  container.className = 'dfb-dashboard';

  const header = document.createElement('header');
  header.className = 'dfb-dashboard-header';
  const h1 = document.createElement('h1');
  h1.textContent = 'Dynamic Form Builder';
  header.appendChild(h1);

  const headerActions = document.createElement('div');
  headerActions.className = 'dfb-dashboard-header-actions';
  const importBtn = document.createElement('button');
  importBtn.className = 'dfb-btn-icon';
  importBtn.title = 'Import JSON';
  importBtn.textContent = '\u{1F4C2}';
  importBtn.addEventListener('click', () => importInput.click());
  headerActions.appendChild(importBtn);
  const importInput = document.createElement('input');
  importInput.type = 'file';
  importInput.className = 'dfb-import-input dfb-hidden';
  importInput.accept = '.json';
  headerActions.appendChild(importInput);
  header.appendChild(headerActions);
  container.appendChild(header);

  const heading = document.createElement('h2');
  heading.className = 'dfb-dashboard-heading';
  heading.textContent = 'Formulir Saya';
  container.appendChild(heading);

  const grid = document.createElement('div');
  grid.className = 'dfb-dashboard-grid';
  container.appendChild(grid);

  const blankCard = document.createElement('div');
  blankCard.className = 'dfb-form-card dfb-form-card--blank';
  const blankIcon = document.createElement('span');
  blankIcon.className = 'dfb-form-card-blank-icon';
  blankIcon.textContent = '+';
  blankCard.appendChild(blankIcon);
  const blankLabel = document.createElement('span');
  blankLabel.className = 'dfb-form-card-blank-label';
  blankLabel.textContent = 'Formulir kosong';
  blankCard.appendChild(blankLabel);
  blankCard.addEventListener('click', () => {
    const form = FormManager.create();
    window.location.href = `editor.html?formId=${form.formId}`;
  });
  grid.appendChild(blankCard);

  renderCards(grid);

  importInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const result = FormFactory.createFromJSON(json);
      if (!result.success) {
        Toast.show(result.error || 'Gagal import form');
        return;
      }
      FormManager.save(result.form);
      FormManager.addToIndex(result.form.formId);
      Toast.show('Form berhasil diimport');
      renderCards(grid);
    } catch {
      Toast.show('File JSON tidak valid');
    }
    importInput.value = '';
  });

  if (!docCloseBound) {
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.dfb-form-card-dropdown, .dfb-form-card-menu')) {
        document.querySelectorAll('.dfb-form-card-dropdown--open').forEach((d) => {
          d.classList.remove('dfb-form-card-dropdown--open');
        });
      }
    });
    docCloseBound = true;
  }
}

function renderCards(grid) {
  while (grid.querySelectorAll(':scope > .dfb-form-card:not(.dfb-form-card--blank)').length > 0) {
    const existing = grid.querySelector(':scope > .dfb-form-card:not(.dfb-form-card--blank)');
    if (existing) grid.removeChild(existing);
    else break;
  }

  const forms = FormManager.list();
  if (forms.length === 0) return;

  forms.forEach((form) => {
    const card = document.createElement('div');
    card.className = 'dfb-form-card';
    card.dataset.formId = form.formId;

    const strip = document.createElement('div');
    strip.className = 'dfb-form-card-strip';
    strip.style.backgroundColor = form.primaryColor;
    card.appendChild(strip);

    const titleEl = document.createElement('h3');
    titleEl.className = 'dfb-form-card-title';
    titleEl.textContent = form.title || 'Formulir tanpa judul';
    card.appendChild(titleEl);

    const metaEl = document.createElement('p');
    metaEl.className = 'dfb-form-card-meta';
    metaEl.textContent = form.updatedAt
      ? `Terakhir dibuka ${timeAgo(form.updatedAt)}`
      : 'Baru saja dibuat';
    card.appendChild(metaEl);

    const menuBtn = document.createElement('button');
    menuBtn.className = 'dfb-form-card-menu';
    menuBtn.innerHTML = '&#8942;';
    menuBtn.setAttribute('aria-label', 'Opsi formulir');
    card.appendChild(menuBtn);

    card.addEventListener('click', () => {
      window.location.href = `editor.html?formId=${form.formId}`;
    });

    const dropdown = document.createElement('div');
    dropdown.className = 'dfb-form-card-dropdown';

    const editOpt = document.createElement('button');
    editOpt.textContent = 'Edit';
    editOpt.addEventListener('click', (e) => {
      e.stopPropagation();
      window.location.href = `editor.html?formId=${form.formId}`;
    });
    dropdown.appendChild(editOpt);

    const responsesOpt = document.createElement('button');
    responsesOpt.textContent = 'Lihat respons';
    responsesOpt.addEventListener('click', (e) => {
      e.stopPropagation();
      window.location.href = `responses.html?formId=${form.formId}`;
    });
    dropdown.appendChild(responsesOpt);

    const deleteOpt = document.createElement('button');
    deleteOpt.textContent = 'Hapus';
    deleteOpt.className = 'dfb-dropdown-danger';
    deleteOpt.addEventListener('click', async (e) => {
      e.stopPropagation();
      dropdown.classList.remove('dfb-form-card-dropdown--open');
      const confirmed = await ConfirmDialog.confirm(
        `Hapus formulir "${form.title}"? Tindakan ini tidak bisa dibatalkan.`,
      );
      if (confirmed) {
        FormManager.delete(form.formId);
        Toast.show('Formulir berhasil dihapus');
        renderCards(grid);
      }
    });
    dropdown.appendChild(deleteOpt);

    card.appendChild(dropdown);

    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      document.querySelectorAll('.dfb-form-card-dropdown--open').forEach((d) => {
        if (d !== dropdown) d.classList.remove('dfb-form-card-dropdown--open');
      });
      dropdown.classList.toggle('dfb-form-card-dropdown--open');
    });

    grid.appendChild(card);
  });
}

function timeAgo(dateStr) {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'baru saja';
  if (mins < 60) return `${mins} menit yang lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam yang lalu`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} hari yang lalu`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} bulan yang lalu`;
  return `${Math.floor(months / 12)} tahun yang lalu`;
}
