import { QUESTION_TYPES, QUESTION_TYPE_LABELS } from '../../core/form/QuestionTypes.js';

export class QuestionTypeSelector {
  static create(currentType, onChange) {
    const container = document.createElement('div');
    container.className = 'dfb-type-selector';

    // The trigger button
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'dfb-type-selector-trigger';
    
    const iconSpan = document.createElement('span');
    iconSpan.className = 'dfb-type-selector-icon';
    iconSpan.innerHTML = this.getIconForType(currentType);
    
    const textSpan = document.createElement('span');
    textSpan.className = 'dfb-type-selector-text';
    textSpan.textContent = QUESTION_TYPE_LABELS[currentType] || currentType;

    const caretSpan = document.createElement('span');
    caretSpan.className = 'dfb-type-selector-caret';
    caretSpan.innerHTML = `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>`;

    trigger.appendChild(iconSpan);
    trigger.appendChild(textSpan);
    trigger.appendChild(caretSpan);

    container.appendChild(trigger);

    // The dropdown menu
    const dropdown = document.createElement('div');
    dropdown.className = 'dfb-type-selector-dropdown';
    dropdown.style.display = 'none';

    // Group 1: Text
    dropdown.appendChild(this.createGroup([
      QUESTION_TYPES.SHORT_ANSWER,
      QUESTION_TYPES.PARAGRAPH
    ], currentType, onChange, dropdown, trigger, iconSpan, textSpan));

    dropdown.appendChild(this.createDivider());

    // Group 2: Choices
    dropdown.appendChild(this.createGroup([
      QUESTION_TYPES.MULTIPLE_CHOICE,
      QUESTION_TYPES.CHECKBOXES,
      QUESTION_TYPES.DROPDOWN
    ], currentType, onChange, dropdown, trigger, iconSpan, textSpan));

    dropdown.appendChild(this.createDivider());

    // Group 3: Upload
    dropdown.appendChild(this.createGroup([
      QUESTION_TYPES.FILE_UPLOAD
    ], currentType, onChange, dropdown, trigger, iconSpan, textSpan));

    dropdown.appendChild(this.createDivider());

    // Group 4: Scale/Grid
    dropdown.appendChild(this.createGroup([
      QUESTION_TYPES.LINEAR_SCALE,
      QUESTION_TYPES.MULTIPLE_CHOICE_GRID,
      QUESTION_TYPES.CHECKBOX_GRID
    ], currentType, onChange, dropdown, trigger, iconSpan, textSpan));

    dropdown.appendChild(this.createDivider());

    // Group 5: Time
    dropdown.appendChild(this.createGroup([
      QUESTION_TYPES.DATE,
      QUESTION_TYPES.TIME
    ], currentType, onChange, dropdown, trigger, iconSpan, textSpan));

    container.appendChild(dropdown);

    // Toggle logic
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isShowing = dropdown.style.display === 'block';
      document.querySelectorAll('.dfb-type-selector-dropdown').forEach(d => d.style.display = 'none');
      if (!isShowing) {
        dropdown.style.display = 'block';
      }
    });

    document.addEventListener('click', (e) => {
      if (!container.contains(e.target)) {
        dropdown.style.display = 'none';
      }
    });

    return container;
  }

  static createGroup(types, currentType, onChange, dropdown, trigger, iconSpan, textSpan) {
    const group = document.createElement('div');
    group.className = 'dfb-type-selector-group';
    
    types.forEach(t => {
      const item = document.createElement('div');
      item.className = 'dfb-type-selector-item' + (currentType === t ? ' dfb-type-selector-item--active' : '');
      item.dataset.value = t;

      const itemIcon = document.createElement('span');
      itemIcon.className = 'dfb-type-selector-item-icon';
      itemIcon.innerHTML = this.getIconForType(t);

      const itemText = document.createElement('span');
      itemText.className = 'dfb-type-selector-item-text';
      itemText.textContent = QUESTION_TYPE_LABELS[t];

      item.appendChild(itemIcon);
      item.appendChild(itemText);

      item.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.style.display = 'none';
        
        // Update selection UI
        dropdown.querySelectorAll('.dfb-type-selector-item').forEach(el => el.classList.remove('dfb-type-selector-item--active'));
        item.classList.add('dfb-type-selector-item--active');
        iconSpan.innerHTML = this.getIconForType(t);
        textSpan.textContent = QUESTION_TYPE_LABELS[t];

        if (currentType !== t) {
          onChange(t);
          currentType = t;
        }
      });

      group.appendChild(item);
    });

    return group;
  }

  static createDivider() {
    const d = document.createElement('div');
    d.className = 'dfb-type-selector-divider';
    return d;
  }

  static getIconForType(type) {
    // Return appropriate SVG for each type mimicking Google Forms
    switch(type) {
      case QUESTION_TYPES.SHORT_ANSWER:
        return `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M21 4H3v2h18V4zm-6 4H3v2h12V8z"/></svg>`;
      case QUESTION_TYPES.PARAGRAPH:
        return `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M21 4H3v2h18V4zm0 4H3v2h18V8zm-6 4H3v2h12v-2z"/></svg>`;
      case QUESTION_TYPES.MULTIPLE_CHOICE:
        return `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/><circle cx="12" cy="12" r="5"/></svg>`;
      case QUESTION_TYPES.CHECKBOXES:
        return `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM17.99 9l-1.41-1.42-6.59 6.59-2.58-2.57-1.42 1.41 4 3.99z"/></svg>`;
      case QUESTION_TYPES.DROPDOWN:
        return `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/><path d="M7 10l5 5 5-5H7z"/></svg>`;
      case QUESTION_TYPES.FILE_UPLOAD:
        return `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/></svg>`;
      case QUESTION_TYPES.LINEAR_SCALE:
        return `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M21 6H3v2h18V6zm0 4H3v2h18v-2zm0 4H3v2h18v-2z"/><circle cx="8" cy="11" r="3"/></svg>`;
      case QUESTION_TYPES.MULTIPLE_CHOICE_GRID:
        return `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M4 4h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 10h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 16h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4z"/></svg>`;
      case QUESTION_TYPES.CHECKBOX_GRID:
        return `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M3 3v18h18V3H3zm16 16H5V5h14v14z"/><path d="M18 7h-4v4h4V7zm-6 0H8v4h4V7zM18 13h-4v4h4v-4zm-6 0H8v4h4v-4z"/></svg>`;
      case QUESTION_TYPES.DATE:
        return `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/></svg>`;
      case QUESTION_TYPES.TIME:
        return `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>`;
      default:
        return `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><circle cx="12" cy="12" r="5"/></svg>`;
    }
  }
}
