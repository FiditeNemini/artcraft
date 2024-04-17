import MakeRequest from "../MakeRequest";
import { UserDetailsLight } from "../_common/UserDetailsLight";
import { MediaFileType } from "../_common/enums/MediaFileType";
import { WeightCategory } from "../_common/enums/WeightCategory";
import { WeightType } from "../_common/enums/WeightType";
import { MediaFileClass } from "../enums/MediaFileClass";
import { MediaFileSubtype } from "../enums/MediaFileSubtype";

export interface MediaFile {
  token: string;
  media_type: MediaFileType;
  media_class: MediaFileClass | null;
  maybe_media_subtype: MediaFileSubtype | null;
  public_bucket_path: string;
  maybe_engine_extension: string | null;
  maybe_batch_token: string;
  maybe_title: string | null;
  maybe_original_filename: string | null;
  maybe_creator_user: UserDetailsLight | null;
  maybe_prompt_token: string | null;
  creator_set_visibility: string;
  created_at: Date;
  updated_at: Date;
  maybe_model_weight_info: {
    title: string;
    weight_token: string;
    weight_category: WeightCategory;
    weight_type: WeightType;
    maybe_weight_creator: UserDetailsLight;
    maybe_cover_image_public_bucket_path: string;
  };
  cover_image: {
    default_cover: {
      color_index: number,
      image_index: number
    },
    maybe_cover_image_public_bucket_path: string | null
  };
}

export interface GetMediaRequest {}

export interface GetMediaResponse {
  success: boolean;
  media_file?: MediaFile;
}

export const GetMedia = MakeRequest<
  string,
  GetMediaRequest,
  GetMediaResponse,
  {}
>({
  method: "GET",
  routingFunction: (mediaFileToken: string) =>
    `/v1/media_files/file/${mediaFileToken}`,
});
