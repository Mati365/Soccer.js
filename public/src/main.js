import Canvas from "./engine/canvas";
import Client from "./multiplayer/client";

import RoomList from "./states/rooms";

(() => {
  new Client();

  new Canvas()
    .state("main", new RoomList, true)
    .run();
})();
