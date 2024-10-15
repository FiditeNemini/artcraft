import Konva from "konva";
import { MediaNode, TransformationData } from "../types";

export class NodeIsolator {
  private mediaLayerRef: Konva.Layer;
  private backgroundRect: Konva.Rect;
  private nodeIsolationLayerRef: Konva.Layer;
  private currentNode: MediaNode | undefined;
  private originalKNodeTransformation: TransformationData | undefined;
  private adjustSizeFnRef: (() => void) | undefined;

  constructor({
    mediaLayerRef,
    nodeIsolationLayerRef,
  }: {
    mediaLayerRef: Konva.Layer;
    nodeIsolationLayerRef: Konva.Layer;
  }) {
    this.mediaLayerRef = mediaLayerRef;
    this.nodeIsolationLayerRef = nodeIsolationLayerRef;
    this.backgroundRect = new Konva.Rect({
      fill: "rgba(0,0,0,0.5)",
    });
  }

  private adjustSizes() {
    this.backgroundRect.setAttrs({
      width: window.innerWidth,
      height: window.innerHeight,
    });
    if (this.currentNode && this.originalKNodeTransformation) {
      const originalSize = {
        width:
          this.originalKNodeTransformation.size.width *
          this.originalKNodeTransformation.scale.x,
        height:
          this.originalKNodeTransformation.size.height *
          this.originalKNodeTransformation.scale.y,
      };
      const maxWidth = window.innerWidth * 0.8;
      const isolationResize = {
        width: maxWidth,
        height: (maxWidth / originalSize.width) * originalSize.height,
      };
      const maxHeight = window.innerHeight - 350;
      if (isolationResize.height > maxHeight) {
        isolationResize.height = maxHeight;
        isolationResize.width =
          (maxHeight / originalSize.height) * originalSize.width;
      }
      const isolationReposition = {
        x: (window.innerWidth - isolationResize.width) / 2,
        y: (maxHeight - isolationResize.height) / 2 + 100,
      };
      this.currentNode.kNode.setAttrs({
        scale: { x: 1, y: 1 },
        rotation: 0,
        size: isolationResize,
        position: isolationReposition,
      });
    }
  }
  public enterIsolation(node: MediaNode) {
    this.currentNode = node;
    this.preserveKNodeTransformation(node.kNode);
    this.currentNode.kNode.remove();

    this.adjustSizeFnRef = () => this.adjustSizes();
    this.adjustSizeFnRef();
    window.addEventListener("resize", this.adjustSizeFnRef);
    this.nodeIsolationLayerRef.add(this.backgroundRect);
    this.nodeIsolationLayerRef.add(this.currentNode.kNode);
  }

  public exitIsolation() {
    if (this.adjustSizeFnRef) {
      window.removeEventListener("resize", this.adjustSizeFnRef);
      this.adjustSizeFnRef = undefined;
    }
    if (!this.currentNode) {
      console.error("NodeIsolator lost crrent node before isolation!!");
      return;
    }
    this.currentNode.kNode.remove();
    this.backgroundRect.remove();
    this.mediaLayerRef.add(this.currentNode.kNode);
    this.currentNode.kNode.setAttrs(this.originalKNodeTransformation);
  }
  private preserveKNodeTransformation(kNode: Konva.Node) {
    this.originalKNodeTransformation = {
      position: kNode.position(),
      size: kNode.size(),
      rotation: kNode.rotation(),
      scale: {
        x: kNode.scaleX(),
        y: kNode.scaleY(),
      },
      zIndex: kNode.zIndex(),
    };
  }
}
