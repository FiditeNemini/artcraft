// import MakeRequest from "../MakeRequest";
import { UserDetailsLight } from "../_common/UserDetailsLight";
import { WeightCategory } from "../_common/enums/WeightCategory";
import { WeightType } from "../_common/enums/WeightType";

export interface Weight {
  weight_token: string;
  weight_type: WeightType;
  weight_category: WeightCategory;
  maybe_creator_user: UserDetailsLight | null;
  creator_set_visibility: string;
  created_at: Date;
  updated_at: Date;
  title: string;
  description_markdown: string;
}

// export interface GetMediaRequest {}

// export interface GetMediaResponse {
//   success: boolean,
//   media_file?: MediaFile,
// }

// export const GetMedia = MakeRequest<string, GetMediaRequest, GetMediaResponse, {}>({
//   method: "GET",
//   routingFunction: (mediaFileToken: string) => `/v1/media_files/file/${mediaFileToken}`,
// });
