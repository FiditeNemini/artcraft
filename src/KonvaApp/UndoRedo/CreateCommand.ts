import { ICommand } from "./ICommand";
import Konva from "konva";

export class CreateCommand implements ICommand {
  private nodes: Konva.Node[];
  private layer: Konva.Layer;

  constructor(nodes: Konva.Node[]) {
    this.nodes = nodes;
    this.layer = nodes[0].getLayer()!;
  }

  execute() {
    this.nodes.forEach((node) => this.layer.add(node));
    this.layer.draw();
  }

  undo() {
    this.nodes.forEach((node) => node.remove());
    this.layer.draw();
  }
}
