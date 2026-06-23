import { FormManager } from '../../core/form/FormManager.js';
import { LocalStorageAdapter } from '../../core/storage/LocalStorageAdapter.js';
import { ResponseState } from '../../core/state/ResponseState.js';
import { SummaryView } from './SummaryView.js';
import { QuestionView } from './QuestionView.js';
import { IndividualView } from './IndividualView.js';
import { exportToCsv, exportToJson } from '../../core/engine/ExportEngine.js';
import { FileDownloader } from '../common/FileDownloader.js';
import { applyTheme } from '../../core/engine/ThemeEngine.js';
import { eventBus } from '../../core/utils/eventBus.js';
import { ShareDialog } from '../sharing/ShareDialog.js';

const storage = new LocalStorageAdapter();
const responseState = new ResponseState();

export function render(container, formObj = null) {
  container.innerHTML = '';

  const params = new URLSearchParams(window.location.search);
  const formId = params.get('formId');

  if (!formId) {
    const p = document.createElement('p');
    p.style.cssText = 'padding:24px;color:var(--dfb-error-color,#D93025);';
    p.textContent = 'Form ID tidak ditemukan';
    container.appendChild(p);
    return;
  }

  const form = formObj || FormManager.load(formId);
  if (!form) {
    const p = document.createElement('p');
    p.style.cssText = 'padding:24px;color:var(--dfb-error-color,#D93025);';
    p.textContent = 'Form tidak ditemukan';
    container.appendChild(p);
    return;
  }

  // Determine context: is this embedded inline inside the editor, or standalone responses.html?
  const isEmbedded = document.getElementById('dfb-app')?.dataset.page === 'editor';

  let contentArea = container;

  const isReadOnly = params.has('readOnly');

  if (!isEmbedded) {
    if (isReadOnly) {
      container.className = 'gf-page';

      const main = document.createElement('div');
      main.className = 'gf-container';
      container.appendChild(main);

      const headerCard = document.createElement('div');
      headerCard.className = 'gf-header-card';

      // Support header image in readOnly responses
      if (form.metadata.headerImageUrl) {
        headerCard.classList.add('gf-header-card--has-image');
        const imgContainer = document.createElement('div');
        imgContainer.className = 'gf-header-image-container';

        const img = document.createElement('img');
        img.src = form.metadata.headerImageUrl;
        img.className = 'gf-header-image';
        img.alt = 'Form Header';
        img.onerror = () => {
          imgContainer.style.display = 'none';
          headerCard.classList.remove('gf-header-card--has-image');
        };
        imgContainer.appendChild(img);
        headerCard.appendChild(imgContainer);
      }

      const body = document.createElement('div');
      body.className = 'gf-header-body';

      const h1 = document.createElement('h1');
      h1.className = 'gf-form-title';
      h1.textContent = form.metadata.title;
      body.appendChild(h1);

      const desc = document.createElement('div');
      desc.className = 'gf-form-desc';
      desc.textContent = 'Ringkasan tanggapan formulir.';
      body.appendChild(desc);

      headerCard.appendChild(body);
      main.appendChild(headerCard);

      contentArea = document.createElement('div');
      contentArea.className = 'dfb-editor-content-area dfb-editor-responses-area';
      main.appendChild(contentArea);

      applyTheme(form.theme);
    } else {
      // ─── STANDALONE LAYOUT (build editor-like structure) ───
      container.className = 'dfb-editor'; // Reuse editor styling wrapper

      // 1. Editor Header
      const header = document.createElement('div');
      header.className = 'dfb-editor-header';

      const leftArea = document.createElement('div');
      leftArea.className = 'dfb-editor-header-left';

      // Back to dashboard
      const backBtn = document.createElement('button');
      backBtn.className = 'dfb-btn-back';
      backBtn.title = 'Kembali ke Beranda';
      backBtn.setAttribute('aria-label', 'Kembali ke Beranda');
      backBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="22" height="22">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
      `;
      backBtn.addEventListener('click', () => {
        window.location.href = 'index.html';
      });
      leftArea.appendChild(backBtn);

      // SVG Logo
      const logoWrap = document.createElement('div');
      logoWrap.style.cssText =
        'display:flex;align-items:center;gap:6px;margin-right:4px;flex-shrink:0;';
      const logoSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      logoSvg.setAttribute('width', '32');
      logoSvg.setAttribute('height', '32');
      logoSvg.setAttribute('viewBox', '0 0 48 48');
      logoSvg.setAttribute('fill', 'none');
      logoSvg.innerHTML = `
        <rect width="48" height="48" rx="6" fill="#673AB7"/>
        <path d="M12 10h24a2 2 0 0 1 2 2v24a2 2 0 0 1-2 2H12a2 2 0 0 1-2-2V12a2 2 0 0 1 2-2z" fill="#fff" opacity="0.95"/>
        <path d="M16 20h16M16 26h16M16 32h10" stroke="#673AB7" stroke-width="2.5" stroke-linecap="round"/>
      `;
      logoWrap.appendChild(logoSvg);
      leftArea.appendChild(logoWrap);

      // Editable Title Input
      const titleInput = document.createElement('input');
      titleInput.className = 'dfb-editor-title-input';
      titleInput.type = 'text';
      titleInput.value = form.metadata.title;
      titleInput.placeholder = 'Formulir tanpa judul';
      titleInput.maxLength = 500;
      titleInput.setAttribute('aria-label', 'Judul Formulir');
      titleInput.addEventListener('blur', () => {
        form.metadata.title = titleInput.value;
        FormManager.save(form);
        eventBus.emit('form:updated', form);
      });
      leftArea.appendChild(titleInput);
      header.appendChild(leftArea);

      // Header Actions
      const actions = document.createElement('div');
      actions.className = 'dfb-editor-header-actions';

      // Save status
      const saveStatus = document.createElement('span');
      saveStatus.className = 'dfb-editor-save-status';
      saveStatus.textContent = 'Disimpan';
      actions.appendChild(saveStatus);

      // Undo button
      const undoBtn = document.createElement('button');
      undoBtn.className = 'dfb-editor-header-btn';
      undoBtn.title = 'Batalkan';
      undoBtn.setAttribute('aria-label', 'Batalkan');
      undoBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 14 4 9 9 4"/>
          <path d="M20 20v-7a4 4 0 0 0-4-4H4"/>
        </svg>
      `;
      undoBtn.disabled = true;
      undoBtn.style.opacity = '0.38';
      actions.appendChild(undoBtn);

      // Redo button
      const redoBtn = document.createElement('button');
      redoBtn.className = 'dfb-editor-header-btn';
      redoBtn.title = 'Ulangi';
      redoBtn.setAttribute('aria-label', 'Ulangi');
      redoBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 14 20 9 15 4"/>
          <path d="M4 20v-7a4 4 0 0 1 4-4h12"/>
        </svg>
      `;
      redoBtn.disabled = true;
      redoBtn.style.opacity = '0.38';
      actions.appendChild(redoBtn);

      // Preview
      const previewBtn = document.createElement('button');
      previewBtn.className = 'dfb-editor-header-btn';
      previewBtn.title = 'Pratinjau';
      previewBtn.setAttribute('aria-label', 'Pratinjau');
      previewBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      `;
      previewBtn.addEventListener('click', () => {
        window.open(`form.html?formId=${formId}&preview=true`, '_blank');
      });
      actions.appendChild(previewBtn);

      // Theme/Palette button (opens editor with theme tab)
      const themeBtn = document.createElement('button');
      themeBtn.className = 'dfb-editor-header-btn';
      themeBtn.title = 'Ubah tema';
      themeBtn.setAttribute('aria-label', 'Ubah tema warna');
      themeBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 2a10 10 0 1 0 10 10"/>
          <path d="M12 2v5M12 17v5M4.22 4.22l3.54 3.54M16.24 16.24l3.54 3.54M2 12h5M17 12h5M4.22 19.78l3.54-3.54M16.24 7.76l3.54-3.54"/>
        </svg>
      `;
      themeBtn.addEventListener('click', () => {
        window.location.href = `editor.html?formId=${formId}&tab=theme`;
      });
      actions.appendChild(themeBtn);

      // Kirim button (Send)
      const sendBtn = document.createElement('button');
      sendBtn.className = 'dfb-editor-btn-send';
      sendBtn.setAttribute('aria-label', 'Kirim formulir');
      sendBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
          <line x1="22" y1="2" x2="11" y2="13"/>
          <polygon points="22 2 15 22 11 13 2 9 22 2"/>
        </svg>
        <span>Kirim</span>
      `;
      sendBtn.addEventListener('click', () => {
        ShareDialog.open(formId);
      });
      actions.appendChild(sendBtn);

      header.appendChild(actions);
      container.appendChild(header);

      // 2. Editor Tabs (Pertanyaan, Jawaban, Setelan)
      const tabsEl = document.createElement('div');
      tabsEl.className = 'dfb-editor-tabs';

      const qTab = document.createElement('button');
      qTab.className = 'dfb-tab';
      qTab.textContent = 'Pertanyaan';
      qTab.addEventListener('click', () => {
        window.location.href = `editor.html?formId=${formId}`;
      });
      tabsEl.appendChild(qTab);

      const rTab = document.createElement('button');
      rTab.className = 'dfb-tab dfb-tab--active';
      rTab.textContent = 'Jawaban';
      // Count responses
      const allResponses = (() => {
        try {
          const data = localStorage.getItem('dfb:responses');
          const arr = data ? JSON.parse(data) : [];
          return arr.filter((r) => r.formId === formId).length;
        } catch {
          return 0;
        }
      })();
      if (allResponses > 0) {
        rTab.innerHTML = `Jawaban <span class="dfb-tab-badge">${allResponses}</span>`;
      }
      tabsEl.appendChild(rTab);

      const sTab = document.createElement('button');
      sTab.className = 'dfb-tab';
      sTab.textContent = 'Setelan';
      sTab.addEventListener('click', () => {
        window.location.href = `editor.html?formId=${formId}&tab=settings`;
      });
      tabsEl.appendChild(sTab);

      container.appendChild(tabsEl);

      // 3. Body & Content Area
      const body = document.createElement('div');
      body.className = 'dfb-editor-body';
      const main = document.createElement('div');
      main.className = 'dfb-editor-main';
      contentArea = document.createElement('div');
      contentArea.className = 'dfb-editor-content-area dfb-editor-responses-area';
      main.appendChild(contentArea);
      body.appendChild(main);
      container.appendChild(body);

      // Apply Form theme
      applyTheme(form.theme);
    }
  }

  // ─── RENDER DETAILED RESPONSES DASHBOARD CONTENT ───
  responseState.loadFromStorage(storage);
  let filtered = responseState.getFiltered();
  let currentView = 'summary';

  // Wrapper for responses dashboard UI elements
  const dashboardWrap = document.createElement('div');
  dashboardWrap.className = 'dfb-responses-dashboard-wrap';

  // A. MAIN CONTROL CARD
  const controlCard = document.createElement('div');
  controlCard.className = 'dfb-responses-control-card';

  const controlTop = document.createElement('div');
  controlTop.className = 'dfb-responses-control-top';

  const countVal = document.createElement('h1');
  countVal.className = 'dfb-responses-count-title';
  countVal.textContent = `${responseState.totalResponses} jawaban`;
  controlTop.appendChild(countVal);

  const actionsRight = document.createElement('div');
  actionsRight.className = 'dfb-responses-actions-right';

  // Green Sheets button
  const sheetsBtn = document.createElement('button');
  sheetsBtn.className = 'dfb-responses-sheets-btn';
  sheetsBtn.title = 'Lihat di Spreadsheet (CSV)';
  sheetsBtn.setAttribute('aria-label', 'Lihat di Spreadsheet (CSV)');
  sheetsBtn.innerHTML = `
    <svg viewBox="0 0 24 24" width="24" height="24">
      <path fill="#107C41" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
      <path fill="#fff" d="M10 17H5v-4h5v4zm0-5H5V8h5v4zm9 5h-7v-4h7v4zm0-5h-7V8h7v4z"/>
    </svg>
  `;
  sheetsBtn.addEventListener('click', () => {
    const csv = exportToCsv(filtered, form.questions);
    FileDownloader.download(
      csv,
      `${form.metadata.title || 'form'}-jawaban.csv`,
      'text/csv;charset=utf-8',
    );
  });
  actionsRight.appendChild(sheetsBtn);

  // 3-dot Menu Container
  const menuContainer = document.createElement('div');
  menuContainer.style.position = 'relative';

  const menuBtn = document.createElement('button');
  menuBtn.className = 'dfb-responses-menu-btn';
  menuBtn.title = 'Opsi lainnya';
  menuBtn.setAttribute('aria-label', 'Opsi lainnya');
  menuBtn.innerHTML = `
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
      <circle cx="12" cy="5" r="1.5"/>
      <circle cx="12" cy="12" r="1.5"/>
      <circle cx="12" cy="19" r="1.5"/>
    </svg>
  `;
  menuContainer.appendChild(menuBtn);

  const dropdownMenu = document.createElement('div');
  dropdownMenu.className = 'dfb-responses-menu-dropdown';
  dropdownMenu.style.display = 'none';

  const downloadJsonOpt = document.createElement('div');
  downloadJsonOpt.className = 'dfb-responses-menu-item';
  downloadJsonOpt.textContent = 'Unduh jawaban (JSON)';
  downloadJsonOpt.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdownMenu.style.display = 'none';
    const json = exportToJson(filtered);
    FileDownloader.download(
      json,
      `${form.metadata.title || 'form'}-jawaban.json`,
      'application/json',
    );
  });

  const deleteAllOpt = document.createElement('div');
  deleteAllOpt.className = 'dfb-responses-menu-item dfb-responses-menu-item-danger';
  deleteAllOpt.textContent = 'Hapus semua jawaban';
  deleteAllOpt.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdownMenu.style.display = 'none';
    const confirmed = confirm(
      'Apakah Anda yakin ingin menghapus SEMUA jawaban untuk formulir ini? Tindakan ini tidak dapat dibatalkan.',
    );
    if (!confirmed) return;
    try {
      const data = localStorage.getItem('dfb:responses');
      let arr = data ? JSON.parse(data) : [];
      arr = arr.filter((r) => r.formId !== formId);
      localStorage.setItem('dfb:responses', JSON.stringify(arr));

      // Reload state
      responseState.loadFromStorage(storage);
      filtered = [];
      responseState.setCurrentIndex(0);
      countVal.textContent = `0 jawaban`;
      updateEditorBadge(0);
      renderView();
    } catch (err) {
      console.error(err);
    }
  });

  const printOpt = document.createElement('div');
  printOpt.className = 'dfb-responses-menu-item';
  printOpt.textContent = 'Cetak tanggapan';
  printOpt.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdownMenu.style.display = 'none';
    window.print();
  });

  dropdownMenu.appendChild(downloadJsonOpt);
  dropdownMenu.appendChild(printOpt);
  dropdownMenu.appendChild(deleteAllOpt);
  menuContainer.appendChild(dropdownMenu);

  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isShowing = dropdownMenu.style.display === 'block';
    dropdownMenu.style.display = isShowing ? 'none' : 'block';
  });

  document.addEventListener('click', () => {
    dropdownMenu.style.display = 'none';
  });

  actionsRight.appendChild(menuContainer);

  // Menerima Jawaban Toggle
  const toggleWrap = document.createElement('div');
  toggleWrap.className = 'dfb-responses-toggle-wrap';

  const toggleLabel = document.createElement('span');
  toggleLabel.className = 'dfb-responses-toggle-label';
  toggleLabel.textContent = form.metadata.isAcceptingResponses
    ? 'Menerima jawaban'
    : 'Tidak menerima jawaban';

  const toggleSwitch = document.createElement('label');
  toggleSwitch.className = 'dfb-toggle-switch';

  const toggleInput = document.createElement('input');
  toggleInput.type = 'checkbox';
  toggleInput.checked = form.metadata.isAcceptingResponses;

  const toggleSlider = document.createElement('span');
  toggleSlider.className = 'dfb-toggle-slider';

  toggleSwitch.appendChild(toggleInput);
  toggleSwitch.appendChild(toggleSlider);

  toggleWrap.appendChild(toggleLabel);
  toggleWrap.appendChild(toggleSwitch);
  actionsRight.appendChild(toggleWrap);

  if (isReadOnly) {
    actionsRight.style.display = 'none';
  }

  controlTop.appendChild(actionsRight);
  controlCard.appendChild(controlTop);

  // Closed Banner
  const closedBanner = document.createElement('div');
  closedBanner.className = 'dfb-responses-closed-banner';
  closedBanner.style.display = form.metadata.isAcceptingResponses ? 'none' : 'block';

  const closedTitle = document.createElement('p');
  closedTitle.className = 'dfb-responses-closed-title';
  closedTitle.textContent = 'Pesan untuk responden';

  const closedInput = document.createElement('input');
  closedInput.type = 'text';
  closedInput.className = 'dfb-responses-closed-input';
  closedInput.placeholder = 'Formulir ini sudah tidak menerima jawaban';
  closedInput.value =
    form.metadata.confirmationMessageClosed || 'Formulir ini sudah tidak menerima jawaban';

  closedInput.addEventListener('blur', () => {
    form.metadata.confirmationMessageClosed = closedInput.value;
    FormManager.save(form);
  });

  closedBanner.appendChild(closedTitle);
  closedBanner.appendChild(closedInput);
  controlCard.appendChild(closedBanner);

  // D. Date Range Filter Bar
  const filterBar = document.createElement('div');
  filterBar.className = 'dfb-responses-filter-bar';
  filterBar.style.cssText =
    'display:flex;align-items:center;gap:12px;margin-top:16px;padding-top:16px;border-top:1px solid var(--dfb-border-color,#dadce0);flex-wrap:wrap;';

  const filterLabel = document.createElement('span');
  filterLabel.style.cssText = 'font-size:13px;font-weight:500;color:var(--dfb-text-secondary,#5f6368);';
  filterLabel.textContent = 'Filter tanggal:';
  filterBar.appendChild(filterLabel);

  const startLabel = document.createElement('label');
  startLabel.style.cssText =
    'font-size:12px;color:var(--dfb-text-secondary,#5f6368);display:flex;align-items:center;gap:4px;';
  startLabel.textContent = 'Mulai:';
  const startInput = document.createElement('input');
  startInput.type = 'date';
  startInput.className = 'dfb-responses-filter-input';
  startInput.style.cssText =
    'padding:4px 8px;border:1px solid var(--dfb-border-color,#dadce0);border-radius:4px;outline:none;font-size:13px;background:var(--dfb-card-bg,#fff);color:var(--dfb-text-primary,#202124);';
  if (responseState.filter.startDate) {
    startInput.value = responseState.filter.startDate.split('T')[0];
  }
  startLabel.appendChild(startInput);
  filterBar.appendChild(startLabel);

  const endLabel = document.createElement('label');
  endLabel.style.cssText =
    'font-size:12px;color:var(--dfb-text-secondary,#5f6368);display:flex;align-items:center;gap:4px;';
  endLabel.textContent = 'Sampai:';
  const endInput = document.createElement('input');
  endInput.type = 'date';
  endInput.className = 'dfb-responses-filter-input';
  endInput.style.cssText =
    'padding:4px 8px;border:1px solid var(--dfb-border-color,#dadce0);border-radius:4px;outline:none;font-size:13px;background:var(--dfb-card-bg,#fff);color:var(--dfb-text-primary,#202124);';
  if (responseState.filter.endDate) {
    endInput.value = responseState.filter.endDate.split('T')[0];
  }
  endLabel.appendChild(endInput);
  filterBar.appendChild(endLabel);

  const clearFilterBtn = document.createElement('button');
  clearFilterBtn.className = 'dfb-btn dfb-btn-clear-filter';
  clearFilterBtn.textContent = 'Reset';
  clearFilterBtn.style.cssText =
    'padding:4px 8px;font-size:12px;border:none;background:#f1f3f4;border-radius:4px;cursor:pointer;color:var(--dfb-text-primary,#202124);';
  filterBar.appendChild(clearFilterBtn);

  controlCard.appendChild(filterBar);

  const updateFilter = () => {
    const startVal = startInput.value ? startInput.value + 'T00:00:00.000Z' : null;
    const endVal = endInput.value ? endInput.value + 'T23:59:59.999Z' : null;
    responseState.setFilter({ startDate: startVal, endDate: endVal });
  };

  startInput.addEventListener('change', updateFilter);
  endInput.addEventListener('change', updateFilter);

  clearFilterBtn.addEventListener('click', () => {
    startInput.value = '';
    endInput.value = '';
    responseState.setFilter({ startDate: null, endDate: null });
  });

  const onFiltered = (newFilter) => {
    filtered = responseState.getFiltered();
    const count = filtered.length;
    const total = responseState.totalResponses;
    if (newFilter.startDate || newFilter.endDate) {
      countVal.textContent = `${count} dari ${total} jawaban (difilter)`;
    } else {
      countVal.textContent = `${total} jawaban`;
    }
    renderView();
  };

  eventBus.on('responses:filtered', onFiltered);
  if (container._dashboardFilterListener) {
    eventBus.off('responses:filtered', container._dashboardFilterListener);
  }
  container._dashboardFilterListener = onFiltered;

  // Toggle Input Event
  toggleInput.addEventListener('change', () => {
    const isAccepting = toggleInput.checked;
    form.metadata.isAcceptingResponses = isAccepting;
    FormManager.save(form);
    toggleLabel.textContent = isAccepting ? 'Menerima jawaban' : 'Tidak menerima jawaban';
    closedBanner.style.display = isAccepting ? 'none' : 'block';

    // Keep settings panels in sync if any
    eventBus.emit('form:updated', form);
  });

  // Sync accept toggle if updated from other views
  const onFormUpdated = (updatedForm) => {
    if (updatedForm.formId === formId) {
      form.metadata.isAcceptingResponses = updatedForm.metadata.isAcceptingResponses;
      toggleInput.checked = form.metadata.isAcceptingResponses;
      toggleLabel.textContent = form.metadata.isAcceptingResponses
        ? 'Menerima jawaban'
        : 'Tidak menerima jawaban';
      closedBanner.style.display = form.metadata.isAcceptingResponses ? 'none' : 'block';
    }
  };
  eventBus.on('form:updated', onFormUpdated);

  if (container._dashboardListener) {
    eventBus.off('form:updated', container._dashboardListener);
  }
  container._dashboardListener = onFormUpdated;

  dashboardWrap.appendChild(controlCard);

  // B. SUB-TABS (Ringkasan, Pertanyaan, Individual)
  const subTabs = document.createElement('div');
  subTabs.className = 'dfb-response-tabs';

  const summaryTab = document.createElement('button');
  summaryTab.className = 'dfb-sub-tab dfb-sub-tab--active';
  summaryTab.dataset.view = 'summary';
  summaryTab.textContent = 'Ringkasan';

  const questionTab = document.createElement('button');
  questionTab.className = 'dfb-sub-tab';
  questionTab.dataset.view = 'question';
  questionTab.textContent = 'Pertanyaan';

  const individualTab = document.createElement('button');
  individualTab.className = 'dfb-sub-tab';
  individualTab.dataset.view = 'individual';
  individualTab.textContent = 'Individual';

  subTabs.appendChild(summaryTab);
  subTabs.appendChild(questionTab);
  subTabs.appendChild(individualTab);
  dashboardWrap.appendChild(subTabs);

  // C. SUB-VIEW CONTENT CONTAINER
  const contentContainer = document.createElement('div');
  contentContainer.className = 'dfb-response-content';
  dashboardWrap.appendChild(contentContainer);

  contentArea.appendChild(dashboardWrap);

  // Render View helper
  function renderView() {
    contentContainer.innerHTML = '';
    const hasResponses = filtered.length > 0;

    // Toggle sub-tabs visibility
    subTabs.style.display = hasResponses ? 'flex' : 'none';

    // Toggle Sheets button state
    if (hasResponses) {
      sheetsBtn.disabled = false;
      sheetsBtn.style.opacity = '1';
      sheetsBtn.style.cursor = 'pointer';
      sheetsBtn.title = 'Lihat di Spreadsheet (CSV)';
    } else {
      sheetsBtn.disabled = true;
      sheetsBtn.style.opacity = '0.38';
      sheetsBtn.style.cursor = 'not-allowed';
      sheetsBtn.title = 'Spreadsheet tidak tersedia (0 jawaban)';
    }

    if (!hasResponses) {
      const empty = document.createElement('div');
      empty.className = 'dfb-response-empty-card';

      const emptyIcon = document.createElement('div');
      emptyIcon.className = 'dfb-response-empty-icon';
      emptyIcon.textContent = '📊';
      empty.appendChild(emptyIcon);

      const emptyTitle = document.createElement('p');
      emptyTitle.className = 'dfb-response-empty-title';
      emptyTitle.textContent = 'Belum ada jawaban';
      empty.appendChild(emptyTitle);

      const emptyDesc = document.createElement('p');
      emptyDesc.className = 'dfb-response-empty-desc';
      emptyDesc.textContent = 'Bagikan formulir ini untuk mulai mengumpulkan jawaban.';
      empty.appendChild(emptyDesc);

      contentContainer.appendChild(empty);
      return;
    }

    if (currentView === 'summary') {
      contentContainer.appendChild(SummaryView.create(filtered, form.questions));
    } else if (currentView === 'question') {
      contentContainer.appendChild(QuestionView.create(filtered, form.questions));
    } else {
      contentContainer.appendChild(
        IndividualView.create(
          filtered,
          responseState.currentIndex,
          form.questions,
          (idx) => {
            responseState.setCurrentIndex(idx);
            renderView();
          },
          () => {
            const confirmed = confirm('Hapus jawaban ini?');
            if (!confirmed) return;
            const res = filtered[responseState.currentIndex];
            if (res && res.responseId) {
              responseState.removeResponse(res.responseId);
              responseState.saveToStorage(storage);
              filtered = responseState.getFiltered();

              if (responseState.currentIndex >= filtered.length) {
                responseState.setCurrentIndex(Math.max(0, filtered.length - 1));
              }

              const newCount = responseState.totalResponses;
              countVal.textContent = `${newCount} jawaban`;
              updateEditorBadge(newCount);
              renderView();
            }
          },
        ),
      );
    }
  }

  // Tab listeners
  subTabs.querySelectorAll('.dfb-sub-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      subTabs.querySelectorAll('.dfb-sub-tab').forEach((t) => t.classList.remove('dfb-sub-tab--active'));
      tab.classList.add('dfb-sub-tab--active');
      currentView = tab.dataset.view;
      renderView();
    });
  });

  // Editor Badge Update helper
  function updateEditorBadge(count) {
    const badge = document.querySelector('.dfb-tab[data-tab="responses"] .dfb-tab-badge');
    if (badge) {
      if (count > 0) {
        badge.textContent = count;
        badge.style.display = 'inline-block';
      } else {
        badge.style.display = 'none';
      }
    } else if (count > 0) {
      const tab = document.querySelector('.dfb-tab[data-tab="responses"]');
      if (tab) {
        tab.innerHTML = `Jawaban <span class="dfb-tab-badge">${count}</span>`;
      }
    } else {
      const tab = document.querySelector('.dfb-tab[data-tab="responses"]');
      if (tab) {
        tab.innerHTML = 'Jawaban';
      }
    }
  }

  renderView();
}
