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

    // ─── GAMBAR HEADER ───
    const headerImageSection = document.createElement('div');
    headerImageSection.className = 'dfb-theme-header-image-section';
    headerImageSection.style.cssText = 'border-bottom: 1px solid var(--dfb-border-color, #dadce0); padding-bottom: 12px; margin-bottom: 12px;';

    const headerImageTitle = document.createElement('p');
    headerImageTitle.textContent = 'GAMBAR HEADER';
    headerImageTitle.className = 'dfb-theme-section-title';
    headerImageSection.appendChild(headerImageTitle);

    if (form.metadata.headerImageUrl) {
      const imgPreviewContainer = document.createElement('div');
      imgPreviewContainer.style.cssText = 'position:relative; margin-bottom:8px; border-radius:4px; overflow:hidden; border:1px solid var(--dfb-border-color,#dadce0); height:80px;';

      const img = document.createElement('img');
      img.src = form.metadata.headerImageUrl;
      img.style.cssText = 'width:100%; height:100%; object-fit:cover;';
      imgPreviewContainer.appendChild(img);

      const removeBtn = document.createElement('button');
      removeBtn.className = 'dfb-btn-export';
      removeBtn.style.cssText = 'width:100%; margin-top:4px; color:var(--dfb-error-color,#d93025); border-color:var(--dfb-error-color,#d93025);';
      removeBtn.textContent = 'Hapus Gambar';
      removeBtn.addEventListener('click', () => {
        form.metadata.headerImageUrl = null;
        form.metadata.updatedAt = new Date().toISOString();
        FormManager.save(form);
        eventBus.emit('form:updated', form);
        ThemePanel.render(form, container);
      });

      headerImageSection.appendChild(imgPreviewContainer);
      headerImageSection.appendChild(removeBtn);
    } else {
      const uploadContainer = document.createElement('div');
      uploadContainer.style.cssText = 'display:flex; flex-direction:column; gap:8px;';

      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.style.display = 'none';
      uploadContainer.appendChild(fileInput);

      const uploadBtn = document.createElement('button');
      uploadBtn.className = 'dfb-btn-export';
      uploadBtn.textContent = 'Pilih Gambar (File)';
      uploadBtn.style.width = '100%';
      uploadBtn.addEventListener('click', () => fileInput.click());
      uploadContainer.appendChild(uploadBtn);

      fileInput.addEventListener('change', () => {
        const file = fileInput.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
          form.metadata.headerImageUrl = e.target.result;
          form.metadata.updatedAt = new Date().toISOString();
          FormManager.save(form);
          eventBus.emit('form:updated', form);
          ThemePanel.render(form, container);
        };
        reader.readAsDataURL(file);
      });

      const urlInput = document.createElement('input');
      urlInput.type = 'text';
      urlInput.placeholder = 'Atau masukkan URL Gambar...';
      urlInput.className = 'dfb-settings-text-input';
      urlInput.style.cssText = 'font-size:12px; padding:6px 8px; width:100%; box-sizing:border-box;';
      urlInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const val = urlInput.value.trim();
          if (val) {
            form.metadata.headerImageUrl = val;
            form.metadata.updatedAt = new Date().toISOString();
            FormManager.save(form);
            eventBus.emit('form:updated', form);
            ThemePanel.render(form, container);
          }
        }
      });
      uploadContainer.appendChild(urlInput);

      headerImageSection.appendChild(uploadContainer);
    }
    container.appendChild(headerImageSection);

    // ─── KUSTOM TEMA ───
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
      ColorPicker.create('Warna Background Pertanyaan', form.theme.questionBackgroundColor || '#FFFFFF', (color) => {
        form.theme.questionBackgroundColor = color;
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
