import Konva from "konva";
import { SelectionManager } from "../NodesManagers";
import { BaseNode } from "./BaseNode";

export class NetworkedNode extends BaseNode {
  public kNode: Konva.Image;
  public didFinishLoading: boolean = false;

  constructor({
    kNode,
    selectionManagerRef,
    mediaLayerRef,
  }: {
    kNode: Konva.Image;
    selectionManagerRef: SelectionManager;
    mediaLayerRef: Konva.Layer;
  }) {
    super({
      kNode,
      selectionManagerRef,
      mediaLayerRef,
    });
    this.kNode = kNode;
    this.didFinishLoading = false;
  }
}
