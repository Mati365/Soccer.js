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
    super(Layer.VBox);
    this.table = new Table([
        ["Name", .6]
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
        // Truncate title e.g. Gunwogunwo => Gunwo...
        data = _.chain(data)
          .values()
          // TODO: it may cause error with auth to server
          //.map(_.partial(_.truncate, _, { length: 26 }))
          .value();

        // Add new row to ListBox inside table
        this.table.add(data);
      });
    };
    Client
      .emit("listRooms")
      .then(reloadList)
      .catch(_.partial(console.log, "Cannot fetch list of channels..."));
  }

  /**
   * Join to room
   * @param roomName  Name of room
   * @private
   */
  _joinRoom(roomName) {
    Client
      .emit("askToConnect", { name: roomName })
      // Authorize with password, empty if not
      .then(data => {
        return data.isLocked && Popup.input(this, "Password:") || "";
      })
      .then(password => {
        return Client.emit("authorizeToRoom", { pass: password });
      })
      // Redirect to new state
      .then(() => {
        this.canvas.activeState = "board";
      })

      // Show server error
      .catch(_.partial(Popup.confirm, this));
  }

  /** @inheritdoc */
  init() {
    // List of channels
    this.add(this.table, { fill: [1.0, .9] });

    // List methods
    let toolbar = this.add(new Layer(Layer.HBox, new Rect), { fill: [1.0, .1] });

    // Refresh button
    toolbar
      .add(new Button(new Rect(0, 0, 90, 16), "Refresh"))
      .addForwarder(Message.Type.MOUSE_CLICK, this._reloadRoomList.bind(this));

    // Create room button
    toolbar
      .add(new Button(new Rect(0, 0, 90, 16), "Create"))
      .addForwarder(Message.Type.MOUSE_CLICK, () => {
        this.showPopup(new RoomList.CreatorPopup);
      });

    // Create room button
    toolbar
      .add(new Button(new Rect(0, 0, 90, 16), "Join"))
      .addForwarder(Message.Type.MOUSE_CLICK, () => {
        // Join to selected room
        let selectedRow = this.table.listbox.selected;
        if(selectedRow)
          this._joinRoom(selectedRow[0]);
        else
          Popup.confirm(this, "Choose room first!");
      });
  }
};

RoomList.CreatorPopup = class extends Popup {
  constructor() {
    super(Layer.GridBox(2, 7), new Rect(0, 0, 256, 300), "Room creator");
  }

  /**
   * Create room on server, show message or
   * error if created or not
   */
  createRoom() {
    let data = {
        name: this.name.text
      , pass: this.pass.text
      , hidden: this.hidden.checked
      , players: parseInt(this.players.listbox.selected) || 2
    };
    Client
      .emit("createRoom", data)

      // After created
      .then(_.partial(Popup.confirm, this, "Success!", Popup.Type.OK))
      .then(() => {
        this.hide();
        this.canvas.activeState = "board";
      })

      // On error
      .catch(_.partial(Popup.confirm, this));
  }

  /** @inheritdoc */
  init() {
    // Room name row
    this.add(new Text(new Rect(0, 0, 0, 14), "Room name:"));
    this.name = this.add(new TextBox(new Rect(0, 0, 118, 16)));

    // Password row
    this.add(new Text(new Rect(0, 0, 0, 14), "Password:"));
    this.pass = this.add(new TextBox(new Rect(0, 0, 118, 16)));

    // Creator row
    this.hidden = this.add(new Radio(new Rect(0, 0, 16, 14), "Hidden"));
    this
      .add(new Button(new Rect(0, 0, 118, 16), "Create room!"))
      .addForwarder(Message.Type.MOUSE_CLICK, this.createRoom.bind(this));

    this.players = this.add(new Table([["Players:", 1.0]], new Rect(0, 0, 118, 110)), { expand: 2, fill: [1.0, .0] });
    this.players
      .setRows([
        ["2"], ["4"], ["6"], ["8"], ["10"], ["12"], ["16"], ["18"]
      ])
      .listbox.setSelectedIndex(1);

    this.makeCloseable();
  }
};