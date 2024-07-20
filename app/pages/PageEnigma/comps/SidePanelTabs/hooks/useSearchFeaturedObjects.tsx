import { useCallback, useEffect, useState, useRef } from "react";
import { FetchStatus } from "~/pages/PageEnigma/enums";
import {
  FetchMediaItemStates,
  fetchFeaturedMediaItemsSearchResults,
} from "../utilities";
import { FilterEngineCategories } from "~/enums";
import { MediaItem } from "~/pages/PageEnigma/models";
import deepEqual from "deep-equal";

export const useSearchFeaturedObjects = ({
  filterEngineCategories,
  defaultErrorMessage,
  demoFeaturedObjects,
}: {
  filterEngineCategories: FilterEngineCategories[];
  defaultErrorMessage: string;
  demoFeaturedObjects?: MediaItem[];
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const updateSearchTermForFeaturedObjects = (newTerm: string) => {
    setSearchTerm(newTerm);
  };

  const [
    {
      mediaItems: featuredObjectsSearchResults,
      status: featuredObjectsSearchFetchStatus,
    },
    setFeaturedSearchFetch,
  ] = useState<FetchMediaItemStates>({
    mediaItems: undefined,
    status: FetchStatus.READY,
  });

  const demoItemsRef = useRef<MediaItem[]>([]);
  if (
    demoFeaturedObjects &&
    !deepEqual(demoItemsRef.current, demoFeaturedObjects)
  ) {
    demoItemsRef.current = demoFeaturedObjects;
  }

  const fetchFeaturedObjectSearchResults = useCallback(
    async (term: string) => {
      const filteredObjectItems = demoItemsRef.current.filter((item) =>
        item.name.toLowerCase().includes(term.toLowerCase()),
      );
      fetchFeaturedMediaItemsSearchResults({
        filterEngineCategories: filterEngineCategories,
        setState: (newState: FetchMediaItemStates) => {
          setFeaturedSearchFetch(() => ({
            status: newState.status,
            mediaItems: [
              ...filteredObjectItems,
              ...(newState.mediaItems ?? []),
            ],
          }));
        },
        defaultErrorMessage: defaultErrorMessage,
        searchTerm: term,
      });
    },
    [defaultErrorMessage, filterEngineCategories],
  );

  useEffect(() => {
    fetchFeaturedObjectSearchResults(searchTerm);
  }, [fetchFeaturedObjectSearchResults, searchTerm]);

  return {
    searchTermForFeaturedObjects: searchTerm,
    featuredObjectsSearchResults,
    featuredObjectsSearchFetchStatus,
    fetchFeaturedObjectSearchResults,
    updateSearchTermForFeaturedObjects,
  };
};
