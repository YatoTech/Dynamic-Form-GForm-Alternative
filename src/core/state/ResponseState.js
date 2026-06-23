import { eventBus } from '../utils/eventBus.js';

export class ResponseState {
  constructor() {
    this.list = [];
    this.currentIndex = 0;
    this.filter = { startDate: null, endDate: null };
  }

  /**
   * @param {import('../storage/LocalStorageAdapter.js').LocalStorageAdapter} storage
   */
  loadFromStorage(storage) {
    const data = storage.get('responses');
    this.list = data || [];
    eventBus.emit('responses:loaded', this.list);
  }

  saveToStorage(storage) {
    storage.set('responses', this.list);
  }

  addResponse(response) {
    this.list.push(response);
    eventBus.emit('response:added', response);
  }

  removeResponse(responseId) {
    this.list = this.list.filter((r) => r.responseId !== responseId);
    eventBus.emit('response:deleted', responseId);
  }

  setCurrentIndex(index) {
    this.currentIndex = index;
  }

  getCurrent() {
    return this.list[this.currentIndex] || null;
  }

  setFilter(filter) {
    this.filter = { ...this.filter, ...filter };
    eventBus.emit('responses:filtered', this.filter);
  }

  getFiltered() {
    let result = this.list;
    if (this.filter.startDate) {
      result = result.filter((r) => r.submittedAt >= this.filter.startDate);
    }
    if (this.filter.endDate) {
      result = result.filter((r) => r.submittedAt <= this.filter.endDate);
    }
    return result;
  }

  get totalResponses() {
    return this.list.length;
  }
}
