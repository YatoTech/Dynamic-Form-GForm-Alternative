import { FormManager } from '../core/form/FormManager.js';
import { FormFactory } from '../core/form/FormFactory.js';
import { Toast } from './common/Toast.js';
import { ConfirmDialog } from './common/ConfirmDialog.js';

let docCloseBound = false;

export function render(container) {
  container.innerHTML = '';
  container.className = 'dfb-dashboard';

  /* ── Top Header bar ── */
  const header = document.createElement('header');
  header.className = 'dfb-dashboard-header';

  // Logo area
  const logoArea = document.createElement('div');
  logoArea.className = 'dfb-dashboard-header-logo';

  // Forms SVG logo icon
  const logoIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  logoIcon.setAttribute('class', 'dfb-dashboard-header-logo-icon');
  logoIcon.setAttribute('viewBox', '0 0 48 48');
  logoIcon.setAttribute('fill', 'none');
  logoIcon.innerHTML = `
    <rect width="48" height="48" rx="6" fill="rgba(255,255,255,0.15)"/>
    <path d="M10 8h28a2 2 0 0 1 2 2v28a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2z" fill="#fff" opacity="0.9"/>
    <path d="M15 18h18M15 24h18M15 30h12" stroke="#673AB7" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="34" cy="34" r="8" fill="#673AB7"/>
    <path d="M31 34l2 2 4-4" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `;
  logoArea.appendChild(logoIcon);

  const logoText = document.createElement('span');
  logoText.className = 'dfb-dashboard-header-logo-text';
  logoText.textContent = 'Formulir';
  logoArea.appendChild(logoText);

  header.appendChild(logoArea);

  // Header actions
  const headerActions = document.createElement('div');
  headerActions.className = 'dfb-dashboard-header-actions';

  // Import button
  const importBtn = document.createElement('button');
  importBtn.className = 'dfb-btn-icon';
  importBtn.title = 'Import Formulir (JSON)';
  importBtn.setAttribute('aria-label', 'Import Formulir dari JSON');
  importBtn.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="22" height="22">
      <path d="M3 15v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/>
      <line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  `;
  importBtn.addEventListener('click', () => importInput.click());
  headerActions.appendChild(importBtn);

  const importInput = document.createElement('input');
  importInput.type = 'file';
  importInput.accept = '.json';
  importInput.style.display = 'none';
  headerActions.appendChild(importInput);

  header.appendChild(headerActions);
  container.appendChild(header);

  /* ── "Formulir Baru" section (blank + templates) ── */
  const recentSection = document.createElement('div');
  recentSection.className = 'dfb-dashboard-recent-section';

  const recentHeader = document.createElement('div');
  recentHeader.className = 'dfb-dashboard-recent-header';

  const recentHeading = document.createElement('h2');
  recentHeading.style.cssText = 'font-size:13px;font-weight:500;color:#5f6368;margin:0;';
  recentHeading.textContent = 'Mulai formulir baru';
  recentHeader.appendChild(recentHeading);

  recentSection.appendChild(recentHeader);

  // Blank form card (new)
  const templateGrid = document.createElement('div');
  templateGrid.style.cssText = 'display:flex;gap:12px;flex-wrap:wrap;padding-bottom:4px;';

  const blankCard = createTemplateCard('Kosong', null, null, () => {
    const form = FormManager.create();
    window.location.href = `editor.html?formId=${form.formId}`;
  });
  templateGrid.appendChild(blankCard);

  recentSection.appendChild(templateGrid);
  container.appendChild(recentSection);

  /* ── "Formulir saya" list ── */
  const heading = document.createElement('h2');
  heading.className = 'dfb-dashboard-heading';
  heading.textContent = 'Formulir terbaru';
  container.appendChild(heading);

  const grid = document.createElement('div');
  grid.className = 'dfb-dashboard-grid';
  container.appendChild(grid);

  renderCards(grid);

  /* ── Import handler ── */
  importInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const result = FormFactory.createFromJSON(json);
      if (!result.success) {
        Toast.show(result.error || 'Gagal import formulir');
        return;
      }
      FormManager.save(result.form);
      FormManager.addToIndex(result.form.formId);
      Toast.show('Formulir berhasil diimport');
      renderCards(grid);
    } catch {
      Toast.show('File JSON tidak valid');
    }
    importInput.value = '';
  });

  /* ── Close dropdown on outside click ── */
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

/**
 * Creates a template card (blank or with a preview thumbnail)
 * @param {string} label
 * @param {string|null} color - accent color
 * @param {string|null} thumbnailBg - thumbnail background color
 * @param {Function} onClick
 */
function createTemplateCard(label, color, thumbnailBg, onClick) {
  const card = document.createElement('div');
  card.style.cssText = `
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    width: 120px;
  `;
  card.addEventListener('click', onClick);

  const thumb = document.createElement('div');
  thumb.style.cssText = `
    width: 120px;
    height: 160px;
    border-radius: 4px;
    border: 2px solid ${color ? color : '#e0e0e0'};
    background: ${thumbnailBg || '#fff'};
    display: flex;
    align-items: center;
    justify-content: center;
    transition: border-color 200ms, box-shadow 200ms;
    overflow: hidden;
    position: relative;
  `;

  if (!color) {
    // Blank card: show + icon
    const plusIcon = document.createElement('div');
    plusIcon.style.cssText = `
      font-size: 36px;
      color: #673AB7;
      line-height: 1;
      font-weight: 300;
    `;
    plusIcon.textContent = '+';
    thumb.appendChild(plusIcon);
  } else {
    // Colored thumbnail preview
    const strip = document.createElement('div');
    strip.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 40px;
      background: ${color};
    `;
    thumb.appendChild(strip);
    // Form lines preview
    for (let i = 0; i < 4; i++) {
      const line = document.createElement('div');
      line.style.cssText = `
        position: absolute;
        left: 12px;
        right: 12px;
        height: 2px;
        background: #e0e0e0;
        top: ${52 + i * 16}px;
        border-radius: 1px;
      `;
      thumb.appendChild(line);
    }
  }

  card.appendChild(thumb);

  const thumbLabel = document.createElement('span');
  thumbLabel.style.cssText = 'font-size:12px;color:#202124;text-align:center;';
  thumbLabel.textContent = label;
  card.appendChild(thumbLabel);

  card.addEventListener('mouseenter', () => {
    thumb.style.borderColor = '#673AB7';
    thumb.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
  });
  card.addEventListener('mouseleave', () => {
    thumb.style.borderColor = color ? color : '#e0e0e0';
    thumb.style.boxShadow = 'none';
  });

  return card;
}

function renderCards(grid) {
  // Remove existing cards (keep blank)
  while (grid.querySelectorAll(':scope > .dfb-form-card:not(.dfb-form-card--blank)').length > 0) {
    const existing = grid.querySelector(':scope > .dfb-form-card:not(.dfb-form-card--blank)');
    if (existing) grid.removeChild(existing);
    else break;
  }

  const forms = FormManager.list();

  if (forms.length === 0) {
    // Show empty state
    const empty = grid.querySelector('.dfb-dashboard-empty') || document.createElement('div');
    empty.className = 'dfb-dashboard-empty';
    empty.innerHTML = `
      <div class="dfb-dashboard-empty-icon">📋</div>
      <div class="dfb-dashboard-empty-text">Belum ada formulir. Buat formulir baru di atas.</div>
    `;
    grid.appendChild(empty);
    return;
  }

  // Remove empty state if exists
  const emptyEl = grid.querySelector('.dfb-dashboard-empty');
  if (emptyEl) emptyEl.remove();

  forms.forEach((form) => {
    const card = document.createElement('div');
    card.className = 'dfb-form-card';
    card.dataset.formId = form.formId;

    // Thumbnail area
    const thumbnail = document.createElement('div');
    thumbnail.className = 'dfb-form-card-thumbnail';
    thumbnail.style.background = '#fff';

    // Color strip at top of thumbnail (represents theme)
    const strip = document.createElement('div');
    strip.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 40%;
      background: ${form.primaryColor || '#673AB7'};
    `;
    thumbnail.appendChild(strip);

    // Lines preview in thumbnail
    for (let i = 0; i < 3; i++) {
      const line = document.createElement('div');
      line.style.cssText = `
        position: absolute;
        left: 12px;
        right: 12px;
        height: 2px;
        background: #e8eaed;
        top: ${56 + i * 14}px;
        border-radius: 1px;
      `;
      thumbnail.appendChild(line);
    }

    card.appendChild(thumbnail);

    // Info row below thumbnail
    const infoRow = document.createElement('div');
    infoRow.className = 'dfb-form-card-info';

    // Forms icon
    const formIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    formIcon.setAttribute('width', '28');
    formIcon.setAttribute('height', '28');
    formIcon.setAttribute('viewBox', '0 0 24 24');
    formIcon.setAttribute('fill', 'none');
    formIcon.style.flexShrink = '0';
    formIcon.innerHTML = `
      <rect x="3" y="3" width="18" height="18" rx="2" fill="${form.primaryColor || '#673AB7'}" opacity="0.15"/>
      <path d="M7 8h10M7 12h10M7 16h6" stroke="${form.primaryColor || '#673AB7'}" stroke-width="1.5" stroke-linecap="round"/>
    `;
    infoRow.appendChild(formIcon);

    const infoText = document.createElement('div');
    infoText.className = 'dfb-form-card-info-text';

    const titleEl = document.createElement('h3');
    titleEl.className = 'dfb-form-card-title';
    titleEl.textContent = form.title || 'Formulir tanpa judul';
    infoText.appendChild(titleEl);

    const metaEl = document.createElement('p');
    metaEl.className = 'dfb-form-card-meta';
    metaEl.textContent = form.updatedAt ? `Dibuka ${timeAgo(form.updatedAt)}` : 'Baru saja dibuat';
    infoText.appendChild(metaEl);

    infoRow.appendChild(infoText);

    // ⋮ Menu button
    const menuBtn = document.createElement('button');
    menuBtn.className = 'dfb-form-card-menu';
    menuBtn.innerHTML = '&#8942;';
    menuBtn.setAttribute('aria-label', 'Opsi formulir');
    infoRow.appendChild(menuBtn);

    card.appendChild(infoRow);

    // Click on card → open editor
    card.addEventListener('click', (e) => {
      if (!e.target.closest('.dfb-form-card-menu, .dfb-form-card-dropdown')) {
        window.location.href = `editor.html?formId=${form.formId}`;
      }
    });

    // Dropdown menu
    const dropdown = document.createElement('div');
    dropdown.className = 'dfb-form-card-dropdown';

    const menuItems = [
      {
        icon: '✏️',
        label: 'Edit',
        action: (e) => {
          e.stopPropagation();
          window.location.href = `editor.html?formId=${form.formId}`;
        },
      },
      {
        icon: '👁️',
        label: 'Pratinjau',
        action: (e) => {
          e.stopPropagation();
          window.open(`form.html?formId=${form.formId}&preview=true`, '_blank');
        },
      },
      {
        icon: '📊',
        label: 'Lihat jawaban',
        action: (e) => {
          e.stopPropagation();
          window.location.href = `responses.html?formId=${form.formId}`;
        },
      },
      {
        separator: true,
      },
      {
        icon: '📋',
        label: 'Duplikat',
        action: (e) => {
          e.stopPropagation();
          dropdown.classList.remove('dfb-form-card-dropdown--open');
          try {
            const clone = FormManager.duplicate(form.formId);
            if (clone) {
              FormManager.addToIndex(clone.formId);
              Toast.show('Formulir berhasil diduplikat');
              renderCards(grid);
            } else {
              Toast.show('Gagal menduplikat formulir');
            }
          } catch {
            Toast.show('Gagal menduplikat formulir');
          }
        },
      },
      {
        icon: '💾',
        label: 'Download JSON',
        action: (e) => {
          e.stopPropagation();
          dropdown.classList.remove('dfb-form-card-dropdown--open');
          try {
            const data = localStorage.getItem(`dfb:form:${form.formId}`);
            if (data) {
              const blob = new Blob([data], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${form.title || 'formulir'}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }
          } catch {
            Toast.show('Gagal download');
          }
        },
      },
      {
        separator: true,
      },
      {
        icon: '🗑️',
        label: 'Hapus',
        danger: true,
        action: async (e) => {
          e.stopPropagation();
          dropdown.classList.remove('dfb-form-card-dropdown--open');
          const confirmed = await ConfirmDialog.confirm(
            `Hapus formulir "${form.title || 'tanpa judul'}"? Tindakan ini tidak dapat dibatalkan.`,
          );
          if (confirmed) {
            FormManager.delete(form.formId);
            Toast.show('Formulir berhasil dihapus');
            renderCards(grid);
          }
        },
      },
    ];

    menuItems.forEach((item) => {
      if (item.separator) {
        const sep = document.createElement('hr');
        sep.style.cssText = 'border:none;border-top:1px solid #e0e0e0;margin:4px 0;';
        dropdown.appendChild(sep);
        return;
      }
      const btn = document.createElement('button');
      if (item.danger) btn.className = 'dfb-dropdown-danger';
      btn.innerHTML = `<span>${item.icon}</span><span>${item.label}</span>`;
      btn.addEventListener('click', item.action);
      dropdown.appendChild(btn);
    });

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

/**
 * Returns human-readable time ago string
 * @param {string} dateStr - ISO date string
 * @returns {string}
 */
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
  if (days === 1) return 'kemarin';
  if (days < 7) return `${days} hari yang lalu`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks} minggu yang lalu`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} bulan yang lalu`;
  return `${Math.floor(months / 12)} tahun yang lalu`;
}
