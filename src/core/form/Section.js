import { generateId } from '../utils/uuid.js';

export class Section {
  /**
   * @param {Object} [data]
   * @param {string} [data.sectionId]
   * @param {string} [data.title]
   * @param {string} [data.description]
   * @param {number} [data.order]
   * @param {string[]} [data.questionIds]
   */
  constructor(data = {}) {
    this.sectionId = data.sectionId || generateId();
    this.title = data.title || '';
    this.description = data.description || '';
    this.order = data.order ?? 0;
    this.questionIds = data.questionIds || [];
  }

  toJSON() {
    return {
      sectionId: this.sectionId,
      title: this.title,
      description: this.description,
      order: this.order,
      questionIds: [...this.questionIds],
    };
  }

  static fromJSON(json) {
    return new Section(json);
  }
}
