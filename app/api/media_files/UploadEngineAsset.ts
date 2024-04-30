import MakeMultipartRequest from "../MakeMultipartRequest";

export enum MediaFileSubtype {
  /// Animation file from Mixamo
  /// Primarily used for FBX and GLB.
  Mixamo = "mixamo",

  /// Animation file from MocapNet
  /// Primarily used for BVH.
  MocapNet = "mocap_net",

  /// Generic animation case
  /// Used for BVH files, but can also pertain to animation-only files of other types.
  AnimationOnly = "animation_only",

  // TODO(bt,2024-03-08): Migrate records and code, then remove
  /// DEPRECATED: Use `SceneImport` instead.
  Scene = "scene",

  /// Generic 3D scene file.
  /// Can pertain to glTF, glB, FBX, etc.
  SceneImport = "scene_import",

  /// Native Storyteller scene format.
  /// Typically stored in a `.scn.ron` file.
  StorytellerScene = "storyteller_scene",
}

export interface UploadEngineAssetRequest {
  file: File;
  media_file_subtype?: MediaFileSubtype;
  title?: string;
  uuid_idempotency_token?: string;
}

export interface UploadEngineAssetResponse {
  media_file_token: string;
  success: boolean;
}

export const UploadEngineAsset = (request: UploadEngineAssetRequest) => {
  return MakeMultipartRequest("/v1/media_files/upload/engine_asset", request);
};
