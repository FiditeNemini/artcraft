import Konva from "konva";

import { SelectionManager } from "../NodesManagers";
import { highlightStrokeWidth, primaryOrange } from "./constants";
import { NodeData, Position } from "../types";

export abstract class BaseNode {
  protected selectionManagerRef: SelectionManager;
  public kNode: Konva.Image | Konva.Group;
  protected mediaLayerRef: Konva.Layer;

  // Internal State members
  // do not modify internal
  protected isSelecting: boolean = false;
  // This locks interaction when the render engine is rendering
  protected isProcessing: boolean = false;
  protected _isLocked: boolean = false;
  protected _isKEventRef: boolean = false;

  abstract getNodeData(captureCanvasPosition: Position): NodeData;

  constructor({
    selectionManagerRef,
    mediaLayerRef,
    kNode,
  }: {
    selectionManagerRef: SelectionManager;
    mediaLayerRef: Konva.Layer;
    kNode: Konva.Image | Konva.Group;
  }) {
    console.log("Node constructed");
    // this.uuid = uuidv4();
    this.mediaLayerRef = mediaLayerRef;
    this.selectionManagerRef = selectionManagerRef;
    this.kNode = kNode;
  }

  protected delete() {
    // Do any other clean up and delete the konva node.
    this.kNode.destroy();
  }
  protected async setProcessing() {
    this.isProcessing = true;
  }
  public isKEventRef() {
    return this._isKEventRef;
  }
  public setIsKEventRef(flag: boolean) {
    this._isKEventRef = flag;
    this.removeListenToBaseKNodeTransformations();
    this.removeListenToBaseKNodeDrags();
    if (flag) {
      this.listenToBaseKNodeTransformations();
      this.listenToBaseKNodeDrags();
    }
  }
  public highlight() {
    // console.log("Highlight", this.kNode._id);
    if (this.kNode instanceof Konva.Image) {
      this.kNode.stroke(primaryOrange);
      this.kNode.strokeWidth(highlightStrokeWidth);
      return;
    }
    if (this.kNode instanceof Konva.Group) {
      const wrapperRect = this.kNode.findOne(".wrapper") as Konva.Rect;
      wrapperRect.stroke(primaryOrange);
      wrapperRect.strokeWidth(highlightStrokeWidth);
      return;
    }
    if (import.meta.env.DEV) {
      console.warn(
        "DEV: BaseNode Highlight Error, kNode of BaseNode should be override by MediaNodes that extends kNode",
      );
    }
  }

  public unhighlight() {
    // console.log("unHighlight", this.kNode._id);
    if (this.kNode instanceof Konva.Image) {
      this.kNode.strokeWidth(0);
      return;
    }
    if (this.kNode instanceof Konva.Group) {
      const wrapperRect = this.kNode.findOne(".wrapper") as Konva.Rect;
      wrapperRect.strokeWidth(0);
      return;
    }
    if (import.meta.env.DEV) {
      console.warn(
        "DEV: BaseNode UnHighlight Error, kNode of BaseNode should be override by MediaNodes that extends kNode",
      );
    }
  }

  public moveLayerUp() {
    this.kNode.moveUp();
  }
  public moveLayerDown() {
    this.kNode.moveDown();
  }
  public isLocked() {
    return this._isLocked;
  }
  public lock() {
    this._isLocked = true;
    this.kNode.setDraggable(false);
    if (this._isKEventRef) {
      this.selectionManagerRef.updateContextComponents(this);
    }
  }
  public unlock() {
    this._isLocked = false;
    this.kNode.setDraggable(true);
    if (this._isKEventRef) {
      this.selectionManagerRef.updateContextComponents(this);
    }
  }

  public listenToBaseKNode() {
    const handleSelect = (isMultiSelect: boolean) => {
      if (!isMultiSelect) {
        // clear selection if not multislect
        //console.log("No Shift >> no multiselect");
        this.selectionManagerRef.clearSelection();
      }
      if (this.selectionManagerRef.isNodeSelected(this)) {
        this.selectionManagerRef.deselectNode(this);
        return;
      }
      this.selectionManagerRef.selectNode(this);
    };

    this.kNode.on("mousedown", (e) => {
      // console.log("Mouse down");
      // Selection of Node
      if (!this.selectionManagerRef.isNodeSelected(this)) {
        this.isSelecting = true;
        //checking for multiselect
        handleSelect(e.evt.shiftKey);
      }
    });

    this.kNode.on("mouseup", (e) => {
      // console.log("MOUSE UP");

      // just coming out of dragging or selecting mode
      // no need to handle select
      if (this.selectionManagerRef.isDragging() || this.isSelecting) {
        this.isSelecting = false;
        return;
      }

      // checking for multiselect, in multiselect deselection is possible
      handleSelect(e.evt.shiftKey);
    });
  }
  public listenToBaseKNodeDrags() {
    this.kNode.on("dragstart", () => {
      // console.log("Drag start", this.kNode._id);
      if (this.isProcessing) {
        return;
      }
      this.selectionManagerRef.dragStart();
    });

    this.kNode.on("dragend", () => {
      // console.log("Drag End", this.kNode._id);
      this.selectionManagerRef.dragEnd(this);
    });
  }
  public removeListenToBaseKNodeDrags() {
    this.kNode.removeEventListener("dragstart");
    this.kNode.removeEventListener("dragend");
  }
  public listenToBaseKNodeTransformations() {
    this.kNode.on("transformstart", (event) => {
      console.log("transformstart", event.target._id);
      this.selectionManagerRef.transformStart();
    });
    this.kNode.on("transform", () => {
      this.kNode.setAttrs({
        width: this.kNode.width() * this.kNode.scaleX(),
        height: this.kNode.height() * this.kNode.scaleY(),
        scaleX: 1,
        scaleY: 1,
      });
    });
    this.kNode.on("transformend", (event) => {
      console.log("transformend", event.target._id);
      this.selectionManagerRef.transformEnd(this);
    });
  }
  public removeListenToBaseKNodeTransformations() {
    this.kNode.removeEventListener("transformend");
  }
}
