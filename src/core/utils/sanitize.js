/**
 * HTML Sanitizer — pure string-based, NO DOM access.
 * Core layer TIDAK BOLEH mengakses DOM.
 */

/**
 * Sanitasi string — memastikan input adalah string.
 * Core layer tidak melakukan HTML escaping (itu tugas UI layer via escHtml).
 * @param {*} input
 * @returns {string}
 */
export function sanitizeText(input) {
  if (typeof input !== 'string') return '';
  return input;
}

/**
 * Escape HTML entities untuk ditampilkan sebagai teks.
 * @param {string} input
 * @returns {string}
 */
export function escapeHtml(input) {
  if (typeof input !== 'string') return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
