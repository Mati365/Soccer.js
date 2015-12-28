import _ from "lodash";

import { Rect, Vec2 } from "shared/math";
import Canvas from "./engine/canvas";

import { State, Layer } from "./engine/object";
import { Button, Radio }  from "./ui/button";
import ListBox from "./ui/listbox";
import Progressbar from "./ui/progressbar";

import { Text, Sprite } from "./engine/wrapper";
import Message from "./engine/message";
import Client from "./multiplayer/client";

(() => {
  let layer =  new State(Layer.VBox, new Rect(5, 5, 755, 355));
  layer.spacing = 10;
  layer.init = function() {
    //this.canvas.context.loadResource("tile", "assets/tile.png");
  };

  let move = function(src, destination) {
    let selected = src.selected;
    _.each(selected, item => {
      src.remove(item);
      destination.add(item);
      item.checked = false;
    });
  };

  let list1 = new ListBox(new Rect(0, 0, 150, 150))
    , list2 = new ListBox(new Rect(0, 0, 150, 150));

  list1
    .add(new ListBox.Item("User1"))
    .add(new ListBox.Item("User2"))
    .add(new ListBox.Item("User3"))
    .add(new ListBox.Item("User4"));

  let toolbar = new Layer(Layer.VBox, new Rect(0, 0, 60, 0));
  toolbar
    .add(new Button(new Rect(0, 0, 60, 20), "Right").addForwarder(Message.Type.MOUSE_CLICK, _.partial(move, list1, list2)))
    .add(new Button(new Rect(0, 0, 60, 20), "Left").addForwarder(Message.Type.MOUSE_CLICK, _.partial(move, list2, list1)));

  let vbox = new Layer(Layer.HBox, new Rect(5, 5, 0, 0));
  vbox
    .add(list1)
    .add(toolbar)
    .add(list2);

  layer
    .add(new Text(new Rect(0, 0, 100, 20), "Player list:", "#FF0000"))
    .add(vbox);

  new Client();

  new Canvas()
    .state("main", layer, true)
    .run();
})();
