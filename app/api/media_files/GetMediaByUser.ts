import MakeRequest from "../MakeRequest";
import { MediaFile, Pagination } from "~/pages/PageEnigma/models";

export interface GetMediaRequest {}

export interface GetMediaListResponse {
  pagination: Pagination;
  success: boolean;
  results: MediaFile[];
}

export interface GetMediaParams {
  page_index: number;
  filter_media_type: string;
}

export const GetMediaByUser = MakeRequest<
  string,
  GetMediaRequest,
  GetMediaListResponse,
  GetMediaParams
>({
  method: "GET",
  routingFunction: (userToken: string) =>
    `/v1/media_files/list/user/${userToken}`,
});
