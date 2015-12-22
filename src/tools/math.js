import _ from "lodash";

/**
 * Simple 2D Vector class
 */
export class Vec2 {
  constructor(x=0.0, y=0.0) {
    this.x = x;
    this.y = y;

    /** Bind method */
    this.sub = _.partial(this.add, _, -1.0);
  }

  /** Getters/Setters */
  set xy(xy) {
    this.x = xy[0];
    this.y = xy[1];
    return this;
  }
  get xy() {
    return [this.x, this.y]
  }

  /**
   * Add to Vector
   * @param vec     Vector to add
   * @param mul=1.0 Direction
   */
  add(vec, mul=1.0) {
    this.x += vec.x * mul;
    this.y += vec.y * mul;
    return this;
  }

  /**
   * Mul by Vector
   * @param vec Vector to multi-player
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
   * @return  Normalized vector
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
   * @param   vector Vector
   * @return  True if equals
   */
  equals(vector) {
    return vector.x === this.x && vector.y === this.y;
  }
}

/**
 * Simple 2D Rectangle class
 */
export class Rect extends Vec2 {
  constructor(x=0.0, y=0.0, w=0.0, h=0.0) {
    super(x, y);

    this.w = w;
    this.h = h;
  }

  /**
   * Compare rectangles
   * @param   rect Rectangle
   *
   * @return  True if equals
   */
  equals(rect) {
    return super.equals(rect)
      && this.w === rect.w
      && this.h === rect.h;
  }

  /**
   * Check if rectangles are intersecting
   *
   * @param rect  Rectangle
   * @return True if intersect
   */
  intersect(rect) {
    return rect.x + rect.w >= this.x
      && rect.x <= this.x + this.w
      && rect.y + rect.h >= this.y
      && rect.y <= this.y + this.h;
  }

  /**
   * Check if rectangle contains rectangle
   *
   * @param rect  Rectangle
   * @return True if contains
   */
  contains(rect) {
    return rect.x >= this.x
      && rect.x + (rect.w || 0) <= this.x + this.w
      && rect.y >= this.y
      && rect.y + (rect.h || 0) <= this.y + this.h;
  }
}
