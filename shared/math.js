"use strict";
const _ = require("lodash");

/**
 * Simple 2D Vector class
 */
class Vec2 {
  constructor(x, y) {
    this.x = x || .0;
    this.y = y || .0;

    /** Bind method */
    this.sub = _.partial(this.add, _, -1.0);
  }

  /** Make clone of object */
  clone() { return new Vec2(this.x, this.y); }

  /** Getters/Setters */
  set xy(xy) {
    this.x = xy[0];
    this.y = xy[1];
    return this;
  }
  get xy() {
    return [this.x, this.y];
  }

  /**
   * Add to Vector
   * @param vec     Vector to add
   * @param mul=1.0 Direction
   */
  add(vec, mul) {
    mul = mul || 1.0;
    if(_.isArray(vec)) {
      this.x += vec[0] * mul;
      this.y += vec[1] * mul;
    } else {
      this.x += vec.x * mul;
      this.y += vec.y * mul;
    }
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
class Rect extends Vec2 {
  constructor(x, y, w, h) {
    super(x, y);

    this.w = w || .0;
    this.h = h || .0;
  }

  /** Make clone of object */
  clone() { return new Rect(this.x, this.y, this.w, this.h ); }

  /** Getters/Setters */
  set wh(wh) {
    this.w = wh[0];
    this.h = wh[1];
    return this;
  }
  get wh() {
    return [this.w, this.h];
  }

  /**
   * Remove border
   * @param border  Border size
   */
  borderReduce(border) {
    this.x += border; this.y += border;
    this.w -= border * 2; this.h -= border * 2;
    return this;
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
    return rect.x > this.x
      && rect.x + (rect.w || 0) < this.x + this.w
      && rect.y > this.y
      && rect.y + (rect.h || 0) < this.y + this.h;
  }
}

/**
 *
 */
class Circle extends Vec2 {
  constructor(x, y, r) {
    super(x, y);
    this.r = r || .0;
  }

  /**
   * Get distance between circles
   * @param circle  Circle
   * @returns {number}
   */
  distance(circle) {
    let x = this.x - circle.x
      , y = this.y - circle.y;
    return Math.sqrt(x*x + y*y);
  }

  /**
   * Returns true if circles intersects
   * @param circle  Circle
   * @returns {boolean}
   */
  intersect(circle) {
    return this.distance(circle) < circle.r + this.r;
  }
}

/** Export modules */
module.exports = {
    Vec2: Vec2
  , Rect: Rect
  , Circle: Circle
};