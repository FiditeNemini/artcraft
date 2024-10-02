import Konva from "konva";
import { Layer } from "konva/lib/Layer";
import { NetworkedNodeContext } from "./NetworkedNodeContext";
import { NodeTransformer, SelectionManager } from "../NodesManagers";
import { Position, Size } from "../types";

interface ImageNodeContructor {
  mediaLayer: Layer;
  position: Position;
  canvasSize: Size;
  imageFile: File;
  selectionManagerRef: SelectionManager;
  nodeTransformerRef: NodeTransformer;
}

export class ImageNode extends NetworkedNodeContext {
  public imageURL: string;

  private imageObject: HTMLImageElement;

  constructor({
    mediaLayer,
    position,
    canvasSize,
    imageFile,
    selectionManagerRef,
    nodeTransformerRef,
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
      nodeTransfomerRef: nodeTransformerRef,
      selectionManagerRef: selectionManagerRef,
      mediaLayer: mediaLayer,
      kNode: kNode,
    });
    this.mediaLayer.add(this.kNode);

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
      this.mediaLayer.draw();

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
