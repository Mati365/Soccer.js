import _ from "lodash";
import Canvas from "./engine/canvas";
import { State, Layer } from "./engine/object";
import { Button, Radio }  from "./ui/button";
import Progressbar from "./ui/progressbar";

import { Sprite } from "./engine/wrapper";
import { Rect, Vec2 } from "./tools/math";
import Message from "./engine/message";

(() => {
  let layer =  new State();
  layer.rect = new Rect(0, 0, 800, 400);
  layer.init = function() {
    this.canvas.context.loadResource("tile", "assets/tile.png");
  };

  let shitContainer = new Layer(new Rect(90, 90, 100, 100));
  shitContainer.layout = Layer.VBox;

  layer
    .add(shitContainer)
    .add(new Progressbar(new Rect(0, 30, 200, 20), 0.5), { align: new Vec2(0, 1.0) })
    .add(new Radio(new Rect(50, 50, 16, 16), "Lewy gorny").addForwarder(Message.Type.MOUSE_CLICK, function() {
      if(this.checked);
        shitContainer.add(new Button(new Rect(0, 0, 100, 20), "GUNWO"));
    }), { align: new Vec2(0.3, 0.3) });
  new Canvas()
    .state("main", layer, true)
    .run();
})();
