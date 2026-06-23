import { FormManager } from '../../core/form/FormManager.js';
import { LocalStorageAdapter } from '../../core/storage/LocalStorageAdapter.js';
import { ResponseState } from '../../core/state/ResponseState.js';
import { SummaryView } from './SummaryView.js';
import { QuestionView } from './QuestionView.js';
import { IndividualView } from './IndividualView.js';
import { exportToCsv, exportToJson } from '../../core/engine/ExportEngine.js';
import { FileDownloader } from '../common/FileDownloader.js';

const storage = new LocalStorageAdapter();
const responseState = new ResponseState();

export function render(container) {
  container.innerHTML = '';
  container.className = 'dfb-responses';

  const params = new URLSearchParams(window.location.search);
  const formId = params.get('formId');

  if (!formId) {
    const p = document.createElement('p');
    p.style.cssText = 'padding:24px;color:var(--dfb-error-color,#D93025);';
    p.textContent = 'Form ID tidak ditemukan';
    container.appendChild(p);
    return;
  }

  const form = FormManager.load(formId);
  if (!form) {
    const p = document.createElement('p');
    p.style.cssText = 'padding:24px;color:var(--dfb-error-color,#D93025);';
    p.textContent = 'Form tidak ditemukan';
    container.appendChild(p);
    return;
  }

  responseState.loadFromStorage(storage);
  let filtered = responseState.getFiltered();
  let headerCountEl = null;
  let currentView = 'summary';

  /* ── Purple Header ── */
  const header = document.createElement('div');
  header.className = 'dfb-response-header';

  const headerLeft = document.createElement('div');
  headerLeft.className = 'dfb-response-header-left';

  const backBtn = document.createElement('button');
  backBtn.className = 'dfb-response-btn-back';
  backBtn.innerHTML = '\u2190';
  backBtn.title = 'Kembali ke Editor';
  headerLeft.appendChild(backBtn);

  const titleEl = document.createElement('h2');
  titleEl.className = 'dfb-response-header-title';
  titleEl.textContent = form.metadata.title;
  headerLeft.appendChild(titleEl);

  const countEl = document.createElement('span');
  countEl.className = 'dfb-response-header-count';
  countEl.textContent = `${responseState.totalResponses} respons`;
  headerLeft.appendChild(countEl);

  header.appendChild(headerLeft);

  const headerRight = document.createElement('div');
  headerRight.className = 'dfb-response-header-actions';

  const csvBtn = document.createElement('button');
  csvBtn.className = 'dfb-btn-export';
  csvBtn.textContent = 'CSV';
  headerRight.appendChild(csvBtn);

  const jsonBtn = document.createElement('button');
  jsonBtn.className = 'dfb-btn-export';
  jsonBtn.textContent = 'JSON';
  headerRight.appendChild(jsonBtn);

  header.appendChild(headerRight);
  container.appendChild(header);

  headerCountEl = countEl;

  /* ── Tabs: Ringkasan | Pertanyaan | Individu ── */
  const tabs = document.createElement('div');
  tabs.className = 'dfb-response-tabs';

  const summaryTab = document.createElement('button');
  summaryTab.className = 'dfb-tab dfb-tab--active';
  summaryTab.dataset.view = 'summary';
  summaryTab.textContent = 'Ringkasan';

  const questionTab = document.createElement('button');
  questionTab.className = 'dfb-tab';
  questionTab.dataset.view = 'question';
  questionTab.textContent = 'Pertanyaan';

  const individualTab = document.createElement('button');
  individualTab.className = 'dfb-tab';
  individualTab.dataset.view = 'individual';
  individualTab.textContent = 'Individual';

  tabs.appendChild(summaryTab);
  tabs.appendChild(questionTab);
  tabs.appendChild(individualTab);
  container.appendChild(tabs);

  /* ── Content Area ── */
  const content = document.createElement('div');
  content.className = 'dfb-response-content';
  container.appendChild(content);

  function renderView() {
    content.innerHTML = '';
    if (currentView === 'summary') {
      content.appendChild(SummaryView.create(filtered, form.questions));
    } else if (currentView === 'question') {
      content.appendChild(QuestionView.create(filtered, form.questions));
    } else {
      content.appendChild(
        IndividualView.create(filtered, responseState.currentIndex, form.questions, (idx) => {
          responseState.setCurrentIndex(idx);
          renderView();
        }, () => {
          const confirmed = confirm('Hapus respons ini?');
          if (!confirmed) return;
          const res = filtered[responseState.currentIndex];
          if (res && res.responseId) {
            responseState.removeResponse(res.responseId);
            responseState.saveToStorage(storage);
            filtered = responseState.getFiltered();
            if (responseState.currentIndex >= filtered.length) {
              responseState.setCurrentIndex(Math.max(0, filtered.length - 1));
            }
            if (headerCountEl) headerCountEl.textContent = `${responseState.totalResponses} respons`;
            renderView();
          }
        }),
      );
    }
  }

  tabs.querySelectorAll('.dfb-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.querySelectorAll('.dfb-tab').forEach((t) => t.classList.remove('dfb-tab--active'));
      tab.classList.add('dfb-tab--active');
      currentView = tab.dataset.view;
      renderView();
    });
  });

  backBtn.addEventListener('click', () => {
    window.location.href = `editor.html?formId=${formId}`;
  });

  csvBtn.addEventListener('click', () => {
    const csv = exportToCsv(filtered, form.questions);
    FileDownloader.download(csv, `${form.metadata.title || 'form'}-respons.csv`, 'text/csv;charset=utf-8');
  });

  jsonBtn.addEventListener('click', () => {
    const json = exportToJson(filtered);
    FileDownloader.download(json, form.metadata.title + '-respons.json', 'application/json');
  });

  renderView();
}

