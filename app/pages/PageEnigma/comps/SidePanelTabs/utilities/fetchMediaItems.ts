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
