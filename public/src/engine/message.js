/**
 * Contains type and data in message
 * @class
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

  /** Prevent finalCallback executing */
  preventDefault() { this.finalCallback = null; }

  /** Check is mouse event */
  isMouseEvent() {
    return this.type >= Message.Type.MOUSE_DOWN && this.type <= Message.Type.MOUSE_CLICK;
  }

  /** Check is keyboard event */
  isKeyboardEvent() {
    return this.type >= Message.Type.KEY_DOWN && this.type <= Message.Type.KEY_ENTER;
  }
}

/**
 * Event type
 */
Message.Type = {
  // Mouse events
    MOUSE_DOWN:   1
  , MOUSE_UP:     2
  , MOUSE_DRAG:   3
  , MOUSE_SCROLL: 4
  , MOUSE_CLICK:  5

  // Keyboard Events
  , KEY_DOWN:     6
  , KEY_UP:       7
  , KEY_ENTER:    8
};