import { uiAccess } from "~/signals";
import { SelectionManager } from "../SelectionManager";
import Konva from "konva";
import { Layer } from "konva/lib/Layer";
import { v4 as uuidv4 } from "uuid";

const toolbarVideo = uiAccess.toolbarImage;
const loadingBar = uiAccess.loadingBar;

export class NetworkedNodeContext {
  public selectionManagerRef: SelectionManager;
  public kNode: Konva.Image | undefined;
  protected mediaLayer: Layer;
  public uuid: string;

  // Internal State members
  // do not modify internal
  public didFinishLoading: boolean = false;
  // This locks interaction when the render engine is rendering
  protected isProcessing: boolean = false;

  async setProcessing() {
    this.isProcessing = true;
  }

  constructor(selectionManagerRef: SelectionManager, mediaLayer: Layer) {
    this.uuid = uuidv4();
    this.mediaLayer = mediaLayer;
    this.selectionManagerRef = selectionManagerRef;
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

  updateContextMenuPosition() {
    if (!this.kNode) {
      return;
    }
    toolbarVideo.setPosition({
      x: this.kNode.getPosition().x + this.kNode.getSize().width / 2,
      y: this.kNode.getPosition().y,
    });
  }

  updateLoadingBarPosition() {
    if (!this.kNode) {
      return;
    }
    loadingBar.updatePosition({
      x: this.kNode.getPosition().x + this.kNode.getSize().width / 2,
      y: this.kNode.getPosition().y + this.kNode.getSize().height,
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

    this.kNode.on("click", (e) => {
      console.log("click");
      const isMultiSelect = e.evt.shiftKey;
      if (isMultiSelect) {
        if (this.selectionManagerRef.isNodeSelected(this)) {
          this.selectionManagerRef.deselectNode(this);
        } else {
          this.selectionManagerRef.selectNode(this);
        }
      }
    });

    this.kNode.on("mousedown", (e) => {
      toolbarVideo.show();
      console.log("Mouse Down");

      const isMultiSelect = e.evt.shiftKey;

      if (isMultiSelect) {
        console.log("Shift");
      } else {
        console.log("No Shift");
        this.selectionManagerRef.clearSelection();
        this.selectionManagerRef.selectNode(this);
      }

      // selection on click doesn't do a good job.
      this.updateContextMenuPosition();

      if (this.didFinishLoading == false) {
        this.updateLoadingBarPosition();
      } else {
        loadingBar.hide();
      }
    });

    this.kNode.on("mouseup", (e) => {
      if (this.didFinishLoading == false) {
        return;
      }
    });
  }
}
