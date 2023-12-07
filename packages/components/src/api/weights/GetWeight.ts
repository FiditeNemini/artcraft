// import MakeRequest from "../MakeRequest";
import { UserDetailsLight } from "../_common/UserDetailsLight";
import { WeightsCategory } from "../_common/enums/WeightsCategory";
import { WeightsType } from "../_common/enums/WeightsType";

export interface Weight {
  weight_token: string;
  weights_type: WeightsType;
  weights_category: WeightsCategory;
  maybe_creator_user: UserDetailsLight | null;
  creator_set_visibility: string;
  created_at: Date;
  updated_at: Date;
  title: string;
}

// export interface GetMediaRequest {}

// export interface GetMediaResponse {
//   success: boolean,
//   media_file?: MediaFile,
// }

// export const GetMedia = MakeRequest<string, GetMediaRequest, GetMediaResponse>({
//   method: "GET",
//   routingFunction: (mediaFileToken: string) => `/v1/media_files/file/${mediaFileToken}`,
// });
