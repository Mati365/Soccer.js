import Canvas from "./engine/canvas";
import RoomList from "./states/rooms";
import Boot from "./states/boot";
import Board from "./states/board";

//import Client from "./multiplayer/client";
//let d = {
//    name: "debug room"
//  , pass: ""
//  , hidden: false
//  , players: 8
//};
//Client
//  .connect("localhost")
//  .then(Client.emit("setNick", "debug player"))
//  .then(Client.emit("createRoom", d))
//  .then(Client.emit("setTeam", { nick: "debug player", team: 2 }))
//  .then(Client.emit("roomStart"));

(() => {
  new Canvas()
    .state("main", Boot)
    .state("roomList", RoomList)
    .state("board", Board)
    .run();
})();
