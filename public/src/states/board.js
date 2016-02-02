import _ from "lodash";

import { Layer, State } from "../engine/object";
import { Rect, Vec2 } from "shared/math";
import Color from "shared/color";

import { Sprite } from "../engine/wrapper";
import Popup from "../ui/popup";

import { Button } from "../ui/button";
import ListBox from "../ui/listbox";
import Table from "../ui/table";

import Message from "../engine/message";
import Client from "../multiplayer/client";

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
      tile: "assets/tile.png"
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
      this.projector.board.xywh = data.board;
      this.projector.goals = data.goals;
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
      .add(new Board.Projector, { align: [0., 0.], fill: [1., 1.] });

    // UI buttons
    this
      .add(new Button(new Rect(0, 0, 100, 16), "Exit"), { align: [0., 1.] });

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
Board.Projector = class extends Layer {
  init() {
    this.eventForwarding = false;

    this.tile = new Sprite(new Rect(0, 0, 16, 16), "tile", new Vec2(4, 1));
    this.board = new Rect;
  }

  /** @inherticdoc */
  draw(context) {
    let ctx = context.ctx;
    ctx.save();
    ctx.translate(this.rect.w / 2 - this.board.w / 2, 50);

    // Render board
    context
      .strokeWith(Color.Hex.DARK_GRAY)

      .strokeRect(this.board, 2)
      .strokeLine(new Vec2(this.board.w / 2, this.board.h), new Vec2(this.board.w / 2, 0), 2);

    // Render goals
    context.strokeWith(Color.Hex.WHITE);
    _.each(this.goals, goal => {
      let r = 20
        , w = 30  * goal.sign;

      ctx.beginPath();
      ctx.lineWidth = 2;

      // Top rounded border
      ctx.moveTo(goal.p1[0], goal.p1[1]);
      ctx.quadraticCurveTo(goal.p1[0] + w, goal.p1[1], goal.p1[0] + w, goal.p1[1] + r);

      // Line between
      ctx.moveTo(goal.p1[0] + w , goal.p1[1] + r);
      ctx.lineTo(goal.p2[0] + w , goal.p2[1] - r);

      // Bottom rounded border
      ctx.moveTo(goal.p2[0], goal.p2[1]);
      ctx.quadraticCurveTo(goal.p2[0] + w, goal.p2[1], goal.p2[0] + w, goal.p2[1] - r);

      ctx.stroke();

      // Draw circles
      context
        .strokeCircle(new Vec2(goal.p1[0], goal.p1[1]), 8).fill()
        .strokeCircle(new Vec2(goal.p2[0], goal.p2[1]), 8).fill();
    });

    // Render players
    _.each(this.children, (player, index) => {
      let isBall = player[3] & 0b100;

      // Position
      this.tile.rect.xy = player;
      this.tile.rect.w = this.tile.rect.h = player[2] * 2;

      // Render sprite
      this.tile.tileIndex.xy = [isBall ? 1 : (player[3] & 0b011), 0];
      this.tile.draw(context);

      // Draw index
      if(!isBall)
        context
          .fillWith(Color.Hex.WHITE)
          .drawText(index, new Vec2(this.tile.rect.x + player[2] - 5, this.tile.rect.y + this.tile.rect.h - 7));

      // Check flags
      let flags = player[3] >> 3 & 0b111;
      if(flags & 2)
        context
          .strokeWith("rgba(255, 255, 255, .35)")
          .strokeCircle(new Vec2(this.tile.rect.x + player[2], this.tile.rect.y + player[2]), player[2] + 6, 2);
    });

    // Render score
    if(this.goals) {
      let text = `${this.goals[0].score} : ${this.goals[2].score}`;
      context
        .fillWith(Color.Hex.WHITE)
        .setFontSize(60, "Score Font")
        .drawText(text, new Vec2(this.board.w / 2 - context.textWidth(text) / 2, -5));

      // Draw colors
      context
        .fillWith("#e20000")
        .fillRect(new Rect(0, -32, 38, 28))

        .fillWith("#4b71ff")
        .fillRect(new Rect(this.board.w - 38, -32, 38, 28));
    }
    ctx.restore();
  }

  /** @inheritdoc */
  onEvent(event) {
    if(!event.isKeyboardEvent())
      return;

    let flag = 0;
    switch(event.data) {
      /** Space */
      case 32: flag = 1 << 1; break;
    }

    // Add flag when key pressed, remove when released
    switch(event.type) {
      case Message.Type.KEY_DOWN: Client.emit("addFlag", flag);     break;
      case Message.Type.KEY_UP:   Client.emit("removeFlag", flag);  break;
    }
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
      Client.emit("move", dir.xy);
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
    _.each(this.teams, (table, index)  => {
      let selected = table.listbox.selected
        , newTeam = index + next;

      // Move selected to other team
      if(selected && this.teams[newTeam]) {
        Client.emit("setTeam", {
            nick: selected
          , team: newTeam
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
    this.teams = [];
    this.teams[0] = teamsBox.add(new Table([["Left", 1.0]]), { fill: [.33, 1.] });

    // Toolbox
    let toolbox = teamsBox.add(new Layer(Layer.VBox), { fill: [.34, 1.] });
    this.teams[1] = toolbox.add(new Table([["Spectators", 1.]]), { fill: [1., .7] });

    toolbox
      .add(new Button(new Rect, "<"), { fill: [1., .1] })
      .addForwarder(Message.Type.MOUSE_CLICK, this._changeTeam.bind(this, -1));

    toolbox
      .add(new Button(new Rect, ">"), { fill: [1., .1] })
      .addForwarder(Message.Type.MOUSE_CLICK, this._changeTeam.bind(this, 1));

    // Right
    this.teams[2] = teamsBox.add(new Table([["Right", 1.]]), { fill: [.33, 1.] });
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
