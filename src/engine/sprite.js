import Rect from "../tools/math";

export default class Sprite extends Rect {
  /**
   * @param resourceId  Context's resource ID
   * @param cords       Rect coordinates
   */
  constructor(resourceId, ...cords) {
    super.call(this, cords);

    this.resourceId = resourceId;
  }

  /**
   * Render sprite
   * @param ctx Canvas context
   */
  draw(ctx) {
    console.log(ctx.resources);
  }
}