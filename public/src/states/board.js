import _ from "lodash";

import { Layer, State } from "../engine/object";
import { Rect } from "shared/math";

import { Sprite } from "../engine/wrapper";
import Popup from "../ui/popup";

import { Button } from "../ui/button";
import ListBox from "../ui/listbox";

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

    this.left = teamsBox.add(new ListBox, { fill: [.3, 1.0] });

    let toolbox = teamsBox.add(new Layer(Layer.VBox), { fill: [.3, 1.0] });
    toolbox.add(new Button(new Rect(0, 0, 0, 16), "<"), { fill: [1.0, .0] });
    toolbox.add(new Button(new Rect(0, 0, 0, 16), ">"), { fill: [1.0, .0] });
    this.spectators = toolbox.add(new ListBox, { fill: [.3, 1.0] });

    this.right = teamsBox.add(new ListBox, { fill: [.3, 1.0] });

    this.makeCloseable();
  }
};
