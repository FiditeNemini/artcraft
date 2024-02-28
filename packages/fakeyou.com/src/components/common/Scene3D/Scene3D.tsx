import React from "react";
import IframeResizer from "iframe-resizer-react";
import "./Scene3D.scss";

// See the following page for Storyteller Engine's query param documentation:
// https://www.notion.so/storytellerai/Studio-Iframe-Query-Params-a748a9929ec3404780c3884e7fb89bdb
interface Scene3DProps {
  mode: string;
  fullScreen?: boolean;
  urlParams?: string;
  objectId?: string;
}

export default function Scene3D({
  mode,
  fullScreen = false,
  objectId,
  urlParams,
}: Scene3DProps) {

  let engineUrl = `https://engine.fakeyou.com?mode=${mode}`;

  if (objectId) {
    engineUrl += `&objectId=${objectId}`;
  }

  return (
    <div
      className={`${
        fullScreen ? "fy-scene-3d-fullscreen" : "fy-scene-3d-default"
      }`.trim()}
    >
      <IframeResizer
        src={engineUrl}
        width="100%"
        height="100%"
        id=""
      />
    </div>
  );
}
