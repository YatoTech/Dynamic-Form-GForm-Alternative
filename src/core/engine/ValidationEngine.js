/**
 * ValidationEngine — pure function validasi input.
 * TIDAK BOLEH mengakses DOM.
 * TIDAK BOLEH memiliki side effects.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_REGEX = /^https?:\/\/.+/;
const NUMBER_REGEX = /^-?\d+(\.\d+)?$/;
const INTEGER_REGEX = /^-?\d+$/;

/**
 * @param {string|number|string[]|null|undefined} value
 * @param {import('../form/Question.js').ValidationConfig} config
 * @returns {{ isValid: boolean, error: string|null }}
 */
function withCustom(err, config) {
  return { isValid: false, error: config.customError || err };
}

export function validateField(value, config) {
  if (!config || Object.keys(config).length === 0) {
    return { isValid: true, error: null };
  }

  const strVal = value == null ? '' : String(value);
  const isEmpty = strVal.trim() === '' || (Array.isArray(value) && value.length === 0);

  if (config.required && isEmpty) {
    return withCustom('Pertanyaan ini wajib diisi', config);
  }

  if (isEmpty) {
    return { isValid: true, error: null };
  }

  if (config.minLength != null && strVal.length < config.minLength) {
    return withCustom(`Terlalu pendek (min. ${config.minLength} karakter)`, config);
  }

  if (config.maxLength != null && strVal.length > config.maxLength) {
    return withCustom(`Terlalu panjang (maks. ${config.maxLength} karakter)`, config);
  }

  if (config.pattern && config.pattern !== 'none') {
    const result = validatePattern(strVal, config);
    if (!result.isValid) return result;
  }

  if (config.minValue != null || config.maxValue != null) {
    const num = Number(strVal);
    if (!isNaN(num)) {
      if (config.minValue != null && num < config.minValue) {
        return withCustom(`Nilai harus minimal ${config.minValue}`, config);
      }
      if (config.maxValue != null && num > config.maxValue) {
        return withCustom(`Nilai harus maksimal ${config.maxValue}`, config);
      }
    }
  }

  if (config.minDate || config.maxDate) {
    const dateVal = value ? String(value) : '';
    if (dateVal) {
      if (config.minDate && dateVal < config.minDate) {
        return withCustom(`Tanggal harus setelah ${config.minDate}`, config);
      }
      if (config.maxDate && dateVal > config.maxDate) {
        return withCustom(`Tanggal harus sebelum ${config.maxDate}`, config);
      }
    }
  }

  return { isValid: true, error: null };
}

/**
 * @param {*} value
 * @param {import('../form/Question.js').ValidationConfig} config
 * @returns {{ isValid: boolean, error: string|null }}
 */
export function validateChoices(value, config) {
  if (!Array.isArray(value)) {
    return { isValid: true, error: null };
  }
  if (config.minSelect != null && value.length < config.minSelect) {
    return withCustom(`Pilih minimal ${config.minSelect} opsi`, config);
  }
  if (config.maxSelect != null && value.length > config.maxSelect) {
    return withCustom(`Pilih maksimal ${config.maxSelect} opsi`, config);
  }
  return { isValid: true, error: null };
}

function validatePattern(value, config) {
  const pattern = config.pattern;
  switch (pattern) {
    case 'email':
      if (!EMAIL_REGEX.test(value)) {
        return { isValid: false, error: 'Masukkan alamat email yang valid' };
      }
      break;
    case 'url':
      if (!URL_REGEX.test(value)) {
        return { isValid: false, error: 'Masukkan URL yang valid' };
      }
      break;
    case 'number':
      if (!NUMBER_REGEX.test(value)) {
        return { isValid: false, error: 'Masukkan angka yang valid' };
      }
      break;
    case 'integer':
      if (!INTEGER_REGEX.test(value)) {
        return { isValid: false, error: 'Masukkan bilangan bulat' };
      }
      break;
    case 'regex':
      if (config.customRegex) {
        try {
          const re = new RegExp(config.customRegex);
          if (!re.test(value)) {
            return { isValid: false, error: config.customError || 'Format tidak valid' };
          }
        } catch {
          return { isValid: true, error: null };
        }
      }
      break;
  }
  return { isValid: true, error: null };
}

/**
 * Validasi grid question (mc_grid / checkbox_grid).
 * @param {Object|null|undefined} value
 * @param {import('../form/Question.js').ValidationConfig} config
 * @param {string[]} rows
 * @param {'mc_grid'|'checkbox_grid'} type
 * @returns {{ isValid: boolean, error: string|null }}
 */
export function validateGrid(value, config, rows, type) {
  if (!config || Object.keys(config).length === 0) return { isValid: true, error: null };
  if (!config.required) return { isValid: true, error: null };

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return withCustom('Pertanyaan ini wajib diisi', config);
  }

  for (let i = 0; i < rows.length; i++) {
    const rowVal = value[String(i)];
    if (type === 'mc_grid') {
      if (!rowVal || rowVal === '') {
        return withCustom('Semua baris harus diisi', config);
      }
    } else if (type === 'checkbox_grid') {
      if (!Array.isArray(rowVal) || rowVal.length === 0) {
        return withCustom('Semua baris harus diisi', config);
      }
    }
  }

  return { isValid: true, error: null };
}
