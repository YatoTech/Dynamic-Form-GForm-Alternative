/**
 * PieChart — SVG-based pie chart, zero dependencies.
 */

const COLORS = [
  '#4285F4',
  '#EA4335',
  '#FBBC04',
  '#34A853',
  '#FF6D01',
  '#46BDC6',
  '#AB47BC',
  '#7B1FA2',
];

export class PieChart {
  /**
   * @param {Array<{label: string, count: number}>} data
   * @param {number} total
   * @returns {HTMLElement}
   */
  static create(data, total) {
    const container = document.createElement('div');
    container.className = 'dfb-chart-container';

    const svgSize = 160;
    const cx = svgSize / 2;
    const cy = svgSize / 2;
    const r = 70;

    let cumulative = 0;
    const slices = data.map((d, i) => {
      const pct = total > 0 ? d.count / total : 0;
      const angle = pct * 360;
      const startAngle = cumulative;
      cumulative += angle;
      return {
        label: d.label,
        count: d.count,
        pct,
        startAngle,
        angle,
        color: COLORS[i % COLORS.length],
      };
    });

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', svgSize);
    svg.setAttribute('height', svgSize);
    svg.setAttribute('viewBox', `0 0 ${svgSize} ${svgSize}`);

    slices.forEach((s) => {
      if (s.angle <= 0) return;
      const startRad = ((s.startAngle - 90) * Math.PI) / 180;
      const endRad = ((s.startAngle + s.angle - 90) * Math.PI) / 180;
      const x1 = cx + r * Math.cos(startRad);
      const y1 = cy + r * Math.sin(startRad);
      const x2 = cx + r * Math.cos(endRad);
      const y2 = cy + r * Math.sin(endRad);
      const largeArc = s.angle > 180 ? 1 : 0;
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largeArc},1 ${x2},${y2} Z`);
      path.setAttribute('fill', s.color);
      path.setAttribute('stroke', '#fff');
      path.setAttribute('stroke-width', '2');
      svg.appendChild(path);
    });

    const innerCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    innerCircle.setAttribute('cx', cx);
    innerCircle.setAttribute('cy', cy);
    innerCircle.setAttribute('r', r * 0.5);
    innerCircle.setAttribute('fill', '#fff');
    svg.appendChild(innerCircle);

    const textTotal = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    textTotal.setAttribute('x', cx);
    textTotal.setAttribute('y', cy - 4);
    textTotal.setAttribute('text-anchor', 'middle');
    textTotal.setAttribute('font-size', '20');
    textTotal.setAttribute('font-weight', 'bold');
    textTotal.setAttribute('fill', '#202124');
    textTotal.textContent = total;
    svg.appendChild(textTotal);

    const textLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    textLabel.setAttribute('x', cx);
    textLabel.setAttribute('y', cy + 14);
    textLabel.setAttribute('text-anchor', 'middle');
    textLabel.setAttribute('font-size', '11');
    textLabel.setAttribute('fill', '#5F6368');
    textLabel.textContent = 'total';
    svg.appendChild(textLabel);

    container.appendChild(svg);

    const legend = document.createElement('div');
    legend.className = 'dfb-chart-legend';
    slices.forEach((s) => {
      const pctText = total > 0 ? ` (${Math.round(s.pct * 100)}%)` : '';
      const item = document.createElement('div');
      item.className = 'dfb-chart-legend-item';

      const colorSpan = document.createElement('span');
      colorSpan.className = 'dfb-chart-legend-color';
      colorSpan.style.background = s.color;

      const labelSpan = document.createElement('span');
      labelSpan.textContent = `${s.label}${pctText}`;

      const countSpan = document.createElement('span');
      countSpan.style.cssText = 'color:var(--dfb-text-secondary,#5F6368);';
      countSpan.textContent = s.count;

      item.appendChild(colorSpan);
      item.appendChild(labelSpan);
      item.appendChild(countSpan);
      legend.appendChild(item);
    });
    container.appendChild(legend);

    return container;
  }
}
