import MakeMultipartRequest from "../MakeMultipartRequest";

export enum MediaFileEngineCategory {
  Scene = "scene",
  Character = "character",
  Animation = "animation",
  Object = "object",
  Skybox = "skybox",
  Expression = "expression",
}

export enum MediaFileAnimationType {
  ar_kit = "ar_kit",
  miku_miku_dance = "miku_miku_dance",
  miku_miku_dance_ar_kit = "miku_miku_dance_ar_kit",
  mixamo = "mixamo",
  mixamo_ar_kit = "mixamo_ar_kit",
  mocap_net = "mocap_net",
  mocap_net_ar_kit = "mocap_net_ar_kit",
  move_ai = "move_ai",
  move_ai_ar_kit = "move_ai_ar_kit",
  rigify = "rigify",
  rigify_ar_kit = "rigify_ar_kit",
}

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
  engine_category: MediaFileEngineCategory;
  file: File;
  maybe_animation_type: MediaFileAnimationType | null;
  maybe_title?: string;
  maybe_visibility?: string;
  uuid_idempotency_token?: string;
}

export interface UploadEngineAssetResponse {
  media_file_token: string;
  engine_category: string;
  success: boolean;
}

export const UploadEngineAsset = (request: UploadEngineAssetRequest) => {
  return MakeMultipartRequest("/v1/media_files/upload/engine_asset", request);
};
