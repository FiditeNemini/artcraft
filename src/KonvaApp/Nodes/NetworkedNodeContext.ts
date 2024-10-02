import Konva from "konva";
import { v4 as uuidv4 } from "uuid";

import { Layer } from "konva/lib/Layer";

import { uiAccess } from "~/signals";
import { NodeTransformer, SelectionManager } from "../NodesManagers";
import { Size } from "../types";

const toolbarNode = uiAccess.toolbarNode;
const loadingBar = uiAccess.loadingBar;

export class NetworkedNodeContext {
  public selectionManagerRef: SelectionManager;
  private nodeTransformerRef: NodeTransformer;
  public kNode: Konva.Image;
  protected mediaLayer: Layer;
  public uuid: string;

  // Internal State members
  // do not modify internal
  public didFinishLoading: boolean = false;
  // This locks interaction when the render engine is rendering
  protected isProcessing: boolean = false;
  protected isDragging: boolean = false;
  protected isSelecting: boolean = false;
  public isLocked: boolean = false;

  async setProcessing() {
    this.isProcessing = true;
  }

  constructor({
    nodeTransfomerRef,
    selectionManagerRef,
    mediaLayer,
    kNode,
  }: {
    nodeTransfomerRef: NodeTransformer;
    selectionManagerRef: SelectionManager;
    mediaLayer: Layer;
    kNode: Konva.Image;
  }) {
    console.log("reconstructed");
    this.uuid = uuidv4();
    this.mediaLayer = mediaLayer;
    this.selectionManagerRef = selectionManagerRef;
    this.nodeTransformerRef = nodeTransfomerRef;
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
    this.kNode.draw();
  }

  public unHighLight() {
    this.kNode.strokeWidth(0);
    this.kNode.draw();
  }
  public toggleLock() {
    this.isLocked = !this.isLocked;
    if (this.isLocked) {
      toolbarNode.lock();
      this.kNode.setDraggable(false);
    } else {
      toolbarNode.unlock();
      this.kNode.setDraggable(true);
    }
  }
  updateNodeTransformer() {
    const selectedNodes = this.selectionManagerRef.getSelectedNodes();
    const transformableNodes = new Set(
      Array.from(selectedNodes).filter((node) => {
        return !node.isLocked;
      }),
    );
    this.nodeTransformerRef.enable({ selectedNodes: transformableNodes });
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

  public moveLayerUp() {
    this.kNode.moveUp();
  }
  public moveLayerDown() {
    this.kNode.moveDown();
  }

  public updateContextComponents() {
    this.updateContextMenuPosition();
    if (this.didFinishLoading == false) {
      this.updateLoadingBarPosition();
    } else {
      loadingBar.hide();
    }
    if (!toolbarNode.isShowing()) {
      toolbarNode.show({
        locked: this.isLocked,
      });
    } else {
      toolbarNode.update({
        locked: this.isLocked,
      });
    }
  }
  public selectThisNode() {
    const selected = this.selectionManagerRef.selectNode(this);
    if (selected) {
      this.highlight();
      if (this.selectionManagerRef.getSelectedNodes().size === 1) {
        this.listenToBaseKNodeDrags();
        this.updateContextComponents();
      }
      this.updateNodeTransformer();
    }
  }
  public unselectThisNode() {
    this.unHighLight();
    this.removeListenToBaseKNodeDrags();
    this.selectionManagerRef.deselectNode(this);
  }
  public listenToBaseKNode() {
    const handleSelect = (isMultiSelect: boolean) => {
      if (!isMultiSelect) {
        // clear selection if not multislect
        //console.log("No Shift >> no multiselect");
        this.selectionManagerRef.clearSelection();
      }
      this.selectThisNode();
    };

    this.kNode.on("mousedown", (e) => {
      // console.log("Mouse down");
      // Selection of Node
      if (!this.selectionManagerRef.isNodeSelected(this)) {
        //checking for multiselect
        this.isSelecting = true;
        handleSelect(e.evt.shiftKey);
      } else {
        this.isDragging = true;
      }

      if (!toolbarNode.isShowing()) {
        toolbarNode.show({
          locked: this.isLocked,
        });
      }
    });

    this.kNode.on("mouseup", (e) => {
      // just coming out of dragging or selecting mode
      // console.log("MOUSE UP");
      if (this.isDragging || this.isSelecting) {
        this.isSelecting = false;
        return;
      }

      // checking for multiselect, in multiselect deselection is possible
      const isMultiSelect = e.evt.shiftKey;
      if (isMultiSelect && this.selectionManagerRef.isNodeSelected(this)) {
        this.selectionManagerRef.deselectNode(this);
        this.updateNodeTransformer();
        //TODO: show toolbarNode on another Node;
        return;
      }

      // if the code gets here, we are selecting again from selected nodes
      handleSelect(isMultiSelect);
    });
  }
  public listenToBaseKNodeDrags() {
    this.kNode.on("dragstart", () => {
      console.log("Drag start", this.kNode._id);
      if (this.isProcessing) {
        return;
      }
      this.isDragging = true;
      this.selectionManagerRef.dragStart();
      this.updateContextComponents();
    });

    this.kNode.on("dragmove", () => {
      // console.log("Drag Move");
      if (!this.isDragging) {
        return;
      }
      this.updateContextComponents();
    });

    this.kNode.on("dragend", () => {
      console.log("Drag End");
      if (!this.isDragging) {
        return;
      }
      this.isDragging = false;
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
    this.kNode.on("transform", () => {
      // console.log("kNode tansformed");
      this.updateContextMenuPosition();
    });
  }
  public removeListenToBaseKNodeTransformations() {
    if (!this.kNode) {
      return;
    }
    this.kNode.removeEventListener("transform");
  }
}
