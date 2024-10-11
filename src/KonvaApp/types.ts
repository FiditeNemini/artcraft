import { Vector2d } from "konva/lib/types";
import { BaseNode } from "./Nodes/BaseNode";
// import { NetworkedNode } from "./Nodes/NetworkedNode";
import { VideoNode } from "./Nodes/VideoNode";
import { ImageNode } from "./Nodes/ImageNode";
import { TextNode } from "./Nodes/TextNodes";
import { NodeType } from "./Nodes/constants";
import { NavigateFunction } from "react-router-dom";

export interface EngineOptions {
  navigate: NavigateFunction;
  sceneToken?: string;
}
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

export interface TransformationData extends Omit<Transformation, "kNodeId"> {
  zIndex: number;
}

export interface TextNodeChildrenTransformData {
  wrapperRectTransform: TransformationData;
  textNodeTransform: TransformationData;
}
export interface NodeData {
  type: NodeType;
  transform: TransformationData;
  // Image Node / Video Node data
  mediaFileUrl?: string;
  mediaFileToken?: string;

  //Text Node Data
  textNodeData?: TextNodeData;
  textChildrenTransforms?: TextNodeChildrenTransformData;
}
