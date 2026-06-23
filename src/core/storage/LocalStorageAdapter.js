import { StorageAdapter } from './StorageAdapter.js';

const PREFIX = 'dfb:';

export class LocalStorageAdapter extends StorageAdapter {
  /**
   * @param {string} key
   * @param {*} value - akan di-JSON.stringify
   */
  set(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch (e) {
      console.error('[LocalStorageAdapter] Gagal menyimpan:', e);
    }
  }

  /**
   * @param {string} key
   * @returns {*|null}
   */
  get(key) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.error('[LocalStorageAdapter] Gagal membaca:', e);
      return null;
    }
  }

  /**
   * @param {string} key
   */
  remove(key) {
    localStorage.removeItem(PREFIX + key);
  }

  /**
   * @param {string} [prefix]
   * @returns {string[]}
   */
  keys(prefix = '') {
    const fullPrefix = PREFIX + prefix;
    const result = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(fullPrefix)) {
        result.push(key.slice(PREFIX.length));
      }
    }
    return result;
  }

  /**
   * @param {string} [prefix]
   */
  clear(prefix = '') {
    this.keys(prefix).forEach((key) => this.remove(key));
  }
}
