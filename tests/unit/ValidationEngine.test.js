import { describe, it, expect } from 'vitest';
import { validateField, validateChoices, validateGrid } from '../../src/core/engine/ValidationEngine.js';

describe('ValidationEngine', () => {
  describe('validateField', () => {
    it('returns valid for empty config', () => {
      expect(validateField('test', {})).toEqual({ isValid: true, error: null });
    });

    it('returns valid for null/undefined config', () => {
      expect(validateField('test', null)).toEqual({ isValid: true, error: null });
      expect(validateField('test', undefined)).toEqual({ isValid: true, error: null });
    });

    describe('required', () => {
      it('rejects empty string when required', () => {
        const config = { required: true };
        const result = validateField('', config);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Pertanyaan ini wajib diisi');
      });

      it('rejects null when required', () => {
        const result = validateField(null, { required: true });
        expect(result.isValid).toBe(false);
      });

      it('rejects empty array when required', () => {
        const result = validateField([], { required: true });
        expect(result.isValid).toBe(false);
      });

      it('accepts non-empty value when required', () => {
        const result = validateField('hello', { required: true });
        expect(result.isValid).toBe(true);
      });
    });

    describe('minLength / maxLength', () => {
      it('rejects value shorter than minLength', () => {
        const result = validateField('ab', { minLength: 3 });
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Terlalu pendek');
      });

      it('rejects value longer than maxLength', () => {
        const result = validateField('abcdef', { maxLength: 3 });
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Terlalu panjang');
      });

      it('accepts value within length bounds', () => {
        const result = validateField('abc', { minLength: 2, maxLength: 5 });
        expect(result.isValid).toBe(true);
      });
    });

    describe('pattern validation', () => {
      it('validates email pattern', () => {
        expect(validateField('not-an-email', { pattern: 'email' }).isValid).toBe(false);
        expect(validateField('user@example.com', { pattern: 'email' }).isValid).toBe(true);
      });

      it('validates URL pattern', () => {
        expect(validateField('not-a-url', { pattern: 'url' }).isValid).toBe(false);
        expect(validateField('https://example.com', { pattern: 'url' }).isValid).toBe(true);
      });

      it('validates number pattern', () => {
        expect(validateField('abc', { pattern: 'number' }).isValid).toBe(false);
        expect(validateField('123', { pattern: 'number' }).isValid).toBe(true);
        expect(validateField('12.5', { pattern: 'number' }).isValid).toBe(true);
      });

      it('validates integer pattern', () => {
        expect(validateField('12.5', { pattern: 'integer' }).isValid).toBe(false);
        expect(validateField('42', { pattern: 'integer' }).isValid).toBe(true);
      });

      it('validates custom regex', () => {
        const config = { pattern: 'regex', customRegex: '^[A-Z]+$' };
        expect(validateField('abc', config).isValid).toBe(false);
        expect(validateField('ABC', config).isValid).toBe(true);
      });
    });

    describe('minValue / maxValue', () => {
      it('rejects value below minValue', () => {
        const result = validateField('5', { minValue: 10 });
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('minimal');
      });

      it('rejects value above maxValue', () => {
        const result = validateField('50', { maxValue: 10 });
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('maksimal');
      });

      it('accepts value within range', () => {
        const result = validateField('7', { minValue: 1, maxValue: 10 });
        expect(result.isValid).toBe(true);
      });
    });

    describe('minDate / maxDate', () => {
      it('rejects date before minDate', () => {
        const result = validateField('2024-01-01', { minDate: '2024-06-01' });
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('setelah');
      });

      it('rejects date after maxDate', () => {
        const result = validateField('2024-12-01', { maxDate: '2024-06-01' });
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('sebelum');
      });

      it('accepts date within range', () => {
        const result = validateField('2024-06-15', { minDate: '2024-06-01', maxDate: '2024-06-30' });
        expect(result.isValid).toBe(true);
      });

      it('accepts date without minDate/maxDate config', () => {
        const result = validateField('2024-06-15', {});
        expect(result.isValid).toBe(true);
      });
    });

    describe('customError', () => {
      it('returns customError for required', () => {
        const result = validateField('', { required: true, customError: 'Harus diisi' });
        expect(result.error).toBe('Harus diisi');
      });

      it('returns customError for minLength', () => {
        const result = validateField('ab', { minLength: 5, customError: 'Terlalu pendek' });
        expect(result.error).toBe('Terlalu pendek');
      });

      it('returns customError for minValue', () => {
        const result = validateField('1', { minValue: 10, customError: 'Nilai kurang' });
        expect(result.error).toBe('Nilai kurang');
      });

      it('returns customError for minDate', () => {
        const result = validateField('2024-01-01', { minDate: '2024-06-01', customError: 'Tanggal terlalu awal' });
        expect(result.error).toBe('Tanggal terlalu awal');
      });
    });
  });

  describe('validateGrid', () => {
    const rows = ['Baris 1', 'Baris 2'];

    it('returns valid for empty config', () => {
      expect(validateGrid({}, {}, rows, 'mc_grid')).toEqual({ isValid: true, error: null });
    });

    it('returns valid when not required', () => {
      expect(validateGrid({}, { required: false }, rows, 'mc_grid')).toEqual({ isValid: true, error: null });
    });

    it('rejects null/undefined value when required', () => {
      const config = { required: true };
      expect(validateGrid(null, config, rows, 'mc_grid').isValid).toBe(false);
      expect(validateGrid(undefined, config, rows, 'mc_grid').isValid).toBe(false);
    });

    it('mc_grid rejects if a row has no selection', () => {
      const value = { '0': 'Kolom 1' };
      const result = validateGrid(value, { required: true }, rows, 'mc_grid');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Semua baris harus diisi');
    });

    it('mc_grid accepts if all rows have selection', () => {
      const value = { '0': 'Kolom 1', '1': 'Kolom 2' };
      expect(validateGrid(value, { required: true }, rows, 'mc_grid').isValid).toBe(true);
    });

    it('checkbox_grid rejects if a row has no selection', () => {
      const value = { '0': ['Kolom 1'] };
      const result = validateGrid(value, { required: true }, rows, 'checkbox_grid');
      expect(result.isValid).toBe(false);
    });

    it('checkbox_grid accepts if all rows have selection', () => {
      const value = { '0': ['Kolom 1'], '1': ['Kolom 2', 'Kolom 3'] };
      expect(validateGrid(value, { required: true }, rows, 'checkbox_grid').isValid).toBe(true);
    });
  });

  describe('validateChoices', () => {
    it('returns valid for non-array values', () => {
      expect(validateChoices('string', {}).isValid).toBe(true);
    });

    it('validates minSelect', () => {
      const config = { minSelect: 2 };
      expect(validateChoices(['a'], config).isValid).toBe(false);
      expect(validateChoices(['a', 'b'], config).isValid).toBe(true);
    });

    it('validates maxSelect', () => {
      const config = { maxSelect: 2 };
      expect(validateChoices(['a', 'b', 'c'], config).isValid).toBe(false);
      expect(validateChoices(['a', 'b'], config).isValid).toBe(true);
    });

    it('returns customError for minSelect', () => {
      const result = validateChoices(['a'], { minSelect: 2, customError: 'Pilih lebih banyak' });
      expect(result.error).toBe('Pilih lebih banyak');
    });
  });
});
