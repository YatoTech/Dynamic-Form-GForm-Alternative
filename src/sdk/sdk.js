import './web-component.js';
import { render as renderForm } from '../ui/renderer/FormRenderer.js';
import { FormManager } from '../core/form/FormManager.js';

/**
 * DynamicForm SDK — embed forms anywhere.
 *
 * Usage (Web Component):
 *   <script src="https://your-app.com/sdk.js"></script>
 *   <dynamic-form form-id="..."></dynamic-form>
 *
 * Usage (JavaScript API):
 *   DynamicForm.render({
 *     target: '#form-container',
 *     formId: '...',
 *     theme: { primaryColor: '#FF5722' }
 *   });
 */

const DynamicForm = {
  version: '1.0.0',

  render({ target, formId, theme = {} } = {}) {
    const container = typeof target === 'string'
      ? document.querySelector(target)
      : target;
    if (!container) {
      console.error('[DynamicForm] Target container tidak ditemukan:', target);
      return;
    }

    if (theme && Object.keys(theme).length > 0) {
      if (theme.primaryColor) container.style.setProperty('--dfb-primary-color', theme.primaryColor);
      if (theme.bgColor) container.style.setProperty('--dfb-bg-color', theme.bgColor);
    }

    renderForm(container, { formId, isPreview: false });
  },

  loadForm(formId) {
    return FormManager.load(formId);
  },
};

export { DynamicForm };
export { DynamicFormElement } from './web-component.js';
