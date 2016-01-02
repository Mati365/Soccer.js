import _ from "lodash";

import { State, Layer } from "../engine/object";
import { Rect } from "shared/math";

import Table from "../ui/table";
import { Button } from "../ui/button";
import Popup from "../ui/popup";

import Message from "../engine/message";
import Client from "../multiplayer/client";

/**
 * List of rooms
 */
export default class RoomList extends State {
  constructor() {
    super(Layer.VBox);
    this.table = new Table([
        ["Name", .5]
      , ["Admin", .2]
      , ["Pass", .1]
      , ["Total", .1]
      , ["Max", .1]
    ]);

    this._reloadRoomList();
  }

  /**
   * Reload room list
   * @private
   */
  _reloadRoomList() {
    let reloadList = list => {
      // Remove old data
      this.table.clear();

      // Add each row to listBox
      for(let i = 0;i < 90;++i)
        _.each(list, data => {
          data.name = i;
          this.table.add(_.values(data));
        });
    };
    Client.emit("listRooms")
      .then(reloadList)
      .catch(_.partial(console.log, "Cannot fetch list of channels..."));
  }

  /**
   * Initialize state
   */
  init() {
    let window = new Popup(null, new Rect(60, 60, 256, 256));
    window.add(new Button(new Rect(90, 90, 90, 90), "Refresh"));
    this.showPopup(window);

    // List of channels
    this.add(this.table, { fill: [1.0, .9] });

    // List methods
    let toolbar = this.add(new Layer(Layer.HBox, new Rect), { fill: [1.0, .1] });

    // Refresh button
    toolbar
      .add(new Button(new Rect(0, 0, 90, 0), "Refresh"), { fill: [0, 1.0] })
      .addForwarder(Message.Type.MOUSE_CLICK, this._reloadRoomList.bind(this));

    // Create room button
    toolbar
      .add(new Button(new Rect(0, 0, 90, 0), "Create"), { fill: [0, 1.0] })
      .addForwarder(Message.Type.MOUSE_CLICK, () => {
        Client.emit("createRoom", { name: "DUPA", password: "" });
      });
  }
};