import _ from "lodash";

import { State, Layer } from "../engine/object";
import { Rect } from "shared/math";

import { Button, Radio } from "../ui/button";
import { Text } from "../engine/wrapper";
import ListBox from "../ui/listbox";

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
        ["", .03, column => new ListBox.ImageItem(`assets/flags/${column}.png`)]
      , ["Name", .57]
      , ["Pass", .2]
      , ["Total", .2]
    ]);
  }

  /**
   * Fetch new room list from server
   * @private
   */
  reloadRoomList() {
    let reloadList = list => {
      // Remove old data
      this.table.clear();

      // Add each row to listBox
      _.each(list, data => this.table.add(_.values(data)));
    };
    Client
      .emit("listRooms")
      .then(reloadList)
      .catch(_.partial(Popup.confirm, this, "Cannot fetch channels!", Popup.Type.OK));
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
        return Client.emit("authorizeToRoom", {pass: password});
      })
      // Redirect to new state
      .then(() => this.canvas.activeState = "board")

      // Show server error
      .catch(_.partial(Popup.confirm, this));
  }

  /** @inheritdoc */
  init() {
    // List of channels
    this.add(this.table, {fill: [1., .7]});

    // List methods
    let toolbar = this.add(new Layer(Layer.HBox), {fill: [1., .3]});
    toolbar.add(new RoomList.CreatorPopup, {fill: [.7, 1.]});

    // Room list utils
    let utils = toolbar.add(new Layer(Layer.HBox), {fill: [.3, 1.]});

    // Refresh button
    utils
      .add(new Button(new Rect(0, 0, 90, 16), "Refresh"))
      .addForwarder(Message.Type.MOUSE_CLICK, this.reloadRoomList.bind(this));

    // Create room button
    utils
      .add(new Button(new Rect(0, 0, 90, 16), "Join"))
      .addForwarder(Message.Type.MOUSE_CLICK, () => {
        // Join to selected room
        let selectedCol = this.table.listbox.selected;
        if(selectedCol)
          this._joinRoom(selectedCol[1]);
        else
          Popup.confirm(this, "Choose room first!");
      });
  }
};

/**
 * Room creator popup
 * @class
 */
RoomList.CreatorPopup = class extends Layer {
  constructor() {
    super(Layer.HBox, new Rect);
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
      .then(() => this.canvas.activeState = "board")

      // On error
      .catch(_.partial(Popup.confirm, this));
  }

  /** @inheritdoc */
  init() {
    let left = this.add(new Layer(Layer.GridBox(2, 4)), {fill: [.7, 1.]});

    // Title
    left.add(new Text(new Rect(0, 0, 0, 13), "Create room"), {expand: 2});

    // Room name row
    left.add(new Text(new Rect(0, 0, 0, 14), "Room name:"));
    this.name = left.add(new TextBox(new Rect(0, 0, 0, 16)), {fill: [.5, .0]});

    // Password row
    left.add(new Text(new Rect(0, 0, 0, 14), "Password:"));
    this.pass = left.add(new TextBox(new Rect(0, 0, 0, 16)), {fill: [.5, .0]});

    // Creator row
    this.hidden = left.add(new Radio(new Rect(0, 0, 16, 14), "Hidden"));
    left
      .add(new Button(new Rect(0, 0, 118, 16), "Create room!"))
      .addForwarder(Message.Type.MOUSE_CLICK, this.createRoom.bind(this));

    // Max players count
    this.players = this.add(new Table([["Players:", 1.0]]), {fill: [.3, 1.]});
    this.players
      .setRows(["2", "4", "6", "8", "10", "12", "16", "18"])
      .listbox.setSelectedIndex(1);
  }
};