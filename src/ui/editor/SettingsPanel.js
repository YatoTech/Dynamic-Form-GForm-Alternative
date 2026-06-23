import { FormManager } from '../../core/form/FormManager.js';
import { eventBus } from '../../core/utils/eventBus.js';

export class SettingsPanel {
  static render(form, container) {
    container.innerHTML = '';

    const panel = document.createElement('div');
    panel.className = 'dfb-settings-panel';
    container.appendChild(panel);

    const title = document.createElement('h3');
    title.className = 'dfb-settings-section-title';
    title.textContent = 'Setelan';
    panel.appendChild(title);

    // Helpers to build sections
    const accordionJawaban = createAccordionGroup(
      'Jawaban',
      'Mengelola cara jawaban dikumpulkan dan dilindungi',
      true, // expanded by default
    );
    panel.appendChild(accordionJawaban.group);

    const acceptRow = createToggleRow(
      'Menerima jawaban',
      'Mengizinkan responden mengisi formulir ini',
      'dfb-settings-accept',
      form.metadata.isAcceptingResponses,
    );
    accordionJawaban.content.appendChild(acceptRow);

    const limitRow = createToggleRow(
      'Batasi ke 1 jawaban',
      'Batasi responden agar hanya dapat mengirimkan formulir satu kali (membutuhkan local storage)',
      'dfb-settings-limit',
      form.metadata.limitOneResponse,
    );
    accordionJawaban.content.appendChild(limitRow);

    const emailRow = createToggleRow(
      'Kumpulkan alamat email',
      'Responden wajib mengisi alamat email mereka',
      'dfb-settings-collect-email',
      form.metadata.collectEmail,
    );
    accordionJawaban.content.appendChild(emailRow);

    const maxResponsesRow = createInputRow(
      'Batas maksimal respons',
      'Batasi jumlah respons maksimum yang diterima (kosongkan untuk tidak terbatas)',
      'Contoh: 100',
      'dfb-settings-max-responses',
      form.metadata.maxResponses || '',
      'number',
    );
    accordionJawaban.content.appendChild(maxResponsesRow);

    const closingDateRow = createInputRow(
      'Tutup otomatis pada',
      'Formulir akan berhenti menerima jawaban pada waktu yang ditentukan',
      '',
      'dfb-settings-closing-date',
      form.metadata.closingDate || '',
      'datetime-local',
    );
    accordionJawaban.content.appendChild(closingDateRow);

    const accordionPresentasi = createAccordionGroup(
      'Presentasi',
      'Mengelola cara formulir dan jawaban ditampilkan',
      false,
    );
    panel.appendChild(accordionPresentasi.group);

    const progressRow = createToggleRow(
      'Tampilkan bilah kemajuan (Progress Bar)',
      'Menampilkan indikator persentase pengisian halaman di bagian bawah formulir',
      'dfb-settings-progress',
      form.metadata.showProgressBar ?? false,
    );
    accordionPresentasi.content.appendChild(progressRow);

    const shuffleRow = createToggleRow(
      'Acak urutan pertanyaan',
      'Mengacak susunan pertanyaan untuk setiap responden',
      'dfb-settings-shuffle',
      form.metadata.shuffleQuestions ?? false,
    );
    accordionPresentasi.content.appendChild(shuffleRow);

    const summaryRow = createToggleRow(
      'Tampilkan ringkasan jawaban ke responden',
      'Mengizinkan responden melihat ringkasan jawaban setelah mengirim formulir',
      'dfb-settings-show-summary',
      form.metadata.showSummaryToRespondents ?? false,
    );
    accordionPresentasi.content.appendChild(summaryRow);

    const confirmRow = createInputRow(
      'Pesan konfirmasi',
      'Pesan yang ditampilkan setelah responden menyerahkan jawaban',
      'Jawaban Anda telah tercatat.',
      'dfb-settings-confirmation',
      form.metadata.confirmationMessage || '',
      'textarea',
    );
    accordionPresentasi.content.appendChild(confirmRow);

    const accordionWebhook = createAccordionGroup(
      'Webhook (Opsional)',
      'Mengirimkan data jawaban secara real-time ke URL eksternal',
      false,
    );
    panel.appendChild(accordionWebhook.group);

    const webhookUrlRow = createInputRow(
      'URL Webhook',
      'Kirim payload JSON berisi data jawaban via HTTP POST',
      'https://contoh.com/webhook',
      'dfb-settings-webhook-url',
      form.metadata.webhookUrl || '',
      'url',
    );
    accordionWebhook.content.appendChild(webhookUrlRow);

    const webhookSecretRow = createInputRow(
      'Rahasia Webhook (HMAC)',
      'Kunci rahasia untuk memverifikasi tanda tangan HMAC-SHA256 dari payload yang dikirim',
      'Kunci Rahasia HMAC',
      'dfb-settings-webhook-secret',
      form.metadata.webhookSecret || '',
      'password',
    );
    accordionWebhook.content.appendChild(webhookSecretRow);

    attachEvents(form, panel);

    // Sync accept toggle if updated from other views
    const onFormUpdated = (updatedForm) => {
      if (updatedForm.formId === form.formId) {
        const acceptEl = panel.querySelector('.dfb-settings-accept');
        if (acceptEl) acceptEl.checked = updatedForm.metadata.isAcceptingResponses;
        const emailEl = panel.querySelector('.dfb-settings-collect-email');
        if (emailEl) emailEl.checked = updatedForm.metadata.collectEmail;
        const limitEl = panel.querySelector('.dfb-settings-limit');
        if (limitEl) limitEl.checked = updatedForm.metadata.limitOneResponse;
        const summaryEl = panel.querySelector('.dfb-settings-show-summary');
        if (summaryEl) summaryEl.checked = updatedForm.metadata.showSummaryToRespondents;
      }
    };
    eventBus.on('form:updated', onFormUpdated);

    if (container._settingsListener) {
      eventBus.off('form:updated', container._settingsListener);
    }
    container._settingsListener = onFormUpdated;
  }
}

// ─── HELPER FUNCTIONS ───

function createAccordionGroup(titleVal, subtitleVal, isExpandedByDefault = false) {
  const group = document.createElement('div');
  group.className = 'dfb-settings-group';
  if (isExpandedByDefault) {
    group.classList.add('dfb-settings-group--expanded');
  }

  const header = document.createElement('div');
  header.className = 'dfb-settings-group-header';

  const titleWrap = document.createElement('div');
  titleWrap.className = 'dfb-settings-group-title-wrap';

  const title = document.createElement('h4');
  title.className = 'dfb-settings-group-title';
  title.textContent = titleVal;
  titleWrap.appendChild(title);

  const subtitle = document.createElement('div');
  subtitle.className = 'dfb-settings-group-subtitle';
  subtitle.textContent = subtitleVal;
  titleWrap.appendChild(subtitle);

  header.appendChild(titleWrap);

  const chevron = document.createElement('div');
  chevron.className = 'dfb-settings-group-chevron';
  chevron.innerHTML = `
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  `;
  header.appendChild(chevron);
  group.appendChild(header);

  const content = document.createElement('div');
  content.className = 'dfb-settings-group-content';
  group.appendChild(content);

  header.addEventListener('click', () => {
    const isExpanded = group.classList.contains('dfb-settings-group--expanded');
    if (isExpanded) {
      group.classList.remove('dfb-settings-group--expanded');
    } else {
      group.classList.add('dfb-settings-group--expanded');
    }
  });

  return { group, content };
}

function createToggleRow(labelVal, hintVal, className, isChecked) {
  const row = document.createElement('div');
  row.className = 'dfb-settings-row';

  const labelGroup = document.createElement('div');
  labelGroup.className = 'dfb-settings-label-group';

  const label = document.createElement('div');
  label.className = 'dfb-settings-label';
  label.textContent = labelVal;
  labelGroup.appendChild(label);

  const hint = document.createElement('div');
  hint.className = 'dfb-settings-hint';
  hint.textContent = hintVal;
  labelGroup.appendChild(hint);

  row.appendChild(labelGroup);

  const toggleLabel = document.createElement('label');
  toggleLabel.className = 'dfb-toggle';

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = className;
  checkbox.checked = isChecked;

  const slider = document.createElement('span');
  slider.className = 'dfb-toggle-slider';

  toggleLabel.appendChild(checkbox);
  toggleLabel.appendChild(slider);
  row.appendChild(toggleLabel);

  return row;
}

function createInputRow(
  labelVal,
  hintVal,
  placeholderVal,
  inputClassName,
  value,
  inputType = 'text',
) {
  const row = document.createElement('div');
  row.className = 'dfb-settings-row';
  row.style.flexDirection = 'column';
  row.style.alignItems = 'stretch';
  row.style.gap = '8px';

  const labelGroup = document.createElement('div');
  labelGroup.className = 'dfb-settings-label-group';

  const label = document.createElement('div');
  label.className = 'dfb-settings-label';
  label.textContent = labelVal;
  labelGroup.appendChild(label);

  const hint = document.createElement('div');
  hint.className = 'dfb-settings-hint';
  hint.textContent = hintVal;
  labelGroup.appendChild(hint);

  row.appendChild(labelGroup);

  const inputContainer = document.createElement('div');
  inputContainer.className = 'dfb-settings-input-container';

  let inputEl;
  if (inputType === 'textarea') {
    inputEl = document.createElement('textarea');
    inputEl.className = `${inputClassName} dfb-settings-textarea`;
  } else {
    inputEl = document.createElement('input');
    inputEl.type = inputType;
    inputEl.className = `${inputClassName} dfb-settings-text-input`;
  }
  inputEl.placeholder = placeholderVal;
  inputEl.value = value || '';
  inputContainer.appendChild(inputEl);
  row.appendChild(inputContainer);

  return row;
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

  const emailToggle = container.querySelector('.dfb-settings-collect-email');
  if (emailToggle) {
    emailToggle.addEventListener('change', () => {
      form.metadata.collectEmail = emailToggle.checked;
      form.metadata.updatedAt = new Date().toISOString();
      scheduleSave();
    });
  }

  const maxResponsesInput = container.querySelector('.dfb-settings-max-responses');
  if (maxResponsesInput) {
    maxResponsesInput.addEventListener('change', () => {
      const val = parseInt(maxResponsesInput.value, 10);
      form.metadata.maxResponses = !isNaN(val) && val > 0 ? val : null;
      form.metadata.updatedAt = new Date().toISOString();
      scheduleSave();
    });
  }

  const closingDateInput = container.querySelector('.dfb-settings-closing-date');
  if (closingDateInput) {
    closingDateInput.addEventListener('change', () => {
      form.metadata.closingDate = closingDateInput.value || null;
      form.metadata.updatedAt = new Date().toISOString();
      scheduleSave();
    });
  }

  const summaryToggle = container.querySelector('.dfb-settings-show-summary');
  if (summaryToggle) {
    summaryToggle.addEventListener('change', () => {
      form.metadata.showSummaryToRespondents = summaryToggle.checked;
      form.metadata.updatedAt = new Date().toISOString();
      scheduleSave();
    });
  }

  const progressToggle = container.querySelector('.dfb-settings-progress');
  progressToggle.addEventListener('change', () => {
    form.metadata.showProgressBar = progressToggle.checked;
    form.metadata.updatedAt = new Date().toISOString();
    scheduleSave();
  });

  const shuffleToggle = container.querySelector('.dfb-settings-shuffle');
  shuffleToggle.addEventListener('change', () => {
    form.metadata.shuffleQuestions = shuffleToggle.checked;
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
