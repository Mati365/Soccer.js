import _ from "lodash";

import { Layer, State } from "../engine/object";
import { Rect } from "shared/math";

import { Sprite } from "../engine/wrapper";
import Popup from "../ui/popup";

import { Button } from "../ui/button";
import ListBox from "../ui/listbox";
import Table from "../ui/table";

import Message from "../engine/message";
import Client from "../multiplayer/client";

/**
 * Load room data
 * @class
 */
export default class Board extends State {
  constructor() {
    super(Layer.BorderBox);
  }

  /**
   * Get room listeners
   */
  get listeners() {
    let listeners = {};
    // Fetch all players from all teams
    listeners['roomPlayerList'] = data => {
      _.each(data, (players, team) => this.settings.teams[team].setRows(players));
    };

    // Fetch joining player
    listeners['roomPlayerJoin'] = data => {
      this.settings.teams[data.team].add(data.nick);
    };
    return listeners;
  }

  /** @inheritdoc */
  init() {
    this.settings = this.showPopup(new Board.SettingsPopup);
    this
      .add(new Button(new Rect(0, 0, 100, 16), "Options"), { align: [1., 1.] })
      .addForwarder(Message.Type.MOUSE_CLICK, this.showPopup.bind(this, this.settings));
  }
};

Board.SettingsPopup = class extends Popup {
  constructor() {
    super(Layer.VBox, new Rect(0, 0, 500, 300), "Room settings");
  }

  /**
   * Create teams panel
   * @private
   */
  _createTeamsPanel() {
    let teamsBox = this.add(new Layer(Layer.HBox, new Rect(0, 0, 0, 200)), { fill: [1., .0] });

    // Left
    this.teams = {};
    this.teams.left = teamsBox.add(new Table([["Left", 1.0]]), { fill: [.33, 1.] });

    // Toolbox
    let toolbox = teamsBox.add(new Layer(Layer.VBox), { fill: [.34, 1.] });
    this.teams.spectators = toolbox.add(new Table([["Spectators", 1.]]), { fill: [1., .7] });

    // Move player to other team
    let movePlayer = side => {
      // It helps with getting previous and next element
      // 0: ["key", Table], ...
      let pairs = _.toPairs(this.teams);
      _.each(pairs, ([team, players], index)  => {
        let selected = players.listbox.selected
          , newTeam = pairs[index + side];
        if(selected && newTeam) {
          Client.emit("setTeam", {
              nick: selected
            , team: newTeam[0]
          });
          return false;
        }
      });
    };
    toolbox
      .add(new Button(new Rect, "<"), { fill: [1., .1] })
      .addForwarder(Message.Type.MOUSE_CLICK, _.partial(movePlayer, -1));

    toolbox
      .add(new Button(new Rect, ">"), { fill: [1., .1] })
      .addForwarder(Message.Type.MOUSE_CLICK, _.partial(movePlayer, 1));

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
