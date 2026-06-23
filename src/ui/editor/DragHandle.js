/**
 * DragHandle — mengelola drag-and-drop reordering question list.
 * Menggunakan HTML5 Drag & Drop API + keyboard alternative (Alt+↑/↓).
 */

export class DragHandler {
  #listEl;
  #onReorder;
  #dragSrcIndex = -1;
  #dropIndicator;

  /**
   * @param {HTMLElement} listEl - Elemen container question list
   * @param {(fromIndex: number, toIndex: number) => void} onReorder
   */
  constructor(listEl, onReorder) {
    this.#listEl = listEl;
    this.#onReorder = onReorder;
    this.#createDropIndicator();
  }

  #createDropIndicator() {
    this.#dropIndicator = document.createElement('div');
    this.#dropIndicator.className = 'dfb-drop-indicator';
    this.#dropIndicator.style.cssText =
      'height:3px;background:var(--dfb-primary-color,#4285F4);border-radius:2px;margin:4px 0;display:none;';
    this.#listEl.parentNode.insertBefore(this.#dropIndicator, this.#listEl.nextSibling);
  }

  /** Pasang drag & drop events pada semua card */
  attach() {
    const cards = this.#listEl.querySelectorAll('[data-dfb-question-id]');
    cards.forEach((card, index) => {
      card.draggable = true;
      card.dataset.dfbIndex = String(index);

      card.addEventListener('dragstart', (e) => this.#onDragStart(e, card, index));
      card.addEventListener('dragend', (e) => this.#onDragEnd(e));
      card.addEventListener('dragover', (e) => this.#onDragOver(e, card, index));
      card.addEventListener('dragenter', (e) => this.#onDragEnter(e, card));
      card.addEventListener('dragleave', (e) => this.#onDragLeave(e, card));
      card.addEventListener('drop', (e) => this.#onDrop(e, card, index));

      card.addEventListener('keydown', (e) => this.#onKeyDown(e, card, index));
    });
  }

  #onDragStart(e, card, index) {
    this.#dragSrcIndex = index;
    card.classList.add('dfb-dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  }

  #onDragEnd(_e) {
    this.#listEl.querySelectorAll('[data-dfb-question-id]').forEach((c) => {
      c.classList.remove('dfb-dragging');
      c.classList.remove('dfb-drag-over');
    });
    this.#dropIndicator.style.display = 'none';
    this.#dragSrcIndex = -1;
  }

  #onDragOver(e, card, _index) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const rect = card.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const showBefore = e.clientY < midY;
    this.#showDropIndicator(card, showBefore);
  }

  #onDragEnter(e, card) {
    e.preventDefault();
    card.classList.add('dfb-drag-over');
  }

  #onDragLeave(e, card) {
    card.classList.remove('dfb-drag-over');
  }

  #onDrop(e, _card, index) {
    e.preventDefault();
    this.#listEl.querySelectorAll('[data-dfb-question-id]').forEach((c) => {
      c.classList.remove('dfb-dragging');
      c.classList.remove('dfb-drag-over');
    });
    this.#dropIndicator.style.display = 'none';

    const from = this.#dragSrcIndex;
    if (from === -1 || from === index) return;
    this.#onReorder(from, index);
  }

  #showDropIndicator(card, before) {
    this.#dropIndicator.style.display = 'block';
    if (before) {
      card.parentNode.insertBefore(this.#dropIndicator, card);
    } else {
      card.parentNode.insertBefore(this.#dropIndicator, card.nextSibling);
    }
  }

  #onKeyDown(e, card, index) {
    if (e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
      e.preventDefault();
      const targetIndex = e.key === 'ArrowUp' ? index - 1 : index + 1;
      const cards = this.#listEl.querySelectorAll('[data-dfb-question-id]');
      if (targetIndex < 0 || targetIndex >= cards.length) return;
      this.#onReorder(index, targetIndex);
    }
  }
}
