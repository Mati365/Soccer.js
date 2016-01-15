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
  init() {
    Client.socket
      .on("roomPlayerList", data => {
        console.log(data);
      });
    this.showPopup(new Board.SettingsPopup);
  }
};

Board.SettingsPopup = class extends Popup {
  constructor() {
    super(Layer.VBox, new Rect(0, 0, 500, 300), "Room settings");
    this.teams = {};
  }

  /**
   * Create teams panel
   * @private
   */
  _createTeamsPanel() {
    let teamsBox = this.add(new Layer(Layer.HBox, new Rect(0, 0, 0, 200)), { fill: [1., .0] });

    // Left
    this.teams.left = teamsBox.add(new Table([["Left", 1.0]]), { fill: [.33, 1.] });

    // Toolbox
    let toolbox = teamsBox.add(new Layer(Layer.VBox), { fill: [.34, 1.] });
    toolbox.add(new Button(new Rect, "<"), { fill: [1., .1] });
    toolbox.add(new Button(new Rect, ">"), { fill: [1., .1] });
    this.teams.spectators = toolbox.add(new ListBox(new Rect(0, 0, 0, teamsBox.rect.h - 64)), { fill: [1., .8] });

    // Right
    this.teams.right = teamsBox.add(new Table([["Right", 1.]]), { fill: [.33, 1.] });
    return this;
  }

  /**
   * Create user management panel
   * @private
   */
  _createUserPanel() {
    let hBox = this.add(new Layer(Layer.HBox, new Rect(0, 0, 0, 20)), { fill: [1., 0. ] });
    hBox.add(new Button(new Rect(0, 0, 64, 0), "Kick"), { fill: [0., 1.] });
    hBox.add(new Button(new Rect(0, 0, 64, 0), "Start"), { fill: [0., 1.] });
    return this;
  }

  /** @inheritdoc */
  init() {
    this
      ._createTeamsPanel()
      ._createUserPanel()
      .makeCloseable();
  }
};
