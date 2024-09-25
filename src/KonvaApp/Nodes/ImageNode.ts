import Konva from "konva";
import { Layer } from "konva/lib/Layer";
import { NetworkedNodeContext } from "./NetworkedNodeContext";
import { SelectionManager } from "../SelectionManager";
import { NodeTransformer } from "../NodeTransformer";

interface ImageNodeContructor {
  mediaLayer: Layer;
  x: number;
  y: number;
  imageFile: File;
  selectionManagerRef: SelectionManager;
  nodeTransformer: NodeTransformer;
}

export class ImageNode extends NetworkedNodeContext {
  public imageURL: string;

  private imageObject: HTMLImageElement;

  constructor({
    mediaLayer,
    x,
    y,
    imageFile,
    selectionManagerRef,
    nodeTransformer,
  }: ImageNodeContructor) {
    super({
      nodeTransfomerRef: nodeTransformer,
      selectionManagerRef: selectionManagerRef,
      mediaLayer: mediaLayer,
    });
    this.mediaLayer = mediaLayer;
    this.didFinishLoading = false;

    const imageComponent = new Image();

    this.imageObject = imageComponent;
    this.imageObject.crossOrigin = "anonymous";

    this.kNode = new Konva.Image({
      x: x,
      y: y,
      image: undefined, // to do replace with placeholder
      width: 100,
      height: 100,
      fill: "gray",
      draggable: true,
    });

    this.mediaLayer.add(this.kNode);

    imageComponent.onload = () => {
      if (!this.kNode) {
        return;
      }

      this.kNode.image(imageComponent);
      this.kNode.width(imageComponent.width);
      this.kNode.height(imageComponent.height);

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
