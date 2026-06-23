import { render as renderForm } from '../ui/renderer/FormRenderer.js';

const STYLE_SHEET = `
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
:host {
  display: block;
  font-family: var(--dfb-font-family, 'Google Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
  font-size: 14px;
  color: var(--dfb-text-primary, #202124);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
img, svg { display: block; max-width: 100%; }
input, select, textarea, button { font: inherit; }
button { cursor: pointer; border: none; background: none; }
`;

export class DynamicFormElement extends HTMLElement {
  static get observedAttributes() {
    return ['form-id', 'theme'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._formId = null;
    this._theme = null;
  }

  connectedCallback() {
    this._formId = this.getAttribute('form-id');
    this._theme = this.getAttribute('theme');
    if (this._formId) {
      this._render();
    }
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal === newVal) return;
    if (name === 'form-id') {
      this._formId = newVal;
      this._render();
    } else if (name === 'theme') {
      this._theme = newVal;
      this._applyTheme();
    }
  }

  _render() {
    const root = this.shadowRoot;
    root.textContent = '';

    const style = document.createElement('style');
    style.textContent = STYLE_SHEET;
    root.appendChild(style);

    const container = document.createElement('div');
    container.id = 'dfb-sdk-root';
    root.appendChild(container);

    renderForm(container, { formId: this._formId, isPreview: false });

    this._applyTheme();
  }

  _applyTheme() {
    if (!this._theme) return;
    try {
      const theme = JSON.parse(this._theme);
      if (typeof theme.primaryColor === 'string') {
        const root = this.shadowRoot;
        root.host.style.setProperty('--dfb-primary-color', theme.primaryColor);
      }
      if (typeof theme.bgColor === 'string') {
        const root = this.shadowRoot;
        root.host.style.setProperty('--dfb-bg-color', theme.bgColor);
      }
    } catch (e) {
      console.warn('[DynamicForm] Invalid theme JSON:', e);
    }
  }
}

if (!customElements.get('dynamic-form')) {
  customElements.define('dynamic-form', DynamicFormElement);
}
