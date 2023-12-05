import MakeRequest from "../MakeRequest";
import { UserDetailsLight } from "../_common/UserDetailsLight";
import { MediaFileType } from "../_common/enums/MediaFileType";

export interface MediaFile {
  token: string,
  media_type: MediaFileType,
  public_bucket_path: string,
  maybe_creator_user: UserDetailsLight | null,
  creator_set_visibility: string,
  created_at: Date,
  updated_at: Date,
}

export interface GetMediaRequest {}

export interface GetMediaResponse {
  success: boolean,
  media_file?: MediaFile,
}

export const GetMedia = MakeRequest<string, GetMediaRequest, GetMediaResponse>({
  method: "GET",
  routingFunction: (mediaFileToken: string) => `/v1/media_files/file/${mediaFileToken}`,
});