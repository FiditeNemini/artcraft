import React from "react";
import IframeResizer from "iframe-resizer-react";
import "./Scene3D.scss";

interface Scene3DProps {
  mode: string;
  fullScreen?: boolean;
  urlParams?: string;
}

export default function Scene3D({
  mode,
  fullScreen = false,
  urlParams,
}: Scene3DProps) {
  return (
    <div
      className={`${
        fullScreen ? "fy-scene-3d-fullscreen" : "fy-scene-3d-default"
      }`.trim()}
    >
      <IframeResizer
        src={`https://engine.fakeyou.com?mode=${mode}`}
        width="100%"
        height="100%"
        id=""
      />
    </div>
  );
}
