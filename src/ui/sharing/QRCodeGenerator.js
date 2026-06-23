/**
 * QRCodeGenerator — client-side QR Code rendering utility.
 * Lazy-loads qrcode.min.js from cdnjs.
 */
export class QRCodeGenerator {
  /**
   * Loads the qrcode.min.js library dynamically.
   * @returns {Promise<any>}
   */
  static loadLib() {
    if (window.QRCode) return Promise.resolve(window.QRCode);

    return new Promise((resolve, reject) => {
      // Check if script is already loading
      let script = document.querySelector('script[data-lib="qrcodejs"]');
      if (!script) {
        script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
        script.setAttribute('data-lib', 'qrcodejs');
        document.head.appendChild(script);
      }

      const onLoad = () => {
        script.removeEventListener('load', onLoad);
        script.removeEventListener('error', onError);
        resolve(window.QRCode);
      };

      const onError = () => {
        script.removeEventListener('load', onLoad);
        script.removeEventListener('error', onError);
        reject(new Error('Gagal memuat pustaka QRCode'));
      };

      script.addEventListener('load', onLoad);
      script.addEventListener('error', onError);
    });
  }

  /**
   * Renders a QR Code into the target container.
   * @param {string} text - text/URL to encode
   * @param {HTMLElement} container - DOM container element
   * @returns {Promise<string>} - Promise resolving to canvas data URL for download
   */
  static render(text, container) {
    container.innerHTML = '';
    const loading = document.createElement('div');
    loading.style.cssText = 'font-size:13px;color:var(--dfb-text-secondary,#5F6368);padding:24px 0;';
    loading.textContent = 'Memuat kode QR...';
    container.appendChild(loading);

    return this.loadLib()
      .then((QRCodeLib) => {
        container.innerHTML = '';
        
        // Create an inner wrapper for the QR code library
        const qrEl = document.createElement('div');
        qrEl.style.display = 'inline-block';
        container.appendChild(qrEl);

        const qrInstance = new QRCodeLib(qrEl, {
          text: text,
          width: 200,
          height: 200,
          colorDark: '#000000',
          colorLight: '#ffffff',
          correctLevel: QRCodeLib.CorrectLevel.M,
        });

        // QRCodejs renders into a canvas and an image. We need to extract the canvas dataURL.
        return new Promise((resolve) => {
          // Allow small timeout for canvas/image rendering to complete
          setTimeout(() => {
            const canvas = qrEl.querySelector('canvas');
            if (canvas) {
              resolve(canvas.toDataURL('image/png'));
            } else {
              const img = qrEl.querySelector('img');
              if (img && img.src) {
                resolve(img.src);
              } else {
                resolve('');
              }
            }
          }, 100);
        });
      })
      .catch((err) => {
        container.innerHTML = '';
        const errorEl = document.createElement('div');
        errorEl.style.cssText = 'color:var(--dfb-error-color,#d93025);font-size:13px;padding:24px 0;';
        errorEl.textContent = 'Gagal memuat Kode QR. Hubungkan ke internet.';
        container.appendChild(errorEl);
        throw err;
      });
  }
}
