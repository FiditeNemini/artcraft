import Konva from "konva";
import { Position, Size } from "../types";

export const NodeUtilities = {
  adjustNodeSizeToCanvas,
  positionNodeOnCanvasCenter,
  printKNodeAttrs,
};
function adjustNodeSizeToCanvas({
  componentSize,
  maxSize,
}: {
  componentSize: Size;
  maxSize: Size;
}) {
  const adjustedSize = {
    width: componentSize.width,
    height: componentSize.height,
  };
  if (adjustedSize.width > maxSize.width) {
    const scaleDown = maxSize.width / adjustedSize.width;
    adjustedSize.width = adjustedSize.width * scaleDown;
    adjustedSize.height = adjustedSize.height * scaleDown;
  }
  if (adjustedSize.height > maxSize.height) {
    const scaleDownAgain = maxSize.height / adjustedSize.height;
    adjustedSize.width = adjustedSize.width * scaleDownAgain;
    adjustedSize.height = adjustedSize.height * scaleDownAgain;
  }
  return adjustedSize;
}

function positionNodeOnCanvasCenter({
  canvasOffset,
  componentSize,
  maxSize,
}: {
  canvasOffset: Position;
  componentSize: Size;
  maxSize: Size;
}) {
  return {
    x: canvasOffset.x + maxSize.width / 2 - componentSize.width / 2,
    y: canvasOffset.y + maxSize.height / 2 - componentSize.height / 2,
  };
}

function printKNodeAttrs(kNode: Konva.Node) {
  console.log({
    position: kNode.position(),
    size: kNode.size(),
    scale: kNode.scale(),
    rotation: kNode.rotation(),
  });
}
