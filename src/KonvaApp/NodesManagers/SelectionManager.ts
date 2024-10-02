import Konva from "konva";
import { MediaNode, Position } from "../types";
import { uiAccess } from "~/signals";

export enum SelectionManagerEvents {
  NODES_TRANSLATIONS = "nodestranslation",
}
export interface NodesTranslationEventDetails {
  nodes: Set<MediaNode>;
  initialPositions: Map<MediaNode, Position>;
  finalPositions: Map<MediaNode, Position>;
}
export class SelectionManager {
  private selectedNodes: Set<MediaNode>;
  private initialPositions: Map<MediaNode, Position>;
  public eventTarget: EventTarget;

  constructor() {
    this.selectedNodes = new Set();
    this.initialPositions = new Map<MediaNode, Position>();
    this.eventTarget = new EventTarget();
  }

  public selectKNodes({
    allNodes,
    kNodes,
  }: {
    allNodes: Set<MediaNode>;
    kNodes: Konva.Node[];
  }) {
    const nodeArray = Array.from(allNodes);
    const kNodeIds = kNodes.map((kNode) => kNode._id);
    nodeArray.forEach((node) => {
      if (kNodeIds.includes(node.kNode._id)) {
        node.selectThisNode();
      }
    });
    // Konva.stages.forEach((stage) => stage.batchDraw());
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
    // Konva.stages.forEach((stage) => stage.batchDraw());
    return true;
  }

  public deselectNode(node: MediaNode): void {
    this.selectedNodes.delete(node);
    // Konva.stages.forEach((stage) => stage.batchDraw());
  }

  public clearSelection(): void {
    this.selectedNodes.forEach((node) => {
      node.unselectThisNode();
    });
    // console.log("Clearing Selection");
    this.selectedNodes.clear();
    uiAccess.toolbarNode.hide();
    // Konva.stages.forEach((stage) => stage.batchDraw());
  }

  public isNodeSelected(node: MediaNode): boolean {
    return this.selectedNodes.has(node);
  }

  // Start State
  public dragStart(): void {
    //move track all nodes initial position when dragstart
    this.selectedNodes.forEach((selectedNode) => {
      this.initialPositions.set(selectedNode, {
        x: selectedNode.kNode.x(),
        y: selectedNode.kNode.y(),
      });
    });
  }

  // End State
  public dragEnd(): void {
    // console.log("Stop Dragging");
    const finalPositions = new Map<MediaNode, Position>();

    this.selectedNodes.forEach((currNode) => {
      const initialPosition = this.initialPositions.get(currNode);
      if (!initialPosition) {
        // console.log("Initial Position is Null");
        return;
      }
      finalPositions.set(currNode, {
        x: currNode.kNode.x(),
        y: currNode.kNode.y(),
      });
    });
    this.eventTarget.dispatchEvent(
      new CustomEvent<NodesTranslationEventDetails>(
        SelectionManagerEvents.NODES_TRANSLATIONS,
        {
          detail: {
            nodes: this.selectedNodes,
            initialPositions: new Map(this.initialPositions),
            finalPositions: finalPositions,
          },
        },
      ),
    );
    this.initialPositions.clear();
  }

  // This lets us perfom operations on the selected node.
  public getSelectedNodes(): Set<MediaNode> {
    return this.selectedNodes;
  }
}
