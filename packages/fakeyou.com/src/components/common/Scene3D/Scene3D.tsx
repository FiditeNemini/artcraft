import React, { useCallback, useEffect, useRef } from "react";
//import IframeResizer from "iframe-resizer-react";
import "./Scene3D.scss";

// See the following page for Storyteller Engine's query param documentation:
// https://www.notion.so/storytellerai/Studio-Iframe-Query-Params-a748a9929ec3404780c3884e7fb89bdb
//
// You can supply either an `objectId` or a `sceneMediaFileToken` when loading in studio mode.
interface Scene3DProps {
  mode: string;
  skybox?: string;
  fullScreen?: boolean;
  urlParams?: string;
  className?: string;
  onSceneSavedCallback?: (mediaToken: string) => void;

  // NB: The following parameters are mutally exclusive.
  // We should use Typescript to enforce this.
  objectId?: string; // built-in objects
  sceneMediaFileToken?: string; // scn.ron native storyteller engine scenes
  mixamoUrl?: string; // a mixamo animation
  bvhUrl?: string; // a MocapNet animation in BVH format
  sceneImportUrl?: string; // a generic (non-storyteller) scene: GLB, GLTF, etc.
}

export default function Scene3D({
  mode,
  skybox,
  fullScreen = false,
  className,
  onSceneSavedCallback,

  // NB: The following parameters are mutally exclusive.
  // We should use Typescript to enforce this.
  objectId,
  sceneMediaFileToken,
  mixamoUrl,
  bvhUrl,
  sceneImportUrl,

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

      // NB: Example of how to call the API in the other direction:
      //  studio.postMessage("save-scene", engineBaseUrl);
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
  }, [onSceneSavedCallback]);


  useEffect(() => {
    window.addEventListener("message", onMessage, false);
    return () => {
      window.removeEventListener("message", onMessage, false);
    }
  }, [onMessage]);


  let engineUrl = `${engineBaseUrl}/?mode=${mode}`;

  if (skybox) {
    engineUrl += `&skybox=${skybox}`;
  }

  if (sceneMediaFileToken) {
    // NB: Storyteller Engine makes the API call to load the scene.
    // We don't need to pass the bucket path.
    // The engine, does, however, need a `.scn.ron` file extension.
    const sceneUrlRef = `remote://${sceneMediaFileToken}.scn.ron`;
    engineUrl += `&scene=${sceneUrlRef}`;
  } else if (objectId) {
    // NB: This is an engine built-in, eg. `couch.gltf` or `sample-room.gltf`.
    engineUrl += `&objectId=${objectId}`;
  } else if (mixamoUrl) {
    // NB: This should be a full bucket path to an asset.
    engineUrl += `&mixamo=${mixamoUrl}`;
  } else if (bvhUrl) {
    // NB: This should be a full bucket path to an asset.
    engineUrl += `&bvh=${bvhUrl}`;
  } else if (sceneImportUrl) {
    // TODO: Not sure what the format of this should be.
    engineUrl += `&sceneImport=${sceneImportUrl}`;
  }

  return (
    <div
      className={`${
        fullScreen ? "fy-scene-3d-fullscreen" : "fy-scene-3d-default"
      } ${className ? className : ""}`.trim()}
    >
      {/* IframeResizer was causing some glitches passing messages. Need to test more. */}
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
