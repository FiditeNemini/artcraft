import Konva from "konva";
import { v4 as uuidv4 } from "uuid";

import { Layer } from "konva/lib/Layer";

import { uiAccess } from "~/signals";
import { SelectionManager } from "../NodesManagers";
import { Size } from "../types";

const toolbarNode = uiAccess.toolbarNode;
const loadingBar = uiAccess.loadingBar;

export class NetworkedNodeContext {
  public selectionManagerRef: SelectionManager;
  public kNode: Konva.Image;
  protected mediaLayerRef: Layer;
  public uuid: string;

  // Internal State members
  // do not modify internal
  public didFinishLoading: boolean = false;
  // This locks interaction when the render engine is rendering
  protected isProcessing: boolean = false;
  protected isSelecting: boolean = false;
  protected _isLocked: boolean = false;

  async setProcessing() {
    this.isProcessing = true;
  }

  constructor({
    selectionManagerRef,
    mediaLayerRef,
    kNode,
  }: {
    selectionManagerRef: SelectionManager;
    mediaLayerRef: Layer;
    kNode: Konva.Image;
  }) {
    console.log("reconstructed");
    this.uuid = uuidv4();
    this.mediaLayerRef = mediaLayerRef;
    this.selectionManagerRef = selectionManagerRef;
    this.kNode = kNode;
    this.didFinishLoading = false;
  }
  protected calculateRenderSizeOnLoad({
    componentSize,
    maxSize,
  }: {
    componentSize: Size;
    maxSize: Size;
  }) {
    const renderSize = {
      width: componentSize.width,
      height: componentSize.height,
    };
    if (renderSize.width > maxSize.width) {
      const scaleDown = maxSize.width / renderSize.width;
      renderSize.width = renderSize.width * scaleDown;
      renderSize.height = renderSize.height * scaleDown;
    }
    if (renderSize.height > maxSize.height) {
      const scaleDownAgain = maxSize.height / renderSize.height;
      renderSize.width = renderSize.width * scaleDownAgain;
      renderSize.height = renderSize.height * scaleDownAgain;
    }
    return renderSize;
  }
  public delete() {
    // Do any other clean up and delete the konva node.
    this.kNode.destroy();
  }

  public highlight() {
    this.kNode.stroke("salmon");
    this.kNode.strokeWidth(10);
  }

  public unHighLight() {
    console.log("unHighlight", this.kNode._id);
    this.kNode.strokeWidth(0);
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
    toolbarNode.lock();
    this.kNode.setDraggable(false);
  }
  public unlock() {
    this._isLocked = false;
    toolbarNode.unlock();
    this.kNode.setDraggable(true);
  }

  calculateContextualsPosition(kNode: Konva.Node) {
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
  updateContextMenuPosition() {
    const coord = this.calculateContextualsPosition(this.kNode);
    toolbarNode.setPosition({
      x: coord.x,
      y: coord.y,
    });
  }

  updateLoadingBarPosition() {
    const coord = this.calculateContextualsPosition(this.kNode);

    loadingBar.updatePosition({
      x: coord.x,
      y: coord.y,
    });
  }

  public updateContextComponents() {
    this.updateContextMenuPosition();
    this.updateLoadingBarPosition();
    if (this.didFinishLoading == false && !loadingBar.isShowing()) {
      loadingBar.show();
    } else {
      loadingBar.hide();
    }
    if (!toolbarNode.isShowing()) {
      toolbarNode.show({
        locked: this._isLocked,
      });
    } else {
      toolbarNode.update({
        locked: this._isLocked,
      });
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

      if (!toolbarNode.isShowing()) {
        toolbarNode.show({
          locked: this._isLocked,
        });
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
      this.updateContextComponents();
    });

    this.kNode.on("dragmove", () => {
      // console.log("Drag Move");
      this.updateContextComponents();
    });

    this.kNode.on("dragend", () => {
      // console.log("Drag End", this.kNode._id);
      this.selectionManagerRef.dragEnd();
      this.updateContextComponents();
    });
  }
  public removeListenToBaseKNodeDrags() {
    this.kNode.removeEventListener("dragstart");
    this.kNode.removeEventListener("dragmove");
    this.kNode.removeEventListener("dragend");
  }
  public listenToBaseKNodeTransformations() {
    this.kNode.on("transformstart", (event) => {
      console.log("transformstart", event.target._id);
      this.selectionManagerRef.transformStart();
      toolbarNode.hide();
      loadingBar.hide();
    });

    this.kNode.on("transformend", (event) => {
      console.log("transformend", event.target._id);
      this.selectionManagerRef.transformEnd();
      this.updateContextComponents();
    });
  }
  public removeListenToBaseKNodeTransformations() {
    this.kNode.removeEventListener("transformend");
  }
}
