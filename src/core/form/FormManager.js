import { LocalStorageAdapter } from '../storage/LocalStorageAdapter.js';
import { FormFactory } from './FormFactory.js';
import { FormDefinition } from './FormDefinition.js';
import { Section } from './Section.js';
import { Question } from './Question.js';

const storage = new LocalStorageAdapter();
const FORMS_INDEX_KEY = 'form_index';

export class FormManager {
  /**
   * Mendapatkan daftar semua form (metadata saja).
   * @returns {Array<{formId: string, title: string, updatedAt: string, responseCount: number}>}
   */
  static list() {
    const index = storage.get(FORMS_INDEX_KEY) || [];
    return index.map((entry) => {
      const formData = storage.get(`form:${entry.formId}`);
      return {
        formId: entry.formId,
        title: formData?.metadata?.title || 'Formulir tanpa judul',
        updatedAt: formData?.metadata?.updatedAt || '',
        responseCount: entry.responseCount || 0,
        primaryColor: formData?.theme?.primaryColor || '#673AB7',
      };
    });
  }

  /**
   * Membuat form baru dan menyimpannya.
   * @param {string} [title]
   * @returns {import('./FormDefinition.js').FormDefinition}
   */
  static create(title = '') {
    const form = FormFactory.createEmpty(title);
    storage.set(`form:${form.formId}`, form.toJSON());
    const index = storage.get(FORMS_INDEX_KEY) || [];
    index.unshift({ formId: form.formId, responseCount: 0 });
    storage.set(FORMS_INDEX_KEY, index);
    return form;
  }

  /**
   * Memuat form berdasarkan formId.
   * @param {string} formId
   * @returns {import('./FormDefinition.js').FormDefinition|null}
   */
  static load(formId) {
    const data = storage.get(`form:${formId}`);
    if (!data) return null;
    return FormDefinition.fromJSON(data);
  }

  /**
   * Menyimpan form.
   * @param {import('./FormDefinition.js').FormDefinition} form
   */
  static save(form) {
    storage.set(`form:${form.formId}`, form.toJSON());
  }

  /**
   * Mendaftarkan formId ke index (untuk import).
   * @param {string} formId
   */
  static addToIndex(formId) {
    const index = storage.get(FORMS_INDEX_KEY) || [];
    index.unshift({ formId, responseCount: 0 });
    storage.set(FORMS_INDEX_KEY, index);
  }

  /**
   * Menghapus form dan entry dari index.
   * @param {string} formId
   */
  static delete(formId) {
    storage.remove(`form:${formId}`);
    const index = storage.get(FORMS_INDEX_KEY) || [];
    const filtered = index.filter((e) => e.formId !== formId);
    storage.set(FORMS_INDEX_KEY, filtered);
  }

  /**
   * Menduplikasi form.
   * @param {string} formId
   * @returns {import('./FormDefinition.js').FormDefinition|null}
   */
  static duplicate(formId) {
    const original = FormManager.load(formId);
    if (!original) return null;
    const clone = FormFactory.createEmpty(
      original.metadata.title ? `${original.metadata.title} (Salinan)` : '',
    );
    clone.metadata = { ...original.metadata, ...clone.metadata, title: clone.metadata.title };
    clone.theme = { ...original.theme };
    clone.sections = original.sections.map((s) => Section.fromJSON(s.toJSON()));
    clone.questions = original.questions.map((q) => Question.fromJSON(q.toJSON()));
    FormManager.save(clone);
    return clone;
  }
}
