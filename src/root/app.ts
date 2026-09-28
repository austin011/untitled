import { Canvas } from "./canvas";
import { chart } from "./chart";
import { Draw } from "./draw";
import type { Renderable } from "./renderable/_class";

export const config = {
  fps: 60,
  //frameTime: 1000 / fps(),
};

type Interval = "second";
type TimingInterval = {
  __root__: number;
} & Record<Interval, Record<string, () => void>>;

export class App {
  private chart: ReturnType<typeof chart>;

  public static time = 0;
  private tick = 0;

  static Canvas: Canvas;

  private static timingIntervals: TimingInterval = {
    __root__: -1,
    second: {},
  };

  constructor(querySelector: string) {
    App.Canvas = new Canvas(querySelector);

    this.chart = chart();

    requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
  }

  private gameLoop(timestamp: number) {
    const frameTime = 1000 / config.fps;

    if (timestamp - App.time >= frameTime) {
      this.render();
      App.time = timestamp;
    }

    requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
  }

  private static startEventPropogation() {
    this.timingIntervals.__root__ = setInterval(() => {
      Object.keys(this.timingIntervals.second).forEach((key) => {
        this.timingIntervals.second[key]();
      });
    }, 1000);
  }

  //TODO: finish this
  public static addEventListener({
    id,
    interval,
    fn,
  }: {
    id: string;
    interval: Interval;
    fn: () => void;
  }) {
    this.timingIntervals[interval][id] = fn;
  }

  private render() {
    if (App.timingIntervals.__root__ === -1) {
      App.startEventPropogation();
    }

    this.tick++;

    Draw.refresh();

    this.chart.actions.use("render");

    if (Canvas.forceUpdate) {
      Canvas.forceUpdate = false;
    }
  }
}
