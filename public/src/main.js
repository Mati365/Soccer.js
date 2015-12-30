import Canvas from "./engine/canvas";
import RoomList from "./states/rooms";

(() => {
  new Canvas()
    .state("main", new RoomList, true)
    .run();
})();
