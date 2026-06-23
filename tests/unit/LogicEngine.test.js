import { describe, it, expect } from 'vitest';
import { evaluateBranching, validateBranching } from '../../src/core/engine/LogicEngine.js';
import { QUESTION_TYPES } from '../../src/core/form/QuestionTypes.js';

describe('LogicEngine', () => {
  const sections = [
    { sectionId: 's1', title: 'Section 1', questionIds: ['q1'] },
    { sectionId: 's2', title: 'Section 2', questionIds: ['q2'] },
    { sectionId: 's3', title: 'Section 3', questionIds: ['q3'] },
  ];

  const questions = [
    {
      questionId: 'q1',
      type: QUESTION_TYPES.MULTIPLE_CHOICE,
      options: {
        choices: ['Yes', 'No'],
        branching: { Yes: 's2', No: 's3' },
      },
    },
    { questionId: 'q2', type: QUESTION_TYPES.SHORT_ANSWER, options: {} },
    { questionId: 'q3', type: QUESTION_TYPES.SHORT_ANSWER, options: {} },
  ];

  describe('evaluateBranching', () => {
    it('navigates to configured section', () => {
      const answers = { q1: { value: 'Yes' } };
      const idx = evaluateBranching(answers, questions, sections, 0);
      expect(idx).toBe(1);
    });

    it('navigates to alternative section', () => {
      const answers = { q1: { value: 'No' } };
      const idx = evaluateBranching(answers, questions, sections, 0);
      expect(idx).toBe(2);
    });

    it('goes to next section when no branching configured', () => {
      const questions2 = [
        { questionId: 'q1', type: QUESTION_TYPES.SHORT_ANSWER, options: {} },
      ];
      const answers = { q1: { value: 'test' } };
      const idx = evaluateBranching(answers, questions2, sections, 0);
      expect(idx).toBe(1);
    });

    it('returns last section index for __submit__', () => {
      const qs = [{
        questionId: 'q1',
        type: QUESTION_TYPES.MULTIPLE_CHOICE,
        options: {
          choices: ['Done'],
          branching: { Done: '__submit__' },
        },
      }];
      const answers = { q1: { value: 'Done' } };
      const idx = evaluateBranching(answers, qs, [{ sectionId: 's1', questionIds: ['q1'] }], 0);
      expect(idx).toBe(1);
    });

    it('detects infinite loop and falls back', () => {
      const loopQs = [{
        questionId: 'q1',
        type: QUESTION_TYPES.MULTIPLE_CHOICE,
        options: {
          choices: ['Loop'],
          branching: { Loop: 's1' },
        },
      }];
      const answers = { q1: { value: 'Loop' } };
      const idx = evaluateBranching(answers, loopQs, [{ sectionId: 's1', questionIds: ['q1'] }], 0);
      expect(idx).toBeLessThan(sections.length);
    });
  });

  describe('validateBranching', () => {
    it('returns true for valid branching config', () => {
      expect(validateBranching(sections, questions)).toBe(true);
    });

    it('returns true when no branching configured', () => {
      expect(validateBranching(sections, [])).toBe(true);
    });

    it('returns false when target section does not exist', () => {
      const badQs = [{
        questionId: 'q1',
        type: QUESTION_TYPES.MULTIPLE_CHOICE,
        options: {
          choices: ['X'],
          branching: { X: 'nonexistent' },
        },
      }];
      expect(validateBranching(sections, badQs)).toBe(false);
    });
  });
});
