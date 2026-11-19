export default class UndoHistory {
  /**
   * @param {any} initial
   * @param {{ limit?: number }} [options]
   */
  constructor(initial, options = {}) {
    // TODO
  }

  get present() {
    throw 'Not implemented!';
  }

  get canUndo() {
    throw 'Not implemented!';
  }

  get canRedo() {
    throw 'Not implemented!';
  }

  set(value) {
    throw 'Not implemented!';
  }

  update(fn) {
    throw 'Not implemented!';
  }

  undo() {
    throw 'Not implemented!';
  }

  redo() {
    throw 'Not implemented!';
  }

  reset(value) {
    throw 'Not implemented!';
  }
}
