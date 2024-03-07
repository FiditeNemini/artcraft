import React from "react";
import IframeResizer from "iframe-resizer-react";
import "./Scene3D.scss";

// See the following page for Storyteller Engine's query param documentation:
// https://www.notion.so/storytellerai/Studio-Iframe-Query-Params-a748a9929ec3404780c3884e7fb89bdb
//
// You can supply either an `objectId` or a `sceneMediaFileToken` when loading in studio mode.
interface Scene3DProps {
  mode: string;
  fullScreen?: boolean;
  urlParams?: string;
  objectId?: string;
  sceneMediaFileToken?: string;
  className?: string;
}

export default function Scene3D({
  mode,
  fullScreen = false,
  objectId,
  sceneMediaFileToken,
  urlParams,
  className,
}: Scene3DProps) {
  let engineUrl = `https://engine.fakeyou.com?mode=${mode}`;

  if (sceneMediaFileToken) {
    const sceneUrlRef = `remote://${sceneMediaFileToken}.scn.ron`;
    engineUrl += `&scene=${sceneUrlRef}`;
  } else if (objectId) {
    engineUrl += `&objectId=${objectId}`;
  }

  return (
    <div
      className={`${
        fullScreen ? "fy-scene-3d-fullscreen" : "fy-scene-3d-default"
      } ${className ? className : ""}`.trim()}
    >
      <IframeResizer src={engineUrl} width="100%" height="100%" id="" />
    </div>
  );
}
