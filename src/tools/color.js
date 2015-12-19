/**
 * Color class
 */
export default class Color {
  constructor(r, g, b, a=1.0) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }

  /** Get CSS value */
  get css() {
    return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
  }

  /**
   * Get color from hex string
   * @param hex Hex
   * @return Color
   */
  static hexColor(hex) {
    let result = hex.match(/([\da-fA-F]{2})/g);
    return new Color(
        parseInt(result[0], 16)
      , parseInt(result[1], 16)
      , parseInt(result[2], 16)
    );
  }
}

/** Colors table */
Color.Hex = {
    BLACK: "#000000"
  , WHITE: "#FFFFFF"
  , RED: "#FF0000"
  , GREEN: "#00FF00"
  , BLUE: "#0000FF"
};