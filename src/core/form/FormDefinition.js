import { generateId } from '../utils/uuid.js';
import { Section } from './Section.js';
import { Question } from './Question.js';

export class FormDefinition {
  /**
   * @param {Object} [data]
   * @param {string} [data.formId]
   * @param {string} [data.version]
   * @param {import('./FormDefinition.js').FormMetadata} [data.metadata]
   * @param {import('./FormDefinition.js').ThemeConfig} [data.theme]
   * @param {import('./Section.js').Section[]} [data.sections]
   * @param {import('./Question.js').Question[]} [data.questions]
   */
  constructor(data = {}) {
    this.formId = data.formId || generateId();
    this.version = data.version || '1';
    this.metadata = {
      title: data.metadata?.title || '',
      description: data.metadata?.description || '',
      headerImageUrl: data.metadata?.headerImageUrl || null,
      createdAt: data.metadata?.createdAt || new Date().toISOString(),
      updatedAt: data.metadata?.updatedAt || new Date().toISOString(),
      isAcceptingResponses: data.metadata?.isAcceptingResponses ?? true,
      confirmationMessage: data.metadata?.confirmationMessage || 'Respons Anda telah tercatat.',
      showProgressBar: data.metadata?.showProgressBar ?? true,
      shuffleQuestions: data.metadata?.shuffleQuestions ?? false,
      limitOneResponse: data.metadata?.limitOneResponse ?? false,
      webhookUrl: data.metadata?.webhookUrl || null,
      webhookSecret: data.metadata?.webhookSecret || null,
    };
    this.theme = {
      primaryColor: data.theme?.primaryColor || '#4285F4',
      backgroundColor: data.theme?.backgroundColor || '#F0F4F9',
      questionBackgroundColor: data.theme?.questionBackgroundColor || '#FFFFFF',
      fontFamily: data.theme?.fontFamily || 'Sans Serif',
      fontSize: data.theme?.fontSize || 'medium',
    };
    this.sections = data.sections || [];
    this.questions = data.questions || [];
  }

  toJSON() {
    return {
      formId: this.formId,
      version: this.version,
      metadata: { ...this.metadata },
      theme: { ...this.theme },
      sections: this.sections.map((s) => s.toJSON()),
      questions: this.questions.map((q) => q.toJSON()),
    };
  }

  static fromJSON(json) {
    const form = new FormDefinition(json);
    form.sections = (json.sections || []).map((s) => Section.fromJSON(s));
    form.questions = (json.questions || []).map((q) => Question.fromJSON(q));
    return form;
  }
}

/**
 * @typedef {Object} FormMetadata
 * @property {string} title
 * @property {string} description
 * @property {string|null} headerImageUrl
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {boolean} isAcceptingResponses
 * @property {string} confirmationMessage
 * @property {boolean} showProgressBar
 * @property {boolean} shuffleQuestions
 * @property {boolean} limitOneResponse
 * @property {string|null} webhookUrl
 * @property {string|null} webhookSecret
 */

/**
 * @typedef {Object} ThemeConfig
 * @property {string} primaryColor
 * @property {string} backgroundColor
 * @property {string} questionBackgroundColor
 * @property {'Sans Serif'|'Serif'|'Monospace'|'Decorative'} fontFamily
 * @property {'small'|'medium'|'large'} fontSize
 */
