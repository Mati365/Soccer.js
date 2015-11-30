import _ from "lodash";

/**
 * Simple 2D Vector class
 */
export default class Vec2 {
  constructor(x=0.0, y=0.0) {
    this.x = x;
    this.y = y;

    /** Bind method */
    this.sub = _.partial(this.add, _, -1.0);
  }

  /** Getters/Setters */
  set xy([x, y]) {
    this.x = x;
    this.y = y;
    return this;
  }
  get xy() {
    return [this.x, this.y]
  }

  /**
   * Add to Vector
   * @param {Vec2}    vec     Vector to add
   * @param {number}  mul=1.0 Directrion
   */
  add(vec, mul=1.0) {
    this.x += vec.x * mul;
    this.y += vec.y * mul;
    return this;
  }

  /**
   * Mul by Vector
   * @param  {Vec2} vec Vector to multiplayer
   */
  mul(vec) {
    if(vec instanceof Vec2) {
      this.x *= vec.x;
      this.y *= vec.y;
    } else {
      this.x *= vec;
      this.y *= vec;
    }
    return this;
  }

  /**
   * Get length of Vector
   */
  get length() {
    return Math.sqrt(this.dot);
  }

  /**
   * Dot product of vector
   */
  get dot() {
    return this.x*this.x + this.y*this.y
  }

  /**
   * Normalize vector
   * @return {Vec2} Normalized vector
   */
  normalize() {
    let len = this.length;
    return new Vec2(
        this.x / len
      , this.y / len
    );
  }

  /**
   * Compare vectors
   * @param  {Vec2} vector Vector
   * @return {Bool}        True if equals
   */
  equals(vector) {
    return vector.x === this.x && vector.y === this.y;
  }
};
