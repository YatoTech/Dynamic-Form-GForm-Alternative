import { PieChart } from './charts/PieChart.js';
import { BarChart } from './charts/BarChart.js';
import { ScaleChart } from './charts/ScaleChart.js';
import { QUESTION_TYPES } from '../../core/form/QuestionTypes.js';

export class SummaryView {
  /**
   * @param {Array} responses
   * @param {Array<{questionId: string, title: string, type: string, options: Object}>} questions
   * @returns {HTMLElement}
   */
  static create(responses, questions) {
    const container = document.createElement('div');
    container.className = 'dfb-summary-view';

    const total = responses.length;
    const lastDate = responses.length > 0
      ? responses.reduce((latest, r) => r.submittedAt > latest ? r.submittedAt : latest, responses[0].submittedAt)
      : null;

    const statsBar = document.createElement('div');
    statsBar.className = 'dfb-summary-stats';

    const statCard1 = document.createElement('div');
    statCard1.className = 'dfb-summary-stat-card';
    const statValue1 = document.createElement('div');
    statValue1.className = 'dfb-summary-stat-value';
    statValue1.textContent = total;
    const statLabel1 = document.createElement('div');
    statLabel1.className = 'dfb-summary-stat-label';
    statLabel1.textContent = 'Total Respons';
    statCard1.appendChild(statValue1);
    statCard1.appendChild(statLabel1);

    const statCard2 = document.createElement('div');
    statCard2.className = 'dfb-summary-stat-card';
    const statValue2 = document.createElement('div');
    statValue2.className = 'dfb-summary-stat-value';
    statValue2.style.fontSize = '14px';
    statValue2.textContent = lastDate ? new Date(lastDate).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';
    const statLabel2 = document.createElement('div');
    statLabel2.className = 'dfb-summary-stat-label';
    statLabel2.textContent = 'Respons Terakhir';
    statCard2.appendChild(statValue2);
    statCard2.appendChild(statLabel2);

    statsBar.appendChild(statCard1);
    statsBar.appendChild(statCard2);
    container.appendChild(statsBar);

    if (total === 0) {
      const empty = document.createElement('div');
      empty.style.cssText = 'text-align:center;padding:48px 24px;color:var(--dfb-text-secondary,#5F6368);';
      const emptyIcon = document.createElement('div');
      emptyIcon.style.cssText = 'font-size:48px;margin-bottom:16px;';
      emptyIcon.textContent = '\uD83D\uDCCA';
      empty.appendChild(emptyIcon);
      const emptyTitle = document.createElement('p');
      emptyTitle.style.cssText = 'font-size:16px;font-weight:500;margin-bottom:4px;';
      emptyTitle.textContent = 'Belum ada respons';
      empty.appendChild(emptyTitle);
      const emptyDesc = document.createElement('p');
      emptyDesc.style.cssText = 'font-size:13px;';
      emptyDesc.textContent = 'Bagikan formulir ini untuk mulai mengumpulkan respons.';
      empty.appendChild(emptyDesc);
      container.appendChild(empty);
      return container;
    }

    const activeQuestions = questions.filter((q) => q.type !== 'section_header');

    activeQuestions.forEach((q) => {
      const card = document.createElement('div');
      card.className = 'dfb-summary-card';

      const h3 = document.createElement('h3');
      h3.textContent = q.title || 'Pertanyaan';
      card.appendChild(h3);

      const chartContainer = document.createElement('div');
      const distribution = calculateDistribution(q, responses);

      if (distribution.length === 0) {
        const emptyP = document.createElement('p');
        emptyP.className = 'dfb-summary-empty';
        emptyP.textContent = 'Belum ada respons untuk pertanyaan ini.';
        chartContainer.appendChild(emptyP);
      } else if (q.type === QUESTION_TYPES.MULTIPLE_CHOICE_GRID || q.type === QUESTION_TYPES.CHECKBOX_GRID) {
        chartContainer.appendChild(renderGridSummary(q, responses));
      } else if (q.type === QUESTION_TYPES.LINEAR_SCALE) {
        chartContainer.appendChild(ScaleChart.create(distribution, total));
      } else if (
        q.type === QUESTION_TYPES.MULTIPLE_CHOICE ||
        q.type === QUESTION_TYPES.CHECKBOXES ||
        q.type === QUESTION_TYPES.DROPDOWN
      ) {
        if (distribution.length <= 6) {
          chartContainer.appendChild(PieChart.create(distribution, total));
        } else {
          chartContainer.appendChild(BarChart.create(distribution, total));
        }
      } else {
        const list = document.createElement('div');
        list.className = 'dfb-summary-choice-list';
        distribution.forEach((d) => {
          const item = document.createElement('div');
          item.className = 'dfb-summary-choice-item';
          item.textContent = d.label;
          list.appendChild(item);
        });
        chartContainer.appendChild(list);
      }

      card.appendChild(chartContainer);
      container.appendChild(card);
    });

    return container;
  }
}

function renderGridSummary(question, responses) {
  const rows = question.options?.rows || [];
  const cols = question.options?.columns || [];
  const isMc = question.type === 'mc_grid';

  const freq = {};
  rows.forEach((_, ri) => { freq[ri] = {}; });
  responses.forEach((r) => {
    const answer = (r.answers || []).find((a) => a.questionId === question.questionId);
    if (!answer || !answer.value || typeof answer.value !== 'object') return;
    Object.entries(answer.value).forEach(([ri, val]) => {
      if (!freq[ri]) return;
      if (isMc) {
        freq[ri][val] = (freq[ri][val] || 0) + 1;
      } else if (Array.isArray(val)) {
        val.forEach((v) => { freq[ri][v] = (freq[ri][v] || 0) + 1; });
      }
    });
  });

  const table = document.createElement('table');
  table.className = 'dfb-grid-heatmap';

  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');

  const thCorner = document.createElement('th');
  thCorner.style.cssText = 'text-align:left;padding:8px;color:var(--dfb-text-secondary,#5F6368);font-weight:500;';
  headerRow.appendChild(thCorner);

  cols.forEach((c) => {
    const th = document.createElement('th');
    th.style.cssText = 'text-align:center;padding:8px;color:var(--dfb-text-secondary,#5F6368);font-weight:500;';
    th.textContent = c;
    headerRow.appendChild(th);
  });

  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');

  const maxFreq = Math.max(
    1,
    ...Object.values(freq).flatMap((row) => Object.values(row)),
  );

  rows.forEach((r, ri) => {
    const tr = document.createElement('tr');

    const tdLabel = document.createElement('td');
    tdLabel.style.cssText = 'padding:8px;color:var(--dfb-text-primary,#202124);border-top:1px solid var(--dfb-border-color,#DADCE0);';
    tdLabel.textContent = r;
    tr.appendChild(tdLabel);

    cols.forEach((c) => {
      const count = freq[ri]?.[c] || 0;
      const intensity = count / maxFreq;
      const bg = count > 0 ? `rgba(66,133,244,${0.08 + intensity * 0.25})` : 'transparent';
      const td = document.createElement('td');
      td.style.cssText = `text-align:center;padding:10px 8px;border-top:1px solid var(--dfb-border-color,#DADCE0);background:${bg};font-weight:${count > 0 ? '500' : 'normal'};color:var(--dfb-text-primary,#202124);`;
      td.textContent = count;
      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  return table;
}

function calculateDistribution(question, responses) {
  const counts = new Map();

  responses.forEach((r) => {
    const answer = (r.answers || []).find((a) => a.questionId === question.questionId);
    if (!answer) return;

    const values = Array.isArray(answer.value) ? answer.value : [answer.value];
    values.forEach((v) => {
      if (v == null || v === '') return;
      counts.set(v, (counts.get(v) || 0) + 1);
    });
  });

  const sorted = [...counts.entries()]
    .map(([label, count]) => ({ label: String(label), count }))
    .sort((a, b) => b.count - a.count);

  return sorted;
}
