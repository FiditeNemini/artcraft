import { useCallback, useEffect, useState, useRef } from "react";
import { FetchStatus } from "~/pages/PageEnigma/enums";
import { FetchMediaItemStates, fetchFeaturedMediaItems } from "../utilities";
import { FilterEngineCategories } from "~/enums";

const maxFailedFetches = 5;

export const useFeaturedObjects = ({
  filterEngineCategories,
  defaultErrorMessage,
}: {
  filterEngineCategories: FilterEngineCategories[];
  defaultErrorMessage: string;
}) => {
  const failedFetches = useRef<number>(0);
  const [
    {
      mediaItems: featuredObjects,
      status: featuredFetchStatus,
      nextPageInf: nextFeaturedObjects,
    },
    setFeaturedFetch,
  ] = useState<FetchMediaItemStates>({
    mediaItems: undefined,
    nextPageInf: undefined,
    status: FetchStatus.READY,
  });
  const nextPageCursor = nextFeaturedObjects?.maybe_next;

  const fetchFeaturedObjects = useCallback(async () => {
    if (featuredFetchStatus !== FetchStatus.IN_PROGRESS) {
      setFeaturedFetch({ status: FetchStatus.IN_PROGRESS });

      const result = await fetchFeaturedMediaItems({
        filterEngineCategories: filterEngineCategories,
        defaultErrorMessage: defaultErrorMessage,
        nextPageCursor: nextPageCursor,
      });

      if (result.status === FetchStatus.ERROR) {
        failedFetches.current = failedFetches.current + 1;
      } else {
        failedFetches.current = 0;
      }

      setFeaturedFetch({
        status: result.status,
        mediaItems: result.mediaItems
          ? featuredObjects
            ? [...featuredObjects, ...result.mediaItems]
            : result.mediaItems
          : featuredObjects,
        nextPageInf: result.nextPageInf,
      });
    }
  }, [
    featuredObjects,
    featuredFetchStatus,
    defaultErrorMessage,
    filterEngineCategories,
    nextPageCursor,
  ]);

  useEffect(() => {
    if (!featuredObjects && failedFetches.current <= maxFailedFetches) {
      fetchFeaturedObjects();
    }
  }, [featuredObjects, fetchFeaturedObjects]);

  return {
    featuredObjects,
    featuredFetchStatus,
    nextFeaturedObjects,
    fetchFeaturedObjects,
  };
};
