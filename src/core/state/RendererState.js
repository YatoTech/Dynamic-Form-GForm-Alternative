import { eventBus } from '../utils/eventBus.js';

export class RendererState {
  constructor() {
    this.currentSectionIndex = 0;
    this.sectionHistory = [];
    this.answers = {};
    this.errors = {};
    this.isSubmitting = false;
    this.isSubmitted = false;
  }

  setAnswer(questionId, questionType, value) {
    this.answers[questionId] = { questionType, value };
    this.clearError(questionId);
    eventBus.emit('answer:changed', { questionId, value });
  }

  getAnswer(questionId) {
    return this.answers[questionId]?.value ?? null;
  }

  setError(questionId, error) {
    this.errors[questionId] = error;
    eventBus.emit('validation:result', { questionId, error });
  }

  clearError(questionId) {
    delete this.errors[questionId];
  }

  hasErrors() {
    return Object.keys(this.errors).length > 0;
  }

  setSection(index, isBack = false) {
    if (isBack) {
      const prev = this.sectionHistory.pop();
      this.currentSectionIndex = prev !== undefined ? prev : index;
    } else {
      this.sectionHistory.push(this.currentSectionIndex);
      this.currentSectionIndex = index;
    }
    eventBus.emit('section:navigate', this.currentSectionIndex);
  }

  startSubmit() {
    this.isSubmitting = true;
  }

  finishSubmit() {
    this.isSubmitting = false;
    this.isSubmitted = true;
    eventBus.emit('form:submit', { answers: this.answers });
  }

  reset() {
    this.currentSectionIndex = 0;
    this.sectionHistory = [];
    this.answers = {};
    this.errors = {};
    this.isSubmitting = false;
    this.isSubmitted = false;
  }
}
