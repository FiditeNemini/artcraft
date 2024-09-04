// to do fix https://codesandbox.io/p/sandbox/react-konva-infinite-grid-kkndq?file=%2Fsrc%2Findex.js the dotted background doesn't move when draggable.
import { Engine } from "./Engine";
export const KonvaApp = (element: HTMLDivElement) => {
  const engine = new Engine(element);
  engine.initializeStage("");
};
