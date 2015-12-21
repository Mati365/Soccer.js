/**
 * Event type
 */
export const Type = {
    MOUSE_CLICK: 1
  , KEY_ENTER:   2
};

/**
 * Event Data
 */
export class Data {
  /**
   * @param type          Action Type
   * @param creator       Creator
   * @param data          Data
   * @param finalCallback Callback called after broadcasting
   */
  constructor(type, creator, data, finalCallback) {
    this.type = type;
    this.creator = creator;
    this.data = data;
    this.finalCallback = finalCallback;
  }

  /**
   * Prevent finalCallback executing
   */
  preventDefault() {
    this.finalCallback = null;
  }
}