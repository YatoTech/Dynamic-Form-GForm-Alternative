import { ColorPicker } from './ColorPicker.js';
import { FontSelector } from './FontSelector.js';
import { applyTheme, PRESET_THEMES } from '../../core/engine/ThemeEngine.js';
import { FormManager } from '../../core/form/FormManager.js';
import { eventBus } from '../../core/utils/eventBus.js';

export class ThemePanel {
  static render(form, container) {
    container.textContent = '';
    container.className = 'dfb-theme-panel';

    const title = document.createElement('h3');
    title.textContent = 'Kustomisasi Tema';
    title.className = 'dfb-theme-title';
    container.appendChild(title);

    const section = document.createElement('div');
    section.className = 'dfb-theme-section';

    const sectionTitle = document.createElement('p');
    sectionTitle.textContent = 'PRESET TEMA';
    sectionTitle.className = 'dfb-theme-section-title';
    section.appendChild(sectionTitle);

    const presetGrid = document.createElement('div');
    presetGrid.className = 'dfb-theme-preset-grid';

    PRESET_THEMES.forEach((preset) => {
      const btn = document.createElement('button');
      btn.className = 'dfb-theme-preset-btn';

      const swatch = document.createElement('div');
      swatch.className = 'dfb-theme-preset-swatch';
      swatch.style.background = preset.backgroundColor;
      swatch.style.borderColor = preset.primaryColor;
      btn.appendChild(swatch);

      const nameSpan = document.createElement('span');
      nameSpan.className = 'dfb-theme-preset-name';
      nameSpan.textContent = preset.name;
      btn.appendChild(nameSpan);

      if (
        form.theme.primaryColor === preset.primaryColor &&
        form.theme.backgroundColor === preset.backgroundColor
      ) {
        btn.classList.add('dfb-theme-preset-btn--active');
      }
      btn.addEventListener('click', () => {
        form.theme.primaryColor = preset.primaryColor;
        form.theme.backgroundColor = preset.backgroundColor;
        applyTheme(form.theme);
        FormManager.save(form);
        eventBus.emit('theme:changed', form.theme);
        ThemePanel.render(form, container);
      });
      presetGrid.appendChild(btn);
    });

    section.appendChild(presetGrid);
    container.appendChild(section);

    const customSection = document.createElement('div');
    customSection.className = 'dfb-theme-custom-section';

    const customTitle = document.createElement('p');
    customTitle.textContent = 'KUSTOM';
    customTitle.className = 'dfb-theme-section-title';
    customSection.appendChild(customTitle);

    customSection.appendChild(
      ColorPicker.create('Warna Header', form.theme.primaryColor, (color) => {
        form.theme.primaryColor = color;
        applyTheme(form.theme);
        FormManager.save(form);
        eventBus.emit('theme:changed', form.theme);
      }),
    );

    customSection.appendChild(
      ColorPicker.create('Warna Background', form.theme.backgroundColor, (color) => {
        form.theme.backgroundColor = color;
        applyTheme(form.theme);
        FormManager.save(form);
        eventBus.emit('theme:changed', form.theme);
      }),
    );

    customSection.appendChild(
      FontSelector.create(form.theme.fontFamily, (font) => {
        form.theme.fontFamily = font;
        applyTheme(form.theme);
        FormManager.save(form);
        eventBus.emit('theme:changed', form.theme);
      }),
    );

    container.appendChild(customSection);
  }
}
