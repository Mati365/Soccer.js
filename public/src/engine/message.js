/**
 * Event Data
 */
export default class Message {
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
  preventDefault() { this.finalCallback = null; }

  /** Check is mouse event */
  isMouseEvent() {
    return this.type >= Message.Type.MOUSE_DOWN && this.type <= Message.Type.MOUSE_CLICK;
  }
}

/**
 * Event type
 */
Message.Type = {
  // Mouse events
    MOUSE_DOWN:   1
  , MOUSE_UP:     2
  , MOUSE_CLICK:  3

  // Keyboard Events
  , KEY_DOWN:     4
  , KEY_UP:       8
  , KEY_ENTER:    12
};