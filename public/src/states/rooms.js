import _ from "lodash";

import { State, Layer } from "../engine/object";
import { Rect } from "shared/math";

import { Button, Radio } from "../ui/button";
import { Text } from "../engine/wrapper";

import Table from "../ui/table";
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
      .add(new Button(new Rect(0, 0, 0, 16), "Refresh"), { fill: [1.0, .0] })
      .addForwarder(Message.Type.MOUSE_CLICK, this._reloadRoomList.bind(this));

    // Create room button
    toolbar
      .add(new Button(new Rect(0, 0, 0, 16), "Create"), { fill: [1.0, .0] })
      .addForwarder(Message.Type.MOUSE_CLICK, () => {
        this.showPopup(new RoomList.CreatorPopup());
      });

    Popup.input(this, "Enter nick").then(text => {
      console.log(text);
    });
  }
};

RoomList.CreatorPopup = class extends Popup {
  constructor() {
    super(Layer.HBox, new Rect(0, 0, 480, 256), "Room creator");
  }

  /** @inheritdoc */
  init() {
    let grid = this.add(new Layer(Layer.GridBox(2, 8), new Rect), { fill: [.7, 1.0] });

    grid.add(new Text(new Rect(0, 0, 0, 14), "Room name:"));
    grid.add(new TextBox(new Rect(0, 0, 140, 16), "name"));

    grid.add(new Text(new Rect(0, 0, 0, 14), "Password:"));
    grid.add(new TextBox(new Rect(0, 0, 140, 16), "pass"));

    grid.add(new Radio(new Rect(0, 0, 16, 14), "Show on list"), { expand: 2 });

    let players = this.add(new Table([["Players:", 1.0]], new Rect(0, 0, 0, 160)), { fill: [.3, 0.0] });
    players.setRows([
      ["2"], ["4"], ["6"], ["8"], ["10"], ["12"], ["16"]
    ]);

    this.makeCloseable();
  }
};