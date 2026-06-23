export class Toast {
  static show(message, type = 'success', duration = 3000) {
    const el = document.createElement('div');
    el.className = `dfb-toast dfb-toast--${type}`;
    el.textContent = message;
    el.style.background = type === 'error' ? '#D93025' : type === 'warning' ? '#F9AB00' : '#188038';
    document.body.appendChild(el);
    setTimeout(() => {
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 300);
    }, duration);
  }
}
