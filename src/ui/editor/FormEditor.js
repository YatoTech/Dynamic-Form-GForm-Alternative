import { FormManager } from '../../core/form/FormManager.js';
import { FormFactory } from '../../core/form/FormFactory.js';
import { EditorState } from '../../core/state/EditorState.js';
import { debounce } from '../../core/utils/debounce.js';
import { eventBus } from '../../core/utils/eventBus.js';
import { QuestionCard } from './QuestionCard.js';
import { DragHandler } from './DragHandle.js';
import { ThemePanel } from '../theme/ThemePanel.js';
import { SettingsPanel } from './SettingsPanel.js';
import { ShareDialog } from '../sharing/ShareDialog.js';
import { applyTheme } from '../../core/engine/ThemeEngine.js';
import { QUESTION_TYPES } from '../../core/form/QuestionTypes.js';
import * as ResponseDashboard from '../responses/ResponseDashboard.js';
import { initRipple } from '../common/ripple.js';

const editorState = new EditorState();
let formId = null;
let containerEl = null;
let eventBusRegistered = false;

export function render(container) {
  containerEl = container;
  containerEl.innerHTML = '';
  containerEl.className = 'dfb-editor';

  const params = new URLSearchParams(window.location.search);
  formId = params.get('formId');
  if (!formId) {
    container.textContent = 'Form ID tidak ditemukan';
    return;
  }

  const form = FormManager.load(formId);
  if (!form) {
    container.textContent = 'Form tidak ditemukan';
    return;
  }

  editorState.setForm(form);
  buildLayout();
  attachEvents();

  // Handle initial tab from URL param
  const initialTab = params.get('tab');
  if (initialTab === 'responses') {
    const tabEl = containerEl.querySelector('.dfb-tab[data-tab="responses"]');
    if (tabEl) tabEl.click();
  } else if (initialTab === 'settings') {
    const tabEl = containerEl.querySelector('.dfb-tab[data-tab="settings"]');
    if (tabEl) tabEl.click();
  }
}

function buildLayout() {
  /* ── Top Header ── */
  const header = document.createElement('div');
  header.className = 'dfb-editor-header';

  const leftArea = document.createElement('div');
  leftArea.className = 'dfb-editor-header-left';

  // Back button
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
  leftArea.appendChild(backBtn);

  // Forms logo icon
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

  // Title input (in header)
  const titleInput = document.createElement('input');
  titleInput.className = 'dfb-editor-title-input';
  titleInput.type = 'text';
  titleInput.value = editorState.formDefinition.metadata.title;
  titleInput.placeholder = 'Formulir tanpa judul';
  titleInput.maxLength = 500;
  titleInput.setAttribute('aria-label', 'Judul Formulir');
  leftArea.appendChild(titleInput);

  header.appendChild(leftArea);

  /* ── Header Actions (right side) ── */
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
  undoBtn.title = 'Batalkan (Ctrl+Z)';
  undoBtn.setAttribute('aria-label', 'Batalkan');
  undoBtn.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="9 14 4 9 9 4"/>
      <path d="M20 20v-7a4 4 0 0 0-4-4H4"/>
    </svg>
  `;
  actions.appendChild(undoBtn);

  // Redo button
  const redoBtn = document.createElement('button');
  redoBtn.className = 'dfb-editor-header-btn';
  redoBtn.title = 'Ulangi (Ctrl+Y)';
  redoBtn.setAttribute('aria-label', 'Ulangi');
  redoBtn.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="15 14 20 9 15 4"/>
      <path d="M4 20v-7a4 4 0 0 1 4-4h12"/>
    </svg>
  `;
  actions.appendChild(redoBtn);

  // Preview button (eye icon)
  const previewBtn = document.createElement('button');
  previewBtn.className = 'dfb-editor-header-btn';
  previewBtn.title = 'Pratinjau';
  previewBtn.setAttribute('aria-label', 'Pratinjau formulir');
  previewBtn.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  `;
  actions.appendChild(previewBtn);

  // Theme/Palette button
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
  actions.appendChild(themeBtn);

  // More options button (3 dots)
  const moreBtn = document.createElement('button');
  moreBtn.className = 'dfb-editor-header-btn';
  moreBtn.title = 'Lainnya';
  moreBtn.setAttribute('aria-label', 'Opsi lainnya');
  moreBtn.innerHTML = `
    <svg viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="5" r="1.5"/>
      <circle cx="12" cy="12" r="1.5"/>
      <circle cx="12" cy="19" r="1.5"/>
    </svg>
  `;
  actions.appendChild(moreBtn);

  // "Kirim" button (purple, with send icon)
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
  initRipple(sendBtn);
  actions.appendChild(sendBtn);

  header.appendChild(actions);
  containerEl.appendChild(header);

  /* ── Tabs (Pertanyaan | Respons | Setelan) ── */
  const tabs = document.createElement('div');
  tabs.className = 'dfb-editor-tabs';

  const qTab = document.createElement('button');
  qTab.className = 'dfb-tab dfb-tab--active';
  qTab.dataset.tab = 'questions';
  qTab.textContent = 'Pertanyaan';
  initRipple(qTab);
  tabs.appendChild(qTab);

  const rTab = document.createElement('button');
  rTab.className = 'dfb-tab';
  rTab.dataset.tab = 'responses';
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
  rTab.innerHTML = `Jawaban${allResponses > 0 ? ` <span class="dfb-tab-badge">${allResponses}</span>` : ''}`;
  initRipple(rTab);
  tabs.appendChild(rTab);

  const sTab = document.createElement('button');
  sTab.className = 'dfb-tab';
  sTab.dataset.tab = 'settings';
  sTab.textContent = 'Setelan';
  initRipple(sTab);
  tabs.appendChild(sTab);

  const indicator = document.createElement('div');
  indicator.className = 'dfb-tab-indicator';
  tabs.appendChild(indicator);

  function updateTabIndicator(activeTabEl) {
    if (!indicator || !activeTabEl) return;
    const tabsRect = tabs.getBoundingClientRect();
    const activeRect = activeTabEl.getBoundingClientRect();
    const left = activeRect.left - tabsRect.left;
    const width = activeRect.width;
    indicator.style.width = `${width}px`;
    indicator.style.transform = `translateX(${left}px)`;
  }

  window.addEventListener('resize', () => {
    const active = tabs.querySelector('.dfb-tab--active');
    updateTabIndicator(active);
  });

  setTimeout(() => {
    const active = tabs.querySelector('.dfb-tab--active');
    updateTabIndicator(active);
  }, 50);

  containerEl.appendChild(tabs);

  /* ── Editor Body ── */
  const body = document.createElement('div');
  body.className = 'dfb-editor-body';

  const main = document.createElement('div');
  main.className = 'dfb-editor-main';

  const contentArea = document.createElement('div');
  contentArea.className = 'dfb-editor-content-area';
  main.appendChild(contentArea);

  body.appendChild(main);
  containerEl.appendChild(body);

  /* ── Floating Vertical Toolbar (Google Forms right-side) ── */
  const toolbar = document.createElement('div');
  toolbar.className = 'dfb-editor-toolbar';
  toolbar.setAttribute('role', 'toolbar');
  toolbar.setAttribute('aria-label', 'Tambah konten');

  // Add Question button
  const addQuestionBtn = document.createElement('button');
  addQuestionBtn.className = 'dfb-editor-toolbar-btn dfb-q-toolbar-btn';
  addQuestionBtn.title = 'Tambah pertanyaan';
  addQuestionBtn.setAttribute('aria-label', 'Tambah pertanyaan');
  addQuestionBtn.dataset.type = 'multiple_choice';
  addQuestionBtn.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  `;
  initRipple(addQuestionBtn);
  addQuestionBtn.addEventListener('click', () => onAddQuestion(QUESTION_TYPES.MULTIPLE_CHOICE));
  toolbar.appendChild(addQuestionBtn);

  // Import questions button (from other forms)
  const importQBtn = document.createElement('button');
  importQBtn.className = 'dfb-editor-toolbar-btn';
  importQBtn.title = 'Import pertanyaan';
  importQBtn.setAttribute('aria-label', 'Import pertanyaan');
  importQBtn.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="16 16 12 12 8 16"/>
      <line x1="12" y1="12" x2="12" y2="21"/>
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
    </svg>
  `;
  initRipple(importQBtn);
  importQBtn.addEventListener('click', () => {
    // TODO: Import from other forms
    onAddQuestion(QUESTION_TYPES.SHORT_ANSWER);
  });
  toolbar.appendChild(importQBtn);

  // Divider
  const div1 = document.createElement('div');
  div1.className = 'dfb-editor-toolbar-divider';
  toolbar.appendChild(div1);

  // Add section button
  const addSectionBtn = document.createElement('button');
  addSectionBtn.className = 'dfb-editor-toolbar-btn';
  addSectionBtn.title = 'Tambah seksi';
  addSectionBtn.setAttribute('aria-label', 'Tambah pembatas seksi');
  addSectionBtn.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="3" width="18" height="7" rx="1"/>
      <rect x="3" y="14" width="18" height="7" rx="1"/>
    </svg>
  `;
  initRipple(addSectionBtn);
  addSectionBtn.addEventListener('click', () => onAddQuestion(QUESTION_TYPES.SECTION_HEADER));
  toolbar.appendChild(addSectionBtn);

  // Add image button (placeholder)
  const addImageBtn = document.createElement('button');
  addImageBtn.className = 'dfb-editor-toolbar-btn';
  addImageBtn.title = 'Tambah gambar';
  addImageBtn.setAttribute('aria-label', 'Tambah gambar');
  addImageBtn.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <circle cx="9" cy="9" r="2"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>
  `;
  initRipple(addImageBtn);
  addImageBtn.addEventListener('click', () => {
    // Import Toast dynamically
    import('../common/Toast.js')
      .then(({ Toast: T }) => {
        T.show('Fitur tambah gambar akan segera hadir');
      })
      .catch(() => {});
  });
  toolbar.appendChild(addImageBtn);

  // Add video button (placeholder)
  const addVideoBtn = document.createElement('button');
  addVideoBtn.className = 'dfb-editor-toolbar-btn';
  addVideoBtn.title = 'Tambah video YouTube';
  addVideoBtn.setAttribute('aria-label', 'Tambah video YouTube');
  addVideoBtn.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="23 7 16 12 23 17 23 7"/>
      <rect x="1" y="5" width="15" height="14" rx="2"/>
    </svg>
  `;
  initRipple(addVideoBtn);
  addVideoBtn.addEventListener('click', () => {
    import('../common/Toast.js')
      .then(({ Toast: T }) => {
        T.show('Fitur tambah video akan segera hadir');
      })
      .catch(() => {});
  });
  toolbar.appendChild(addVideoBtn);

  body.appendChild(toolbar);

  renderQuestionList();
  setTimeout(updateToolbarPosition, 100);
}

function updateToolbarPosition() {
  const qTab = containerEl?.querySelector('.dfb-tab[data-tab="questions"]');
  const isQuestionsTab = qTab && qTab.classList.contains('dfb-tab--active');
  const toolbar = containerEl?.querySelector('.dfb-editor-toolbar');

  if (!isQuestionsTab && toolbar) {
    toolbar.style.display = 'none';
    return;
  }

  if (!toolbar) return;

  // Don't touch on mobile (fixed bottom bar)
  if (window.innerWidth <= 900) {
    toolbar.style.display = 'flex';
    return;
  }

  const activeCard =
    containerEl?.querySelector('.dfb-question-card--active') ||
    containerEl?.querySelector('.dfb-section-divider--active') ||
    containerEl?.querySelector('.dfb-editor-header-card--active');
  const bodyEl = containerEl?.querySelector('.dfb-editor-body');
  if (!bodyEl) return;
  const bodyRect = bodyEl.getBoundingClientRect();

  if (activeCard) {
    const cardRect = activeCard.getBoundingClientRect();
    let topOffset = cardRect.top - bodyRect.top;

    const toolbarHeight = toolbar.getBoundingClientRect().height;
    const cardHeight = cardRect.height;

    // Clamp toolbar to stay within the card bounds
    if (cardRect.top < 130) {
      const adjust = 130 - cardRect.top;
      topOffset += Math.min(adjust, cardHeight - toolbarHeight - 16);
    }
    if (topOffset < 0) topOffset = 8;

    toolbar.style.top = `${topOffset}px`;
    toolbar.style.display = 'flex';
  } else {
    const firstCard =
      containerEl?.querySelector('.dfb-question-card') ||
      containerEl?.querySelector('.dfb-section-divider');
    if (firstCard) {
      const cardRect = firstCard.getBoundingClientRect();
      toolbar.style.top = `${cardRect.top - bodyRect.top}px`;
    } else {
      toolbar.style.top = '80px';
    }
    toolbar.style.display = 'flex';
  }
}

function renderQuestionList() {
  const area = getContentArea();
  if (!area) return;
  area.innerHTML = '';
  area.className = 'dfb-editor-content-area';

  const form = editorState.formDefinition;
  const activeQuestionId = editorState.activeQuestionId;

  const list = document.createElement('div');
  list.className = 'dfb-editor-question-list';
  area.appendChild(list);

  // Header card (form title + description)
  const headerCard = buildHeaderCard(form);
  if (activeQuestionId === 'header') {
    headerCard.classList.add('dfb-editor-header-card--active');
  }
  list.appendChild(headerCard);

  const sections = getFormSections(form);
  // Question cards
  form.questions.forEach((q, i) => {
    const isActive = q.questionId === activeQuestionId;
    const card = QuestionCard.create(
      q,
      i + 1,
      {
        onEdit: () => {
          editorState.setActiveQuestion(q.questionId);
        },
        onDuplicate: () => onDuplicateQuestion(q.questionId),
        onDelete: () => onDeleteQuestion(q.questionId),
        onRequiredToggle: (required) => onToggleRequired(q.questionId, required),
        onSave: () => {
          markDirty();
        },
        onAddAfter: () => {
          onAddQuestion(QUESTION_TYPES.SHORT_ANSWER);
        },
      },
      isActive,
      sections,
    );
    list.appendChild(card);
  });

  // Drag and drop handler
  const dragHandler = new DragHandler(list, (from, to) => onReorder(from, to));
  dragHandler.attach();

  // Click on list background → deselect
  list.addEventListener('click', (e) => {
    if (e.target === list || e.target.classList.contains('dfb-editor-question-list')) {
      editorState.setActiveQuestion(null);
    }
  });
}

/**
 * Builds the header card (form title + description editor)
 * @param {Object} form - FormDefinition
 * @returns {HTMLElement}
 */
function buildHeaderCard(form) {
  const card = document.createElement('div');
  card.className = 'dfb-editor-header-card';

  const titleInput = document.createElement('input');
  titleInput.className = 'dfb-editor-form-title-input';
  titleInput.type = 'text';
  titleInput.value = form.metadata.title || '';
  titleInput.placeholder = 'Judul formulir';
  titleInput.maxLength = 500;
  titleInput.setAttribute('aria-label', 'Judul formulir');

  titleInput.addEventListener('input', () => {
    form.metadata.title = titleInput.value;
    // Also update header title input
    const headerTitleInput = containerEl?.querySelector('.dfb-editor-title-input');
    if (headerTitleInput) headerTitleInput.value = titleInput.value;
    markDirty();
  });

  card.appendChild(titleInput);

  const descInput = document.createElement('textarea');
  descInput.className = 'dfb-editor-form-desc-input';
  descInput.value = form.metadata.description || '';
  descInput.placeholder = 'Deskripsi formulir';
  descInput.rows = 1;
  descInput.setAttribute('aria-label', 'Deskripsi formulir');

  descInput.addEventListener('input', function () {
    form.metadata.description = this.value;
    this.style.height = 'auto';
    this.style.height = `${this.scrollHeight}px`;
    markDirty();
  });

  requestAnimationFrame(() => {
    descInput.style.height = 'auto';
    descInput.style.height = `${descInput.scrollHeight}px`;
  });

  card.appendChild(descInput);

  // Click on header card to activate it
  card.addEventListener('click', (e) => {
    e.stopPropagation();
    editorState.setActiveQuestion('header');
  });

  return card;
}

function getContentArea() {
  return containerEl.querySelector('.dfb-editor-content-area');
}

function onAddQuestion(type) {
  editorState.pushUndo();
  const activeId = editorState.activeQuestionId;
  const newQ = FormFactory.addQuestion(editorState.formDefinition, type, null, activeId);
  FormManager.save(editorState.formDefinition);
  if (newQ) {
    editorState.setActiveQuestion(newQ.questionId);
  }
  renderQuestionList();
  markDirty();
  // Scroll new card into view
  requestAnimationFrame(() => {
    const newCard = containerEl?.querySelector(`[data-dfb-question-id="${newQ?.questionId}"]`);
    if (newCard) {
      newCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    updateToolbarPosition();
  });
}

function onDuplicateQuestion(questionId) {
  editorState.pushUndo();
  const clone = FormFactory.duplicateQuestion(editorState.formDefinition, questionId);
  FormManager.save(editorState.formDefinition);
  if (clone) {
    editorState.setActiveQuestion(clone.questionId);
  }
  renderQuestionList();
  markDirty();
  setTimeout(updateToolbarPosition, 50);
}

function onDeleteQuestion(questionId) {
  editorState.pushUndo();
  const idx = editorState.formDefinition.questions.findIndex((q) => q.questionId === questionId);
  let nextActiveId = null;
  if (idx !== -1) {
    if (editorState.formDefinition.questions.length > 1) {
      if (idx < editorState.formDefinition.questions.length - 1) {
        nextActiveId = editorState.formDefinition.questions[idx + 1].questionId;
      } else {
        nextActiveId = editorState.formDefinition.questions[idx - 1].questionId;
      }
    }
  }
  FormFactory.removeQuestion(editorState.formDefinition, questionId);
  FormManager.save(editorState.formDefinition);
  editorState.setActiveQuestion(nextActiveId);
  renderQuestionList();
  markDirty();
  setTimeout(updateToolbarPosition, 50);
}

function onReorder(from, to) {
  editorState.pushUndo();
  const ids = editorState.formDefinition.questions.map((q) => q.questionId);
  const [moved] = ids.splice(from, 1);
  ids.splice(to, 0, moved);
  FormFactory.reorderQuestions(editorState.formDefinition, ids);
  FormManager.save(editorState.formDefinition);
  renderQuestionList();
  markDirty();
  setTimeout(updateToolbarPosition, 50);
}

function onToggleRequired(questionId, required) {
  const q = editorState.formDefinition.questions.find((q) => q.questionId === questionId);
  if (q) {
    q.required = required;
    q.validation = q.validation || {};
    q.validation.required = required;
    FormManager.save(editorState.formDefinition);
    markDirty();
  }
}

function showThemeModal() {
  const overlay = document.createElement('div');
  overlay.className = 'dfb-modal-overlay';

  const content = document.createElement('div');
  content.className = 'dfb-modal-content';

  const modalHeader = document.createElement('div');
  modalHeader.className = 'dfb-modal-header';

  const modalTitle = document.createElement('div');
  modalTitle.className = 'dfb-modal-title';
  modalTitle.textContent = 'Ubah tema';
  modalHeader.appendChild(modalTitle);

  const closeBtn = document.createElement('button');
  closeBtn.className = 'dfb-modal-close';
  closeBtn.setAttribute('aria-label', 'Tutup');
  closeBtn.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  `;
  closeBtn.addEventListener('click', () => overlay.remove());
  modalHeader.appendChild(closeBtn);

  content.appendChild(modalHeader);

  const modalBody = document.createElement('div');
  modalBody.className = 'dfb-modal-body';
  ThemePanel.render(editorState.formDefinition, modalBody);
  content.appendChild(modalBody);

  overlay.appendChild(content);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });
  document.body.appendChild(overlay);
}

const autoSave = debounce(() => {
  if (editorState.formDefinition) {
    FormManager.save(editorState.formDefinition);
    const status = containerEl?.querySelector('.dfb-editor-save-status');
    if (status) status.textContent = 'Disimpan';
  }
}, 1000);

function markDirty() {
  editorState.isDirty = true;
  const status = containerEl?.querySelector('.dfb-editor-save-status');
  if (status) status.textContent = 'Menyimpan...';
  autoSave();
}

function attachEvents() {
  // Sync header title input → form definition
  const headerTitleInput = containerEl.querySelector('.dfb-editor-title-input');
  if (headerTitleInput) {
    headerTitleInput.addEventListener('input', () => {
      editorState.formDefinition.metadata.title = headerTitleInput.value;
      // Also sync the header card title input
      const cardTitleInput = containerEl.querySelector('.dfb-editor-form-title-input');
      if (cardTitleInput) cardTitleInput.value = headerTitleInput.value;
      markDirty();
    });
    headerTitleInput.addEventListener('blur', () => {
      editorState.formDefinition.metadata.title = headerTitleInput.value;
      FormManager.save(editorState.formDefinition);
    });
  }

  // Tab switching
  containerEl.querySelectorAll('.dfb-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      containerEl
        .querySelectorAll('.dfb-tab')
        .forEach((t) => t.classList.remove('dfb-tab--active'));
      tab.classList.add('dfb-tab--active');
      const indicator = containerEl.querySelector('.dfb-tab-indicator');
      const tabsContainer = containerEl.querySelector('.dfb-editor-tabs');
      if (indicator && tabsContainer) {
        const tabsRect = tabsContainer.getBoundingClientRect();
        const activeRect = tab.getBoundingClientRect();
        indicator.style.width = `${activeRect.width}px`;
        indicator.style.transform = `translateX(${activeRect.left - tabsRect.left}px)`;
      }
      const tabName = tab.dataset.tab;
      if (tabName === 'responses') {
        const toolbar = containerEl.querySelector('.dfb-editor-toolbar');
        if (toolbar) toolbar.style.display = 'none';
        const area = getContentArea();
        area.innerHTML = '';
        area.className = 'dfb-editor-content-area dfb-editor-responses-area';
        ResponseDashboard.render(area, editorState.formDefinition);
      } else if (tabName === 'settings') {
        const toolbar = containerEl.querySelector('.dfb-editor-toolbar');
        if (toolbar) toolbar.style.display = 'none';
        const area = getContentArea();
        area.innerHTML = '';
        area.className = 'dfb-editor-content-area dfb-editor-settings-area';
        SettingsPanel.render(editorState.formDefinition, area);
      } else {
        renderQuestionList();
        setTimeout(updateToolbarPosition, 50);
      }
    });
  });

  // Apply current theme
  applyTheme(editorState.formDefinition.theme);

  // Back button
  const backBtn = containerEl.querySelector('.dfb-btn-back');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  }

  // Preview button
  const previewBtn = containerEl.querySelector('.dfb-editor-header-btn[title="Pratinjau"]');
  if (previewBtn) {
    previewBtn.addEventListener('click', () => {
      window.open(`form.html?formId=${formId}&preview=true`, '_blank');
    });
  }

  // Theme button
  const themeBtn = containerEl.querySelector('.dfb-editor-header-btn[title="Ubah tema"]');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      showThemeModal();
    });
  }

  // Send/Share button
  const sendBtn = containerEl.querySelector('.dfb-editor-btn-send');
  if (sendBtn) {
    sendBtn.addEventListener('click', () => {
      ShareDialog.open(formId);
    });
  }

  // Undo button
  const undoBtn = containerEl.querySelector('.dfb-editor-header-btn[title="Batalkan (Ctrl+Z)"]');
  if (undoBtn) {
    undoBtn.addEventListener('click', () => {
      editorState.undo();
      renderQuestionList();
      FormManager.save(editorState.formDefinition);
      setTimeout(updateToolbarPosition, 50);
    });
  }

  // Redo button
  const redoBtn = containerEl.querySelector('.dfb-editor-header-btn[title="Ulangi (Ctrl+Y)"]');
  if (redoBtn) {
    redoBtn.addEventListener('click', () => {
      editorState.redo();
      renderQuestionList();
      FormManager.save(editorState.formDefinition);
      setTimeout(updateToolbarPosition, 50);
    });
  }

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      editorState.undo();
      renderQuestionList();
      FormManager.save(editorState.formDefinition);
      setTimeout(updateToolbarPosition, 50);
    }
    if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
      e.preventDefault();
      editorState.redo();
      renderQuestionList();
      FormManager.save(editorState.formDefinition);
      setTimeout(updateToolbarPosition, 50);
    }
  });

  // EventBus subscriptions (avoid duplicate registration)
  if (!eventBusRegistered) {
    eventBus.on('form:updated', (updatedForm) => {
      if (updatedForm && updatedForm.formId === editorState.formDefinition?.formId) {
        editorState.formDefinition = updatedForm;
      }
      const activeTabEl = containerEl?.querySelector('.dfb-editor-tabs .dfb-tab--active');
      const activeTab = activeTabEl ? activeTabEl.dataset.tab : 'questions';
      if (activeTab === 'questions') {
        renderQuestionList();
        updateToolbarPosition();
      }
    });
    eventBus.on('active-question:changed', () => {
      const activeTabEl = containerEl?.querySelector('.dfb-editor-tabs .dfb-tab--active');
      const activeTab = activeTabEl ? activeTabEl.dataset.tab : 'questions';
      if (activeTab === 'questions') {
        renderQuestionList();
        requestAnimationFrame(updateToolbarPosition);
      }
    });
    window.addEventListener('resize', updateToolbarPosition);
    window.addEventListener('scroll', updateToolbarPosition, { passive: true });
    eventBusRegistered = true;
  }
}

function getFormSections(form) {
  const hasSectionHeader = form.questions.some((q) => q.type === 'section_header');
  if (!hasSectionHeader && form.sections && form.sections.length > 0) {
    return form.sections;
  }

  const sections = [];
  let currentSection = {
    sectionId: 'default',
    title: 'Bagian 1',
    description: '',
    questionIds: [],
  };

  form.questions.forEach((q) => {
    if (q.type === 'section_header') {
      if (currentSection.questionIds.length > 0 || sections.length > 0) {
        sections.push(currentSection);
      }
      currentSection = {
        sectionId: q.questionId,
        title: q.title || 'Tanpa Judul',
        description: q.description || '',
        questionIds: [],
      };
    } else {
      currentSection.questionIds.push(q.questionId);
    }
  });

  sections.push(currentSection);
  return sections;
}
