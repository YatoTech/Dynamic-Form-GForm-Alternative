import { FormDefinition } from './FormDefinition.js';
import { Section } from './Section.js';
import { Question } from './Question.js';
import { generateId } from '../utils/uuid.js';

export class FormFactory {
  /**
   * Membuat form kosong dengan satu section default.
   * @param {string} [title]
   * @returns {FormDefinition}
   */
  static createEmpty(title = '') {
    const now = new Date().toISOString();
    const form = new FormDefinition({
      metadata: {
        title,
        createdAt: now,
        updatedAt: now,
      },
    });
    const defaultSection = new Section({
      title: 'Bagian 1',
      order: 0,
    });
    form.sections = [defaultSection];
    return form;
  }

  /**
   * Membuat question baru dan menambahkannya ke form.
   * @param {FormDefinition} form
   * @param {string} type
   * @param {string} [sectionId]
   * @param {string|null} [afterQuestionId]
   * @returns {Question}
   */
  static addQuestion(form, type, sectionId, afterQuestionId = null) {
    const options = {};
    if (type === 'mc_grid' || type === 'checkbox_grid') {
      options.rows = ['Baris 1'];
      options.columns = ['Kolom 1', 'Kolom 2'];
    }
    const question = new Question(type, { order: 0, options });

    let targetIndex = form.questions.length;
    if (afterQuestionId) {
      const idx = form.questions.findIndex((q) => q.questionId === afterQuestionId);
      if (idx !== -1) {
        targetIndex = idx + 1;
      }
    }

    form.questions.splice(targetIndex, 0, question);
    form.questions.forEach((q, i) => {
      q.order = i;
    });

    let targetSection = null;
    if (sectionId) {
      targetSection = form.sections.find((s) => s.sectionId === sectionId);
    } else {
      if (afterQuestionId) {
        targetSection = form.sections.find((s) => s.questionIds.includes(afterQuestionId));
      }
      if (!targetSection) {
        targetSection = form.sections[form.sections.length - 1];
      }
    }

    if (targetSection) {
      let qIdx = targetSection.questionIds.length;
      if (afterQuestionId) {
        const idx = targetSection.questionIds.indexOf(afterQuestionId);
        if (idx !== -1) {
          qIdx = idx + 1;
        }
      }
      targetSection.questionIds.splice(qIdx, 0, question.questionId);
    }

    form.metadata.updatedAt = new Date().toISOString();
    return question;
  }

  /**
   * Menghapus question dari form.
   * @param {FormDefinition} form
   * @param {string} questionId
   */
  static removeQuestion(form, questionId) {
    form.questions = form.questions.filter((q) => q.questionId !== questionId);
    form.sections.forEach((s) => {
      s.questionIds = s.questionIds.filter((id) => id !== questionId);
    });
    form.metadata.updatedAt = new Date().toISOString();
  }

  /**
   * Menduplikasi question dalam form.
   * @param {FormDefinition} form
   * @param {string} questionId
   * @returns {Question|null}
   */
  static duplicateQuestion(form, questionId) {
    const sourceIndex = form.questions.findIndex((q) => q.questionId === questionId);
    if (sourceIndex === -1) return null;
    const source = form.questions[sourceIndex];
    const clone = new Question(source.type, {
      ...source.toJSON(),
      questionId: undefined,
      order: sourceIndex + 1,
      title: source.title ? `${source.title} (Salinan)` : '',
    });

    form.questions.splice(sourceIndex + 1, 0, clone);
    form.questions.forEach((q, i) => {
      q.order = i;
    });

    form.sections.forEach((s) => {
      const idx = s.questionIds.indexOf(questionId);
      if (idx !== -1) {
        s.questionIds.splice(idx + 1, 0, clone.questionId);
      }
    });

    form.metadata.updatedAt = new Date().toISOString();
    return clone;
  }

  /**
   * Membuat form dari JSON yang di-upload.
   * @param {Object} json
   * @returns {{ success: boolean, form?: FormDefinition, error?: string }}
   */
  static createFromJSON(json) {
    if (!json || typeof json !== 'object') {
      return { success: false, error: 'File JSON tidak valid' };
    }
    if (!json.formId || !Array.isArray(json.questions)) {
      return { success: false, error: 'Format form tidak dikenal (butuh formId + questions)' };
    }
    try {
      const form = FormDefinition.fromJSON(json);
      form.formId = generateId();
      form.metadata.createdAt = new Date().toISOString();
      form.metadata.updatedAt = new Date().toISOString();
      if (!Array.isArray(form.sections) || form.sections.length === 0) {
        const defaultSection = new Section({ title: 'Bagian 1', order: 0 });
        form.sections = [defaultSection];
        form.questions.forEach((q) => defaultSection.questionIds.push(q.questionId));
      }
      return { success: true, form };
    } catch (e) {
      return { success: false, error: `Gagal memproses JSON: ${e.message}` };
    }
  }

  /**
   * Mengurutkan ulang questions berdasarkan array questionId.
   * @param {FormDefinition} form
   * @param {string[]} questionIds
   */
  static reorderQuestions(form, questionIds) {
    const map = new Map(form.questions.map((q) => [q.questionId, q]));
    form.questions = questionIds
      .filter((id) => map.has(id))
      .map((id, i) => {
        const q = map.get(id);
        q.order = i;
        return q;
      });
    form.metadata.updatedAt = new Date().toISOString();
  }
}
