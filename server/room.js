"use strict";
const md5 = require("blueimp-md5")
    , _ = require("lodash");

const { Vec2, Circle } = require("../shared/math");

/**
 * Room body
 */
class Body extends Circle {
  constructor(x, y, r) {
    super(x, y, r);
    this.v = new Vec2;
  }
}

/**
 * Room class
 */
class Room {
  constructor(name, admin, password) {
    this.name = name;
    this.admin = admin;
    this.password = md5(password);

    this.ball = new Body(16, 16, 16);
    this.teams = {
      spectators: []
    };

    (Room.list = Room.List || []).push(this);
  }

  /**
   * Update physics in loop
   * @private
   */
  _updatePhysics() {
    this.cachedPlayers = _.chain(this.teams)
      .omit("spectators")
      .values()
      .flatten()
      .concat(this.ball)
      .value();
    console.log(this.cachedPlayers);
  }

  /**
   * Start/stop room loop
   */
  start() {
    this.physicsInterval = setInterval(this._updatePhysics.bind(this), 1000 / 30);
  }
  stop() {
    clearInterval(this.physicsInterval);
  }

  /**
   * Set player team
   * @param player    player
   * @param newTeam   New team
   * @returns {Room}
   */
  setTeam(player, newTeam) {
    console.assert(this.teams[newTeam], `Team ${newTeam} not exists!`);

    // Remove from old team
    player.team && _.remove(player.team, player);

    // Add to new team
    player.team = this.teams[newTeam];
    player.team.push(player);
    return this;
  }

  /**
   * Join to room
   * @param player
   * @returns {Room}
   */
  join(player) {
    player.socket.join(this.name);
    player.room = this;

    this.teams.spectators.push(player);
    return this;
  }

  /**
   * Return list of rooms
   * @returns {Array}
   */
  static headers() {
    return _.map(Room.list, room => {
      return {
          name: room.name
        , admin: room.admin.nick
        , password: this.password === ""
      };
    });
  }
}

/** Export modules */
module.exports = {
    Body: Body
  , Room: Room
};