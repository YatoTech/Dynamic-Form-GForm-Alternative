import { generateId } from '../utils/uuid.js';

/**
 * @typedef {'short_answer'|'paragraph'|'multiple_choice'|'checkboxes'|'dropdown'|'linear_scale'|'mc_grid'|'checkbox_grid'|'date'|'time'|'file_upload'|'section_header'|'rating'} QuestionType
 */

/**
 * @typedef {Object} ValidationConfig
 * @property {boolean} [required]
 * @property {number} [minLength]
 * @property {number} [maxLength]
 * @property {'email'|'url'|'number'|'integer'|'regex'|'none'} [pattern]
 * @property {string} [customRegex]
 * @property {number} [minValue]
 * @property {number} [maxValue]
 * @property {number} [minSelect]
 * @property {number} [maxSelect]
 * @property {string} [minDate]
 * @property {string} [maxDate]
 */

/**
 * @typedef {Object} QuestionOptions
 * @property {string[]} [choices]
 * @property {boolean} [includeOther]
 * @property {number} [minScale]
 * @property {number} [maxScale]
 * @property {string} [leftLabel]
 * @property {string} [rightLabel]
 * @property {string[]} [rows]
 * @property {string[]} [columns]
 * @property {'date'|'datetime'|'year_month'} [dateType]
 * @property {boolean} [use24h]
 */

export class Question {
  /**
   * @param {QuestionType} type
   * @param {Partial<import('./Question.js').QuestionData>} [data]
   */
  constructor(type, data = {}) {
    this.questionId = data.questionId || generateId();
    this.type = type;
    this.title = data.title || '';
    this.description = data.description || '';
    this.required = data.required || false;
    this.imageUrl = data.imageUrl || null;
    this.order = data.order ?? 0;
    this.validation = data.validation || {};
    this.options = data.options || {};
  }

  toJSON() {
    return {
      questionId: this.questionId,
      type: this.type,
      title: this.title,
      description: this.description,
      required: this.required,
      imageUrl: this.imageUrl,
      order: this.order,
      validation: this.validation,
      options: this.options,
    };
  }

  static fromJSON(json) {
    return new Question(json.type, json);
  }
}
