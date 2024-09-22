import Konva from "konva";
import { VideoNode } from "./Nodes/VideoNode";
import { ImageNode } from "./Nodes/ImageNode";
import { NetworkedNodeContext } from "./Nodes/NetworkedNodeContext";
type MediaNode = NetworkedNodeContext | VideoNode | ImageNode;
export class SelectionManager {
  private selectedNodes: Set<MediaNode>;
  private initialPositions: Map<MediaNode, { x: number; y: number }>;

  constructor() {
    this.selectedNodes = new Set();
    this.initialPositions = new Map<MediaNode, { x: number; y: number }>();
  }

  public selectNode(node: MediaNode): void {
    if (this.selectedNodes.has(node)) {
      return;
    } else {
      this.selectedNodes.add(node);
      node.highlight();
    }

    if (!node.kNode) {
      console.log("KNode is initialized");
      return;
    }
    node.kNode.getLayer()?.batchDraw();

    console.log("Selected Nodes:");
    console.log(this.selectedNodes);
  }

  public deselectNode(node: MediaNode): void {
    this.selectedNodes.delete(node);
    node.unHighLight();
    if (!node.kNode) {
      console.log("KNode is initialized");
      return;
    }
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
  public startDrag(node: MediaNode): void {
    console.log("Starting Drag");
    if (!node.kNode) {
      console.log("KNode is initialized");
      return;
    }

    this.selectedNodes.forEach((selectedNode) => {
      if (!selectedNode.kNode) {
        console.log("selectedNode KNode is initialized");
        return;
      }
      this.initialPositions.set(selectedNode, {
        x: selectedNode.kNode.x(),
        y: selectedNode.kNode.y(),
      });
    });
  }
  public isNodeSelected(node: MediaNode): boolean {
    return this.selectedNodes.has(node);
  }
  // Drag State
  public dragging(node: MediaNode): void {
    const initialPosition = this.initialPositions.get(node);
    if (!initialPosition) {
      console.log("Initial Position Undefined");
      return;
    }
    if (!node.kNode) {
      console.log("selectedNode KNode is initialized");
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

      if (!selectedNode.kNode) {
        console.log("selectedNode KNode is initialized");
        return;
      }
      selectedNode.kNode.x(initialPosition.x + dx);
      selectedNode.kNode.y(initialPosition.y + dy);
    });
  }

  // End State
  public draggingStopped(node: MediaNode): void {
    console.log("Stop Dragging");
    this.initialPositions.clear();
  }

  // This lets us perfom operations on the selected node.
  public getSelectedNodes(): Set<MediaNode> {
    return this.selectedNodes;
  }
}
