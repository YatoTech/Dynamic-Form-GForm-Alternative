import { Modal } from './Modal.js';

export class ConfirmDialog {
  static confirm(message, confirmText = 'Hapus', cancelText = 'Batal') {
    return new Promise((resolve) => {
      const modal = new Modal();

      const dialog = document.createElement('div');
      dialog.className = 'dfb-confirm-dialog';

      const p = document.createElement('p');
      p.textContent = message;
      dialog.appendChild(p);

      const actions = document.createElement('div');
      actions.className = 'dfb-confirm-actions';

      const cancelBtn = document.createElement('button');
      cancelBtn.className = 'dfb-btn dfb-btn--ghost';
      cancelBtn.textContent = cancelText;
      cancelBtn.addEventListener('click', () => {
        modal.close();
        resolve(false);
      });
      actions.appendChild(cancelBtn);

      const confirmBtn = document.createElement('button');
      confirmBtn.className = 'dfb-btn dfb-btn--primary';
      confirmBtn.style.background = '#D93025';
      confirmBtn.textContent = confirmText;
      confirmBtn.addEventListener('click', () => {
        modal.close();
        resolve(true);
      });
      actions.appendChild(confirmBtn);

      dialog.appendChild(actions);
      modal.setBody(dialog);
      modal.open();
    });
  }
}
