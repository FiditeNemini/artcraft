import { ICommand } from "./ICommand";
import Konva from "konva";

export class RotateCommand implements ICommand {
  private nodes: Konva.Node[];
  private oldRotations: number[];
  private newRotation: number;

  constructor(nodes: Konva.Node[], newRotation: number) {
    this.nodes = nodes;
    this.oldRotations = nodes.map((node) => node.rotation());
    this.newRotation = newRotation;
  }

  execute() {
    this.nodes.forEach((node) => node.rotation(this.newRotation));
    this.nodes[0].getLayer()?.draw();
  }

  undo() {
    this.nodes.forEach((node, index) =>
      node.rotation(this.oldRotations[index]),
    );
    this.nodes[0].getLayer()?.draw();
  }
}
