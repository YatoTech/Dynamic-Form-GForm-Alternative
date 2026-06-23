/**
 * Menghasilkan UUID v4 — pure JavaScript, tanpa dependency eksternal.
 * @returns {string} UUID v4 string
 */
export function generateId() {
  const hex = '0123456789abcdef';
  const segments = [8, 4, 4, 4, 12];
  return segments
    .map((len, i) => {
      let segment = '';
      for (let j = 0; j < len; j++) {
        segment += hex[Math.floor(Math.random() * 16)];
      }
      return i === 2 ? '4' + segment.slice(1) : segment;
    })
    .join('-');
}
