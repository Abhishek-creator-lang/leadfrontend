export default class UndoHistory {
  /**
   * @param {any} initial
   * @param {{ limit?: number }} [options]
   */
  constructor(initial, options = {}) {
    this._limit = options.limit ?? Infinity;
    this._past = [];
    this._present = initial;
    this._future = [];
  }

  get present() {
    return this._present;
  }

  get canUndo() {
    return this._past.length > 0;
  }

  get canRedo() {
    return this._future.length > 0;
  }

  set(value) {
    if (Object.is(value, this._present)) return this._present;
    this._past.push(this._present);
    while (this._past.length > this._limit) this._past.shift();
    this._present = value;
    // A new change invalidates the redo branch.
    this._future = [];
    return this._present;
  }

  update(fn) {
    return this.set(fn(this._present));
  }

  undo() {
    if (this._past.length === 0) return this._present;
    this._future.push(this._present);
    this._present = this._past.pop();
    return this._present;
  }

  redo() {
    if (this._future.length === 0) return this._present;
    this._past.push(this._present);
    this._present = this._future.pop();
    return this._present;
  }

  reset(value) {
    this._past = [];
    this._future = [];
    this._present = value;
  }
}
