import MakeRequest from "../MakeRequest";
import { MediaFile } from "./GetMedia";
// import { MediaFileType } from "../_common/enums/MediaFileType";
import { LazyPagination } from "../_common/SharedFetchTypes";

export interface ListMediaFilesRequest {}

export interface ListMediaFilesResponse {
  pagination: LazyPagination;
  success: boolean;
  results: MediaFile[];
}

export interface ListMediaFilesParams {
  page_index: number;
}

export const ListMediaFiles = MakeRequest<
  string,
  ListMediaFilesRequest,
  ListMediaFilesResponse,
  ListMediaFilesParams
>({
  method: "GET",
  routingFunction: () => `/v1/media_files/list`,
});
