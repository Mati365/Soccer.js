import _ from "lodash";

import { Rect } from "shared/math";
import { Text } from "../engine/wrapper";
import { Layer } from "../engine/object";
import ListBox from "../ui/listbox";

/**
 * Table control
 * @class
 */
export default class Table extends Layer {
  constructor(headers, rect) {
    super(Layer.VBox, rect);
    this.init = () => {
      this
        ._setHeaders(headers)
        .setRows([]);
    };
  }

  /**
   * Clear all childs and add header row
   * @param headers Headers eg. [["DUPA", .2], ["KUPA", .3]]
   * @returns {Table}
   * @private
   */
  _setHeaders(headers) {
    this.header = super.add(new Layer(Layer.HBox, new Rect(0, 0, 0, 28)), { fill: [1.0, 0]});
    this.header.spacing = 0;

    // Add headers
    _.each(headers, ([title, size]) => {
      this.header.add(new Text(title, new Rect), { fill: [size, 1.0] });
    });

    // Size of columns
    this.columns = _.map(headers, value => value[1]);
    return this;
  }

  /**
   * Set rows data
   * @param rows  Rows data array
   * @returns {Table}
   */
  setRows(rows) {
    // Create listbox
    if(!this.listbox) {
      this.listbox = super.add(new ListBox, { fill: [1.0, .9] });

      //this.listbox.rect.h -= 28;
      this.header.rect.x += 5;
    }

    // Add every row to listbox
    _.each(rows, this.add.bind(this));
    return this;
  }

  /** @inheritdoc */
  clear() {
    this.listbox.clear();
    return this;
  }

  /**
   * Add row
   * @param values  Row value eg. ["val1", "val2"]
   * @override
   */
  add(values) {
    let row = this.listbox.add(new ListBox.Row);
    // Add each column to row
    _.each(values, (column, index) => {
      row.add(new ListBox.Item(column), { fill: [this.columns[index], .0] });
    });
    return row;
  }
}