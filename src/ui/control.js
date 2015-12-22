import { Child } from "../engine/object";
import Message from "../engine/message";

export class Control extends Child {
  constructor(rect) {
    super(rect);
    this.forwarder = {};
    this.state = null;
  }

  /**
   * Add forwarder to UI control
   * @param type      Event type
   * @param callback  Callback
   * @returns {Control}
   */
  addForwarder(type, callback) {
    assert(type in this.forwarder, "Forwarder is already registered!");
    this.forwarder[type] = callback;
    return this;
  }

  /**
   * Forward event to callbacks
   * @param event  Event
   */
  onEvent(event) {
    let callback = this.forwarder[event.type];
    if(!callback)
      return;

    // TODO: Add more event types
    switch(event.type) {
      case Message.Type.MOUSE_CLICK:
      case Message.Type.MOUSE_DOWN:
      case Message.Type.MOUSE_UP:
        if(this.rect.contains(event.data))
          return false;
        break;
    }

    // Assign state and call callback
    this.state = event.type;
    callback(event);
  }
}