import { VideoNode } from "./Nodes/VideoNode";
import { ImageNode } from "./Nodes/ImageNode";
import { NetworkedNodeContext } from "./Nodes/NetworkedNodeContext";
export type MediaNode = NetworkedNodeContext | VideoNode | ImageNode;
export interface Size {
  width: number;
  height: number;
}
export interface Position {
  x: number;
  y: number;
}
