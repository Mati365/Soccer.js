import Canvas from "./engine/canvas";
import RoomList from "./states/rooms";
import Boot from "./states/boot";
import Board from "./states/board";

(() => {
  new Canvas()
    .state("main", Boot)
    .state("roomList", RoomList)
    .state("board", Board)
    .run();
})();
