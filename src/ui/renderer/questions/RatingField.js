export class RatingField {
  static create(question, value = '', isError = false) {
    const container = document.createElement('div');
    container.className = 'dfb-rating-container';
    container.style.cssText = 'display:flex; gap:8px; align-items:center; margin-top:8px;';

    const maxStars = question.options?.maxStars ?? 5;
    const selectedVal = value ? Number(value) : 0;

    const starsWrapper = document.createElement('div');
    starsWrapper.style.cssText =
      'display:flex; gap:6px; font-size:28px; cursor:pointer; color:#DADCE0; user-select:none;';
    if (isError) {
      starsWrapper.style.outline = '1px dashed #c5221f';
      starsWrapper.style.outlineOffset = '4px';
    }
    if (question.disabled) {
      starsWrapper.style.cursor = 'default';
    }

    const starElements = [];

    // Hidden input to hold value for form submission
    const hiddenInput = document.createElement('input');
    hiddenInput.type = 'hidden';
    hiddenInput.className = 'gf-input-rating';
    hiddenInput.value = value;
    container.appendChild(hiddenInput);

    const updateStars = (rating) => {
      starElements.forEach((star, index) => {
        if (index < rating) {
          star.innerHTML = '&#9733;'; // Unicode Filled Star
          star.style.color = '#FFB900';
        } else {
          star.innerHTML = '&#9734;'; // Unicode Empty Star
          star.style.color = '#DADCE0';
        }
      });
    };

    for (let i = 0; i < maxStars; i++) {
      const star = document.createElement('span');
      star.innerHTML = '&#9734;';
      star.style.transition = 'color 150ms ease';
      starsWrapper.appendChild(star);
      starElements.push(star);

      if (!question.disabled) {
        star.addEventListener('mouseenter', () => {
          updateStars(i + 1);
        });

        star.addEventListener('mouseleave', () => {
          updateStars(hiddenInput.value ? Number(hiddenInput.value) : 0);
        });

        star.addEventListener('click', () => {
          hiddenInput.value = String(i + 1);
          updateStars(i + 1);
          const changeEvent = new Event('change', { bubbles: true });
          hiddenInput.dispatchEvent(changeEvent);
        });
      }
    }

    updateStars(selectedVal);
    container.appendChild(starsWrapper);

    return container;
  }
}
