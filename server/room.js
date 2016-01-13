"use strict";
const md5 = require("blueimp-md5")
    , io = require("socket.io")
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
  constructor(name, admin, maxPlayers, password, hidden) {
    this.name = name;
    this.admin = admin;
    this.maxPlayers = maxPlayers || 2;
    this.password =  md5(password);

    this.ball = new Body(16, 16, 16);
    this.teams = {
        spectators: []
      , left: []
      , right: []
    };

    // hide room in rooms list
    if(hidden !== true)
      (Room.list = Room.list || []).push(this);
  }

  /**
   * Get teams with players nicks
   */
  get teamsHeaders() {
    return _.mapValues(this.teams, _.partial(_.get, _, "nick"));
  }

  /**
   * Returns true if passwords matches
   * @param password  Password in plain text
   * @returns {boolean}
   */
  checkPassword(password) {
    return md5(password) === this.password;
  }

  /**
   * Returns true if server is full
   * @returns {boolean}
   */
  isFull() {
    return this.maxPlayers <= this.connected().length;
  }

  /**
   * Returns true is room is locked
   * @returns {boolean}
   */
  isLocked() {
    return this.password !== "d41d8cd98f00b204e9800998ecf8427e";
  }

  /**
   * Kick player from room
   * @param player  Player
   * @returns {Room}
   */
  kick(player) {
    player.socket
      .emit("kickFromRoom", "You are kicked!")
      .leave(this.name);
    player.room = null;
    return this;
  }

  /**
   * Get list of all players from all teams
   * @param omit  Omit team name
   * @returns Players
   */
  connected(omit) {
    return _.chain(this.teams)
      .omit(omit)
      .values()
      .flatten()
      .value();
  }

  /**
   * Destroy room
   */
  destroy() {
    _.each(this.connected(), this.kick.bind(this));
    _.remove(Room.list, this);
    return this;
  }

  /**
   * Update physics in loop
   * @private
   */
  _updatePhysics() {
    this.cachedPlayers = this.connected("spectators");
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
   * @param player  Player
   * @returns {Room}
   */
  join(player) {
    player.room = this;
    player.socket.join(this.name);

    this.teams.spectators.push(player);
    return this;
  }

  /**
   * Leave player from room
   * @param player  Player
   */
  leave(player) {
    // Slow but short
    _.each(this.teams, _.partial(_.remove, _, player));
    this.admin === player && this.destroy();
  }

  /**
   * Return list of rooms
   * @returns {Array}
   */
  static headers() {
    return _.map(Room.list, room => {
      return {
          name: room.name
        , password: room.isLocked() ? "yes" : "no"
        , players: _.flatten(this.player).length + "/" + room.maxPlayers
      };
    });
  }
}

/** Export modules */
module.exports = {
    Body: Body
  , Room: Room
};