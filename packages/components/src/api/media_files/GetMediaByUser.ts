import MakeRequest from "../MakeRequest";
import { MediaFile } from "./GetMedia";
// import { MediaFileType } from "../_common/enums/MediaFileType";

export interface GetMediaRequest {}

export interface GetMediaResponse {
  success: boolean,
  results: MediaFile[],
}

export const GetMediaByUser = MakeRequest<string, GetMediaRequest, GetMediaResponse>({
  method: "GET",
  routingFunction: (userToken: string) => `/v1/media_files/list/user/${userToken}`,
});