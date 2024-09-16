import Konva from "konva";
import { VideoNode } from "./Nodes/VideoNode";

export class SelectionManager {
  private selectedNodes: Set<VideoNode>;
  private initialPositions: Map<VideoNode, { x: number; y: number }>;

  constructor() {
    this.selectedNodes = new Set();
    this.initialPositions = new Map<VideoNode, { x: number; y: number }>();
  }

  public selectNode(node: VideoNode, isMultiSelect: boolean): void {
    if (!isMultiSelect) {
      this.clearSelection();
    }

    if (this.selectedNodes.has(node)) {
      this.deselectNode(node);
    } else {
      this.selectedNodes.add(node);
      node.highlight();
    }

    node.kNode.getLayer()?.batchDraw();

    console.log("Selected Nodes:");
    console.log(this.selectedNodes);
  }

  public deselectNode(node: VideoNode): void {
    this.selectedNodes.delete(node);
    node.kNode.getLayer()?.batchDraw();
  }

  public clearSelection(): void {
    this.selectedNodes.forEach((node) => {
      node.unHighLight();
    });
    console.log("Clearing Selection");
    this.selectedNodes.clear();
    Konva.stages.forEach((stage) => stage.batchDraw());
  }

  // Start State
  public startDrag(node: VideoNode): void {
    console.log("Starting Drag");

    const position = node.kNode.position();

    this.selectedNodes.forEach((selectedNode) => {
      this.initialPositions.set(selectedNode, {
        x: selectedNode.kNode.x(),
        y: selectedNode.kNode.y(),
      });
    });
  }

  // Drag State
  public dragging(node: VideoNode): void {
    const initialPosition = this.initialPositions.get(node);
    if (!initialPosition) {
      console.log("Initial Position Undefined");
      return;
    }

    const dx = node.kNode.x() - initialPosition.x;
    const dy = node.kNode.y() - initialPosition.y;

    // console.log(dx);
    // console.log(dy);

    this.selectedNodes.forEach((selectedNode) => {
      const initialPosition = this.initialPositions.get(selectedNode);
      if (!initialPosition) {
        console.log("Initial Position is Null");
        return;
      }
      selectedNode.kNode.x(initialPosition.x + dx);
      selectedNode.kNode.y(initialPosition.y + dy);
    });
  }

  // End State
  public draggingStopped(node: VideoNode): void {
    console.log("Stop Dragging");
    this.initialPositions.clear();
  }

  // This lets us perfom operations on the selected node.
  public getSelectedNodes(): Set<VideoNode> {
    return this.selectedNodes;
  }
}
