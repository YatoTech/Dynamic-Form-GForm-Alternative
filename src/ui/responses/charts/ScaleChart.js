/**
 * ScaleChart — distribusi skala linear (bar chart vertikal).
 */

const COLORS = ['#4285F4', '#4285F4', '#4285F4', '#4285F4', '#4285F4', '#FBBC04', '#FBBC04', '#EA4335', '#EA4335', '#EA4335'];

export class ScaleChart {
  /**
   * @param {Array<{label: string, count: number}>} data
   * @param {number} total
   * @returns {HTMLElement}
   */
  static create(data, total) {
    const container = document.createElement('div');
    container.className = 'dfb-scale-chart';

    const maxCount = Math.max(...data.map((d) => d.count), 1);
    const barWidth = 48;

    let avg = 0;
    let weightedSum = 0;
    data.forEach((d) => {
      const val = parseFloat(d.label) || 0;
      weightedSum += val * d.count;
    });
    avg = total > 0 ? weightedSum / total : 0;

    data.forEach((d) => {
      const height = maxCount > 0 ? (d.count / maxCount) * 120 : 0;
      const col = document.createElement('div');
      col.className = 'dfb-scale-col';

      const countLabel = document.createElement('span');
      countLabel.textContent = d.count;
      countLabel.className = 'dfb-scale-count';

      const bar = document.createElement('div');
      const idx = parseInt(d.label) - 1;
      bar.className = 'dfb-scale-bar';
      bar.style.cssText = `width:${barWidth}px;height:${Math.max(height, 2)}px;background:${COLORS[idx >= 0 && idx < COLORS.length ? idx : 0]};`;

      const label = document.createElement('span');
      label.textContent = d.label;
      label.className = 'dfb-scale-value';

      col.appendChild(countLabel);
      col.appendChild(bar);
      col.appendChild(label);
      container.appendChild(col);
    });

    const avgEl = document.createElement('div');
    avgEl.className = 'dfb-scale-average';
    const strong = document.createElement('strong');
    strong.textContent = avg.toFixed(1);
    avgEl.append('Rata-rata: ', strong, ` dari ${total} respons`);
    container.parentNode?.appendChild(avgEl);

    return container;
  }
}
