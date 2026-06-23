import { describe, it, expect } from 'vitest';
import { FormDefinition } from '../../src/core/form/FormDefinition.js';
import { FormFactory } from '../../src/core/form/FormFactory.js';
import { Question } from '../../src/core/form/Question.js';
import { Section } from '../../src/core/form/Section.js';
import { QUESTION_TYPES } from '../../src/core/form/QuestionTypes.js';

describe('FormDefinition', () => {
  it('creates instance with default values', () => {
    const form = new FormDefinition();
    expect(form.formId).toBeTruthy();
    expect(form.version).toBe('1');
    expect(form.metadata.title).toBe('');
    expect(form.metadata.isAcceptingResponses).toBe(true);
    expect(form.sections).toEqual([]);
    expect(form.questions).toEqual([]);
  });

  it('serializes to JSON and back', () => {
    const form = new FormDefinition();
    form.metadata.title = 'Test Form';
    const json = form.toJSON();
    expect(json.formId).toBe(form.formId);
    expect(json.metadata.title).toBe('Test Form');
  });

  it('fromJSON restores all fields', () => {
    const original = new FormDefinition({
      metadata: { title: 'Restored Form' },
    });
    original.sections.push(new Section({ title: 'Section 1' }));
    original.questions.push(new Question(QUESTION_TYPES.SHORT_ANSWER, { title: 'Q1' }));

    const json = original.toJSON();
    const restored = FormDefinition.fromJSON(json);

    expect(restored.formId).toBe(original.formId);
    expect(restored.metadata.title).toBe('Restored Form');
    expect(restored.sections.length).toBe(1);
    expect(restored.sections[0].title).toBe('Section 1');
    expect(restored.questions.length).toBe(1);
    expect(restored.questions[0].title).toBe('Q1');
  });
});

describe('FormFactory', () => {
  describe('createEmpty', () => {
    it('creates form with one default section', () => {
      const form = FormFactory.createEmpty('My Form');
      expect(form.metadata.title).toBe('My Form');
      expect(form.sections.length).toBe(1);
      expect(form.sections[0].title).toBe('Bagian 1');
      expect(form.questions).toEqual([]);
    });
  });

  describe('addQuestion', () => {
    it('adds question to form and default section', () => {
      const form = FormFactory.createEmpty();
      const q = FormFactory.addQuestion(form, QUESTION_TYPES.SHORT_ANSWER);
      expect(form.questions.length).toBe(1);
      expect(form.questions[0].type).toBe(QUESTION_TYPES.SHORT_ANSWER);
      expect(form.sections[0].questionIds).toContain(q.questionId);
    });
  });

  describe('removeQuestion', () => {
    it('removes question and cleans up section references', () => {
      const form = FormFactory.createEmpty();
      const q = FormFactory.addQuestion(form, QUESTION_TYPES.SHORT_ANSWER);
      expect(form.questions.length).toBe(1);

      FormFactory.removeQuestion(form, q.questionId);
      expect(form.questions.length).toBe(0);
      expect(form.sections[0].questionIds).not.toContain(q.questionId);
    });
  });

  describe('duplicateQuestion', () => {
    it('creates a copy of the question', () => {
      const form = FormFactory.createEmpty();
      const q = FormFactory.addQuestion(form, QUESTION_TYPES.MULTIPLE_CHOICE, {
        title: 'Original',
        options: { choices: ['A', 'B'] },
      });
      q.title = 'Original';

      const clone = FormFactory.duplicateQuestion(form, q.questionId);
      expect(clone).not.toBeNull();
      expect(clone.questionId).not.toBe(q.questionId);
      expect(clone.title).toContain('Salinan');
      expect(clone.type).toBe(QUESTION_TYPES.MULTIPLE_CHOICE);
    });

    it('returns null if question not found', () => {
      const form = FormFactory.createEmpty();
      const result = FormFactory.duplicateQuestion(form, 'nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('reorderQuestions', () => {
    it('reorders questions based on id array', () => {
      const form = FormFactory.createEmpty();
      const q1 = FormFactory.addQuestion(form, QUESTION_TYPES.SHORT_ANSWER);
      const q2 = FormFactory.addQuestion(form, QUESTION_TYPES.PARAGRAPH);
      const q3 = FormFactory.addQuestion(form, QUESTION_TYPES.DATE);

      FormFactory.reorderQuestions(form, [q3.questionId, q1.questionId, q2.questionId]);
      expect(form.questions[0].questionId).toBe(q3.questionId);
      expect(form.questions[1].questionId).toBe(q1.questionId);
      expect(form.questions[2].questionId).toBe(q2.questionId);
      expect(form.questions[0].order).toBe(0);
      expect(form.questions[1].order).toBe(1);
    });
  });
});

describe('Question', () => {
  it('creates question with default values', () => {
    const q = new Question(QUESTION_TYPES.SHORT_ANSWER);
    expect(q.questionId).toBeTruthy();
    expect(q.type).toBe(QUESTION_TYPES.SHORT_ANSWER);
    expect(q.title).toBe('');
    expect(q.required).toBe(false);
  });

  it('creates question with provided data', () => {
    const q = new Question(QUESTION_TYPES.MULTIPLE_CHOICE, {
      title: 'Pilih satu',
      required: true,
      options: { choices: ['A', 'B', 'C'] },
    });
    expect(q.title).toBe('Pilih satu');
    expect(q.required).toBe(true);
    expect(q.options.choices).toEqual(['A', 'B', 'C']);
  });

  it('serializes and deserializes via toJSON/fromJSON', () => {
    const original = new Question(QUESTION_TYPES.LINEAR_SCALE, {
      title: 'Rating',
      options: { minScale: 1, maxScale: 5 },
    });
    const json = original.toJSON();
    const restored = Question.fromJSON(json);
    expect(restored.title).toBe('Rating');
    expect(restored.options.minScale).toBe(1);
    expect(restored.options.maxScale).toBe(5);
  });
});

describe('Section', () => {
  it('creates section with default values', () => {
    const s = new Section();
    expect(s.sectionId).toBeTruthy();
    expect(s.title).toBe('');
    expect(s.questionIds).toEqual([]);
  });

  it('serializes and deserializes', () => {
    const original = new Section({ title: 'Bagian 1', questionIds: ['q1', 'q2'] });
    const json = original.toJSON();
    const restored = Section.fromJSON(json);
    expect(restored.title).toBe('Bagian 1');
    expect(restored.questionIds).toEqual(['q1', 'q2']);
  });
});
