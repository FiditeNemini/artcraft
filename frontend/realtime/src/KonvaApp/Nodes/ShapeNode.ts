import Konva from "konva";
import { SelectionManager } from "../NodesManagers";
import { Position, Size, NodeData, TransformationData } from "../types";
import { BaseNode } from "./BaseNode";
import { NodeType } from "./constants";
import { NodeUtilities } from "./NodeUtilities";

export enum ShapeType {
    CIRCLE = "circle",
    SQUARE = "square", 
    TRIANGLE = "triangle"
  }
  
interface ShapeNodeConstructor {
  canvasPosition: Position;
  canvasSize: Size;
  shapeType: ShapeType;
  size: number;
  color?: string; // Hex color string
  transform?: TransformationData;
  mediaLayerRef: Konva.Layer;
  selectionManagerRef: SelectionManager;
}

export class ShapeNode extends BaseNode {
  public kNode: Konva.Group;
  private shapeType: ShapeType;
  private shape: Konva.Shape;

  constructor({
    canvasPosition,
    canvasSize,
    shapeType,
    size,
    color = "#ff0000", // Default red if no color provided
    transform: existingTransform,
    mediaLayerRef,
    selectionManagerRef,
  }: ShapeNodeConstructor) {
    
    const transform = NodeUtilities.getInitialTransform({
      existingTransform,
      canvasPosition,
      canvasSize,
    });

    // Create group to satisfy BaseNode type requirements
    const group = new Konva.Group({
      ...transform,
      draggable: true,
    });

    super({
      selectionManagerRef: selectionManagerRef,
      mediaLayerRef: mediaLayerRef,
      kNode: group
    });

    this.kNode = group;
    this.shapeType = shapeType;

    // Create the actual shape inside the group
    switch (shapeType) {
      case ShapeType.CIRCLE:
        this.shape = new Konva.Circle({
          radius: 50,
          fill: color,
          strokeScaleEnabled: false
        });
        break;

      case ShapeType.SQUARE:
        this.shape = new Konva.Rect({
          width: 100,
          height: 100,
          fill: color,
          strokeScaleEnabled: false
        });
        break;

      case ShapeType.TRIANGLE:
        this.shape = new Konva.RegularPolygon({
          sides: 3,
          radius: 50,
          fill: color,
          strokeScaleEnabled: false
        });
        break;

      default:
        throw new Error('Invalid shape type');
    }

    // Add shape to group
    const centerPosition = NodeUtilities.positionNodeOnCanvasCenter({
        canvasOffset: canvasPosition,
        componentSize: canvasSize,
        maxSize: canvasSize,
      });
    this.kNode.setPosition(centerPosition);
    this.kNode.add(this.shape);
    this.mediaLayerRef.add(this.kNode);
    this.listenToBaseKNode();
    this.mediaLayerRef.draw();
  }

  public getNodeData(canvasPosition: Position) {
    const data: NodeData = {
      type: NodeType.SHAPE,
      transform: {
        position: {
          x: this.kNode.position().x - canvasPosition.x,
          y: this.kNode.position().y - canvasPosition.y,
        },
        size: this.kNode.size(),
        rotation: this.kNode.rotation(),
        scale: {
          x: this.kNode.scaleX(),
          y: this.kNode.scaleY(),
        },
        zIndex: this.kNode.getZIndex(),
      }
    };
    return data;
  }
}
