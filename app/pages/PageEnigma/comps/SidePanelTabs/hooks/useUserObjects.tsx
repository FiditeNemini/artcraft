import { useCallback, useEffect, useState } from "react";
import { FetchStatus } from "~/pages/PageEnigma/enums";
import { FetchMediaItemStates, fetchUserMediaItems } from "../utilities";
import { FilterEngineCategories } from "~/enums";

export const useUserObjects = ({
  filterEngineCategories,
  defaultErrorMessage,
}: {
  filterEngineCategories: FilterEngineCategories[];
  defaultErrorMessage: string;
}) => {
  const [{ mediaItems: userObjects, status: userFetchStatus }, setUserFetch] =
    useState<FetchMediaItemStates>({
      mediaItems: undefined,
      status: FetchStatus.READY,
    });

  const fetchUserObjects = useCallback(
    () =>
      fetchUserMediaItems({
        filterEngineCategories: filterEngineCategories,
        setState: (newState: FetchMediaItemStates) => {
          setUserFetch((curr) => ({
            status: newState.status,
            mediaItems: newState.mediaItems
              ? newState.mediaItems
              : curr.mediaItems,
          }));
        },
        defaultErrorMessage: defaultErrorMessage,
      }),
    [filterEngineCategories, defaultErrorMessage],
  );

  useEffect(() => {
    if (!userObjects) {
      fetchUserObjects();
    }
  }, [userObjects, fetchUserObjects]);

  return {
    userObjects,
    userFetchStatus,
    fetchUserObjects,
  };
};
