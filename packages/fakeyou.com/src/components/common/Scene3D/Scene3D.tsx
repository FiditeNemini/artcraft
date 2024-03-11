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
  onSceneSavedCallback?: (mediaToken: string) => void;
}

export default function Scene3D({
  mode,
  fullScreen = false,
  objectId,
  sceneMediaFileToken,
  urlParams,
  className,
  onSceneSavedCallback,
}: Scene3DProps) {
  const engineBaseUrl = "https://engine.fakeyou.com";

  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  const onMessage = useCallback((event: MessageEvent) => {
    console.log("engine message received", event.data, event);

    if (event.origin !== engineBaseUrl)
      return;

    if (event.data === "studio-ready") {
      console.log("studio-ready message (1)");

      const studio = iframeRef.current?.contentWindow;
      if (!studio) return;

      console.log("studio-ready message (2)");

      studio.postMessage("save-scene", engineBaseUrl);
    } else if (
      typeof event.data === "string"
      && event.data.startsWith("scene-saved:")
    ) {
      const mediaToken = event.data.match(/scene-saved:(.+)/)?.[1];
      console.log("saved scene media token:", mediaToken);

      if (onSceneSavedCallback !== undefined && mediaToken !== undefined) {
        onSceneSavedCallback(mediaToken);
      }

    } else if (event.data === "scene-save-failed") {
      console.error("Failed to save the scene!");
    }
  }, []);


  useEffect(() => {
    /*
    if (iframeRef && iframeRef.current) {
      console.log("installing event listener for messages");
      
      // NB: Compiler complains about ref going out of scope before destructor is called.
      let ref = iframeRef.current;

      // TODO(bt,2024-03-08): Fix typescript 'any' hack
      (ref as any).addEventListener("message", onMessage);

      return () => {
        console.log("uninstalling event listener for messages");

        // TODO(bt,2024-03-08): Fix typescript 'any' hack
        (ref as any).removeEventListener("message", onMessage);
      }
    }
    */

    console.log("installing event listener for messages");
    window.addEventListener("message", onMessage, false);

    return () => {
      console.log("uninstalling event listener for messages");
      window.removeEventListener("message", onMessage, false);
    }
  }, [onMessage]);
  //}, [onMessage, iframeRef]);


  let engineUrl = `${engineBaseUrl}/?mode=${mode}`;

  if (sceneMediaFileToken) {
    const sceneUrlRef = `remote://${sceneMediaFileToken}.scn.ron`;
    engineUrl += `&scene=${sceneUrlRef}`;
  } else if (objectId) {
    engineUrl += `&objectId=${objectId}`;
  }

  console.log('installing iframe engine and callbacks');

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
