import React from "react";
import { MediaFile } from "@storyteller/components/src/api/media_files/GetMediaFile";
import { BucketConfig } from "@storyteller/components/src/api/BucketConfig";
//import Iframe from "react-iframe";
import { MediaFileType } from "@storyteller/components/src/api/_common/enums/MediaFileType";
import { Scene3D } from "components/common";
import { MediaFileSubtype } from "@storyteller/components/src/api/enums/MediaFileSubtype";

// Storyteller Engine parameters
// These are documented here:
// https://www.notion.so/storytellerai/Studio-Iframe-Query-Params-a748a9929ec3404780c3884e7fb89bdb
const SKYBOX = "333348"; // Looks good (lighter)
//const SKYBOX = "242433"; // Looks good
//const SKYBOX = "1a1a27"; // Too dark
//const SKYBOX = "3f3f55"; // too light

export interface EngineMediaPanelArgs {
  mediaFile: MediaFile,
}

export function EngineMediaPanel({ mediaFile } : EngineMediaPanelArgs) {
  const assetUrl = new BucketConfig().getGcsUrl(mediaFile.public_bucket_path);

  let engineParams = {};

  switch (mediaFile.maybe_media_subtype) {
    case MediaFileSubtype.StorytellerScene:
      engineParams = {
        sceneMediaFileToken: mediaFile.token,
      };
      break;
    case MediaFileSubtype.Mixamo:
      engineParams = {
        mixamoUrl: assetUrl,
      };
      break;
    case MediaFileSubtype.MocapNet:
      engineParams = {
        bvhUrl: assetUrl,
      };
      break;
    case MediaFileSubtype.AnimationOnly:
    case MediaFileSubtype.Scene:
    case MediaFileSubtype.SceneImport:
    default:
      // This should hypothetically be any type of generic scene asset
      engineParams = {
        sceneImportUrl: assetUrl,
      };
      break;
  }

  if (Object.keys(engineParams).length === 0) {
    // Support for files without a media subtype
    if (assetUrl.endsWith("bvh")) {
      // Assume MocapNet. 
      engineParams = {
        bvhUrl: assetUrl,
      };
    }
    // TODO(bt,2024-03-11): Figure this out
    //else if (assetUrl.endsWith("glb")) {
    //  // Assume MocapNet. 
    //  engineParams = {
    //    bvhUrl: assetUrl,
    //  };
    //}
  }

  if (mediaFile.media_type === MediaFileType.SceneRon) {
    // This will always be a storyteller scene
    engineParams = {
      sceneMediaFileToken: mediaFile.token,
    };
  } 

  return (
    /*<Iframe
      {...{
        url: `https://engine.fakeyou.com?mode=viewer&bvh=${assetUrl}&skybox=${SKYBOX}`,
        className: "fy-studio-frame",
      }}
    />*/
    <Scene3D
      mode="viewer"
      skybox={SKYBOX}
      fullScreen={false}
      //className="flex-grow-1"
      className="fy-studio-frame"
      //onSceneSavedCallback={onSaveCallback}
      {...engineParams}
      />
  );
}
