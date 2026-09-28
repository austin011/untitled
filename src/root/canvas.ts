import { Draw } from "./draw";

export class Canvas {
  public static Draw: Draw;

  public static width: number;
  public static height: number;

  public static forceUpdate = false;

  private canvas: HTMLCanvasElement;

  constructor(querySelector: string) {
    const app = document.querySelector(querySelector);

    if (!app) {
      throw new Error(
        "Selector passed to App is invalid: root element could not be found.",
      );
    }

    const canvas = document.createElement("canvas");

    this.canvas = canvas;
    this.canvas.style =
      "border:1px solid #ccc;box-sizing:border-box;display:block;";

    this.eventListeners();

    app.appendChild(this.canvas);

    Canvas.Draw = new Draw(canvas);
  }

  private eventListeners() {
    const onWindowResize = () => {
      const windowWidth = window.innerWidth;
      const virtualHeight = windowWidth / (16 / 9);

      this.canvas.width = windowWidth;
      this.canvas.height = virtualHeight;

      Canvas.width = windowWidth;
      Canvas.height = virtualHeight;

      Canvas.forceUpdate = true;
    };

    window.addEventListener("resize", onWindowResize);
    onWindowResize();
  }
}
