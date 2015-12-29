import _ from "lodash";

import { Vec2, Rect } from "shared/math";
import { Layer, State } from "../engine/object";
import ListBox from "../ui/listbox";

export default class RoomList extends State {
  constructor() {
    super();
    this.randomData = [
        { name: "Pokoj jakis bla bla", admin: "Mati", pass: false }
      , { name: "Pokoj 2", admin: "Debil", pass: true }
      , { name: "Lubie dzem", admin: "Klocuch12", pass: false }
    ];
  }

  init() {
    let listBox = new ListBox(new Rect(5, 5, this.rect.w - 10, this.rect.h / 2));
    _.each(this.randomData, data => {
      let rowLayer = new ListBox.Row;
      listBox.add(rowLayer);

      _.each(data, column => {
        rowLayer.add(new ListBox.Item(column), { fill: new Vec2(.20, .0) });
      });
    });
    this.add(listBox);
  }
};