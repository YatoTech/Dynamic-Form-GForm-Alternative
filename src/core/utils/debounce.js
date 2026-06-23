/**
 * Debounce & Throttle utilities.
 */

/**
 * Membuat debounced function — menunda eksekusi sampai jeda tertentu.
 * @param {Function} fn
 * @param {number} delay - milidetik
 * @returns {Function & { cancel: Function }}
 */
export function debounce(fn, delay = 300) {
  let timer = null;
  const debounced = (...args) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn(...args);
      timer = null;
    }, delay);
  };
  debounced.cancel = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };
  return debounced;
}

/**
 * Membuat throttled function — maksimal satu eksekusi per interval.
 * @param {Function} fn
 * @param {number} interval - milidetik
 * @returns {Function}
 */
export function throttle(fn, interval = 300) {
  let lastCall = 0;
  return (...args) => {
    const now = Date.now();
    if (now - lastCall >= interval) {
      lastCall = now;
      fn(...args);
    }
  };
}
