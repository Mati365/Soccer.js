import Canvas from "./engine/canvas";
import RoomList from "./states/rooms";
import Boot from "./states/boot";
import Board from "./states/board";

(() => {
  new Canvas()
    .state("main", new Boot, true)
    .state("roomList", new RoomList)
    .state("board", new Board)
    .run();
})();
