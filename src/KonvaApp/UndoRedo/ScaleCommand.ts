import { ICommand } from "./ICommand";
import Konva from "konva";

export class ScaleCommand implements ICommand {
  private nodes: Konva.Node[];
  private oldScales: { x: number; y: number }[];
  private newScaleX: number;
  private newScaleY: number;

  constructor(nodes: Konva.Node[], newScaleX: number, newScaleY: number) {
    this.nodes = nodes;
    this.oldScales = nodes.map((node) => ({
      x: node.scaleX(),
      y: node.scaleY(),
    }));
    this.newScaleX = newScaleX;
    this.newScaleY = newScaleY;
  }

  execute() {
    this.nodes.forEach((node) =>
      node.scale({ x: this.newScaleX, y: this.newScaleY }),
    );
    this.nodes[0].getLayer()?.draw();
  }

  undo() {
    this.nodes.forEach((node, index) => node.scale(this.oldScales[index]));
    this.nodes[0].getLayer()?.draw();
  }
}
