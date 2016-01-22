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
    this.padding.xy = [0, 0];

    // Initialise table
    this.init = () => {
      // List of headers
      this.header = super.add(new Layer(Layer.HBox, new Rect(0, 0, 0, 16)), { fill: [1.0, 0] });

      // ListBox with ScrollBar
      this.listbox = super.add(new ListBox, { fill: [1.0, .9] });
      this
        .setHeaders(headers)
        .setRows([]);
    };
  }

  /**
   * Clear all childs and add header row
   * @param headers Headers eg. [["DUPA", .2], ["KUPA", .3]]
   * @returns {Table}
   */
  setHeaders(headers) {
    this.header.clear();

    // Add headers
    _.each(headers, ([title, size]) => {
      this.header.add(new Text(new Rect, title), { fill: [size, 1.0] });
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
    this.clear();

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
    _.each(
        this.header.children.length === 1 ? [values] : values
      , (column, index) => {
        row.add(new ListBox.Item(column), { fill: [this.columns[index], 1.0] });
      });
    return row;
  }

  /**
   * Remove element from list, if text remove child with text column
   * @param obj
   * @return {Row}
   */
  remove(obj) {
    if(_.isString(obj))
      obj = _.filter(this.listbox.children, child => {
        return child.children[0].text == obj;
      })[0];

    return this.listbox.remove(obj);
  }
}