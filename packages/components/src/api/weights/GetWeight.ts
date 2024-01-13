import MakeRequest from "../MakeRequest";
import { UserDetailsLight } from "../_common/UserDetailsLight";
import { WeightCategory } from "../_common/enums/WeightCategory";
import { WeightType } from "../_common/enums/WeightType";

export interface Weight {
  weight_token: string;
  weight_type: WeightType;
  weight_category: WeightCategory;
  title: string;
  public_bucket_path: string;
  creator_set_visibility: string;
  created_at: Date;
  updated_at: Date;
  creator: UserDetailsLight;
  description_markdown: string;
  description_rendered_html: string;
  file_checksum_sha2: string;
  file_size_bytes: number;
  maybe_cached_user_ratings_ratio: number | null;
  cover_image: {
    maybe_cover_image_public_bucket_path: string | null;
    default_cover: {
      image_index: number;
    };
  };
  version: number;
}

export interface GetWeightRequest {}

export interface GetWeightResponse {
  success: boolean;
  weight?: Weight;
}

export const GetWeight = MakeRequest<
  string,
  GetWeightRequest,
  GetWeightResponse,
  {}
>({
  method: "GET",
  routingFunction: (weightToken: string) => `/v1/weights/weight/${weightToken}`,
});
