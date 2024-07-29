import { MediaFileClass } from "../enums/MediaFileClass";
import { MediaFileSubtype } from "../enums/MediaFileSubtype";
import MakeMultipartRequest from "../MakeMultipartRequest";

export interface WriteEngineAssetRequest {
  uuid_idempotency_token?: string,
  media_file_token?: string,
  file: any,
  media_file_subtype?: MediaFileSubtype;
  media_file_class?: MediaFileClass;
}

export interface WriteEngineAssetResponse {
  media_file_token: string,
  success: boolean
}

export const WriteEngineAsset = (request: WriteEngineAssetRequest) => {
  return MakeMultipartRequest("/v1/media_files/write/engine_asset", request);
}
