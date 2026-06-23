export class Modal {
  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'dfb-modal-overlay';
    this.element.style.display = 'none';
    this.element.addEventListener('click', (e) => {
      if (e.target === this.element) this.close();
    });
    this.content = document.createElement('div');
    this.content.className = 'dfb-modal-content';
    this.element.appendChild(this.content);
    document.body.appendChild(this.element);
  }

  setBody(element) {
    this.content.textContent = '';
    this.content.appendChild(element);
  }

  open() {
    this.element.style.display = 'flex';
  }

  close() {
    this.element.style.display = 'none';
  }

  destroy() {
    this.element.remove();
  }
}
