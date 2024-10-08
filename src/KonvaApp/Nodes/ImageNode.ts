import Konva from "konva";
import { NetworkedNode } from "./NetworkedNode";
import { SelectionManager } from "../NodesManagers";
import { Position, Size } from "../types";
import { minNodeSize, transparent } from "./constants";
import { NodeUtilities } from "./NodeUtilities";

interface ImageNodeContructor {
  canvasPosition: Position;
  canvasSize: Size;
  imageFile: File;
  mediaLayerRef: Konva.Layer;
  selectionManagerRef: SelectionManager;
}

export class ImageNode extends NetworkedNode {
  // public imageURL: string;
  public kNode: Konva.Image;

  private imageObject: HTMLImageElement;

  constructor({
    canvasPosition,
    canvasSize,
    imageFile,
    mediaLayerRef,
    selectionManagerRef,
  }: ImageNodeContructor) {
    // kNodes need to be created first to guaruntee it is not undefined in parent's context
    const kNode = new Konva.Image({
      image: undefined, // to do replace with placeholder
      size: minNodeSize,
      position: NodeUtilities.positionNodeOnCanvasCenter({
        canvasOffset: canvasPosition,
        componentSize: minNodeSize,
        maxSize: canvasSize,
      }),
      fill: "gray",
      draggable: true,
      strokeScaleEnabled: false,
    });

    super({
      selectionManagerRef: selectionManagerRef,
      mediaLayerRef: mediaLayerRef,
      kNode: kNode,
    });
    this.kNode = kNode;
    this.mediaLayerRef.add(this.kNode);

    const imageComponent = new Image();
    this.imageObject = imageComponent;
    this.imageObject.crossOrigin = "anonymous";
    this.didFinishLoading = false;

    imageComponent.onload = () => {
      if (!this.kNode) {
        return;
      }

      const adjustedSize = NodeUtilities.adjustNodeSizeToCanvas({
        componentSize: {
          width: imageComponent.width,
          height: imageComponent.height,
        },
        maxSize: canvasSize,
      });
      const centerPosition = NodeUtilities.positionNodeOnCanvasCenter({
        canvasOffset: canvasPosition,
        componentSize: adjustedSize,
        maxSize: canvasSize,
      });
      this.kNode.image(imageComponent);
      this.kNode.setSize(adjustedSize);
      this.kNode.setPosition(centerPosition);

      this.listenToBaseKNode();
      this.kNode.fill(transparent);
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
      this.kNode.fill(transparent);
      this.kNode.draw();
    };
  }
}
