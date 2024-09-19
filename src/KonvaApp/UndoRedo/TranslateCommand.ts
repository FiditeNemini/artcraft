import { ICommand } from "./ICommand";
import Konva from "konva";

export class TranslateCommand implements ICommand {
  private nodes: Konva.Node[];
  private oldPositions: { x: number; y: number }[];
  private newX: number;
  private newY: number;

  constructor(nodes: Konva.Node[], newX: number, newY: number) {
    this.nodes = nodes;
    this.oldPositions = nodes.map((node) => ({ x: node.x(), y: node.y() }));
    this.newX = newX;
    this.newY = newY;
  }

  execute() {
    this.nodes.forEach((node) => node.position({ x: this.newX, y: this.newY }));
    this.nodes[0].getLayer()?.draw();
  }

  undo() {
    this.nodes.forEach((node, index) =>
      node.position(this.oldPositions[index]),
    );
    this.nodes[0].getLayer()?.draw();
  }
}
