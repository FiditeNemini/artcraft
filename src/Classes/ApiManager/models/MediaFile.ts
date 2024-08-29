import { MediaFileClass } from "../enums/MediaFileClass";
import { MediaFileType, MediaFileSubtype } from "../enums/MediaFileType";
import { WeightCategory } from "../enums/WeightCategory";
import { WeightType } from "../enums/WeightType";
import { UserInfo } from "./Users";

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
  maybe_creator_user: UserInfo | null;
  maybe_prompt_token: string | null;
  creator_set_visibility: string;
  created_at: Date;
  updated_at: Date;
  maybe_model_weight_info: {
    title: string;
    weight_token: string;
    weight_category: WeightCategory;
    weight_type: WeightType;
    maybe_weight_creator: UserInfo;
    maybe_cover_image_public_bucket_path: string;
  };
}
