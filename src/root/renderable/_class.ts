import { Canvas } from "../canvas";
import { Draw } from "../draw";
import type { Position } from "../lib/position";
import type { Size } from "../lib/size";

export type BaseGetData<M extends Methods, T extends State> = ReturnType<
  Renderable<M, T>["getData"]
>;

export type GetData<
  M extends Methods,
  S extends State,
  T extends BaseGetData<M, S>,
> = T;

export type State = Record<string, unknown> &
  RenderableConstructorValuesBaseProps;

type KeyOfState<S extends State> = keyof S;
type ValueOfState<S extends State, K extends KeyOfState<S>> = S[K];

type RenderableConstructorValuesBaseProps = {
  position: Position;
  size: Size;
};

export type RenderableConstructorValueProp<S extends State> =
  RenderableConstructorValuesBaseProps & S;

export type Methods = Record<string, (...args: any[]) => any> &
  RenderableConstructorMethodsBaseProps;

type KeyOfMethods<M extends Methods> = keyof RenderableConstructorMethodProp<M>;

type ValueOfMethod<M extends Methods, K extends KeyOfMethods<M>> = Parameters<
  RenderableConstructorMethodProp<M>[K]
>;

type RenderableConstructorMethodsBaseProps = {
  render: () => void;
};

export type RenderableConstructorMethodProp<M extends Methods> =
  RenderableConstructorMethodsBaseProps & M;

function _clone<T>(value: T): T {
  if (value === null || typeof value !== "object") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(_clone) as T;
  }

  const result = Object.create(Object.getPrototypeOf(value));

  for (const key of Reflect.ownKeys(value)) {
    result[key] = _clone((value as any)[key]);
  }

  return result;
}

export class Renderable<M extends Methods, S extends State> {
  protected id: number;
  protected hasUpdated = true;

  protected state: RenderableConstructorValueProp<S>;

  protected methods: M;

  public store = {
    get: <K extends KeyOfState<RenderableConstructorValueProp<S>>>(
      key: K,
    ): S[K] => {
      //return a temporary clone of the state value (to hopefully get disposed of) :) (sadness)
      return _clone(this.state[key]);
    },
    set: <K extends KeyOfState<RenderableConstructorValueProp<S>>>(
      key: K,
      value: ValueOfState<RenderableConstructorValueProp<S>, K>,
    ) => {
      this.state[key] = value;
      //TODO update hasUpdated
    },
  };

  public actions = {
    use: <K extends KeyOfMethods<M>>(
      key: K,
      ...props: ValueOfMethod<M, K>
    ): ReturnType<RenderableConstructorMethodProp<M>[K]> => {
      const method = this.methods[key];

      return method.call(this, ...props);
    },
  };

  constructor(
    actions: RenderableConstructorMethodProp<M>,
    state: RenderableConstructorValueProp<S>,
  ) {
    this.id = Draw.generateId();
    this.state = state;
    this.methods = actions;
  }

  protected updated() {
    this.hasUpdated = true;
  }

  //TODO: need an intuitive way for objects to change state in a way that makes
  //the rendering of multiple objects of the same class only rerender what is needed
  //look at chart.render() for an example
  //need uid to work in sync with the draw cache as well as the internal state of a renderable class
  // should look to place all "data" (ie state) in a private state object at the top of a class so that you can reference by keyname/change by keyname if necessary
  public outOfSync() {
    if (Canvas.forceUpdate) {
      this.hasUpdated = false;
      return true;
    }

    if (!this.hasUpdated) {
      return false;
    } else {
      this.hasUpdated = false;
      return true;
    }
  }

  public destroy() {
    return this.id;
  }

  /**
   *
   * TODO:
   *
   * (I think its done)
   *
   * Returns a cloned state while maintaining the validity of
   * certain embedded classes (w/o destroying them)
   */
  private getClonedState() {
    const clonedState = Object.fromEntries(
      Object.keys(this.state).map((key) => [key, this.store.get(key)]),
    );

    return clonedState as typeof this.state;
  }

  public getData() {
    return {
      id: this.id,
      outOfSync: () => this.outOfSync(),
      state: this.getClonedState(),
    };
  }
}
