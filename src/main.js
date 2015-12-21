import Canvas from "./engine/canvas";
import { State } from "./engine/state";

(() => {
  let layer =  new State();
  layer.add({
    draw: function(ctx) {

    }
  });
  new Canvas()
    .state("main", layer, true)
    .run();
})();
