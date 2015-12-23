import Canvas from "./engine/canvas";
import { State } from "./engine/object";
import { Button }  from "./ui/button";
import Sprite from "./engine/sprite";
import { Rect, Vec2 } from "./tools/math";
import Message from "./engine/message";

(() => {
  let layer =  new State();
  layer.init = function() {
    this.canvas.context.loadResource("tile", "assets/tile.png");
  };
  layer.add(new Button(new Rect(50, 50, 60, 20), "KLOCEK").addForwarder(Message.Type.MOUSE_CLICK, () => {
    console.log("E");
  }));
  new Canvas()
    .state("main", layer, true)
    .run();
})();
