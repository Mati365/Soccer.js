import Canvas from "./engine/canvas";
import { State } from "./engine/object";
import { Control } from "./ui/control";
import Sprite from "./engine/sprite";
import { Rect } from "./tools/math";

(() => {
  let layer =  new State();
  layer.init = function() {
    this.canvas.context.loadResource("tile", "assets/tile.png");
  };
  layer.add(new Sprite(new Rect(50, 50, 100, 40), "tile"));
  new Canvas()
    .state("main", layer, true)
    .run();
})();
