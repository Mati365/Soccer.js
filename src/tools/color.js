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
   * Inverse color
   * @returns {Color}
   */
  inverse() {
    return new Color(
        255 - this.r
      , 255 - this.g
      , 255 - this.b
    );
  }

  /**
   * Mix color with other color
   * @param color Color to mix with
   * @param scale Mixing scale
   * @returns {Color}
   */
  mix(color, scale=1.0) {
    this.r = (this.r + color.r * scale) / 2.0;
    this.g = (this.g + color.g * scale) / 2.0;
    this.b = (this.b + color.b * scale) / 2.0;
    return this;
  }

  /**
   * Get color from hex string
   * @param hex Hex
   * @return Color
   */
  static parseHex(hex) {
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