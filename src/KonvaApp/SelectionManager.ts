import Konva from "konva";
import { Node, NodeConfig } from "konva/lib/Node";

import { MediaNode } from "./type";
import { uiAccess } from "~/signals";

export class SelectionManager {
  private allNodes: Set<MediaNode>;
  private selectedNodes: Set<MediaNode>;
  private initialPositions: Map<MediaNode, { x: number; y: number }>;

  constructor() {
    this.allNodes = new Set();
    this.selectedNodes = new Set();
    this.initialPositions = new Map<MediaNode, { x: number; y: number }>();
  }
  public saveNode(node: MediaNode): void {
    if (this.allNodes.has(node)) {
      return;
    } else {
      this.allNodes.add(node);
    }
  }
  public getAllNodes() {
    return this.allNodes;
  }
  public selectKNodes(kNodes: Node<NodeConfig>[]) {
    const nodeArray = Array.from(this.allNodes);
    const kNodeIds = kNodes.map((kNode) => kNode._id);
    nodeArray.forEach((node) => {
      if (!node.kNode) {
        return false;
      }
      if (kNodeIds.includes(node.kNode._id) && !node.isLocked) {
        if (this.selectedNodes.size === 0) {
          node.updateContextMenu();
        }
        this.selectNode(node);
      }
    });
  }
  public selectNode(node: MediaNode): boolean {
    if (
      !node.kNode || // KNode is not initialized
      this.selectedNodes.has(node) || // if the node is already selected\
      (this.selectedNodes.size > 0 && node.isLocked) // if in multiselect but picked a locked item
    ) {
      return false;
    }

    this.selectedNodes.add(node);
    node.highlight();
    node.kNode.getLayer()?.batchDraw();
    // console.log("Selected Nodes:");
    // console.log(this.selectedNodes);
    return true;
  }

  public deselectNode(node: MediaNode): void {
    this.selectedNodes.delete(node);
    node.unHighLight();
    if (!node.kNode) {
      // console.log("KNode is initialized");
      return;
    }
    node.kNode.getLayer()?.batchDraw();
  }

  public clearSelection(): void {
    this.selectedNodes.forEach((node) => {
      node.unHighLight();
    });
    // console.log("Clearing Selection");
    this.selectedNodes.clear();
    uiAccess.toolbarNode.hide();
    Konva.stages.forEach((stage) => stage.batchDraw());
  }

  // Start State
  public startDrag(node: MediaNode): void {
    // console.log("Starting Drag");
    if (!node.kNode) {
      // console.log("KNode is initialized");
      return;
    }

    this.selectedNodes.forEach((selectedNode) => {
      if (!selectedNode.kNode) {
        // console.log("selectedNode KNode is initialized");
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
      // console.log("Initial Position Undefined");
      return;
    }
    if (!node.kNode) {
      // console.log("selectedNode KNode is initialized");
      return;
    }
    const dx = node.kNode.x() - initialPosition.x;
    const dy = node.kNode.y() - initialPosition.y;

    // console.log(dx);
    // console.log(dy);

    this.selectedNodes.forEach((selectedNode) => {
      const initialPosition = this.initialPositions.get(selectedNode);
      if (!initialPosition) {
        // console.log("Initial Position is Null");
        return;
      }

      if (!selectedNode.kNode) {
        // console.log("selectedNode KNode is initialized");
        return;
      }
      selectedNode.kNode.x(initialPosition.x + dx);
      selectedNode.kNode.y(initialPosition.y + dy);
    });
  }

  // End State
  public draggingStopped(): void {
    // console.log("Stop Dragging");
    this.initialPositions.clear();
  }

  // This lets us perfom operations on the selected node.
  public getSelectedNodes(): Set<MediaNode> {
    return this.selectedNodes;
  }
}
