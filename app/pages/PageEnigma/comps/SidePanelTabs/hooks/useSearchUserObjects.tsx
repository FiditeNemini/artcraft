import { useCallback, useEffect, useState } from "react";
import { FetchStatus } from "~/pages/PageEnigma/enums";
import {
  FetchMediaItemStates,
  fetchUserMediaItemsSearchResults,
} from "../utilities";
import { FilterEngineCategories } from "~/enums";

export const useSearchUserdObjects = ({
  filterEngineCategories,
  defaultErrorMessage,
}: {
  filterEngineCategories: FilterEngineCategories[];
  defaultErrorMessage: string;
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const updateSearchTermForUserObjects = (newTerm: string) => {
    setSearchTerm(newTerm);
  };
  const [
    {
      mediaItems: userObjectsSearchResults,
      status: userObjectsSearchFetchStatus,
    },
    setUserSearchFetch,
  ] = useState<FetchMediaItemStates>({
    mediaItems: undefined,
    status: FetchStatus.READY,
  });

  const fetchUserObjectsSearchResults = useCallback(
    async (term: string) => {
      fetchUserMediaItemsSearchResults({
        filterEngineCategories: filterEngineCategories,
        setState: (newState: FetchMediaItemStates) => {
          setUserSearchFetch(() => ({
            status: newState.status,
            mediaItems: newState.mediaItems,
          }));
        },
        defaultErrorMessage: defaultErrorMessage,
        searchTerm: term,
      });
    },
    [defaultErrorMessage, filterEngineCategories],
  );

  useEffect(() => {
    fetchUserObjectsSearchResults(searchTerm);
  }, [fetchUserObjectsSearchResults, searchTerm]);

  return {
    searchTermForUserObjects: searchTerm,
    userObjectsSearchResults,
    userObjectsSearchFetchStatus,
    fetchUserObjectsSearchResults,
    updateSearchTermForUserObjects,
  };
};
