export class ProgressBar {
  static create(current, total) {
    if (total <= 1) {
      const el = document.createElement('div');
      el.style.display = 'none';
      return el;
    }

    const pct = Math.round(((current + 1) / total) * 100);
    const pctLabel = total === 1 ? '' : `${pct}%`;

    const container = document.createElement('div');
    container.className = 'gf-progress-bar';

    const fill = document.createElement('div');
    fill.className = 'gf-progress-fill';
    fill.style.width = `${pct}%`;
    container.appendChild(fill);

    const label = document.createElement('div');
    label.className = 'gf-progress-label';
    const sectionSpan = document.createElement('span');
    sectionSpan.textContent = `Seksi ${current + 1} dari ${total}`;
    label.appendChild(sectionSpan);

    const pctSpan = document.createElement('span');
    pctSpan.textContent = pctLabel;
    label.appendChild(pctSpan);

    const wrap = document.createElement('div');
    wrap.className = 'gf-progress-wrap';
    wrap.appendChild(container);
    wrap.appendChild(label);

    return wrap;
  }
}
