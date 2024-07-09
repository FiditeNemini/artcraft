import { useCallback, useEffect, useState } from "react";
import { useSignals } from "@preact/signals-react/runtime";
import { faCirclePlus } from "@fortawesome/pro-solid-svg-icons";
import {
  AssetFilterOption,
  AssetType,
  FeatureFlags,
  FilterEngineCategories,
} from "~/enums";
import { FetchStatus } from "~/pages/PageEnigma/enums";
import { characterItems as demoCharacterItems } from "~/pages/PageEnigma/signals";
import {
  Button,
  FileWrapper,
  FilterButtons,
  Pagination,
  SearchFilter,
} from "~/components";
import {
  ItemElements,
  TabTitle,
} from "~/pages/PageEnigma/comps/SidePanelTabs/sharedComps";
import { usePosthogFeatureFlag } from "~/hooks/usePosthogFeatureFlag";
import {
  fetchFeaturedMediaItems,
  fetchFeaturedMediaItemsSearchResults,
  FetchMediaItemStates,
  fetchUserMediaItems,
  fetchUserMediaItemsSearchResults,
  isAnyStatusFetching,
} from "../utilities";

export const CharactersTab = () => {
  useSignals();

  const showSearchObjectComponent = usePosthogFeatureFlag(
    FeatureFlags.SHOW_SEARCH_OBJECTS,
  );

  const [searchTermFeatured, setSearchTermFeatured] = useState("");
  const [searchTermUser, setSearchTermUser] = useState("");

  const [
    { mediaItems: userCharacters, status: userFetchStatus },
    setUserFetch,
  ] = useState<FetchMediaItemStates>({
    mediaItems: undefined,
    status: FetchStatus.READY,
  });
  const [
    { mediaItems: featuredCharacters, status: featuredFetchStatus },
    setFeaturedFetch,
  ] = useState<FetchMediaItemStates>({
    mediaItems: undefined,
    status: FetchStatus.READY,
  });
  const [
    { mediaItems: featuredSearchResults, status: featuredSearchFetchStatus },
    setFeaturedSearchFetch,
  ] = useState<FetchMediaItemStates>({
    mediaItems: undefined,
    status: FetchStatus.READY,
  });
  const [
    { mediaItems: userSearchResults, status: userSearchFetchStatus },
    setUserSearchFetch,
  ] = useState<FetchMediaItemStates>({
    mediaItems: undefined,
    status: FetchStatus.READY,
  });

  const [selectedFilter, setSelectedFilter] = useState(
    AssetFilterOption.FEATURED,
  );
  const allFeaturedCharacters = [
    ...demoCharacterItems.value,
    ...(featuredCharacters ?? []),
  ];
  const displayedItems =
    selectedFilter === AssetFilterOption.FEATURED
      ? allFeaturedCharacters ?? []
      : userCharacters ?? [];

  const [currentPage, setCurrentPage] = useState<number>(0);

  const pageSize = 21;
  const totalPages = Math.ceil(displayedItems.length / pageSize);

  const isFetching = isAnyStatusFetching([
    userFetchStatus,
    featuredFetchStatus,
    featuredSearchFetchStatus,
    userSearchFetchStatus,
  ]);

  const fetchUserCharacters = useCallback(
    () =>
      fetchUserMediaItems({
        filterEngineCategories: [FilterEngineCategories.CHARACTER],
        setState: (newState: FetchMediaItemStates) => {
          setUserFetch((curr) => ({
            status: newState.status,
            mediaItems: newState.mediaItems
              ? newState.mediaItems
              : curr.mediaItems,
          }));
        },
        defaultErrorMessage: "Unknown Error in Fetching User Characters",
      }),
    [],
  );

  const fetchFeaturedCharacters = useCallback(
    () =>
      fetchFeaturedMediaItems({
        filterEngineCategories: [FilterEngineCategories.CHARACTER],
        setState: (newState: FetchMediaItemStates) => {
          setFeaturedFetch((curr) => ({
            status: newState.status,
            mediaItems: newState.mediaItems
              ? newState.mediaItems
              : curr.mediaItems,
          }));
        },
        defaultErrorMessage: "Unknown Error in Fetching Featured Characters",
      }),
    [],
  );

  const filterCharacterItems = (searchTerm: string) =>
    demoCharacterItems.value.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );

  const fetchFeaturedSearchResults = useCallback(async () => {
    const filteredCharacterItems = filterCharacterItems(searchTermFeatured);
    fetchFeaturedMediaItemsSearchResults({
      filterEngineCategories: [FilterEngineCategories.CHARACTER],
      setState: (newState: FetchMediaItemStates) => {
        setFeaturedSearchFetch(() => ({
          status: newState.status,
          mediaItems: newState.mediaItems
            ? [...filteredCharacterItems, ...newState.mediaItems]
            : filteredCharacterItems,
        }));
      },
      defaultErrorMessage:
        "Unknown Error in Fetching Featured Characters Search Results",
      searchTerm: searchTermFeatured,
    });
  }, [searchTermFeatured]);

  const fetchUserSearchResults = useCallback(async () => {
    fetchUserMediaItemsSearchResults({
      filterEngineCategories: [FilterEngineCategories.CHARACTER],
      setState: (newState: FetchMediaItemStates) => {
        setUserSearchFetch((curr) => ({
          status: newState.status,
          mediaItems: newState.mediaItems
            ? newState.mediaItems
            : curr.mediaItems,
        }));
      },
      defaultErrorMessage:
        "Unknown Error in Fetching User Characters Search Results",
      searchTerm: searchTermUser,
    });
  }, [searchTermUser]);

  useEffect(() => {
    if (!userCharacters) {
      fetchUserCharacters();
    }
    if (!featuredCharacters) {
      fetchFeaturedCharacters();
    }
  }, [
    userCharacters,
    fetchUserCharacters,
    featuredCharacters,
    fetchFeaturedCharacters,
  ]);

  useEffect(() => {
    if (selectedFilter === AssetFilterOption.FEATURED) {
      setCurrentPage(0);
      fetchFeaturedSearchResults();
    } else if (selectedFilter === AssetFilterOption.MINE) {
      setCurrentPage(0);
      fetchUserSearchResults();
    }
  }, [
    searchTermFeatured,
    searchTermUser,
    fetchFeaturedSearchResults,
    fetchUserSearchResults,
    selectedFilter,
  ]);

  return (
    <>
      <FileWrapper
        onSuccess={fetchUserCharacters}
        type={AssetType.CHARACTER}
        render={(parentId) => (
          <>
            <TabTitle title="Characters" />
            <div>
              <FilterButtons
                value={selectedFilter}
                onClick={(button) => {
                  setSelectedFilter(Number(button));
                  setCurrentPage(0);
                }}
              />
            </div>
            <div className="flex w-full flex-col gap-3 px-4">
              <Button
                className="file-picker-button py-3"
                htmlFor={parentId}
                icon={faCirclePlus}
                variant="action"
              >
                Upload Character
              </Button>
              {showSearchObjectComponent && (
                <SearchFilter
                  searchTerm={
                    selectedFilter === AssetFilterOption.FEATURED
                      ? searchTermFeatured
                      : searchTermUser
                  }
                  onSearchChange={
                    selectedFilter === AssetFilterOption.FEATURED
                      ? setSearchTermFeatured
                      : setSearchTermUser
                  }
                  key={selectedFilter}
                  placeholder={
                    selectedFilter === AssetFilterOption.FEATURED
                      ? "Search featured characters"
                      : "Search my characters"
                  }
                />
              )}
            </div>
            <div className="w-full grow overflow-y-auto rounded px-4 pb-4">
              <ItemElements
                busy={isFetching}
                debug="characters tab"
                currentPage={currentPage}
                pageSize={pageSize}
                items={
                  selectedFilter === AssetFilterOption.FEATURED
                    ? searchTermFeatured
                      ? featuredSearchResults ?? []
                      : displayedItems
                    : searchTermUser
                      ? userSearchResults ?? []
                      : displayedItems
                }
              />
            </div>
            {totalPages > 1 && (
              <Pagination
                className="-mt-4 px-4"
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(newPage: number) => {
                  setCurrentPage(newPage);
                }}
              />
            )}
          </>
        )}
      />
    </>
  );
};
