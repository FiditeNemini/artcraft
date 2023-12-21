import MakeRequest from "../MakeRequest";
import { Pagination } from "../_common/SharedFetchTypes";

export interface UserBookmarksListRequest {}

export interface UserBookmarksListResponse {
  // pagination: Pagination,
  success: boolean,
  // weights: any
}

export interface UserBookmarksListQueries {
  page_index: number,
}

export const GetBookmarksByUser = MakeRequest<string, UserBookmarksListRequest, UserBookmarksListResponse, UserBookmarksListQueries>({
  method: "GET",
  routingFunction: (userToken: string) => `/v1/user_bookmarks/list/user/${userToken}`,
});