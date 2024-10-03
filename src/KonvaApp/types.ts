import { VideoNode } from "./Nodes/VideoNode";
import { ImageNode } from "./Nodes/ImageNode";
import { NetworkedNodeContext } from "./Nodes/NetworkedNodeContext";
export type MediaNode = NetworkedNodeContext | VideoNode | ImageNode;

export interface Scale {
  scaleX: number;
  scaleY: number;
}
export interface Size {
  width: number;
  height: number;
}
export interface Position {
  x: number;
  y: number;
}
export interface Transformation {
  position: Position;
  size: Size;
  scale: Scale;
  rotation: number;
}
