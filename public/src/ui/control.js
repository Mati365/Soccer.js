import { Child } from "../engine/object";
import Message from "../engine/message";

export default class Control extends Child {
  constructor(rect) {
    super(rect);

    this.forwarder = {};
    this.state = null;
    this.disabled = false;
  }

  /**
   * Add forwarder to UI control
   * @param type      Event type
   * @param callback  Callback
   * @returns {Control}
   */
  addForwarder(type, callback) {
    console.assert(!this.forwarder[type], "Forwarder is already registered!");
    this.forwarder[type] = callback;
    return this;
  }

  /**
   * Check is mouse hover
   * @param event Event
   * @private
   */
  _checkMouseEvent(event) {
    return !event.isMouseEvent() || this.rect.contains(event.data);
  }

  /**
   * Forward event to callbacks
   * @param event  Event
   */
  onEvent(event) {
    // TODO: Add more event types
    if(!this._checkMouseEvent(event))
      return false;

    // Assign state and call callback
    this.state = event.type;
    if(this.layer)
      this.layer.focus = this;

    let callback = this.forwarder[this.state];
    callback && callback.bind(this)(event);
  }
}