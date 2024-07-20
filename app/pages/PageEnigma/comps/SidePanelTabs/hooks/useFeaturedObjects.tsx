import { useCallback, useEffect, useState } from "react";
import { FetchStatus } from "~/pages/PageEnigma/enums";
import { FetchMediaItemStates, fetchFeaturedMediaItems } from "../utilities";
import { FilterEngineCategories } from "~/enums";

export const useFeaturedObjects = ({
  filterEngineCategories,
  defaultErrorMessage,
}: {
  filterEngineCategories: FilterEngineCategories[];
  defaultErrorMessage: string;
}) => {
  const [
    { mediaItems: featuredObjects, status: featuredFetchStatus },
    setFeaturedFetch,
  ] = useState<FetchMediaItemStates>({
    mediaItems: undefined,
    status: FetchStatus.READY,
  });

  const fetchFeaturedObjects = useCallback(
    () =>
      fetchFeaturedMediaItems({
        filterEngineCategories: filterEngineCategories,
        setState: (newState: FetchMediaItemStates) => {
          setFeaturedFetch((curr) => ({
            status: newState.status,
            mediaItems: newState.mediaItems
              ? newState.mediaItems
              : curr.mediaItems,
          }));
        },
        defaultErrorMessage: defaultErrorMessage,
      }),
    [defaultErrorMessage, filterEngineCategories],
  );

  useEffect(() => {
    if (!featuredObjects) {
      fetchFeaturedObjects();
    }
  }, [featuredObjects, fetchFeaturedObjects]);

  return {
    featuredObjects,
    featuredFetchStatus,
    fetchFeaturedObjects,
  };
};
