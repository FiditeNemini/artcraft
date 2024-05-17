import MakeRequest from "../MakeRequest";
import { MediaInfo, Pagination } from "~/pages/PageEnigma/models";

export interface ListFeaturedMediaFilesRequest {}

export interface ListFeaturedMediaFilesResponse {
  pagination?: Pagination; // does not currently exist on this endpoint but is being added
  success: boolean;
  results: MediaInfo[];
}

export interface ListFeaturedMediaFilesQueries {
  filter_engine_categories: string;
  page_index?: number;
  page_size: number;
}

export const ListFeaturedMediaFiles = MakeRequest<
  string,
  ListFeaturedMediaFilesRequest,
  ListFeaturedMediaFilesResponse,
  ListFeaturedMediaFilesQueries
>({
  method: "GET",
  routingFunction: () => `/v1/media_files/list_featured`,
});
