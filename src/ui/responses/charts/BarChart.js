/**
 * BarChart — SVG-based horizontal bar chart, zero dependencies.
 */

const COLORS = ['#4285F4', '#EA4335', '#FBBC04', '#34A853', '#FF6D01', '#46BDC6'];

export class BarChart {
  /**
   * @param {Array<{label: string, count: number}>} data
   * @param {number} total
   * @returns {HTMLElement}
   */
  static create(data, total) {
    const container = document.createElement('div');
    container.className = 'dfb-bar-chart';

    const maxCount = Math.max(...data.map((d) => d.count), 1);

    data.forEach((d, i) => {
      const pct = total > 0 ? (d.count / maxCount) * 100 : 0;
      const row = document.createElement('div');
      row.className = 'dfb-bar-row';

      const label = document.createElement('span');
      label.textContent = d.label;
      label.className = 'dfb-bar-label';

      const barContainer = document.createElement('div');
      barContainer.className = 'dfb-bar-track';

      const bar = document.createElement('div');
      bar.className = 'dfb-bar-fill';
      bar.style.cssText = `width:${pct}%;background:${COLORS[i % COLORS.length]};`;

      const countLabel = document.createElement('span');
      countLabel.textContent = `${d.count}`;
      countLabel.className = 'dfb-bar-count';

      if (pct > 15) {
        bar.appendChild(countLabel);
      }
      barContainer.appendChild(bar);

      const countRight = document.createElement('span');
      countRight.textContent = `${d.count}`;
      countRight.className = 'dfb-bar-right';
      if (pct <= 15) {
        countRight.style.display = 'block';
      } else {
        countRight.style.display = 'none';
      }

      row.appendChild(label);
      row.appendChild(barContainer);
      row.appendChild(countRight);
      container.appendChild(row);
    });

    return container;
  }
}
