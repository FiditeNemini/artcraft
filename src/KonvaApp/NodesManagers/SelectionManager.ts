import Konva from "konva";
import { NodeTransformer } from "./NodeTransformer";
import { MediaNode, Position, Transformation } from "../types";
import { uiAccess } from "~/signals";
import { NetworkedNode } from "../Nodes/NetworkedNode";

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
  initialTransformations: Map<MediaNode, Transformation[]>;
  finalTransformations: Map<MediaNode, Transformation[]>;
}

export class SelectionManager {
  private selectedNodes: Set<MediaNode>;
  private mediaLayerRef: Konva.Layer;
  private nodeTransformerRef: NodeTransformer;
  private initialPositions: Map<MediaNode, Position>;
  private initialTransformations: Map<MediaNode, Transformation[]>;
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
    this.initialTransformations = new Map<MediaNode, Transformation[]>();
    this.eventTarget = new EventTarget();
    this.mediaLayerRef = mediaLayerRef;
    this.nodeTransformerRef = nodeTransformerRef;
  }
  // This lets us perfom operations on the selected node.
  public getSelectedNodes(): Set<MediaNode> {
    return this.selectedNodes;
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
      node.setIsKEventRef(true);
      this.updateContextComponents(node);
      this.showContextComponents(node);
    }
    this.selectedNodes.add(node);
    this.updateNodeTransformer();
    if (!doNotDraw) {
      this.mediaLayerRef.batchDraw();
    }
    return true;
  }

  public deselectNode(node: MediaNode, doNotDraw?: boolean): void {
    node.unhighlight();
    if (node.isKEventRef()) {
      node.setIsKEventRef(false);
    }
    this.selectedNodes.delete(node);
    this.updateNodeTransformer();
    if (!doNotDraw) {
      this.mediaLayerRef.batchDraw();
    }
  }

  public clearSelection(): void {
    console.log("Clearing Selection");
    this.selectedNodes.forEach((node) => {
      node.unhighlight();
      if (node.isKEventRef()) {
        node.setIsKEventRef(false);
      }
    });

    this.selectedNodes.clear();
    this.nodeTransformerRef.clear();
    this.hideContextComponents();
    this.mediaLayerRef.batchDraw();
  }

  public onToggleLock(node: MediaNode) {
    this.updateContextComponents(node);
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
    this.hideContextComponents();

    // track all nodes initial position when dragstart
    this.selectedNodes.forEach((selectedNode) => {
      this.initialPositions.set(selectedNode, selectedNode.kNode.position());
    });
  }

  public dragEnd(refNode: MediaNode) {
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
    // done, clear data and show menu
    this.initialPositions.clear();
    this.updateContextComponents(refNode);
    this.showContextComponents(refNode);
  }
  private getKNodeTransformation(kNode: Konva.Node) {
    return {
      kNodeId: kNode._id,
      position: kNode.position(),
      size: kNode.size(),
      rotation: kNode.rotation(),
      scale: {
        x: kNode.scaleX(),
        y: kNode.scaleY(),
      },
    };
  }
  public transformStart() {
    // track all nodes initial transformation when transformStart
    this.selectedNodes.forEach((selectedNode) => {
      const transformations = [this.getKNodeTransformation(selectedNode.kNode)];
      if (selectedNode.kNode instanceof Konva.Group) {
        const childKNodes = selectedNode.kNode.getChildren();
        childKNodes.forEach((childKNode) => {
          transformations.push(this.getKNodeTransformation(childKNode));
        });
      }
      this.initialTransformations.set(selectedNode, transformations);
    });
    this.hideContextComponents();
  }
  public transformEnd(refNode: MediaNode) {
    // track and map the final positions
    const finalTransformations = new Map<MediaNode, Transformation[]>();
    this.selectedNodes.forEach((selectedNode) => {
      const transformations = [this.getKNodeTransformation(selectedNode.kNode)];
      if (selectedNode.kNode instanceof Konva.Group) {
        const childKNodes = selectedNode.kNode.getChildren();
        childKNodes.forEach((childKNode) => {
          transformations.push(this.getKNodeTransformation(childKNode));
        });
      }
      finalTransformations.set(selectedNode, transformations);
    });
    // dispatch the info for engine to manage un-redo stack
    this.eventTarget.dispatchEvent(
      new CustomEvent<NodeTransformationEventDetails>(
        SelectionManagerEvents.NODES_TRANSFORMATION,
        {
          detail: {
            nodes: this.selectedNodes,
            initialTransformations: new Map(this.initialTransformations),
            finalTransformations: finalTransformations,
          },
        },
      ),
    );
    this.updateContextComponents(refNode);
    this.showContextComponents(refNode);
  }

  private updateNodeTransformer() {
    const transformableNodes = new Set(
      Array.from(this.selectedNodes).filter((node) => {
        return !node.isLocked();
      }),
    );
    this.nodeTransformerRef.enable({ selectedNodes: transformableNodes });
  }

  protected calculateContextualsPosition(kNode: Konva.Node) {
    const w = kNode.getSize().width * kNode.scaleX();
    const h = kNode.getSize().height * kNode.scaleY();
    const x0 = kNode.getPosition().x;
    const y0 = kNode.getPosition().y;

    const d = kNode.getAbsoluteRotation();
    const r = d >= 0 ? (d * Math.PI) / 180 : ((360 + d) * Math.PI) / 180;

    let px: number, py: number;
    if (r < Math.PI / 2) {
      px = x0 + (h * Math.sin(r) + w * Math.cos(r)) / 2 - h * Math.sin(r);
      py = y0 + h * Math.cos(r) + w * Math.cos(Math.PI / 2 - r);
    } else if (r < Math.PI) {
      px = x0 - (h * Math.sin(r) - w * Math.cos(r)) / 2;
      py = y0 + w * Math.cos(Math.PI / 2 - r);
    } else if (r < (Math.PI * 3) / 2) {
      px = x0 + h * Math.cos(r) - (h * Math.cos(r) + w * Math.sin(r)) / 2;
      py = y0;
    } else {
      px = x0 + (-h * Math.sin(r) + w * Math.cos(r)) / 2;
      py = y0 + h * Math.cos(r);
    }
    return { x: px, y: py };
  }

  public hideContextComponents() {
    uiAccess.toolbarNode.hide();
  }
  public showContextComponents(node: MediaNode) {
    if (!uiAccess.toolbarNode.isShowing()) {
      uiAccess.toolbarNode.show({
        locked: node.isLocked(),
      });
    } else {
      uiAccess.toolbarNode.update({
        locked: node.isLocked(),
      });
    }
    if (node instanceof NetworkedNode) {
      if (!node.didFinishLoading && !uiAccess.loadingBar.isShowing()) {
        uiAccess.loadingBar.show();
      }
    }
  }
  public updateContextComponents(node: MediaNode) {
    const coord = this.calculateContextualsPosition(node.kNode);
    if (node.isLocked() !== uiAccess.toolbarNode.isLocked()) {
      uiAccess.toolbarNode.setLocked(node.isLocked());
    }
    uiAccess.toolbarNode.setPosition({
      x: coord.x,
      y: coord.y,
    });
    if (node instanceof NetworkedNode) {
      uiAccess.loadingBar.updatePosition({
        x: coord.x,
        y: coord.y,
      });
    }
  }
}
