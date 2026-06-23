/**
 * Abstract Storage Adapter Interface.
 * Semua implementasi storage HARUS mengikuti interface ini.
 */

export class StorageAdapter {
  /**
   * Menyimpan data.
   * @param {string} _key
   * @param {*} _value
   * @returns {Promise<void>|void}
   */
  set(_key, _value) {
    throw new Error('Method "set" harus diimplementasikan');
  }

  /**
   * Mengambil data.
   * @param {string} _key
   * @returns {Promise<*>|*}
   */
  get(_key) {
    throw new Error('Method "get" harus diimplementasikan');
  }

  /**
   * Menghapus data.
   * @param {string} _key
   * @returns {Promise<void>|void}
   */
  remove(_key) {
    throw new Error('Method "remove" harus diimplementasikan');
  }

  /**
   * Mendapatkan semua kunci yang ada.
   * @param {string} [_prefix]
   * @returns {Promise<string[]>|string[]}
   */
  keys(_prefix) {
    throw new Error('Method "keys" harus diimplementasikan');
  }

  /**
   * Menghapus semua data yang sesuai prefix.
   * @param {string} [_prefix]
   * @returns {Promise<void>|void}
   */
  clear(_prefix) {
    throw new Error('Method "clear" harus diimplementasikan');
  }
}
