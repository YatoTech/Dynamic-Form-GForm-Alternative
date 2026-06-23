import { describe, it, expect } from 'vitest';
import { exportToCsv, exportToJson } from '../../src/core/engine/ExportEngine.js';

describe('ExportEngine', () => {
  const questions = [
    { questionId: 'q1', title: 'Nama', type: 'short_answer' },
    { questionId: 'q2', title: 'Email', type: 'short_answer' },
    { questionId: 'q3', title: 'Seksi Header', type: 'section_header' },
  ];

  const responses = [
    {
      responseId: 'resp-001',
      submittedAt: '2026-06-22T10:00:00Z',
      durationSeconds: 120,
      answers: [
        { questionId: 'q1', value: 'Budi' },
        { questionId: 'q2', value: 'budi@email.com' },
      ],
    },
    {
      responseId: 'resp-002',
      submittedAt: '2026-06-22T11:00:00Z',
      durationSeconds: 85,
      answers: [
        { questionId: 'q1', value: 'Siti' },
        { questionId: 'q2', value: 'siti@email.com' },
      ],
    },
  ];

  describe('exportToCsv', () => {
    it('returns string with BOM prefix', () => {
      const csv = exportToCsv(responses, questions);
      expect(csv.charCodeAt(0)).toBe(0xFEFF);
    });

    it('includes header row', () => {
      const csv = exportToCsv(responses, questions);
      const lines = csv.split('\n');
      expect(lines[0]).toContain('Response ID');
      expect(lines[0]).toContain('Submitted At');
      expect(lines[0]).toContain('Nama');
      expect(lines[0]).toContain('Email');
    });

    it('excludes section_header from columns', () => {
      const csv = exportToCsv(responses, questions);
      expect(csv).not.toContain('Seksi Header');
    });

    it('includes response data rows', () => {
      const csv = exportToCsv(responses, questions);
      const lines = csv.split('\n');
      expect(lines[1]).toContain('resp-001');
      expect(lines[1]).toContain('Budi');
      expect(lines[2]).toContain('resp-002');
      expect(lines[2]).toContain('Siti');
    });

    it('handles empty responses', () => {
      const csv = exportToCsv([], questions);
      const lines = csv.split('\n');
      expect(lines.length).toBe(2);
    });
  });

  describe('exportToJson', () => {
    it('returns pretty-printed JSON string', () => {
      const json = exportToJson(responses);
      const parsed = JSON.parse(json);
      expect(parsed).toEqual(responses);
      expect(json).toContain('\n');
    });

    it('handles empty array', () => {
      const json = exportToJson([]);
      expect(json).toBe('[]');
    });
  });
});
