import Konva from "konva";
import { SelectionManager } from "../NodesManagers";
import { BaseNode } from "./BaseNode";
import { Position, Size, TextNodeData } from "../types";
import { NodeUtilities } from "./NodeUtilities";

export class TextNode extends BaseNode {
  public kNode: Konva.Group;
  public rectNode: Konva.Rect;
  public textNode: Konva.Text;
  private originalTextSize: Size;
  private textNodeData: TextNodeData;

  public didFinishLoading: boolean = true;

  constructor({
    textNodeData,
    selectionManagerRef,
    mediaLayerRef,
    position,
  }: {
    textNodeData: TextNodeData;
    selectionManagerRef: SelectionManager;
    mediaLayerRef: Konva.Layer;
    position: Position;
  }) {
    console.log(textNodeData);
    const textNode = new Konva.Text({
      ...textNodeData,
      x: 10,
      y: 10,
      width: 500,
    });
    const kNode = new Konva.Group({
      position: position,
      width: textNode.width() + 20,
      height: textNode.height() + 20,
      draggable: true,
    });
    const rectNode = new Konva.Rect({
      x: 0,
      y: 0,
      width: textNode.width() + 20,
      height: textNode.height() + 20,
      strokeScaleEnabled: false,
      name: "wrapper",
    });

    super({
      selectionManagerRef: selectionManagerRef,
      mediaLayerRef: mediaLayerRef,
      kNode: kNode,
    });
    this.textNodeData = textNodeData;
    this.kNode = kNode;
    this.textNode = textNode;
    this.rectNode = rectNode;
    this.kNode.add(this.rectNode);
    this.kNode.add(this.textNode);
    this.mediaLayerRef.add(this.kNode);
    this.originalTextSize = this.textNode.size();
    this.listenToBaseKNode();
  }
  public listenToBaseKNodeTransformations() {
    this.kNode.on("transformstart", () => {
      // console.log("transformstart", event.target._id);
      this.selectionManagerRef.transformStart();
    });

    this.kNode.on("transform", () => {
      const newBoxSize = {
        width: this.kNode.width() * this.kNode.scaleX(),
        height: this.kNode.height() * this.kNode.scaleY(),
        scaleX: 1,
        scaleY: 1,
      };
      this.rectNode.setAttrs(newBoxSize);
      this.kNode.setAttrs(newBoxSize);
      const scaleX = (newBoxSize.width - 20) / this.originalTextSize.width;
      const scaleY = (newBoxSize.height - 20) / this.originalTextSize.height;
      this.textNode.setAttrs({
        // make sure these stay the same
        x: 10,
        y: 10,
        size: this.originalTextSize,
        //while these changes in size
        scaleX: scaleX,
        scaleY: scaleY,
      });
    });
    this.kNode.on("transformend", () => {
      // console.log("transformend", event.target._id);
      NodeUtilities.printKNodeAttrs(this.kNode);
      NodeUtilities.printKNodeAttrs(this.textNode);
      this.selectionManagerRef.transformEnd(this);
    });
  }
}
