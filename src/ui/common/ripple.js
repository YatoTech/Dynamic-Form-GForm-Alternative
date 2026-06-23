/**
 * Reusable Material 3 Ripple Effect utility.
 * Attaches pointerdown event listener to elements to generate ripple circles dynamically.
 * @param {HTMLElement} element - Target element to add ripple to
 */
export function initRipple(element) {
  if (!element) return;

  // Ensure element has relative or absolute layout positioning
  const style = window.getComputedStyle(element);
  if (style.position === 'static') {
    element.style.position = 'relative';
  }

  element.addEventListener('pointerdown', (e) => {
    // Left click only
    if (e.button !== 0) return;

    let container = element.querySelector('.dfb-ripple-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'dfb-ripple-container';
      container.style.borderRadius = style.borderRadius;
      element.appendChild(container);
    }

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const w = rect.width;
    const h = rect.height;

    // Farthest corner distance
    const dx = Math.max(x, w - x);
    const dy = Math.max(y, h - y);
    const radius = Math.sqrt(dx * dx + dy * dy);

    const ripple = document.createElement('span');
    ripple.className = 'dfb-ripple';
    ripple.style.width = ripple.style.height = `${radius * 2}px`;
    ripple.style.left = `${x - radius}px`;
    ripple.style.top = `${y - radius}px`;

    container.appendChild(ripple);

    ripple.addEventListener('animationend', () => {
      ripple.remove();
    });
  });
}
