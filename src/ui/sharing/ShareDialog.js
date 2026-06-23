import { Modal } from '../common/Modal.js';
import { Toast } from '../common/Toast.js';

export class ShareDialog {
  static open(formId) {
    const baseUrl = window.location.origin + window.location.pathname.replace(/[^/]*$/, '');
    const formUrl = `${baseUrl}form.html?formId=${formId}`;

    const modal = new Modal();

    const tabs = ['Link', 'Embed', 'QR'];
    let activeTab = 'Link';

    function render() {
      const dialog = document.createElement('div');
      dialog.className = 'dfb-share-dialog';
      dialog.style.minWidth = '400px';

      const heading = document.createElement('h3');
      heading.style.cssText = 'font-size:18px;font-weight:500;color:var(--dfb-text-primary,#202124);margin-bottom:16px;';
      heading.textContent = 'Bagikan Formulir';
      dialog.appendChild(heading);

      const tabBar = document.createElement('div');
      tabBar.className = 'dfb-share-tab-bar';

      tabs.forEach((t) => {
        const tabBtn = document.createElement('button');
        tabBtn.className = 'dfb-share-tab' + (t === activeTab ? ' dfb-share-tab--active' : '');
        tabBtn.dataset.tab = t;
        tabBtn.textContent = t;
        tabBtn.addEventListener('click', () => {
          activeTab = t;
          render();
        });
        tabBar.appendChild(tabBtn);
      });
      dialog.appendChild(tabBar);

      const tabContent = document.createElement('div');
      tabContent.className = 'dfb-share-tab-content';

      let contentEl;
      if (activeTab === 'Link') {
        contentEl = renderLinkTab(formUrl);
      } else if (activeTab === 'Embed') {
        contentEl = renderEmbedTab(formUrl);
      } else {
        contentEl = renderQrTab(formUrl);
      }
      tabContent.appendChild(contentEl);
      dialog.appendChild(tabContent);

      const footer = document.createElement('p');
      footer.style.cssText = 'font-size:11px;color:var(--dfb-text-secondary,#5F6368);margin-top:16px;text-align:center;';
      footer.textContent = 'Form ini hanya dapat diakses di browser yang sama selama development.';
      dialog.appendChild(footer);

      modal.setBody(dialog);

      modal.content.querySelectorAll('.dfb-share-copy-btn').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const text = btn.dataset.copy;
          try {
            await navigator.clipboard.writeText(text);
            Toast.show('Tersalin ke clipboard!');
          } catch {
            Toast.show('Gagal menyalin', 'error');
          }
        });
      });
    }

    render();
    modal.open();
  }
}

function renderLinkTab(url) {
  const container = document.createElement('div');

  const p = document.createElement('p');
  p.style.cssText = 'font-size:13px;color:var(--dfb-text-secondary,#5F6368);margin-bottom:8px;';
  p.textContent = 'Bagikan link ini untuk mengumpulkan respons:';
  container.appendChild(p);

  const field = document.createElement('div');
  field.className = 'dfb-share-field';

  const input = document.createElement('input');
  input.type = 'text';
  input.readOnly = true;
  input.value = url;
  field.appendChild(input);

  const copyBtn = document.createElement('button');
  copyBtn.className = 'dfb-share-copy-btn';
  copyBtn.dataset.copy = url;
  copyBtn.textContent = 'Salin Link';
  field.appendChild(copyBtn);

  container.appendChild(field);
  return container;
}

function renderEmbedTab(url) {
  const iframeCode = `<iframe src="${url}?embed=true" width="100%" height="600" frameborder="0"></iframe>`;

  const container = document.createElement('div');

  const p = document.createElement('p');
  p.style.cssText = 'font-size:13px;color:var(--dfb-text-secondary,#5F6368);margin-bottom:8px;';
  p.textContent = 'Copy kode di bawah untuk embed form di website Anda:';
  container.appendChild(p);

  const textarea = document.createElement('textarea');
  textarea.readOnly = true;
  textarea.rows = 4;
  textarea.className = 'dfb-share-embed-code';
  textarea.style.cssText = 'resize:none;background:#f8f9fa;';
  textarea.value = iframeCode;
  container.appendChild(textarea);

  const copyBtn = document.createElement('button');
  copyBtn.className = 'dfb-share-copy-btn dfb-mt-sm';
  copyBtn.dataset.copy = iframeCode;
  copyBtn.textContent = 'Salin Kode Embed';
  container.appendChild(copyBtn);

  return container;
}

function renderQrTab(url) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;

  const container = document.createElement('div');
  container.className = 'dfb-text-center';

  const p = document.createElement('p');
  p.style.cssText = 'font-size:13px;color:var(--dfb-text-secondary,#5F6368);margin-bottom:12px;';
  p.textContent = 'Scan QR Code untuk membuka formulir:';
  container.appendChild(p);

  const img = document.createElement('img');
  img.src = qrUrl;
  img.alt = 'QR Code untuk form';
  img.style.cssText = 'width:200px;height:200px;border-radius:8px;border:1px solid var(--dfb-border-color,#DADCE0);';
  container.appendChild(img);

  const btnContainer = document.createElement('div');
  btnContainer.className = 'dfb-mt-sm';

  const a = document.createElement('a');
  a.href = qrUrl;
  a.download = 'form-qr.png';
  a.className = 'dfb-btn dfb-btn--primary';
  a.style.textDecoration = 'none';
  a.textContent = 'Download QR Code';
  btnContainer.appendChild(a);
  container.appendChild(btnContainer);

  return container;
}
