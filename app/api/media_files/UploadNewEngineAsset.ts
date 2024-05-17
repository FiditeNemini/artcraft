import MakeMultipartRequest from "../MakeMultipartRequest";

export enum MediaFileEngineCategory {
  Scene = "scene",
  Character = "character",
  Animation = "animation",
  Expression = "expression",
  Object = "object",
  Skybox = "skybox",
}

export enum MediaFileAnimationType {
  ArKit = "ar_kit",
  MikuMikuDance = "miku_miku_dance",
  MikuMikuDanceArKit = "miku_miku_dance_ar_kit",
  Mixamo = "mixamo",
  MixamoArKit = "mixamo_ar_kit",
  MocapNet = "mocap_net",
  MocapNetArKit = "mocap_net_ar_kit",
  MoveAi = "move_ai",
  MoveAiArKit = "move_ai_ar_kit",
  Rigify = "rigify",
  RigifyArKit = "rigify_ar_kit",
  Rokoko = "rokoko",
}

export interface UploadNewEngineAssetRequest {
  engine_category: MediaFileEngineCategory;
  file: File;
  maybe_animation_type?: MediaFileAnimationType;
  maybe_title?: string;
  maybe_visibility?: "public" | "private";
  maybe_duration_millis?: number;
  uuid_idempotency_token?: string;
}

export interface UploadNewEngineAssetResponse {
  media_file_token: string;
  success: boolean;
}

export const UploadNewEngineAsset = (request: UploadNewEngineAssetRequest) => {
  return MakeMultipartRequest(
    "/v1/media_files/upload/new_engine_asset",
    request,
  );
};
