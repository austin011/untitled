import { Canvas } from "../canvas";
import { Size } from "./size";
import { Vector } from "./vector";

export class Position {
  private relativeX: number;
  private relativeY: number;

  private position: Vector;

  constructor(x: number, y: number) {
    this.relativeX = x;
    this.relativeY = y;

    this.position = new Vector(this.calculateX(), this.calculateY());

    this.eventListeners();
  }

  private calculateX() {
    const { width } = Canvas;

    return width * (this.relativeX / 100);
  }

  private calculateY() {
    const { height } = Canvas;

    return height * (this.relativeY / 100);
  }

  private eventListeners() {
    window.addEventListener("resize", () => {
      this.position = new Vector(this.calculateX(), this.calculateY());
    });
  }

  public get x() {
    return this.position.x;
  }

  public get y() {
    return this.position.y;
  }

  public getPositionRelativeToSize(size: Size) {
    const { x, y } = this.position;

    const { x: width, y: height } = size;

    return new Vector(x - width / 2, y - height / 2);
  }
}
