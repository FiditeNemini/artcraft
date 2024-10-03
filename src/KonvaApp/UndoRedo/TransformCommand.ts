import Konva from "konva";
import { ICommand } from "./ICommand";
import { MediaNode, Transformation } from "../types";

export class TransformCommand implements ICommand {
  private nodes: Set<MediaNode>;
  private initialTransformations: Map<MediaNode, Transformation>;
  private finalTransformations: Map<MediaNode, Transformation>;
  private layerRef: Konva.Layer;

  constructor({
    nodes,
    initialTransformations,
    finalTransformations,
    layerRef,
  }: {
    nodes: Set<MediaNode>;
    initialTransformations: Map<MediaNode, Transformation>;
    finalTransformations: Map<MediaNode, Transformation>;
    layerRef: Konva.Layer;
  }) {
    this.nodes = new Set<MediaNode>(nodes);
    this.initialTransformations = initialTransformations;
    this.finalTransformations = finalTransformations;
    this.layerRef = layerRef;
  }
  execute() {
    this.nodes.forEach((node) => {
      const finalTransformation = this.finalTransformations.get(node);
      if (finalTransformation) {
        node.kNode.position(finalTransformation.position);
        node.kNode.size(finalTransformation.size);
        node.kNode.rotation(finalTransformation.rotation);
        node.kNode.scaleX(finalTransformation.scale.scaleX);
        node.kNode.scaleY(finalTransformation.scale.scaleY);
      }
    });
    this.layerRef.draw();
  }

  undo() {
    this.nodes.forEach((node) => {
      const initialTransformation = this.initialTransformations.get(node);
      if (initialTransformation) {
        node.kNode.position(initialTransformation.position);
        node.kNode.size(initialTransformation.size);
        node.kNode.rotation(initialTransformation.rotation);
        node.kNode.scaleX(initialTransformation.scale.scaleX);
        node.kNode.scaleY(initialTransformation.scale.scaleY);
      }
    });
    this.layerRef.draw();
  }
}
