import { uiAccess } from "~/signals";
import { SelectionManager } from "../SelectionManager";
import { NodeTransformer } from "../NodeTransformer";
import Konva from "konva";
import { Layer } from "konva/lib/Layer";
import { v4 as uuidv4 } from "uuid";
import { Node, NodeConfig } from "konva/lib/Node";

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
  }
  selectThisNode() {
    this.selectionManagerRef.selectNode(this);
    // selection on click doesn't do a good job.
    this.updateContextMenuPosition();
    this.updateNodeTransformer();

    if (this.didFinishLoading == false) {
      this.updateLoadingBarPosition();
    } else {
      loadingBar.hide();
    }
  }
  public listenToBaseKNode() {
    if (!this.kNode) {
      return;
    }

    this.kNode.on("dragstart", (e) => {
      // console.log("Drag start");
      this.updateContextMenuPosition();

      // Multiselect
      const isMultiSelect = e.evt.shiftKey;
      if (isMultiSelect) {
        this.selectionManagerRef.startDrag(this);
      }
      if (this.didFinishLoading == false) {
        this.updateLoadingBarPosition();
      }
    });

    this.kNode.on("dragmove", (e) => {
      // shouldn't be able to move if processing.
      // console.log("Drag Move");
      this.updateContextMenuPosition();

      // Multiselect
      const isMultiSelect = e.evt.shiftKey;
      if (isMultiSelect) {
        this.selectionManagerRef.dragging(this);
      }

      if (this.isProcessing) {
        return;
      }

      if (this.didFinishLoading == false) {
        this.updateLoadingBarPosition();
      }
    });

    this.kNode.on("dragend", (e) => {
      // console.log("Drag End");

      const isMultiSelect = e.evt.shiftKey;
      if (isMultiSelect) {
        this.selectionManagerRef.draggingStopped(this);
      }
      this.updateContextMenuPosition();
      if (this.didFinishLoading == false) {
        this.updateLoadingBarPosition();
      }
    });

    this.kNode.on("mousedown", (e) => {
      toolbarNode.show({
        locked: this.isLocked,
      });
      console.log("Mouse Down");

      const isMultiSelect = e.evt.shiftKey;

      if (!isMultiSelect) {
        console.log("No Shift >> no multiselect");
        this.selectionManagerRef.clearSelection();
        this.selectThisNode();
        return;
      }
      console.log("Shift >> multiselecting");
      if (!this.selectionManagerRef.isNodeSelected(this)) {
        this.selectThisNode();
        return;
      }
      this.selectionManagerRef.deselectNode(this);
      this.updateNodeTransformer();
    });

    this.kNode.on("mouseup", (e) => {
      if (this.didFinishLoading == false) {
        return;
      }
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
