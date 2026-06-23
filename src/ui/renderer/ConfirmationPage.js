export class ConfirmationPage {
  static create(message, _onAnother) {
    const card = document.createElement('div');
    card.className = 'gf-confirmation-card';

    const iconWrap = document.createElement('div');
    iconWrap.className = 'gf-confirmation-icon';

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '32');
    svg.setAttribute('height', '32');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute(
      'd',
      'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
    );
    path.setAttribute('fill', '#43A047');
    svg.appendChild(path);
    iconWrap.appendChild(svg);

    const title = document.createElement('div');
    title.className = 'gf-confirmation-title';
    title.textContent = 'Jawaban Anda telah tercatat';

    const msg = document.createElement('div');
    msg.className = 'gf-confirmation-msg';
    msg.textContent = message;

    card.appendChild(iconWrap);
    card.appendChild(title);
    card.appendChild(msg);

    return card;
  }
}
