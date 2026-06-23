import { StorageAdapter } from './StorageAdapter.js';

export class IndexedDBAdapter extends StorageAdapter {
  constructor(dbName = 'DynamicFormDB', storeName = 'forms') {
    super();
    this.dbName = dbName;
    this.storeName = storeName;
    this.#db = null;
  }

  #db;

  async #open() {
    if (this.#db) return this.#db;
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };
      request.onsuccess = () => {
        this.#db = request.result;
        resolve(this.#db);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async set(key, value) {
    const db = await this.#open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readwrite');
      tx.objectStore(this.storeName).put(value, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async get(key) {
    const db = await this.#open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readonly');
      const request = tx.objectStore(this.storeName).get(key);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async remove(key) {
    const db = await this.#open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readwrite');
      tx.objectStore(this.storeName).delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async keys(prefix = '') {
    const db = await this.#open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readonly');
      const request = tx.objectStore(this.storeName).getAllKeys();
      request.onsuccess = () => {
        const allKeys = request.result;
        if (!prefix) return resolve(allKeys.map(String));
        resolve(allKeys.filter((k) => String(k).startsWith(prefix)).map(String));
      };
      request.onerror = () => reject(request.error);
    });
  }

  async clear(prefix = '') {
    const keys = await this.keys(prefix);
    for (const key of keys) {
      await this.remove(key);
    }
  }
}
