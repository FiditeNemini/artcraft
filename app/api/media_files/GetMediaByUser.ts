import MakeRequest from "../MakeRequest";
import { MediaInfo } from "~/pages/PageEnigma/models";

export interface GetMediaRequest {}

export interface GetMediaListResponse {
  pagination: Pagination;
  success: boolean;
  results: MediaInfo[];
}

export interface Pagination {}

export interface GetMediaParams {
  page_index?: number;
  filter_media_type?: string;
  filter_engine_categories?:
    | "scene"
    | "character"
    | "animation"
    | "object"
    | "skybox"
    | "expression";
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
