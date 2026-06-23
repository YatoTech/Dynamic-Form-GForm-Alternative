/**
 * Event Bus Singleton — satu-satunya pola komunikasi antar modul.
 * DILARANG import langsung antar modul yang tidak terkait layer.
 */

class EventBus {
  #listeners = new Map();

  /**
   * Mendaftarkan listener untuk event tertentu.
   * @param {string} event - Nama event (namespace:action)
   * @param {Function} callback - Listener function
   */
  on(event, callback) {
    if (!this.#listeners.has(event)) {
      this.#listeners.set(event, new Set());
    }
    this.#listeners.get(event).add(callback);
  }

  /**
   * Menghapus listener dari event tertentu.
   * @param {string} event
   * @param {Function} callback
   */
  off(event, callback) {
    const handlers = this.#listeners.get(event);
    if (handlers) {
      handlers.delete(callback);
      if (handlers.size === 0) this.#listeners.delete(event);
    }
  }

  /**
   * Memicu event — semua listener akan dipanggil dengan payload.
   * @param {string} event
   * @param {*} [payload]
   */
  emit(event, payload) {
    const handlers = this.#listeners.get(event);
    if (handlers) {
      handlers.forEach((cb) => {
        try {
          cb(payload);
        } catch (err) {
          console.error(`[EventBus] Error in handler for "${event}":`, err);
        }
      });
    }
  }

  /** Menghapus semua listener. */
  clear() {
    this.#listeners.clear();
  }
}

export const eventBus = new EventBus();
