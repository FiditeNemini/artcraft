import Konva from "konva";
import { v4 as uuidv4 } from "uuid";

import { Layer } from "konva/lib/Layer";
import { Node, NodeConfig } from "konva/lib/Node";

import { uiAccess } from "~/signals";
import { SelectionManager } from "../SelectionManager";
import { NodeTransformer } from "../NodeTransformer";
import { Size } from "../types";

const toolbarNode = uiAccess.toolbarNode;
const loadingBar = uiAccess.loadingBar;

export class NetworkedNodeContext {
  public selectionManagerRef: SelectionManager;
  private nodeTransformerRef: NodeTransformer;
  public kNode: Konva.Image | undefined;
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
  }: {
    nodeTransfomerRef: NodeTransformer;
    selectionManagerRef: SelectionManager;
    mediaLayer: Layer;
  }) {
    console.log("reconstructed");
    this.uuid = uuidv4();
    this.mediaLayer = mediaLayer;
    this.selectionManagerRef = selectionManagerRef;
    this.nodeTransformerRef = nodeTransfomerRef;
    this.kNode = undefined;
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
    if (this.kNode) {
      this.kNode.destroy();
    }
  }

  public highlight() {
    if (!this.kNode) {
      return;
    }
    this.kNode.stroke("salmon");
    this.kNode.strokeWidth(10);
    this.kNode.draw();
  }

  public unHighLight() {
    if (!this.kNode) {
      return;
    }

    // this.kNode.stroke(null);
    this.kNode.strokeWidth(0);
    this.kNode.draw();
  }
  public toggleLock() {
    this.isLocked = !this.isLocked;
    if (this.isLocked) {
      toolbarNode.lock();
      this.kNode?.setDraggable(false);
    } else {
      toolbarNode.unlock();
      this.kNode?.setDraggable(true);
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
  calculatePosition(kNode: Node<NodeConfig>) {
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
    if (!this.kNode) {
      return;
    }
    const coord = this.calculatePosition(this.kNode);
    toolbarNode.setPosition({
      x: coord.x,
      y: coord.y,
    });
  }

  updateLoadingBarPosition() {
    if (!this.kNode) {
      return;
    }
    const coord = this.calculatePosition(this.kNode);

    loadingBar.updatePosition({
      x: coord.x,
      y: coord.y,
    });
  }

  public bringToFront() {
    if (!this.kNode) {
      return;
    }
    this.kNode.moveUp();
  }

  public sendBack() {
    if (!this.kNode) {
      return;
    }
    // prevent canvas being in front.
    if (this.kNode.zIndex() === 1) {
      return;
    }
    this.kNode.moveDown();
  }

  public async updateContextMenu() {
    this.updateContextMenuPosition();
    this.updateLoadingBarPosition();
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
      this.updateContextMenu();
      this.updateNodeTransformer();
      if (this.didFinishLoading == false) {
        this.updateLoadingBarPosition();
      } else {
        loadingBar.hide();
      }
    }
  }
  public listenToBaseKNode() {
    if (!this.kNode) {
      return;
    }
    const handleDrag = () => {
      if (!this.isDragging) {
        return;
      }
      this.selectionManagerRef.startDrag(this);
      this.updateContextMenuPosition();
      if (this.didFinishLoading == false) {
        this.updateLoadingBarPosition();
      }
    };
    const handleSelect = (isMultiSelect: boolean) => {
      if (!isMultiSelect) {
        // clear selection if not multislect
        console.log("No Shift >> no multiselect");
        this.selectionManagerRef.clearSelection();
      }
      this.selectThisNode();
    };
    this.kNode.on("dragstart", () => {
      // console.log("Drag start");
      // shouldn't be able to move if processing.
      if (this.isProcessing) {
        return;
      }
      this.isDragging = true;
      handleDrag();
    });

    this.kNode.on("dragmove", () => {
      // console.log("Drag Move");
      handleDrag();
    });

    this.kNode.on("dragend", () => {
      // console.log("Drag End");
      handleDrag();
    });

    this.kNode.on("mousedown", (e) => {
      console.log("Mouse down");

      // selection node Node
      if (!this.selectionManagerRef.isNodeSelected(this)) {
        //checking for multiselect
        this.isSelecting = true;
        handleSelect(e.evt.shiftKey);
      }

      if (!toolbarNode.isShowing()) {
        toolbarNode.show({
          locked: this.isLocked,
        });
      }
    });

    this.kNode.on("mouseup", (e) => {
      // just coming out of dragging or selecting mode
      if (this.isDragging || this.isSelecting) {
        this.isDragging = false;
        this.isSelecting = false;
        return;
      }

      // deselection mode, checking for multiselect
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

  public listenToBaseKNodeTransformations() {
    if (!this.kNode) {
      return;
    }
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
