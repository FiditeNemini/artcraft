import { FilterEngineCategories, FilterMediaType, ToastTypes } from "~/enums";
import { addToast } from "~/signals";
import { FetchStatus } from "~/pages/PageEnigma/enums";
import { MediaFilesApi } from "~/Classes/ApiManager";
import {
  MediaItem,
  Pagination,
  PaginationInfinite,
} from "~/pages/PageEnigma/models";

import { responseMapping } from "./misc";

export interface FetchMediaItemStates {
  mediaItems?: MediaItem[];
  nextPageInf?: PaginationInfinite;
  nextPage?: Pagination;
  status: FetchStatus;
}
interface fetchMediaItemsInterface {
  setState: ({ mediaItems, status }: FetchMediaItemStates) => void;
  filterEngineCategories: FilterEngineCategories[];
  filterMediaType?: FilterMediaType[];
  defaultErrorMessage?: string;
  searchTerm?: string;
}
interface fetchMediaItemsInterfaceV2 {
  filterEngineCategories: FilterEngineCategories[];
  filterMediaType?: FilterMediaType[];
  defaultErrorMessage?: string;
  searchTerm?: string; // for searches
  nextPageCursor?: string; // for featured items' infinite pagination
  nextPageIndex?: number; // for user item's normal pagination
}

export const fetchUserMediaItems = async ({
  filterEngineCategories,
  defaultErrorMessage,
  nextPageIndex,
}: fetchMediaItemsInterfaceV2): Promise<FetchMediaItemStates> => {
  const mediaFilesApi = new MediaFilesApi();

  const response = await mediaFilesApi.ListUserMediaFiles({
    page_size: 1000,
    page_index: nextPageIndex,
    filter_engine_categories: filterEngineCategories,
  });

  if (response.success && response.data) {
    const newSetObjects = responseMapping(
      response.data,
      filterEngineCategories,
    );
    return {
      mediaItems: newSetObjects,
      status: FetchStatus.SUCCESS,
    };
  }
  addToast(
    ToastTypes.ERROR,
    response.errorMessage ??
      defaultErrorMessage ??
      "Unknown Error in Fetching Media Items",
  );
  return { status: FetchStatus.ERROR };
};

export const fetchFeaturedMediaItems = async ({
  filterEngineCategories,
  defaultErrorMessage,
  nextPageCursor,
}: fetchMediaItemsInterfaceV2): Promise<FetchMediaItemStates> => {
  const mediaFilesApi = new MediaFilesApi();
  const response = await mediaFilesApi.ListFeaturedMediaFiles({
    page_size: 1000,
    filter_engine_categories: filterEngineCategories,
    cursor: nextPageCursor,
  });

  if (response.success && response.data) {
    const newSetObjects = responseMapping(
      response.data,
      filterEngineCategories,
    );
    return {
      mediaItems: newSetObjects,
      status: FetchStatus.SUCCESS,
      nextPageInf: response.pagination,
    };
  }
  addToast(
    ToastTypes.ERROR,
    response.errorMessage ??
      defaultErrorMessage ??
      "Unknown Error in Fetching Media Items",
  );
  return { status: FetchStatus.ERROR };
};

// Search Results
export const fetchFeaturedMediaItemsSearchResults = async ({
  setState,
  searchTerm,
  filterEngineCategories,
  defaultErrorMessage,
}: fetchMediaItemsInterface) => {
  if (!searchTerm || !searchTerm.trim()) {
    //if after trim it's empty, do nothing
    return;
  }

  setState({ status: FetchStatus.IN_PROGRESS });

  const mediaFilesApi = new MediaFilesApi();
  const response = await mediaFilesApi.SearchFeaturedMediaFiles({
    search_term: searchTerm,
    filter_engine_categories: filterEngineCategories,
  });

  if (response.success && response.data) {
    const newSearchObjects = responseMapping(
      response.data,
      filterEngineCategories,
    );
    setState({
      mediaItems: newSearchObjects,
      status: FetchStatus.SUCCESS,
    });
  } else {
    addToast(
      ToastTypes.ERROR,
      response.errorMessage ||
        defaultErrorMessage ||
        "Failed to fetch search results",
    );
    setState({ status: FetchStatus.ERROR });
  }
};

export const fetchUserMediaItemsSearchResults = async ({
  setState,
  searchTerm,
  filterEngineCategories,
  defaultErrorMessage,
}: fetchMediaItemsInterface) => {
  if (!searchTerm || !searchTerm.trim()) {
    return; //if after trim it's empty, do nothing
  }

  setState({ status: FetchStatus.IN_PROGRESS });

  const mediaFilesApi = new MediaFilesApi();
  const response = await mediaFilesApi.SearchUserMediaFiles({
    search_term: searchTerm,
    filter_engine_categories: filterEngineCategories,
  });

  if (response.success && response.data) {
    const newSearchObjects = responseMapping(
      response.data,
      filterEngineCategories,
    );
    setState({
      mediaItems: newSearchObjects,
      status: FetchStatus.SUCCESS,
    });
  } else {
    addToast(
      ToastTypes.ERROR,
      response.errorMessage ||
        defaultErrorMessage ||
        "Failed to fetch search results",
    );
    setState({ status: FetchStatus.ERROR });
  }
};
