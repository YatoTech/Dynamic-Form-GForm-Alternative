import { StorageAdapter } from './StorageAdapter.js';

export class WebhookAdapter extends StorageAdapter {
  /**
   * @param {string} webhookUrl - Harus HTTPS
   * @param {string} [secret] - Untuk HMAC signature
   */
  constructor(webhookUrl, secret = '') {
    super();
    if (!webhookUrl.startsWith('https://')) {
      throw new Error('Webhook URL harus menggunakan HTTPS');
    }
    this.webhookUrl = webhookUrl;
    this.secret = secret;
  }

  async #sign(payload) {
    if (!this.secret) return '';
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(this.secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    );
    const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(JSON.stringify(payload)));
    return Array.from(new Uint8Array(sig))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * @param {string} key - Tidak digunakan, disediakan untuk interface compatibility
   * @param {*} value - Payload yang akan dikirim
   */
  async set(key, value) {
    const signature = await this.#sign(value);
    const response = await fetch(this.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Form-Id': value.formId || '',
        'X-Response-Id': value.responseId || '',
        'X-Signature': signature,
      },
      body: JSON.stringify(value),
    });
    if (!response.ok) {
      throw new Error(`Webhook gagal: ${response.status} ${response.statusText}`);
    }
  }

  get() {
    throw new Error('WebhookAdapter tidak mendukung operasi baca');
  }

  remove() {
    throw new Error('WebhookAdapter tidak mendukung operasi hapus');
  }

  keys() {
    return [];
  }

  clear() {}
}
