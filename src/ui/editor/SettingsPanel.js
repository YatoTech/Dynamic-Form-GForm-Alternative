import { FormManager } from '../../core/form/FormManager.js';
import { eventBus } from '../../core/utils/eventBus.js';

export class SettingsPanel {
  static render(form, container) {
    container.textContent = '';
    const panel = document.createElement('div');
    panel.className = 'dfb-settings-panel';
    container.appendChild(panel);

    const title = document.createElement('h3');
    title.className = 'dfb-settings-section-title';
    title.textContent = 'Setelan Formulir';
    panel.appendChild(title);

    const responsesSection = document.createElement('div');
    responsesSection.style.marginBottom = '24px';

    const responsesLabel = document.createElement('p');
    responsesLabel.style.cssText = 'font-size:13px;font-weight:500;color:var(--dfb-text-secondary,#5F6368);margin-bottom:12px;';
    responsesLabel.textContent = 'RESPONS';
    responsesSection.appendChild(responsesLabel);

    const acceptLabel = document.createElement('label');
    acceptLabel.className = 'dfb-flex-center';
    acceptLabel.style.cssText = 'gap:10px;padding:8px 0;cursor:pointer;';

    const acceptCheckbox = document.createElement('input');
    acceptCheckbox.type = 'checkbox';
    acceptCheckbox.className = 'dfb-settings-accept';
    acceptCheckbox.checked = form.metadata.isAcceptingResponses;
    acceptLabel.appendChild(acceptCheckbox);

    const acceptText = document.createElement('span');
    acceptText.style.cssText = 'font-size:14px;color:var(--dfb-text-primary,#202124);';
    acceptText.textContent = 'Menerima respons';
    acceptLabel.appendChild(acceptText);
    responsesSection.appendChild(acceptLabel);

    const acceptHint = document.createElement('p');
    acceptHint.className = 'dfb-settings-hint';
    acceptHint.style.marginLeft = '28px';
    acceptHint.textContent = 'Nonaktifkan untuk menutup formulir';
    responsesSection.appendChild(acceptHint);

    const limitLabel = document.createElement('label');
    limitLabel.className = 'dfb-flex-center';
    limitLabel.style.cssText = 'gap:10px;padding:8px 0;cursor:pointer;';

    const limitCheckbox = document.createElement('input');
    limitCheckbox.type = 'checkbox';
    limitCheckbox.className = 'dfb-settings-limit';
    limitCheckbox.checked = form.metadata.limitOneResponse;
    limitLabel.appendChild(limitCheckbox);

    const limitText = document.createElement('span');
    limitText.style.cssText = 'font-size:14px;color:var(--dfb-text-primary,#202124);';
    limitText.textContent = 'Batasi satu respons per orang';
    limitLabel.appendChild(limitText);
    responsesSection.appendChild(limitLabel);

    const limitHint = document.createElement('p');
    limitHint.className = 'dfb-settings-hint';
    limitHint.style.marginLeft = '28px';
    limitHint.textContent = 'Mencegah pengiriman lebih dari satu kali';
    responsesSection.appendChild(limitHint);
    panel.appendChild(responsesSection);

    const confirmationSection = document.createElement('div');
    confirmationSection.style.marginBottom = '24px';

    const confirmLabel = document.createElement('p');
    confirmLabel.style.cssText = 'font-size:13px;font-weight:500;color:var(--dfb-text-secondary,#5F6368);margin-bottom:12px;';
    confirmLabel.textContent = 'PESAN KONFIRMASI';
    confirmationSection.appendChild(confirmLabel);

    const textarea = document.createElement('textarea');
    textarea.className = 'dfb-settings-input dfb-settings-confirmation';
    textarea.maxLength = 500;
    textarea.style.cssText = 'resize:vertical;min-height:60px;padding:10px 12px;';
    textarea.value = form.metadata.confirmationMessage;
    confirmationSection.appendChild(textarea);
    panel.appendChild(confirmationSection);

    const webhookSection = document.createElement('div');
    webhookSection.style.marginBottom = '24px';

    const webhookLabel = document.createElement('p');
    webhookLabel.style.cssText = 'font-size:13px;font-weight:500;color:var(--dfb-text-secondary,#5F6368);margin-bottom:12px;';
    webhookLabel.textContent = 'WEBHOOK (opsional)';
    webhookSection.appendChild(webhookLabel);

    const urlLabel = document.createElement('label');
    urlLabel.style.cssText = 'display:block;font-size:13px;color:var(--dfb-text-primary,#202124);margin-bottom:4px;';
    urlLabel.textContent = 'URL Webhook';
    webhookSection.appendChild(urlLabel);

    const urlInput = document.createElement('input');
    urlInput.type = 'url';
    urlInput.className = 'dfb-settings-input dfb-settings-webhook-url dfb-mb-sm';
    urlInput.value = form.metadata.webhookUrl || '';
    urlInput.placeholder = 'https://contoh.com/webhook';
    urlInput.maxLength = 2000;
    webhookSection.appendChild(urlInput);

    const secretLabel = document.createElement('label');
    secretLabel.style.cssText = 'display:block;font-size:13px;color:var(--dfb-text-primary,#202124);margin-bottom:4px;';
    secretLabel.textContent = 'Rahasia (HMAC)';
    webhookSection.appendChild(secretLabel);

    const secretInput = document.createElement('input');
    secretInput.type = 'password';
    secretInput.className = 'dfb-settings-input dfb-settings-webhook-secret';
    secretInput.value = form.metadata.webhookSecret || '';
    secretInput.placeholder = 'Opsional';
    secretInput.maxLength = 500;
    webhookSection.appendChild(secretInput);

    const webhookHint = document.createElement('p');
    webhookHint.className = 'dfb-settings-hint';
    webhookHint.style.marginTop = '4px';
    webhookHint.textContent = 'Data respons akan dikirim ke URL ini setiap kali form disubmit';
    webhookSection.appendChild(webhookHint);
    panel.appendChild(webhookSection);

    attachEvents(form, panel);
  }
}

function attachEvents(form, container) {
  let saveTimer;

  const scheduleSave = () => {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      FormManager.save(form);
      eventBus.emit('form:updated', form);
    }, 500);
  };

  const acceptToggle = container.querySelector('.dfb-settings-accept');
  acceptToggle.addEventListener('change', () => {
    form.metadata.isAcceptingResponses = acceptToggle.checked;
    form.metadata.updatedAt = new Date().toISOString();
    scheduleSave();
  });

  const limitToggle = container.querySelector('.dfb-settings-limit');
  limitToggle.addEventListener('change', () => {
    form.metadata.limitOneResponse = limitToggle.checked;
    form.metadata.updatedAt = new Date().toISOString();
    scheduleSave();
  });

  const confirmationInput = container.querySelector('.dfb-settings-confirmation');
  confirmationInput.addEventListener('blur', () => {
    form.metadata.confirmationMessage = confirmationInput.value;
    form.metadata.updatedAt = new Date().toISOString();
    scheduleSave();
  });

  const webhookUrlInput = container.querySelector('.dfb-settings-webhook-url');
  webhookUrlInput.addEventListener('blur', () => {
    form.metadata.webhookUrl = webhookUrlInput.value || null;
    form.metadata.updatedAt = new Date().toISOString();
    scheduleSave();
  });

  const webhookSecretInput = container.querySelector('.dfb-settings-webhook-secret');
  webhookSecretInput.addEventListener('blur', () => {
    form.metadata.webhookSecret = webhookSecretInput.value || null;
    form.metadata.updatedAt = new Date().toISOString();
    scheduleSave();
  });
}
