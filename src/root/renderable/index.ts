import {
  Renderable,
  type Methods,
  type RenderableConstructorMethodProp,
  type RenderableConstructorValueProp,
  type State,
} from "./_class";

type RenderablePublicMembers<M extends Methods, S extends State> = Pick<
  Renderable<M, S>,
  keyof Renderable<M, S>
>;

export function renderable<S extends State, M extends Methods>(
  state: ThisType<Renderable<M, S>["state"]> & S,
  actions: ThisType<
    RenderablePublicMembers<M, RenderableConstructorValueProp<S>> & {
      actions: M;
    }
  > &
    RenderableConstructorMethodProp<M> &
    M,
) {
  return new Renderable<
    RenderableConstructorMethodProp<Methods>,
    RenderableConstructorValueProp<S>
  >(actions, state);
}
