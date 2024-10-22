import { NodeType, BaseNode, ImageNode, TextNode, VideoNode } from "../Nodes";

import { TransformationData } from "./Transformation";

import { TextNodeData } from "./Text";

export type MediaNode =
  // | NetworkedNode
  BaseNode | VideoNode | ImageNode | TextNode;

export type ImageNodeData = {
  mediaFileUrl: string;
  mediaFileToken?: string;
};
export type VideoNodeData = {
  mediaFileUrl: string;
  mediaFileToken?: string;
  isChroma: boolean;
  chromaColor: {
    red: number;
    green: number;
    blue: number;
  };
  extractionURL?: string;
};

export type NodeData = {
  type: NodeType;
  transform: TransformationData;

  // Text Node Data
  imageNodeData?: ImageNodeData;
  textNodeData?: TextNodeData;
  videoNodeData?: VideoNodeData;
};
