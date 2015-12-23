import _ from "lodash";
import Canvas from "./engine/canvas";
import { State } from "./engine/object";
import { Button }  from "./ui/button";
import { Sprite } from "./engine/wrapper";
import { Rect, Vec2 } from "./tools/math";
import Message from "./engine/message";

(() => {
  let layer =  new State();
  layer.rect = new Rect(0, 0, 800, 400);
  layer.init = function() {
    this.canvas.context.loadResource("tile", "assets/tile.png");
  };
  layer
    .add(new Button(new Rect(50, 50, 60, 20), "Lewy dolny"), { align: new Vec2(1, 1) })
    .add(new Button(new Rect(50, 50, 60, 20), "1:1"), { align: new Vec2(0.5, 1) })
    .add(new Button(new Rect(50, 50, 60, 20), "Hax.js v.2.0"), { align: new Vec2(0.5, 0.5) })
    .add(new Button(new Rect(50, 50, 90, 20), "Prawy dolny"), { align: new Vec2(0, 1) });
  new Canvas()
    .state("main", layer, true)
    .run();
})();
