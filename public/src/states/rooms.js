import _ from "lodash";

import { Vec2, Rect } from "shared/math";
import { Layer, State } from "../engine/object";
import ListBox from "../ui/listbox";
import { Button } from "../ui/button";
import Client from "../multiplayer/client";
import Message from "../engine/message";
import { Text } from "../engine/wrapper";

export default class RoomList extends State {
  constructor() {
    super(Layer.VBox);

    this.listBox = new ListBox(new Rect);
    this._reloadRoomList();
  }

  /**
   * Reload room list
   * @private
   */
  _reloadRoomList() {
    let reloadList = list => {
      // Remove old data
      this.listBox.clear();

      // Add each row to listBox
      _.each(list, data => {
        let rowLayer = this.listBox.add(new ListBox.Row);
        // Add each column to row
        _.each(data, column => {
          rowLayer.add(new ListBox.Item(column), { fill: [.2, .0] });
        });
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
    // Headers
    let header = this.add(new Layer(Layer.HBox, new Rect), { fill: [1.0, .1]});
    _.each(["Name", "Admin", "Password", "Players", "Max"], title => {
      header.add(new Text(title, new Rect), { fill: [.2, 1.0] });
    });

    // List of channels
    this.add(this.listBox, { fill: [1.0, .8] });

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