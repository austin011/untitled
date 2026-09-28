import { Vector } from "./lib/vector";
import type { Methods, State, BaseGetData, GetData } from "./renderable/_class";

/**
 * Static methods for rendering specific elements in the game
 */
export class Draw {
  private static context: CanvasRenderingContext2D;
  private static canvas: HTMLCanvasElement;

  /**
   * TODO: Scale with the current size of the window
   * ex. < 768px (Draw.px = 2)
   *     < 1280px (Draw.px = 4)
   *     < infinity (Draw.px = 8)
   */
  private static px = 8;

  /**
   * Objects will contain the rendering data for elements on the page
   * and will store intermittent data of objects between renders when they
   * don't require a re-render.
   */
  private static cache: Record<string, HTMLCanvasElement> = {};

  // Current canvas to be rendered
  private static renderTarget: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    Draw.canvas = canvas;

    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Could not get canvas context in App");
    }

    Draw.context = context;
  }

  private static buildLocalCanvas(dimensions: Vector) {
    const canvas = document.createElement("canvas");

    // Draw.px pixels of padding
    canvas.width = dimensions.x + Draw.px;
    canvas.height = dimensions.y + Draw.px;

    canvas.style.overflow = "visible";

    Draw.renderTarget = canvas;
  }

  private static getLocalContext() {
    const targetContext = Draw.renderTarget.getContext("2d")!;

    targetContext.imageSmoothingEnabled = false;

    return targetContext;
  }

  private static drawLine(a: Vector, b: Vector, lineWidth = Draw.px) {
    if (!Draw.renderTarget) {
      Draw.buildLocalCanvas(
        new Vector(Math.abs(a.x - b.x), Math.abs(a.y - b.y) + Draw.px),
      );
    }

    /**
     *     Native:                   Restructured:
     *
     * ***************              ***************
     * * S           *              *           E *
     * *    *        *              *         *   *
     * *        *    *              *    *        *
     * *           E *              * S           *
     * ***************              ***************
     *
     *
     * Solution: context.translate AND context.scale
     */

    const { height } = Draw.renderTarget;
    const { x: x1, y: y1 } = a;
    const { x: x2, y: y2 } = b;

    /**
     * Offset is so that we account for the linestroke of lines that sit on x=0 or y=0, y = x
     */
    const offset = Draw.px / 2;

    const targetContext = Draw.getLocalContext();

    targetContext.translate(0, height);
    targetContext.scale(1, -1);

    targetContext.beginPath();

    targetContext.moveTo(x1 + offset, y1 + offset);
    targetContext.lineTo(x2 + offset, y2 + offset);

    targetContext.lineWidth = lineWidth;
    targetContext.lineCap = "round";
    targetContext.lineJoin = "round";

    targetContext.stroke();
  }

  public static shape<
    M extends Methods,
    S extends State,
    T extends BaseGetData<M, S>,
  >({
    data,
    uid,
    draw,
  }: {
    data: GetData<M, S, T>;
    uid: string;
    draw: (
      data: GetData<M, S, T>,
      methods: { line: typeof Draw.drawLine },
    ) => void;
  }) {
    if (data.outOfSync()) {
      console.log("Cache: ", this.cache);

      const positionRelativeToSize =
        data.state.position.getPositionRelativeToSize(data.state.size);

      /**
       * This solves the flicking issue
       * Since we force the rerender of the chart every second with tick,
       * we must show the cached version until it has been overwritten
       */
      if (Draw.cache[data.id]) {
        Draw.context.drawImage(
          Draw.cache[data.id],
          positionRelativeToSize.x,
          positionRelativeToSize.y,
        );
      }

      Draw.buildLocalCanvas(new Vector(data.state.size.x, data.state.size.y));

      draw(data, {
        line: this.drawLine,
      });

      Draw.cache[data.id] = Draw.renderTarget;
    } else {
      const positionRelativeToSize =
        data.state.position.getPositionRelativeToSize(data.state.size);

      Draw.context.drawImage(
        Draw.cache[data.id],
        positionRelativeToSize.x,
        positionRelativeToSize.y,
      );
    }
  }

  public static generateId() {
    let id = Date.now();

    while (Draw.cache[id]) {
      id++;
    }

    return id;
  }

  public static refresh() {
    Draw.context.clearRect(0, 0, Draw.canvas.width, Draw.canvas.height);
  }
}
