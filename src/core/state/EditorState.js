import { eventBus } from '../utils/eventBus.js';
import { FormDefinition } from '../form/FormDefinition.js';

const MAX_UNDO = 50;

export class EditorState {
  constructor() {
    this.formDefinition = null;
    this.activeQuestionId = null;
    this.activeSectionId = null;
    this.isDirty = false;
    this.undoStack = [];
    this.redoStack = [];
    this.viewMode = 'editor';
  }

  /**
   * @param {import('../form/FormDefinition.js').FormDefinition} form
   */
  setForm(form) {
    this.formDefinition = form;
    this.isDirty = false;
    this.undoStack = [];
    this.redoStack = [];
    this.activeQuestionId = form.questions[0]?.questionId || null;
    this.activeSectionId = form.sections[0]?.sectionId || null;
    eventBus.emit('form:loaded', form);
  }

  /** Simpan snapshot sebelum perubahan signifikan */
  pushUndo() {
    if (!this.formDefinition) return;
    this.undoStack.push(structuredClone(this.formDefinition.toJSON()));
    if (this.undoStack.length > MAX_UNDO) this.undoStack.shift();
    this.redoStack = [];
    this.isDirty = true;
  }

  undo() {
    if (this.undoStack.length === 0) return;
    this.redoStack.push(structuredClone(this.formDefinition.toJSON()));
    const prev = this.undoStack.pop();
    this.formDefinition = FormDefinition.fromJSON(prev);
    this.isDirty = true;
    eventBus.emit('form:updated', this.formDefinition);
  }

  redo() {
    if (this.redoStack.length === 0) return;
    this.redoStack.push(structuredClone(this.formDefinition.toJSON()));
    const next = this.redoStack.pop();
    this.formDefinition = FormDefinition.fromJSON(next);
    this.isDirty = true;
    eventBus.emit('form:updated', this.formDefinition);
  }

  setViewMode(mode) {
    this.viewMode = mode;
    eventBus.emit('view:changed', mode);
  }

  setActiveQuestion(questionId) {
    if (this.activeQuestionId === questionId) return;
    this.activeQuestionId = questionId;
    eventBus.emit('active-question:changed', questionId);
  }

  markClean() {
    this.isDirty = false;
  }
}
