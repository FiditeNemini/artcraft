import Konva from "konva";
import { NodeTransformer } from "./NodeTransformer";
import { MediaNode, Position, Transformation } from "../types";
import { uiAccess } from "~/signals";

export enum SelectionManagerEvents {
  NODES_TRANSLATIONS = "nodestranslation",
  NODES_TRANSFORMATION = "nodestransformation",
}
export interface NodesTranslationEventDetails {
  nodes: Set<MediaNode>;
  initialPositions: Map<MediaNode, Position>;
  finalPositions: Map<MediaNode, Position>;
}
export interface NodeTransformationEventDetails {
  nodes: Set<MediaNode>;
  initialTransformations: Map<MediaNode, Transformation>;
  finalTransformations: Map<MediaNode, Transformation>;
}

export class SelectionManager {
  private selectedNodes: Set<MediaNode>;
  private mediaLayerRef: Konva.Layer;
  private nodeTransformerRef: NodeTransformer;
  private initialPositions: Map<MediaNode, Position>;
  private initialTransformations: Map<MediaNode, Transformation>;
  public eventTarget: EventTarget;
  private _isDragging: boolean = false;

  constructor({
    mediaLayerRef,
    nodeTransformerRef,
  }: {
    mediaLayerRef: Konva.Layer;
    nodeTransformerRef: NodeTransformer;
  }) {
    this.selectedNodes = new Set();
    this.initialPositions = new Map<MediaNode, Position>();
    this.initialTransformations = new Map<MediaNode, Transformation>();
    this.eventTarget = new EventTarget();
    this.mediaLayerRef = mediaLayerRef;
    this.nodeTransformerRef = nodeTransformerRef;
  }

  public selectNodes(nodes: MediaNode[]) {
    const unlockedNodes = nodes.filter((node) => {
      return !node.isLocked();
    });
    unlockedNodes.forEach((node) => {
      this.selectNode(node, true);
    });
    this.mediaLayerRef.batchDraw();
  }
  public selectNode(node: MediaNode, doNotDraw?: boolean): boolean {
    if (
      this.selectedNodes.has(node) || // if the node is already selected
      (this.selectedNodes.size > 0 && node.isLocked()) // if in multiselect but picked a locked item
    ) {
      return false;
    }
    node.highlight();
    if (this.selectedNodes.size === 0) {
      node.removeListenToBaseKNodeTransformations();
      node.listenToBaseKNodeTransformations();
      node.removeListenToBaseKNodeDrags();
      node.listenToBaseKNodeDrags();
      node.updateContextComponents();
    }
    this.selectedNodes.add(node);
    this.updateNodeTransformer();
    if (!doNotDraw) {
      this.mediaLayerRef.batchDraw();
    }
    return true;
  }

  public deselectNode(node: MediaNode, doNotDraw?: boolean): void {
    node.unHighLight();
    node.removeListenToBaseKNodeTransformations();
    node.removeListenToBaseKNodeDrags();
    this.selectedNodes.delete(node);
    this.updateNodeTransformer();
    if (!doNotDraw) {
      this.mediaLayerRef.batchDraw();
    }
  }

  public clearSelection(): void {
    console.log("Clearing Selection");
    this.selectedNodes.forEach((node) => {
      node.unHighLight();
      node.removeListenToBaseKNodeTransformations();
      node.removeListenToBaseKNodeDrags();
    });

    this.selectedNodes.clear();
    this.nodeTransformerRef.clear();
    uiAccess.toolbarNode.hide();
    this.mediaLayerRef.batchDraw();
  }
  public isDragging() {
    return this._isDragging;
  }
  public isNodeSelected(node: MediaNode): boolean {
    return this.selectedNodes.has(node);
  }

  public dragStart() {
    // track the dragging state for mouseevents in nodes
    this._isDragging = true;
    // track all nodes initial position when dragstart
    this.selectedNodes.forEach((selectedNode) => {
      this.initialPositions.set(selectedNode, selectedNode.kNode.position());
    });
  }

  public dragEnd() {
    // release the dragging state for mouseevents in nodes
    this._isDragging = false;
    // track and map the final positions
    const finalPositions = new Map<MediaNode, Position>();
    this.selectedNodes.forEach((currNode) => {
      finalPositions.set(currNode, currNode.kNode.position());
    });
    // dispatch the info for engine to manage un-redo stack
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

  public transformStart() {
    // track all nodes initial transformation when transformStart
    this.selectedNodes.forEach((selectedNode) => {
      this.initialTransformations.set(selectedNode, {
        position: selectedNode.kNode.position(),
        size: selectedNode.kNode.size(),
        rotation: selectedNode.kNode.rotation(),
        scale: {
          scaleX: selectedNode.kNode.scaleX(),
          scaleY: selectedNode.kNode.scaleY(),
        },
      });
    });
  }
  public transformEnd() {
    // track and map the final positions
    const finalTransformation = new Map<MediaNode, Transformation>();
    this.selectedNodes.forEach((selectedNode) => {
      finalTransformation.set(selectedNode, {
        position: selectedNode.kNode.position(),
        size: selectedNode.kNode.size(),
        rotation: selectedNode.kNode.rotation(),
        scale: {
          scaleX: selectedNode.kNode.scaleX(),
          scaleY: selectedNode.kNode.scaleY(),
        },
      });
    });
    // dispatch the info for engine to manage un-redo stack
    this.eventTarget.dispatchEvent(
      new CustomEvent<NodeTransformationEventDetails>(
        SelectionManagerEvents.NODES_TRANSFORMATION,
        {
          detail: {
            nodes: this.selectedNodes,
            initialTransformations: new Map(this.initialTransformations),
            finalTransformations: finalTransformation,
          },
        },
      ),
    );
  }

  // This lets us perfom operations on the selected node.
  public getSelectedNodes(): Set<MediaNode> {
    return this.selectedNodes;
  }

  private updateNodeTransformer() {
    const transformableNodes = new Set(
      Array.from(this.selectedNodes).filter((node) => {
        return !node.isLocked();
      }),
    );
    this.nodeTransformerRef.enable({ selectedNodes: transformableNodes });
  }
}
