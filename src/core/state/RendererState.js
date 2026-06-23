import { eventBus } from '../utils/eventBus.js';

export class RendererState {
  constructor() {
    this.currentSectionIndex = 0;
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

  setSection(index) {
    this.currentSectionIndex = index;
    eventBus.emit('section:navigate', index);
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
    this.answers = {};
    this.errors = {};
    this.isSubmitting = false;
    this.isSubmitted = false;
  }
}
