import React, { useCallback, useEffect, useRef } from "react";
//import IframeResizer from "iframe-resizer-react";
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
  const engineBaseUrl = "https://engine.fakeyou.com";

  let engineUrl = `${engineBaseUrl}/?mode=${mode}`;

  const iframeRef = useRef<HTMLIFrameElement>(null);


  const onMessage = useCallback((event: MessageEvent) => {
    if (event.origin !== engineBaseUrl)
      return;
    
    console.log("engine message received", event.data, event);

    if (event.data === "studio-ready") {
      const studio = iframeRef.current?.contentWindow;
      if (!studio) return;

      studio.postMessage("save-scene", engineBaseUrl);
    } else if (
      typeof event.data === "string"
      && event.data.startsWith("scene-saved:")
    ) {
      const mediaToken = event.data.match(/scene-saved:(.+)/)?.[1];
      console.log("saved scene media token:", mediaToken);

    } else if (event.data === "scene-save-failed") {
      console.error("Failed to save the scene!");
    }
  }, []);


  useEffect(() => {
    window.addEventListener("message", onMessage);

    return () => {
      window.removeEventListener("message", onMessage);
    }
  }, [onMessage]);

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
      {/*<IframeResizer src={engineUrl} width="100%" height="100%" id="" />*/}
      <iframe
        title="Storyteller Engine"
        ref={iframeRef}
        src={engineUrl}
        width="100%"
        height="100%"
      />
    </div>
  );
}
