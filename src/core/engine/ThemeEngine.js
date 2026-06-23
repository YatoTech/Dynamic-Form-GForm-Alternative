/**
 * ThemeEngine — CSS variable management.
 * TIDAK BOLEH hardcode warna. Semua via CSS vars.
 */

const PRESET_THEMES = [
  { name: 'Default', primaryColor: '#4285F4', backgroundColor: '#F0F4F9' },
  { name: 'Poppy', primaryColor: '#E53935', backgroundColor: '#FBE9E7' },
  { name: 'Flamingo', primaryColor: '#F06292', backgroundColor: '#FCE4EC' },
  { name: 'Blueberry', primaryColor: '#3949AB', backgroundColor: '#E8EAF6' },
  { name: 'Sage', primaryColor: '#558B2F', backgroundColor: '#F1F8E9' },
  { name: 'Spearmint', primaryColor: '#00897B', backgroundColor: '#E0F2F1' },
  { name: 'Sunset', primaryColor: '#E65100', backgroundColor: '#FFF3E0' },
  { name: 'Ocean', primaryColor: '#0288D1', backgroundColor: '#E1F5FE' },
  { name: 'Forest', primaryColor: '#2E7D32', backgroundColor: '#E8F5E9' },
  { name: 'Night', primaryColor: '#37474F', backgroundColor: '#ECEFF1' },
  { name: 'Grape', primaryColor: '#7B1FA2', backgroundColor: '#F3E5F5' },
];

export { PRESET_THEMES };

/**
 * Menerapkan tema ke dokumen dengan mengubah CSS custom properties.
 * @param {import('../form/FormDefinition.js').ThemeConfig} themeConfig
 */
export function applyTheme(themeConfig) {
  if (!themeConfig) return;
  const root = document.documentElement;

  if (themeConfig.primaryColor) {
    root.style.setProperty('--dfb-primary-color', themeConfig.primaryColor);
  }
  if (themeConfig.backgroundColor) {
    root.style.setProperty('--dfb-bg-color', themeConfig.backgroundColor);
    document.body.style.background = themeConfig.backgroundColor;
  }
  if (themeConfig.questionBackgroundColor) {
    root.style.setProperty('--dfb-card-bg', themeConfig.questionBackgroundColor);
  }
  if (themeConfig.fontFamily) {
    const fontMap = {
      'Sans Serif':
        "'Google Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      Serif: 'Georgia, "Times New Roman", serif',
      Monospace: "'Courier New', Courier, monospace",
      Decorative: "'Comic Sans MS', cursive, sans-serif",
    };
    root.style.setProperty(
      '--dfb-font-family',
      fontMap[themeConfig.fontFamily] || fontMap['Sans Serif'],
    );
  }
  if (themeConfig.fontSize) {
    const sizeMap = { small: '13px', medium: '14px', large: '16px' };
    root.style.fontSize = sizeMap[themeConfig.fontSize] || '14px';
  }
}

/**
 * Mereset tema ke default.
 */
export function resetTheme() {
  const root = document.documentElement;
  root.style.removeProperty('--dfb-primary-color');
  root.style.removeProperty('--dfb-bg-color');
  root.style.removeProperty('--dfb-card-bg');
  root.style.removeProperty('--dfb-font-family');
  root.style.fontSize = '';
  document.body.style.background = '';
}
