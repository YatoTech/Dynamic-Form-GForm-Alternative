/**
 * Dynamic Form Builder — Main Entry Point
 * Menentukan halaman aktif berdasarkan data-page dan me-render komponen terkait.
 */

const app = document.getElementById('dfb-app');
if (!app) throw new Error('Root element #dfb-app tidak ditemukan');

const page = app.dataset.page;

switch (page) {
  case 'dashboard':
    void import('./ui/Dashboard.js').then((m) => m.render(app));
    break;
  case 'editor':
    void import('./ui/editor/FormEditor.js').then((m) => m.render(app));
    break;
  case 'form':
    void import('./ui/renderer/FormRenderer.js').then((m) => m.render(app));
    break;
  case 'responses':
    void import('./ui/responses/ResponseDashboard.js').then((m) => m.render(app));
    break;
  default:
    app.textContent = 'Halaman tidak dikenal';
}
