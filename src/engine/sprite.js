import { Vec2, Rect } from "../tools/math";
import { Child } from "../engine/object";

export default class Sprite extends Child {
  /**
   * @param rect        Rect coordinates
   * @param resourceId  Context's resource ID
   * @param totalTiles  (cols, rows) tiles
   */
  constructor(rect, resourceId, totalTiles=new Vec2(1, 1)) {
    super(rect);
    this.resourceId = resourceId;
    this.totalTiles = tiles;
    this.tileIndex = new Vec2;
  }

  /**
   * Render sprite
   * @param ctx Canvas context
   */
  draw(ctx) {
    if(!this.cachedTiles) {

    }
    ctx.drawImage(this.layer.canvas.context.resources[this.resourceId], 10, 10);
  }
}