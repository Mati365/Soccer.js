"use strict";
const md5 = require("blueimp-md5")
    , _ = require("lodash");

const { Vec2, Circle, Rect } = require("../shared/math")
    , io = require("./server");

/**
 * Body showed on board
 * @class
 */
class BoardBody {
  constructor(room, circle, v) {
    this.circle = circle;
    this.v = v || new Vec2;
    this.room = room;
  }
}

/**
 * Room class
 * @class
 */
class Room {
  constructor(name, admin, maxPlayers, password, hidden) {
    this.name = name;
    this.maxPlayers = maxPlayers || 2;
    this.password =  md5(password);

    // Ball is separated object
    // todo: Vertical gates
    this.board = new Rect(0, 0, 500, 250);
    this.goals = {
        0: {size: 30, sign: -1, p1: [0, 40], p2: [0, 190], score: 0}
      , 2: {size: 30, sign: 1, p1: [500, 40], p2: [500, 190], score: 0}
    };

    // Players
    this.players = [];
    this.admin = this.join(admin);

    // hide room in rooms list
    if(hidden !== true)
      (Room.list = Room.list || []).push(this);
  }

  /**
   * Get teams with players nicks
   */
  get teamsHeaders() {
    return _
      .chain(this.players)
      .groupBy("team")
      .mapValues(_.partial(_.map, _, "nick"))
      .value();
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
    return this.maxPlayers <= this.players.length;
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
    if(!player)
      return;

    player.socket.emit("roomKick", "You are kicked!");
    this.leave(player);
    return this;
  }

  /**
   * Get list of all players from all teams without omit
   * @param omit  Omit team name
   * @returns Players
   */
  omitTeam(omit) {
    return _.filter(this.players, player => player.team !== omit);
  }

  /**
   * Destroy room
   */
  destroy() {
    // Stop interval
    this.stop();

    // Kick all players ;)
    _.each(this.players, this.kick.bind(this));
    _.remove(Room.list, this);
    return this;
  }

  /**
   * Check room collisions
   * @param players Players array
   * @param index   Player index
   * @private
   */
  static checkCollisions(players, index) {
    let p1 = players[index].body
      , c1 = p1.circle.center;

    for (let i = 0; i < players.length; ++i) {
      if(i === index)
        continue;

      // Get center of circle
      let p2 = players[i].body
        , c2 = p2.circle.center;

      // If the circles are colliding
      if(p1.circle.intersect(p2.circle)) {
        let dist = p2.circle.distance(p1.circle)
          , vx = (c2.x - c1.x) / dist
          , vy = (c2.y - c1.y) / dist;

        // Kick if it's the ball
        if(i === players.length - 1 && players[index].flags & 2) {
          vx *= 8;
          vy *= 8;
        }

        // Add to velocity vector
        p2.v.x += vx;
        p2.v.y += vy;
        //p2.circle.add(p2.v);
      }
    }
  }

  /**
   * Broadcast goal and add score to team
   * @param team  Team index
   * @returns {Room}
   * @private
   */
  _addGoal(team) {
    this.goals[team].score++;
    this
      .broadcast("roomScore", _.mapValues(this.goals, "score"))
      .start();
    return this;
  }

  /**
   * Update physics in loop
   * @private
   */
  _updatePhysics() {
    let cachedPlayers = this.omitTeam(Room.Teams.SPECTATORS);
    cachedPlayers.push(...[
      this.ball
    ]);

    // Socket data [x, y, r, flag, v.x, v.y]
    let packSize = 6
      , socketData = new Float32Array(cachedPlayers.length * packSize);

    _.each(cachedPlayers, (player, index) => {
      let circle = player.body.circle
        , v = player.body.v
        , isBall = index === cachedPlayers.length - 1;

      // Check collisions without ball
      if(!isBall)
        Room.checkCollisions(cachedPlayers, index);

      // Check collisions with borders
      if(isBall && !this.board.contains(circle)) {
        // Create colliding box for each goal and check
        let collidingGoal = _.findKey(this.goals, goal => {
          let rect = new Rect(
              goal.p1[0] - goal.size + (goal.sign === -1 && circle.r * 2)
            , goal.p1[1] + goal.size
            , goal.p2[0] - goal.p1[0] + goal.size
            , goal.p2[1] - goal.p1[1] - goal.size * 2
          );
          return rect.intersect(circle);
        });
        if(collidingGoal) {
          this._addGoal(collidingGoal);
          return false;
        } else
          v.mul(-1);
      }

      // Update physics
      circle.add(v);
      v.xy = [v.x * .95, v.y * .95];

      // Data structure: 0FFFFBRR
      let flags =
          player.team
        | (index === cachedPlayers.length - 1 && 1 << 2)
        | player.flags << 3;

      socketData.set([
        /** position */
          circle.x
        , circle.y
        , circle.r
        , flags /** todo: More flags */

        /** velocity */
        , v.x
        , v.y
      ], index * packSize)
    });

    // Broadcast
    this.broadcast("roomUpdate", socketData.buffer);
  }

  /**
   * Start/stop room loop
   */
  start() {
    // Set ball
    this.ball = {
      body: new BoardBody(this, new Circle(this.board.w / 2 - 5, this.board.h / 2 - 5, 10))
    };

    // Start interval
    this.physicsInterval && this.stop();
    this.physicsInterval = setInterval(this._updatePhysics.bind(this), 1000 / 60);
  }
  stop() {
    clearInterval(this.physicsInterval);
  }

  /**
   * Set player team
   * @param player    Player
   * @param newTeam   New team
   * @returns {Room}
   */
  setTeam(player, newTeam) {
    // Create new body
    _.assign(player, {
        team: newTeam
      , body: new BoardBody(this, new Circle(60, 60, 13))
    });

    this
      ._alignOnBoard(player)
      ._broadcastSettings();
    return this;
  }

  /**
   * Set player position on board
   * @param player  Player
   * @returns {Room}
   */
  _alignOnBoard(player) {
    if(this.board.w > this.board.h) {

    } else {

    }
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
   * Send room settings to all player socket
   * @param socket  Socket
   * @returns {Room}
   * @private
   */
  _broadcastSettings(socket) {
    let data = {
        teams: this.teamsHeaders
      , board: this.board.xywh
      , goals: this.goals
    };
    (socket ? socket.emit.bind(socket) : this.broadcast.bind(this))("roomSettings", data);
    return this;
  }

  /**
   * Join to room
   * @param player  Player
   * @returns {Room}
   */
  join(player) {
    // Adding to list
    _.assign(player, {
        team: Room.Teams.SPECTATORS
      , room: this
    });

    // Join socket
    player.socket.join(this.name);
    this.players.push(player);

    // Broadcast to except player
    player.socket.broadcast
      .to(this.name)
      .emit("roomPlayerJoin", _.pick(player, ["nick", "team"]));

    // Send list of players to player
    this._broadcastSettings(player.socket);
    return player;
  }

  /**
   * Leave player from room
   * @param player  Player
   * @returns {Room}
   */
  leave(player) {
    if(!player)
      return;

    // Leave
    player.socket.leave(this.name);
    this.broadcast("roomPlayerLeave", _.pick(player, "team", "nick"));

    // Reset variables for future room
    player.room = player.team = player.body = null;

    _.remove(this.players, player);
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
        , players: room.players.length + "/" + room.maxPlayers
      };
    });
  }
}

/** Team codes */
Room.Teams = {
    LEFT: 0
  , SPECTATORS: 1
  , RIGHT: 2
};

/** Export modules */
module.exports = {
  Room: Room
};