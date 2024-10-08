import { Vector2d } from "konva/lib/types";
import { BaseNode } from "./Nodes/BaseNode";
// import { NetworkedNode } from "./Nodes/NetworkedNode";
import { VideoNode } from "./Nodes/VideoNode";
import { ImageNode } from "./Nodes/ImageNode";
import { TextNode } from "./Nodes/TextNodes";

export interface TextNodeData {
  text: string;
}

export type MediaNode =
  // | NetworkedNode
  BaseNode | VideoNode | ImageNode | TextNode;

export interface Position extends Vector2d {}
export interface Scale extends Vector2d {}
export interface Size {
  width: number;
  height: number;
}

export interface Transformation {
  kNodeId: number | string;
  position: Position;
  size: Size;
  scale: Scale;
  rotation: number;
}
