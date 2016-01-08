import _ from "lodash";

import { State, Layer } from "../engine/object";
import { Rect } from "shared/math";

import Table from "../ui/table";
import { Button, Radio } from "../ui/button";
import Popup from "../ui/popup";
import TextBox from "../ui/textbox";

import Message from "../engine/message";
import Client from "../multiplayer/client";

/**
 * List of rooms
 * @class
 */
export default class RoomList extends State {
  constructor() {
    super(Layer.HBox);
    this.table = new Table([
        ["Name", .4]
      , ["Admin", .2]
      , ["Pass", .2]
      , ["Total", .2]
    ]);

    this._reloadRoomList();
  }

  /**
   * Fetch new room list from server
   * @private
   */
  _reloadRoomList() {
    let reloadList = list => {
      // Remove old data
      this.table.clear();

      // Add each row to listBox
      _.each(list, data => {
        this.table.add(_.values(data));
      });
    };
    Client.emit("listRooms")
      .then(reloadList)
      .catch(_.partial(console.log, "Cannot fetch list of channels..."));
  }

  /** @inheritdoc */
  init() {
    // List of channels
    this.add(this.table, { fill: [.8, 1.0] });

    // List methods
    let toolbar = this.add(new Layer(Layer.VBox, new Rect), { fill: [.2, 1.0] });

    // Refresh button
    toolbar
      .add(new Button(new Rect(0, 0, 0, 30), "Refresh"), { fill: [1.0, .0] })
      .addForwarder(Message.Type.MOUSE_CLICK, this._reloadRoomList.bind(this));

    // Create room button
    toolbar
      .add(new Button(new Rect(0, 0, 0, 30), "Create"), { fill: [1.0, .0] })
      .addForwarder(Message.Type.MOUSE_CLICK, () => {
        this.showPopup(new RoomList.CreatorPopup());
      });
  }
};

RoomList.CreatorPopup = class extends Popup {
  constructor() {
    super(Layer.VBox, new Rect(0, 0, 320, 256), "Create room on server");
  }

  /** @inheritdoc */
  init() {
    this.add(new Radio(new Rect(10, 60, 90, 16), "list in list"));
    super.init();
  }
};