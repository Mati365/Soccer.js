import _ from "lodash";

import { Layer, State } from "../engine/object";
import { Rect } from "shared/math";

import { Sprite } from "../engine/wrapper";
import Popup from "../ui/popup";

import { Button } from "../ui/button";
import ListBox from "../ui/listbox";
import Table from "../ui/table";

import Client from "../multiplayer/client";

/**
 * Load room data
 * @class
 */
export default class Board extends State {
  /** @inheritdoc */
  get assets() {
    return {};
  }

  /** @inheritdoc */
  init() {
    Client.socket
      .on("roomPlayers", data => {
        console.log(data);
      });
    this.showPopup(new Board.SettingsPopup);
  }
};

Board.SettingsPopup = class extends Popup {
  constructor() {
    super(Layer.VBox, new Rect(0, 0, 500, 300), "Room settings");
  }

  /** @inheritdoc */
  init() {
    let teamsBox = this.add(new Layer(Layer.HBox, new Rect(0, 0, 0, 200)), { fill: [1.0, 0.0] });

    // Left
    this.left = teamsBox.add(new Table([["Left", 1.0]]), { fill: [.33, 1.0] });

    // Toolbox
    let toolbox = teamsBox.add(new Layer(Layer.VBox), { fill: [.34, 1.0] });

    // Spectators
    toolbox.add(new Button(new Rect, "<"), { fill: [1.0, .1] });
    toolbox.add(new Button(new Rect, ">"), { fill: [1.0, .1] });
    this.spectators = toolbox.add(new ListBox(new Rect(0, 0, 0, teamsBox.rect.h - 64)), { fill: [1.0, .8] });

    // Right
    this.right = teamsBox.add(new Table([["Right", 1.0]]), { fill: [.33, 1.0] });

    this.makeCloseable();
  }
};
