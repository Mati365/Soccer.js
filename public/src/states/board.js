import _ from "lodash";

import { Layer, State } from "../engine/object";
import { Rect, Vec2 } from "shared/math";

import { Sprite } from "../engine/wrapper";
import Popup from "../ui/popup";

import { Button } from "../ui/button";
import ListBox from "../ui/listbox";
import Table from "../ui/table";

import Message from "../engine/message";
import Client from "../multiplayer/client";

///** Only for debug */
let d = {
    name: "debug room"
  , pass: ""
  , hidden: false
  , players: 8
};
Client
  .emit("setNick", "debug player")
  .then(Client.emit("createRoom", d))
  .then(Client.emit("setTeam", { nick: "debug player", team: "left" }))
  .then(Client.emit("roomStart"));

/**
 * Core game state, it shows rooms gameplay
 * @class
 */
export default class Board extends State {
  constructor() {
    super(Layer.BorderBox);
  }

  /**
   * State resources
   */
  get assets() {
    return {
        'floor': "assets/floor.png"
      , 'player': "assets/player.png"
    };
  }

  /**
   * Get room listeners
   */
  get listeners() {
    let listeners = {};
    // Fetch all players from all teams
    listeners['roomSettings'] = data => {
      // Load teams
      _.each(this.settings.teams, (listBox, key) => listBox.setRows(data.teams[key] || []));

      // Get board list
      this.board = data.board;
    };

    // Fetch joining player
    listeners['roomPlayerJoin'] = data => {
      this.settings.teams[data.team].add(data.nick);
    };

    // Fetch leaving player
    listeners['roomPlayerLeave'] = data => {
      this.settings.teams[data.team].remove(data.nick);
    };

    // Kick from room
    listeners['roomKick'] = message => {
      Popup.confirm(this, message).then(() => {
        this.canvas.activeState = "roomList";
      });
    };

    // Get room changes
    listeners['roomUpdate'] = data => {
      if(this.projector)
        this.projector.children = _.chunk(new Float32Array(data), 6);
    };

    return listeners;
  }

  /** @inheritdoc */
  init() {
    //this.settings = this.showPopup(new Board.SettingsPopup);
    this.settings = new Board.SettingsPopup;

    // Renderer, it should be under UI!
    this.projector = this
      .add(new Board.IsometricProjector, { align: [0., 0.], fill: [1., 1.] });

    // UI buttons
    this
      .add(new Button(new Rect(0, 0, 100, 16), "Options"), { align: [1., 1.] })
      .addForwarder(Message.Type.MOUSE_CLICK, this.showPopup.bind(this, this.settings));
  }
};

/** Bind keyCode to direction */
Board.keyBindings = {
    87: [0, -1]  /** W */
  , 83: [0, 1] /** S */
  , 68: [1, 0] /** D */
  , 65: [-1, 0]  /** A */
};

/**
 * Render whole map
 * @class
 */
Board.IsometricProjector = class extends Layer {
  init() {
    this.eventForwarding = false;
  }

  /** @inherticdoc */
  draw(ctx) {
    // Layer 1: Players
    _.each(this.children, player => {
      ctx.drawImage("player", new Rect(
          player[0]
        , player[1]
        , player[2]
        , player[2]
      ));
    });
  }

  /** @inheritdoc */
  update() {
    // Merge multiple request to one by adding direction params
    let dir = new Vec2;
    _.each(Board.keyBindings, (direction, keyCode) => {
      this.canvas.pressedKeys[keyCode] && dir.add(direction);
    });

    // Send to server input
    if(dir.x || dir.y)
      Client.emit("move", dir);

    //// Update logic
    //_.each(this.children, child => {
    //  // todo: FPS in config
    //  let brake = ((1000 / 30) - Client.ping) / (1000 / 30);
    //
    //  child[0] += child[4];
    //  child[1] += child[5];
    //});
  }
};

/**
 * Settings popup showed after pressing right corner button
 * @class
 */
Board.SettingsPopup = class extends Popup {
  constructor() {
    super(Layer.VBox, new Rect(0, 0, 500, 300), "Room settings");
  }

  /**
   * Get selected player from teams listBoxes
   * @returns {Player}
   */
  get selectedPlayer() {
    return _
      .chain(this.teams)
      // Flatten listBox list
      .values()

      // Map listBox selected values and remove null
      .map(table => table.listbox.selected)
      .filter(element => element)

      // Get first from array
      .thru(_.partial(_.get, _, 0))
      .value();
  }

  /**
   * Move player to new team
   * @param next  Next team eg. 1 is next to current, -1 is previous team
   * @private
   */
  _changeTeam(next) {
    // It helps with getting previous and next element
    // 0: ["key", Table], ...
    let pairs = _.toPairs(this.teams);
    _.each(pairs, ([team, players], index)  => {
      let selected = players.listbox.selected
        , newTeam = pairs[index + next];

      // Move selected to other team
      if(selected && newTeam) {
        Client.emit("setTeam", {
            nick: selected
          , team: newTeam[0]
        });
        return false;
      }
    });
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

    toolbox
      .add(new Button(new Rect, "<"), { fill: [1., .1] })
      .addForwarder(Message.Type.MOUSE_CLICK, this._changeTeam.bind(this, -1));

    toolbox
      .add(new Button(new Rect, ">"), { fill: [1., .1] })
      .addForwarder(Message.Type.MOUSE_CLICK, this._changeTeam.bind(this, 1));

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
    hBox
      .add(new Button(new Rect(0, 0, 64, 0), "Kick"), { fill: [0., 1.] })
      .addForwarder(Message.Type.MOUSE_CLICK, () => {
        Client.emit("roomKick", this.selectedPlayer);
      });
    hBox
      .add(new Button(new Rect(0, 0, 64, 0), "Start"), { fill: [0., 1.] })
      .addForwarder(Message.Type.MOUSE_CLICK, _.partial(Client.emit, "roomStart", null));
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
