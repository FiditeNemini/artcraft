import { useCallback, useEffect, useState } from "react";
import { usePosthogFeatureFlag } from "~/hooks/usePosthogFeatureFlag";
import { useSignals } from "@preact/signals-react/runtime";
import { faCirclePlus } from "@fortawesome/pro-solid-svg-icons";
import {
  AssetFilterOption,
  FeatureFlags,
  FilterEngineCategories,
  OBJECT_FILE_TYPE,
} from "~/enums";
import { FetchStatus } from "~/pages/PageEnigma/enums";
import { shapeItems } from "~/pages/PageEnigma/signals";

import {
  TabTitle,
  ItemElements,
} from "~/pages/PageEnigma/comps/SidePanelTabs/sharedComps";
import {
  Button,
  FilterButtons,
  SearchFilter,
  Pagination,
  UploadModal3D,
} from "~/components";
import {
  fetchFeaturedMediaItems,
  fetchFeaturedMediaItemsSearchResults,
  FetchMediaItemStates,
  fetchUserMediaItems,
  fetchUserMediaItemsSearchResults,
  isAnyStatusFetching,
} from "../utilities";

export const ObjectsTab = () => {
  useSignals();

  const showSearchObjectComponent = usePosthogFeatureFlag(
    FeatureFlags.SHOW_SEARCH_OBJECTS,
  );

  const [openUploadModal, setOpenUploadModal] = useState(false);

  const [searchTermFeatured, setSearchTermFeatured] = useState("");
  const [searchTermUser, setSearchTermUser] = useState("");

  const [{ mediaItems: userObjects, status: userFetchStatus }, setUserFetch] =
    useState<FetchMediaItemStates>({
      mediaItems: undefined,
      status: FetchStatus.READY,
    });
  const [
    { mediaItems: featuredObjects, status: featuredFetchStatus },
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
  const [currentPage, setCurrentPage] = useState<number>(0);

  const displayedItems =
    selectedFilter === AssetFilterOption.FEATURED
      ? [...shapeItems.value, ...(featuredObjects ?? [])]
      : userObjects ?? [];

  const pageSize = 21;
  const totalPages = Math.ceil(displayedItems.length / pageSize);

  const isFetching = isAnyStatusFetching([
    userFetchStatus,
    featuredFetchStatus,
    featuredSearchFetchStatus,
    userSearchFetchStatus,
  ]);

  const fetchUserObjects = useCallback(
    () =>
      fetchUserMediaItems({
        filterEngineCategories: [FilterEngineCategories.OBJECT],
        setState: (newState: FetchMediaItemStates) => {
          setUserFetch((curr) => ({
            status: newState.status,
            mediaItems: newState.mediaItems
              ? newState.mediaItems
              : curr.mediaItems,
          }));
        },
        defaultErrorMessage: "Unknown Error in Fetching User Set Objects",
      }),
    [],
  );

  const fetchFeaturedObjects = useCallback(
    () =>
      fetchFeaturedMediaItems({
        filterEngineCategories: [FilterEngineCategories.OBJECT],
        setState: (newState: FetchMediaItemStates) => {
          setFeaturedFetch((curr) => ({
            status: newState.status,
            mediaItems: newState.mediaItems
              ? newState.mediaItems
              : curr.mediaItems,
          }));
        },
        defaultErrorMessage: "Unknown Error in Fetching Featured Set Objects",
      }),
    [],
  );

  const filterObjectItems = (searchTerm: string) =>
    shapeItems.value.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );

  const fetchFeaturedSearchResults = useCallback(async () => {
    const filteredObjectItems = filterObjectItems(searchTermFeatured);
    fetchFeaturedMediaItemsSearchResults({
      filterEngineCategories: [FilterEngineCategories.OBJECT],
      setState: (newState: FetchMediaItemStates) => {
        setFeaturedSearchFetch(() => ({
          status: newState.status,
          mediaItems: newState.mediaItems
            ? [...filteredObjectItems, ...newState.mediaItems]
            : filteredObjectItems,
        }));
      },
      defaultErrorMessage:
        "Unknown Error in Fetching Featured Set Objects Search Results",
      searchTerm: searchTermFeatured,
    });
  }, [searchTermFeatured]);

  const fetchUserSearchResults = useCallback(async () => {
    fetchUserMediaItemsSearchResults({
      filterEngineCategories: [FilterEngineCategories.OBJECT],
      setState: (newState: FetchMediaItemStates) => {
        setUserSearchFetch((curr) => ({
          status: newState.status,
          mediaItems: newState.mediaItems
            ? newState.mediaItems
            : curr.mediaItems,
        }));
      },
      defaultErrorMessage:
        "Unknown Error in Fetching User Set Objects Search Results",
      searchTerm: searchTermUser,
    });
  }, [searchTermUser]);

  useEffect(() => {
    if (!userObjects) {
      fetchUserObjects();
    }
    if (!featuredObjects) {
      fetchFeaturedObjects();
    }
  }, [userObjects, fetchUserObjects, featuredObjects, fetchFeaturedObjects]);

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
      <TabTitle title="Objects" />
      <FilterButtons
        value={selectedFilter}
        onClick={(button) => {
          setSelectedFilter(Number(button));
          setCurrentPage(0);
        }}
      />
      <div className="flex w-full flex-col gap-3 px-4">
        <Button
          icon={faCirclePlus}
          variant="action"
          onClick={() => setOpenUploadModal(true)}
          className="w-full py-3 text-sm font-medium"
        >
          Upload Objects
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
                ? "Search featured objects"
                : "Search my objects"
            }
          />
        )}
      </div>
      <div className="w-full grow overflow-y-auto rounded px-4 pb-4">
        <ItemElements
          busy={isFetching}
          debug="objects tab"
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
      <UploadModal3D
        onClose={() => setOpenUploadModal(false)}
        onSuccess={fetchUserObjects}
        isOpen={openUploadModal}
        fileTypes={Object.values(OBJECT_FILE_TYPE)}
        title="Upload Objects"
      />
    </>
  );
};
