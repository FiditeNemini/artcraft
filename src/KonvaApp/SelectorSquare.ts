import Konva from "konva";
import { NodeTransformer } from "./NodeTransformer";
import { SelectionManager } from "./SelectionManager";

interface SqaureCoordinates {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}
export class SelectorSquare {
  private kSquare: Konva.Rect;
  private selecting: boolean = false;
  private sqaureCoordinates: SqaureCoordinates = {
    x1: 0,
    x2: 0,
    y1: 0,
    y2: 0,
  };

  constructor() {
    this.kSquare = new Konva.Rect({
      fill: "	rgb(250, 128, 114, 0.3)",
      stroke: "salmon",
      visible: false,
      // disable events to not interrupt with events
      listening: false,
    });
  }
  public getKonvaNode() {
    return this.kSquare;
  }
  public enable({
    captureCanvasRef,
    nodeTransformerRef,
    selectionManagerRef,
    stage,
  }: {
    captureCanvasRef: Konva.Rect;
    nodeTransformerRef: NodeTransformer;
    selectionManagerRef: SelectionManager;
    stage: Konva.Stage;
  }) {
    stage.on("mousedown touchstart", (e) => {
      const stagePointerPos = stage.getPointerPosition();
      if (
        (e.target !== stage && e.target !== captureCanvasRef) || // do nothing if we mousedown on any shape
        stagePointerPos === null || // do nothing if pointers not available
        e.evt.shiftKey // do nothing so then multiselect is more forgiving in misclicks
      ) {
        return;
      }

      // start handle mousedown
      e.evt.preventDefault();
      if (e.target === stage || e.target === captureCanvasRef) {
        //moused down on empty space, clear previous selection first
        nodeTransformerRef.clear();
        selectionManagerRef.clearSelection();
      }

      // this starts drawing the square
      this.sqaureCoordinates = {
        x1: stagePointerPos.x,
        y1: stagePointerPos.y,
        x2: stagePointerPos.x,
        y2: stagePointerPos.y,
      };
      this.kSquare.size({
        width: 0,
        height: 0,
      });
      this.selecting = true;
    });

    stage.on("mousemove touchmove", (e) => {
      // do nothing if we didn't start selection
      const stagePointerPos = stage.getPointerPosition();
      if (!this.selecting || stagePointerPos === null) {
        return;
      }

      // handle drawing square according to mouse move
      e.evt.preventDefault();
      this.sqaureCoordinates = {
        ...this.sqaureCoordinates,
        x2: stagePointerPos.x,
        y2: stagePointerPos.y,
      };
      const { x1, y1, x2, y2 } = this.sqaureCoordinates;
      this.kSquare.moveToTop();
      this.kSquare.setAttrs({
        visible: true,
        x: Math.min(x1, x2),
        y: Math.min(y1, y2),
        width: Math.abs(x2 - x1),
        height: Math.abs(y2 - y1),
      });

      stage.on("mouseup touchend", (e) => {
        // do nothing if we didn't start selection
        this.selecting = false;
        if (!this.kSquare.visible()) {
          return;
        }
        e.evt.preventDefault();
        // update visibility
        this.kSquare.visible(false);
        // Find all the Nodes and feed them into Selectmanager
        var shapes = stage.find("Image");
        var box = this.kSquare.getClientRect();
        var foundKNodes = shapes.filter((shape) =>
          Konva.Util.haveIntersection(box, shape.getClientRect()),
        );
        if (foundKNodes.length > 0) {
          selectionManagerRef.selectKNodes(foundKNodes);
          nodeTransformerRef.enable({
            selectedNodes: selectionManagerRef.getSelectedNodes(),
          });
        }
      });
    });
  }
}
