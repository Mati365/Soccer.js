"use strict";
const md5 = require("blueimp-md5")
    , _ = require("lodash");

const { Vec2, Circle } = require("../shared/math")
    , io = require("./server");

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
    this.maxPlayers = maxPlayers || 2;
    this.password =  md5(password);

    // Players
    this.teams = {
        spectators: []
      , left: []
      , right: []
    };
    this.admin = this.join(admin);

    // Ball is separated object
    this.ball = new Body(16, 16, 16);

    // hide room in rooms list
    if(hidden !== true)
      (Room.list = Room.list || []).push(this);
  }

  /**
   * Get teams with players nicks
   */
  get teamsHeaders() {
    return _.mapValues(this.teams, _.partial(_.map, _, "nick"));
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
    // Remove from old team
    player.team && _.remove(player.team, player);

    // Add to new team
    player.team = this.teams[newTeam || "spectators"];
    player.team.push(player);

    // Reload teams
    newTeam && this._reloadTeams();
    return this;
  }

  /**
   * Broadcast to all sockets connected to room
   * @param arguments Broadcast arguments
   * @returns {Room}
   */
  broadcast() {
    let obj = io.sockets.in(this.name);
    obj && obj.emit.apply(obj, arguments);
    return this;
  }

  /**
   * Send list players teams
   * @param socket  Socket
   * @returns {Room}
   * @private
   */
  _reloadTeams(socket) {
    (socket ? socket.emit.bind(socket) : this.broadcast.bind(this))("roomPlayerList", this.teamsHeaders);
    return this;
  }

  /**
   * Join to room
   * @param player  Player
   * @returns {Room}
   */
  join(player) {
    // Adding to list
    player.room = this;
    player.socket.join(this.name);
    this.setTeam(player);

    // Broadcast to except player
    player.socket.broadcast.to(this.name).emit("roomPlayerJoin", {
        team: "spectators"
      , nick: player.nick
    });

    // Send list of players to player
    this._reloadTeams(player.socket);
    return player;
  }

  /**
   * Leave player from room
   * @param player  Player
   * @returns {Room}
   */
  leave(player) {
    if(!player.team)
      return;

    this.broadcast("roomPlayerLeave", {
        team: _.findKey(player.team)
      , nick: player.nick
    });

    _.remove(player.team, player);
    this.admin === player && this.destroy();
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