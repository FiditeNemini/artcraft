import { VideoNode } from "./Nodes/VideoNode";
import { ImageNode } from "./Nodes/ImageNode";
import { NetworkedNodeContext } from "./Nodes/NetworkedNodeContext";
export type MediaNode = NetworkedNodeContext | VideoNode | ImageNode;

export interface NodeDimensions {
  x: number;
  y: number;
  rotation: number;
  width: number;
  height: number;
  scaleX: number;
  scaleY: number;
}
