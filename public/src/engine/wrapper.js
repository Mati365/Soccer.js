import { Vec2, Rect } from "shared/math";
import Color from "shared/color";

import { Child } from "../engine/object";

/**
 * Simple sprite renderer
 */
export class Sprite extends Child {
  /**
   * @param rect        Rect coordinates
   * @param resourceId  Context's resource ID
   * @param totalTiles  (cols, rows) tiles
   */
  constructor(rect, resourceId, totalTiles=new Vec2(1, 1)) {
    super(rect);
    this.resourceId = resourceId;
    this.totalTiles = totalTiles;
    this.tileIndex = new Vec2;
  }

  /**
   * Render sprite
   * @param context   Canvas context object
   * @param tileIndex Tile index
   */
  draw(context, tileIndex=this.tileIndex) {
    let img = context.resources[this.resourceId];

    // Create cached tile size
    if(!this.tileSize)
      this.tileSize = new Vec2(
          img.naturalWidth / this.totalTiles.x
        , img.naturalHeight / this.totalTiles.y
      );

    // Render clipped tile
    context.ctx.drawImage(
        img
      , tileIndex.x * this.tileSize.x  /** CLIP X */
      , tileIndex.y * this.tileSize.y  /** CLIP Y */
      , this.tileSize.x /** CLIP WIDTH */
      , this.tileSize.y /** CLIP HEIGHT */
      , this.rect.x /** IMG X */
      , this.rect.y /** IMG Y */
      , this.rect.w /** IMG W */
      , this.rect.h /** IMG H */
    );
  }
}

export class Text extends Child {
  /**
   * @param rect  Rect coordinates
   * @param text  Text to render
   * @param color Text color
   */
  constructor(rect, text, color=Color.Hex.WHITE) {
    super(rect);
    this.text = text;
    this.color = color;
  }

  /** Get text width in pixels */
  get width() {
    return this.layer.canvas.context.textWidth(this.text);
  }

  /**
   * Render text
   * @param context   Canvas context object
   */
  draw(context) {
    context
      .fillWith(this.color)
      .setFontSize(this.rect.h)
      .drawText(this.text, this.rect);
  }
}