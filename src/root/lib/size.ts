import { Canvas } from "../canvas";
import { Vector } from "./vector";

export class Size {
  private relativeX: number;
  private relativeY: number;

  private size: Vector;

  constructor(x: number, y: number) {
    this.relativeX = x;
    this.relativeY = y;

    this.size = new Vector(this.calculateX(), this.calculateY());

    this.eventListeners();
  }

  public get x() {
    return this.size.x;
  }

  public get y() {
    return this.size.y;
  }

  private calculateX() {
    const { width } = Canvas;

    return (this.relativeX / 100) * width;
  }

  private calculateY() {
    const { width } = Canvas;

    return (this.relativeY / 100) * width;
  }

  private eventListeners() {
    window.addEventListener("resize", () => {
      this.size = new Vector(this.calculateX(), this.calculateY());
    });
  }
}
