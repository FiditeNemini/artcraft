import Konva from "konva";
import { Node, NodeConfig } from "konva/lib/Node";
import { MediaNode } from "../types";

export class NodeTransformer {
  private kTransformer: Konva.Transformer;
  private selectedKNodes: Set<MediaNode> | undefined;

  constructor() {
    this.kTransformer = new Konva.Transformer({
      anchorStyleFunc: (anchor) => {
        // anchor is Konva.Rect instance
        // you manually change its styling
        anchor.cornerRadius(10);
        if (anchor.hasName("top-center") || anchor.hasName("bottom-center")) {
          anchor.height(6);
          anchor.offsetY(3);
          anchor.width(30);
          anchor.offsetX(15);
        }
        if (anchor.hasName("middle-left") || anchor.hasName("middle-right")) {
          anchor.height(30);
          anchor.offsetY(15);
          anchor.width(6);
          anchor.offsetX(3);
        }
        // if (anchor.hasName("rotater")) {
        //   anchor.offsetY(-25);
        // }
        // you also can set other properties
        // e.g. you can set fillPatternImage to set icon to the anchor
      },
    });
  }
  public getKonvaNode() {
    return this.kTransformer;
  }
  public enable({ selectedNodes }: { selectedNodes: Set<MediaNode> }) {
    this.selectedKNodes = selectedNodes;
    const kNodesArray = Array.from(selectedNodes).reduce((acc, node) => {
      if (node.kNode) {
        node.listenToBaseKNodeTransformations();
        acc.push(node.kNode);
      }
      return acc;
    }, [] as Node<NodeConfig>[]);
    this.kTransformer.moveToTop();
    this.kTransformer.nodes(kNodesArray);
  }
  public clear() {
    this.kTransformer.nodes([]);
    this.selectedKNodes?.forEach((node) => {
      node.removeListenToBaseKNodeTransformations();
    });
    this.selectedKNodes = undefined;
  }
}
