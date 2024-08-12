import { useCallback, useEffect, useState, useRef } from "react";
import { FetchStatus } from "~/pages/PageEnigma/enums";
import { FetchMediaItemStates, fetchUserMediaItems } from "../utilities";
import { FilterEngineCategories } from "~/enums";

const maxFailedFetches = 5;

export const useUserObjects = ({
  filterEngineCategories,
  defaultErrorMessage,
}: {
  filterEngineCategories: FilterEngineCategories[];
  defaultErrorMessage: string;
}) => {
  const failedFetches = useRef<number>(0);
  const [
    {
      mediaItems: userObjects,
      status: userFetchStatus,
      nextPage: nextUserObjects,
    },
    setUserFetch,
  ] = useState<FetchMediaItemStates>({
    mediaItems: undefined,
    status: FetchStatus.READY,
  });
  const nextPageIndex = nextUserObjects?.current
    ? nextUserObjects.current + 1
    : undefined;

  const fetchUserObjects = useCallback(async () => {
    if (userFetchStatus !== FetchStatus.IN_PROGRESS) {
      setUserFetch({ status: FetchStatus.IN_PROGRESS });

      const result = await fetchUserMediaItems({
        filterEngineCategories: filterEngineCategories,
        defaultErrorMessage: defaultErrorMessage,
        nextPageIndex: nextPageIndex,
      });

      if (result.status === FetchStatus.ERROR) {
        failedFetches.current = failedFetches.current + 1;
      } else {
        failedFetches.current = 0;
      }

      setUserFetch({
        status: result.status,
        mediaItems: result.mediaItems
          ? userObjects
            ? [...userObjects, ...result.mediaItems]
            : result.mediaItems
          : userObjects,
      });
    }
  }, [
    userObjects,
    userFetchStatus,
    filterEngineCategories,
    defaultErrorMessage,
    nextPageIndex,
  ]);

  useEffect(() => {
    if (!userObjects && failedFetches.current <= maxFailedFetches) {
      fetchUserObjects();
    }
  }, [userObjects, fetchUserObjects]);

  return {
    userObjects,
    userFetchStatus,
    nextUserObjects,
    fetchUserObjects,
  };
};
