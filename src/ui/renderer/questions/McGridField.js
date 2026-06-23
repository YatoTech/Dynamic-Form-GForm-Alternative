export class McGridField {
  static create(question, value = {}) {
    const wrapper = document.createElement('div');
    wrapper.className = 'gf-grid-wrap';

    const rows = question.options?.rows || ['Baris 1'];
    const cols = question.options?.columns || ['Kolom 1', 'Kolom 2'];

    const table = document.createElement('table');
    table.className = 'gf-grid-table';

    const thead = document.createElement('thead');
    const headerTr = document.createElement('tr');

    const thEmpty = document.createElement('th');
    thEmpty.className = 'gf-grid-th-empty';
    headerTr.appendChild(thEmpty);

    cols.forEach((c) => {
      const th = document.createElement('th');
      th.className = 'gf-grid-th';
      th.textContent = c;
      headerTr.appendChild(th);
    });

    thead.appendChild(headerTr);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    rows.forEach((r, ri) => {
      const tr = document.createElement('tr');
      tr.className = 'gf-grid-row' + (ri % 2 === 1 ? ' gf-grid-row--alt' : '');

      const tdLabel = document.createElement('td');
      tdLabel.className = 'gf-grid-row-label';
      tdLabel.textContent = r;
      tr.appendChild(tdLabel);

      cols.forEach((c) => {
        const td = document.createElement('td');
        td.className = 'gf-grid-cell';

        const input = document.createElement('input');
        input.type = 'radio';
        input.className = 'gf-grid-radio-input';
        input.name = `q-${question.questionId}_r${ri}`;
        input.value = c;
        const currentVal = value[String(ri)];
        if (currentVal === c) input.checked = true;

        const visual = document.createElement('div');
        visual.className = 'gf-grid-radio-visual';

        td.appendChild(input);
        td.appendChild(visual);
        tr.appendChild(td);

        td.addEventListener('click', () => {
          const name = input.name;
          const allInputs = wrapper.querySelectorAll(`input[name="${name}"]`);
          allInputs.forEach((inp) => {
            inp.checked = false;
          });
          input.checked = true;
        });
      });

      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    wrapper.appendChild(table);

    return wrapper;
  }
}
