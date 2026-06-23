import { FormManager } from '../../core/form/FormManager.js';
import { FormFactory } from '../../core/form/FormFactory.js';
import { EditorState } from '../../core/state/EditorState.js';
import { debounce } from '../../core/utils/debounce.js';
import { QuestionCard } from './QuestionCard.js';
import { DragHandler } from './DragHandle.js';
import { ThemePanel } from '../theme/ThemePanel.js';
import { SettingsPanel } from './SettingsPanel.js';
import { ShareDialog } from '../sharing/ShareDialog.js';
import { applyTheme } from '../../core/engine/ThemeEngine.js';
import { QUESTION_TYPES, QUESTION_TYPE_LABELS } from '../../core/form/QuestionTypes.js';

const editorState = new EditorState();
let formId = null;
let containerEl = null;

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
}

function buildLayout() {
  const header = document.createElement('div');
  header.className = 'dfb-editor-header';

  const leftArea = document.createElement('div');
  leftArea.className = 'dfb-editor-header-left';

  const backBtn = document.createElement('button');
  backBtn.className = 'dfb-btn-back';
  backBtn.title = 'Kembali ke Dashboard';
  backBtn.innerHTML = '\u2190';
  leftArea.appendChild(backBtn);

  const titleInput = document.createElement('input');
  titleInput.className = 'dfb-editor-title-input';
  titleInput.type = 'text';
  titleInput.value = editorState.formDefinition.metadata.title;
  titleInput.placeholder = 'Formulir tanpa judul';
  titleInput.maxLength = 500;
  leftArea.appendChild(titleInput);

  header.appendChild(leftArea);

  const actions = document.createElement('div');
  actions.className = 'dfb-editor-header-actions';

  const saveStatus = document.createElement('span');
  saveStatus.className = 'dfb-editor-save-status';
  saveStatus.textContent = 'Disimpan';
  actions.appendChild(saveStatus);

  const undoBtn = document.createElement('button');
  undoBtn.className = 'dfb-editor-header-btn';
  undoBtn.title = 'Undo (Ctrl+Z)';
  undoBtn.innerHTML = '\u21B6';
  actions.appendChild(undoBtn);

  const redoBtn = document.createElement('button');
  redoBtn.className = 'dfb-editor-header-btn';
  redoBtn.title = 'Redo (Ctrl+Y)';
  redoBtn.innerHTML = '\u21B7';
  actions.appendChild(redoBtn);

  const previewBtn = document.createElement('button');
  previewBtn.className = 'dfb-editor-header-btn';
  previewBtn.title = 'Pratinjau';
  previewBtn.innerHTML = '\u{1F441}';
  actions.appendChild(previewBtn);

  const themeBtn = document.createElement('button');
  themeBtn.className = 'dfb-editor-header-btn';
  themeBtn.title = 'Tema';
  themeBtn.innerHTML = '\u{1F3A8}';
  actions.appendChild(themeBtn);

  const sendBtn = document.createElement('button');
  sendBtn.className = 'dfb-editor-btn-send';
  sendBtn.textContent = 'Kirim';
  actions.appendChild(sendBtn);

  header.appendChild(actions);
  containerEl.appendChild(header);

  const tabs = document.createElement('div');
  tabs.className = 'dfb-editor-tabs';

  const qTab = document.createElement('button');
  qTab.className = 'dfb-tab dfb-tab--active';
  qTab.dataset.tab = 'questions';
  qTab.textContent = 'Pertanyaan';
  tabs.appendChild(qTab);

  const rTab = document.createElement('button');
  rTab.className = 'dfb-tab';
  rTab.dataset.tab = 'responses';
  rTab.textContent = 'Respons';
  const rBadge = document.createElement('span');
  rBadge.className = 'dfb-tab-badge';
  rBadge.textContent = '0';
  rTab.appendChild(rBadge);
  tabs.appendChild(rTab);

  const sTab = document.createElement('button');
  sTab.className = 'dfb-tab';
  sTab.dataset.tab = 'settings';
  sTab.textContent = 'Setelan';
  tabs.appendChild(sTab);

  containerEl.appendChild(tabs);

  const body = document.createElement('div');
  body.className = 'dfb-editor-body';

  const main = document.createElement('div');
  main.className = 'dfb-editor-main';

  const contentArea = document.createElement('div');
  contentArea.className = 'dfb-editor-content-area';
  main.appendChild(contentArea);

  body.appendChild(main);
  containerEl.appendChild(body);

  const fabContainer = document.createElement('div');
  fabContainer.className = 'dfb-editor-fab-container';

  const fabBtn = document.createElement('button');
  fabBtn.className = 'dfb-editor-fab-btn';
  fabBtn.innerHTML = '+';
  fabContainer.appendChild(fabBtn);

  const fabPopup = document.createElement('div');
  fabPopup.className = 'dfb-editor-fab-popup';
  fabContainer.appendChild(fabPopup);

  containerEl.appendChild(fabContainer);

  renderQuestionList();
  renderFabPopup(fabPopup);

  fabBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    document.querySelectorAll('.dfb-q-card-dropdown--open').forEach((d) => {
      d.classList.remove('dfb-q-card-dropdown--open');
    });
    fabPopup.classList.toggle('dfb-editor-fab-popup--open');
  });

  document.addEventListener('click', () => {
    fabPopup.classList.remove('dfb-editor-fab-popup--open');
    document.querySelectorAll('.dfb-q-card-dropdown--open').forEach((d) => {
      d.classList.remove('dfb-q-card-dropdown--open');
    });
  });
  fabPopup.addEventListener('click', (e) => e.stopPropagation());
}

function renderQuestionList() {
  const area = getContentArea();
  area.innerHTML = '';
  area.className = 'dfb-editor-content-area';

  const list = document.createElement('div');
  list.className = 'dfb-editor-question-list';
  area.appendChild(list);

  const form = editorState.formDefinition;

  form.questions.forEach((q, i) => {
    const card = QuestionCard.create(q, i + 1, {
      onEdit: () => editorState.setActiveQuestion(q.questionId),
      onDuplicate: () => onDuplicateQuestion(q.questionId),
      onDelete: () => onDeleteQuestion(q.questionId),
      onRequiredToggle: (required) => onToggleRequired(q.questionId, required),
      onSave: () => {
        FormManager.save(editorState.formDefinition);
        markDirty();
      },
    });
    list.appendChild(card);
  });

  const dragHandler = new DragHandler(list, (from, to) => onReorder(from, to));
  dragHandler.attach();
}

function renderFabPopup(popup) {
  const types = [
    { type: QUESTION_TYPES.SHORT_ANSWER, icon: 'Aa' },
    { type: QUESTION_TYPES.PARAGRAPH, icon: '\u00B6' },
    { type: QUESTION_TYPES.MULTIPLE_CHOICE, icon: '\u25C9' },
    { type: QUESTION_TYPES.CHECKBOXES, icon: '\u2611' },
    { type: QUESTION_TYPES.DROPDOWN, icon: '\u25BC' },
    { type: QUESTION_TYPES.LINEAR_SCALE, icon: '\u{1F4CF}' },
    { type: QUESTION_TYPES.DATE, icon: '\u{1F4C5}' },
    { type: QUESTION_TYPES.TIME, icon: '\u23F0' },
    { type: QUESTION_TYPES.MULTIPLE_CHOICE_GRID, icon: '\u229E' },
    { type: QUESTION_TYPES.CHECKBOX_GRID, icon: '\u229F' },
    { type: QUESTION_TYPES.SECTION_HEADER, icon: '\u2500' },
  ];

  types.forEach((item) => {
    const btn = document.createElement('button');
    btn.dataset.type = item.type;

    const iconSpan = document.createElement('span');
    iconSpan.className = 'dfb-editor-fab-popup-icon';
    iconSpan.innerHTML = item.icon;
    btn.appendChild(iconSpan);

    const labelSpan = document.createElement('span');
    labelSpan.textContent = QUESTION_TYPE_LABELS[item.type];
    btn.appendChild(labelSpan);

    btn.addEventListener('click', () => {
      onAddQuestion(item.type);
      popup.classList.remove('dfb-editor-fab-popup--open');
    });
    popup.appendChild(btn);
  });
}

function getContentArea() {
  return containerEl.querySelector('.dfb-editor-content-area');
}

function onAddQuestion(type) {
  editorState.pushUndo();
  FormFactory.addQuestion(editorState.formDefinition, type);
  FormManager.save(editorState.formDefinition);
  renderQuestionList();
  markDirty();
}

function onDuplicateQuestion(questionId) {
  editorState.pushUndo();
  FormFactory.duplicateQuestion(editorState.formDefinition, questionId);
  FormManager.save(editorState.formDefinition);
  renderQuestionList();
  markDirty();
}

function onDeleteQuestion(questionId) {
  editorState.pushUndo();
  FormFactory.removeQuestion(editorState.formDefinition, questionId);
  FormManager.save(editorState.formDefinition);
  renderQuestionList();
  markDirty();
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
}

function onToggleRequired(questionId, required) {
  const q = editorState.formDefinition.questions.find((q) => q.questionId === questionId);
  if (q) {
    q.required = required;
    FormManager.save(editorState.formDefinition);
    markDirty();
  }
}

function showThemeModal() {
  const overlay = document.createElement('div');
  overlay.className = 'dfb-modal-overlay';

  const content = document.createElement('div');
  content.className = 'dfb-modal-content';
  content.style.maxWidth = '400px';

  const closeBtn = document.createElement('button');
  closeBtn.textContent = '\u2716';
  closeBtn.style.cssText = 'float:right;background:none;border:none;font-size:18px;cursor:pointer;color:var(--dfb-text-secondary,#5F6368);';
  closeBtn.addEventListener('click', () => overlay.remove());
  content.appendChild(closeBtn);

  ThemePanel.render(editorState.formDefinition, content);
  overlay.appendChild(content);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });
  document.body.appendChild(overlay);
}

const autoSave = debounce(() => {
  if (editorState.formDefinition) {
    FormManager.save(editorState.formDefinition);
    const status = containerEl.querySelector('.dfb-editor-save-status');
    if (status) status.textContent = 'Disimpan';
  }
}, 30000);

function markDirty() {
  editorState.isDirty = true;
  const status = containerEl.querySelector('.dfb-editor-save-status');
  if (status) status.textContent = 'Menyimpan...';
  autoSave();
}

function attachEvents() {
  const titleInput = containerEl.querySelector('.dfb-editor-title-input');

  titleInput.addEventListener('blur', () => {
    editorState.formDefinition.metadata.title = titleInput.value;
    FormManager.save(editorState.formDefinition);
  });

  containerEl.querySelectorAll('.dfb-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      containerEl.querySelectorAll('.dfb-tab').forEach((t) => t.classList.remove('dfb-tab--active'));
      tab.classList.add('dfb-tab--active');
      const tabName = tab.dataset.tab;
      if (tabName === 'responses') {
        window.location.href = `responses.html?formId=${formId}`;
      } else if (tabName === 'settings') {
        const area = getContentArea();
        area.innerHTML = '';
        area.className = 'dfb-editor-content-area dfb-editor-settings-area';
        SettingsPanel.render(editorState.formDefinition, area);
      } else {
        renderQuestionList();
      }
    });
  });

  applyTheme(editorState.formDefinition.theme);

  containerEl.querySelector('.dfb-btn-back').addEventListener('click', () => {
    window.location.href = 'index.html';
  });

  containerEl.querySelector('.dfb-editor-header-btn[title="Pratinjau"]').addEventListener('click', () => {
    window.open(`form.html?formId=${formId}&preview=true`, '_blank');
  });

  containerEl.querySelector('.dfb-editor-btn-send').addEventListener('click', () => {
    ShareDialog.open(formId);
  });

  containerEl.querySelector('.dfb-editor-header-btn[title="Tema"]').addEventListener('click', () => {
    showThemeModal();
  });

  containerEl.querySelector('.dfb-editor-header-btn[title="Undo (Ctrl+Z)"]').addEventListener('click', () => {
    editorState.undo();
    renderQuestionList();
    FormManager.save(editorState.formDefinition);
  });

  containerEl.querySelector('.dfb-editor-header-btn[title="Redo (Ctrl+Y)"]').addEventListener('click', () => {
    editorState.redo();
    renderQuestionList();
    FormManager.save(editorState.formDefinition);
  });

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      editorState.undo();
      renderQuestionList();
      FormManager.save(editorState.formDefinition);
    }
    if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
      e.preventDefault();
      editorState.redo();
      renderQuestionList();
      FormManager.save(editorState.formDefinition);
    }
  });

  editorState.formDefinition.questions.forEach((q, i) => {
    if (i === 0 && q.type === QUESTION_TYPES.SECTION_HEADER) {
      setTimeout(() => { q.title = q.title || 'Judul Seksi'; }, 0);
    }
  });
}
