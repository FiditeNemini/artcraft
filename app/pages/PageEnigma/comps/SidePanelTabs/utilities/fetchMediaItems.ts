import { FilterEngineCategories, ToastTypes } from "~/enums";
import { addToast } from "~/signals";
import { FetchStatus } from "~/pages/PageEnigma/enums";
import { MediaFilesApi } from "~/Classes/ApiManager";
import { MediaItem } from "~/pages/PageEnigma/models";

import { responseMapping } from "./misc";

export interface FetchMediaItemStates {
  mediaItems?: MediaItem[];
  status: FetchStatus;
}
interface fetchMediaItemsInterface {
  setState: ({ mediaItems, status }: FetchMediaItemStates) => void;
  filterEngineCategories: FilterEngineCategories[];
  defaultErrorMessage?: string;
  searchTerm?: string;
}

export const fetchUserMediaItems = async ({
  setState,
  filterEngineCategories,
  defaultErrorMessage,
}: fetchMediaItemsInterface) => {
  setState({ status: FetchStatus.IN_PROGRESS });
  const mediaFilesApi = new MediaFilesApi();

  const response = await mediaFilesApi.ListUserMediaFiles({
    page_size: 100,
    filter_engine_categories: filterEngineCategories,
  });

  if (response.success && response.data) {
    const newSetObjects = responseMapping(
      response.data,
      filterEngineCategories,
    );
    setState({
      mediaItems: newSetObjects,
      status: FetchStatus.SUCCESS,
    });
    return;
  }
  addToast(
    ToastTypes.ERROR,
    response.errorMessage ??
      defaultErrorMessage ??
      "Unknown Error in Fetching Media Items",
  );
  setState({ status: FetchStatus.ERROR });
  return;
};

export const fetchFeaturedMediaItems = async ({
  setState,
  filterEngineCategories,
  defaultErrorMessage,
}: fetchMediaItemsInterface) => {
  setState({ status: FetchStatus.IN_PROGRESS });
  const mediaFilesApi = new MediaFilesApi();

  const response = await mediaFilesApi.ListFeaturedMediaFiles({
    page_size: 100,
    filter_engine_categories: filterEngineCategories,
  });

  if (response.success && response.data) {
    const newSetObjects = responseMapping(
      response.data,
      filterEngineCategories,
    );
    setState({
      mediaItems: newSetObjects,
      status: FetchStatus.SUCCESS,
    });
    return;
  }
  addToast(
    ToastTypes.ERROR,
    response.errorMessage ??
      defaultErrorMessage ??
      "Unknown Error in Fetching Media Items",
  );
  setState({ status: FetchStatus.ERROR });
  return;
};

// Search Results
export const fetchFeaturedMediaItemsSearchResults = async ({
  setState,
  searchTerm,
  filterEngineCategories,
  defaultErrorMessage,
}: {
  setState: ({ mediaItems, status }: FetchMediaItemStates) => void;
  searchTerm: string;
  filterEngineCategories: FilterEngineCategories[];
  defaultErrorMessage?: string;
}) => {
  setState({ status: FetchStatus.IN_PROGRESS });

  if (!searchTerm.trim()) {
    console.log("Search term is empty after trim");
    setState({
      mediaItems: [],
      status: FetchStatus.SUCCESS,
    });
    return;
  }

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
}: {
  setState: ({ mediaItems, status }: FetchMediaItemStates) => void;
  searchTerm: string;
  filterEngineCategories: FilterEngineCategories[];
  defaultErrorMessage?: string;
}) => {
  setState({ status: FetchStatus.IN_PROGRESS });
  if (!searchTerm.trim()) {
    setState({
      mediaItems: [],
      status: FetchStatus.SUCCESS,
    });
    return;
  }

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
