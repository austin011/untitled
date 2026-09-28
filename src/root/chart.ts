import { Vector } from "./lib/vector";
import { Draw } from "./draw";
import { renderable } from "./renderable";
import { Position } from "./lib/position";
import { Size } from "./lib/size";

export function chart() {
  const getNextPoint = (p: number) => {
    if (p === 0) {
      return 0.2;
    }

    return p * 1.1;
  };

  return renderable(
    {
      position: new Position(50, 50),
      size: new Size(30, 30),
      points: [0, 2, 5, 3, 8, 6, 6, 3, 1, 3],
    },
    {
      tick() {
        const points = this.store.get("points");
        const last = points[points.length];

        points.push(getNextPoint(last));

        this.store.set("points", points);
      },

      render() {
        Draw.shape({
          data: this.getData(),
          uid: "axis",
          draw: (data, { line }) => {
            line(new Vector(), new Vector(data.state.size.x));
            line(new Vector(), new Vector(0, data.state.size.y));

            const gap = data.state.size.x / 10;
            const points = data.state.points;

            // let last: Vector | null = null;

            // points.forEach((p, i) => {
            //   const to = new Vector(i * gap, p * gap);

            //   if (last) {
            //     line(last, to);
            //     last = to;
            //   } else {
            //     line(new Vector(), to);
            //     last = to;
            //   }
            // });

            //TODO: Fix me - draw line is not working as it should
            // notice the first line is drawing from (0,0) to p but the second seems to be drawing from (0, ymax) to p instead of (0,0)
            line(new Vector(), new Vector(gap, points[1] * gap));
            line(new Vector(), new Vector(gap, points[2] * gap));
          },
        });
      },
    },
  );
}
