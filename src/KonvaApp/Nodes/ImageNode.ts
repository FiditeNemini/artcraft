import Konva from "konva";
import { NetworkedNodeContext } from "./NetworkedNodeContext";
import { SelectionManager } from "../NodesManagers";
import { Position, Size } from "../types";

interface ImageNodeContructor {
  position: Position;
  canvasSize: Size;
  imageFile: File;
  mediaLayerRef: Konva.Layer;
  selectionManagerRef: SelectionManager;
}

export class ImageNode extends NetworkedNodeContext {
  public imageURL: string;

  private imageObject: HTMLImageElement;

  constructor({
    position,
    canvasSize,
    imageFile,
    mediaLayerRef,
    selectionManagerRef,
  }: ImageNodeContructor) {
    // kNodes need to be created first to guaruntee it is not undefined in parent's context
    const kNode = new Konva.Image({
      x: position.x,
      y: position.y,
      image: undefined, // to do replace with placeholder
      width: 100,
      height: 100,
      fill: "gray",
      draggable: true,
    });

    super({
      selectionManagerRef: selectionManagerRef,
      mediaLayerRef: mediaLayerRef,
      kNode: kNode,
    });
    this.mediaLayerRef.add(this.kNode);

    const imageComponent = new Image();
    this.imageObject = imageComponent;
    this.imageObject.crossOrigin = "anonymous";
    this.didFinishLoading = false;

    imageComponent.onload = () => {
      if (!this.kNode) {
        return;
      }

      const renderSize = this.calculateRenderSizeOnLoad({
        componentSize: {
          width: imageComponent.width,
          height: imageComponent.height,
        },
        maxSize: canvasSize,
      });

      this.kNode.image(imageComponent);
      this.kNode.setSize(renderSize);

      this.listenToBaseKNode();
      this.kNode.fill(null);
      this.mediaLayerRef.draw();

      this.didFinishLoading = true;
    };

    imageComponent.src = URL.createObjectURL(imageFile);
  }

  async updateImage(newImageSrc: string) {
    const newImage = new Image();
    newImage.src = newImageSrc;
    newImage.onload = () => {
      if (!this.kNode) {
        return;
      }
      this.kNode.image(newImage);
      this.kNode.width(newImage.width);
      this.kNode.height(newImage.height);
      this.kNode.fill(null);
      this.kNode.draw();
    };
  }
}
