import Konva from "konva";
import { Layer } from "konva/lib/Layer";
import { NetworkedNodeContext } from "./NetworkedNodeContext";
import { v4 as uuidv4 } from "uuid";

import { uiAccess } from "~/signals";
import { SelectionManager } from "../SelectionManager";

const toolbarVideo = uiAccess.toolbarImage;
const loadingBar = uiAccess.loadingBar;

export class ImageNode extends NetworkedNodeContext {
  public selectionManagerRef: SelectionManager;

  public imageURL: string;
  public videoComponent: HTMLVideoElement;

  public kNode: Konva.Image;

  // do not modify internal
  public didFinishLoading: boolean;
  private videoLayer: Layer;

  public uuid: string;

  // This locks interaction when the render engine is rendering
  private isProcessing: boolean = false;

  async setProcessing() {
    this.isProcessing = true;
  }

  public delete() {
    // Do any other clean up and delete the konva node.
    if (this.kNode) {
      this.kNode.destroy();
    }
  }

  public highlight() {
    this.kNode.stroke("salmon");
    this.kNode.strokeWidth(12);
    this.kNode.draw();
  }
  public unHighLight() {
    this.kNode.stroke(null);
    this.kNode.strokeWidth(0);
    this.kNode.draw();
  }

  private imageObject: Image;
  constructor(
    uuid: string = uuidv4(),
    videoLayer: Layer,
    x: number,
    y: number,
    imageFile: File,
    selectionManagerRef: SelectionManager,
  ) {
    super();
    this.selectionManagerRef = selectionManagerRef;
    this.uuid = uuid;
    this.videoLayer = videoLayer;
    this.didFinishLoading = false;

    const imageObj = new Image();
    this.imageObject = imageObj;
    imageObj.onload = () => {
      // TODO load this proper.
      this.kNode = new Konva.Image({
        x: x,
        y: y,
        image: imageObj,
        width: imageObj.width,
        height: imageObj.height,
        draggable: true,
      });

      // TODO use loading image
      this.didFinishLoading = true;

      // add the shape to the layer

      this.kNode.on("dragstart", (e) => {
        this.updateContextMenuPosition();
        // Multiselect
        const isMultiSelect = e.evt.shiftKey;
        this.selectionManagerRef.startDrag(this);
        if (this.didFinishLoading == false) {
          this.updateLoadingBarPosition();
        }
      });

      this.kNode.on("dragmove", (e) => {
        // shouldn't be able to move if processing.

        this.updateContextMenuPosition();
        // Multiselect
        const isMultiSelect = e.evt.shiftKey;
        this.selectionManagerRef.dragging(this);
        if (this.isProcessing) {
          return;
        }

        if (this.didFinishLoading == false) {
          this.updateLoadingBarPosition();
        }
      });

      this.kNode.on("dragend", (e) => {
        this.selectionManagerRef.draggingStopped(this);
      });

      this.kNode.on("dragend", () => {
        this.updateContextMenuPosition();
        if (this.didFinishLoading == false) {
          this.updateLoadingBarPosition();
        }
      });

      this.kNode.on("mousedown", (e) => {
        toolbarVideo.show();

        // selection on click doesn't do a good job.
        const isMultiSelect = e.evt.shiftKey;
        this.selectionManagerRef.selectNode(this, isMultiSelect);

        this.updateContextMenuPosition();

        if (this.didFinishLoading == false) {
          this.updateLoadingBarPosition();
        } else {
          loadingBar.hide();
        }
      });

      this.kNode.on("mouseup", () => {
        if (this.didFinishLoading == false) {
          return;
        }
      });

      videoLayer.add(this.kNode);
      videoLayer.draw();
    };

    imageObj.src = URL.createObjectURL(imageFile);
  }

  async updateImage(newImageSrc: string) {
    const newImage = new Image();
    newImage.src = newImageSrc;
    newImage.onload = () => {
      this.kNode.image(newImage);
      this.kNode.draw();
    };
  }

  updateContextMenuPosition() {
    toolbarVideo.setPosition({
      x: this.kNode.getPosition().x + this.kNode.getSize().width / 4,
      y: this.kNode.getPosition().y - 150,
    });
  }

  updateLoadingBarPosition() {
    loadingBar.updatePosition({
      x: this.kNode.getPosition().x + this.kNode.getSize().width / 4,
      y: this.kNode.getPosition().y - 60,
    });
  }

  public bringToFront() {
    this.kNode.moveUp();
  }

  public sendBack() {
    // prevent canvas being in front.
    if (this.kNode.zIndex() === 1) {
      return;
    }
    this.kNode.moveDown();
  }
}
