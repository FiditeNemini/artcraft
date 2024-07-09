import { useCallback, useEffect, useState } from "react";
import { useSignals } from "@preact/signals-react/runtime";
import { faCirclePlus } from "@fortawesome/pro-solid-svg-icons";
import {
  AssetFilterOption,
  FeatureFlags,
  FilterEngineCategories,
  MediaFileAnimationType,
} from "~/enums";
import { animationItems } from "~/pages/PageEnigma/signals";
import {
  Button,
  FilterButtons,
  Pagination,
  SearchFilter,
  UploadModal,
} from "~/components";
import {
  TabTitle,
  ItemElements,
} from "~/pages/PageEnigma/comps/SidePanelTabs/sharedComps";
import { FetchStatus } from "~/pages/PageEnigma/enums";
import {
  fetchFeaturedMediaItems,
  fetchFeaturedMediaItemsSearchResults,
  FetchMediaItemStates,
  fetchUserMediaItems,
  fetchUserMediaItemsSearchResults,
  isAnyStatusFetching,
} from "../utilities";
import { usePosthogFeatureFlag } from "~/hooks/usePosthogFeatureFlag";

export const AnimationTab = () => {
  useSignals();

  const showSearchObjectComponent = usePosthogFeatureFlag(
    FeatureFlags.SHOW_SEARCH_OBJECTS,
  );

  const [open, setOpen] = useState(false);
  const [searchTermFeatured, setSearchTermFeatured] = useState("");
  const [searchTermUser, setSearchTermUser] = useState("");

  const [
    { mediaItems: userAnimations, status: userFetchStatus },
    setUserFetch,
  ] = useState<FetchMediaItemStates>({
    mediaItems: undefined,
    status: FetchStatus.READY,
  });
  const [
    { mediaItems: featuredAnimations, status: featuredFetchStatus },
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
  const displayedItems =
    selectedFilter === AssetFilterOption.FEATURED
      ? [...(featuredAnimations || []), ...animationItems.value]
      : userAnimations ?? [];

  const [currentPage, setCurrentPage] = useState<number>(0);

  const pageSize = 21;
  const totalPages = Math.ceil(displayedItems.length / pageSize);

  const isFetching = isAnyStatusFetching([
    userFetchStatus,
    featuredFetchStatus,
    featuredSearchFetchStatus,
    userSearchFetchStatus,
  ]);

  const fetchUserAnimations = useCallback(
    () =>
      fetchUserMediaItems({
        filterEngineCategories: [FilterEngineCategories.ANIMATION],
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

  const fetchFeaturedAnimations = useCallback(
    () =>
      fetchFeaturedMediaItems({
        filterEngineCategories: [FilterEngineCategories.ANIMATION],
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

  const filterAnimationItems = (searchTerm: string) =>
    animationItems.value.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );

  const fetchFeaturedSearchResults = useCallback(async () => {
    const filteredAnimationItems = filterAnimationItems(searchTermFeatured);
    fetchFeaturedMediaItemsSearchResults({
      filterEngineCategories: [FilterEngineCategories.ANIMATION],
      setState: (newState: FetchMediaItemStates) => {
        setFeaturedSearchFetch(() => ({
          status: newState.status,
          mediaItems: newState.mediaItems
            ? [...filteredAnimationItems, ...newState.mediaItems]
            : filteredAnimationItems,
        }));
      },
      defaultErrorMessage:
        "Unknown Error in Fetching Featured Set Objects Search Results",
      searchTerm: searchTermFeatured,
    });
  }, [searchTermFeatured]);

  const fetchUserSearchResults = useCallback(async () => {
    fetchUserMediaItemsSearchResults({
      filterEngineCategories: [FilterEngineCategories.ANIMATION],
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
    if (!userAnimations) {
      fetchUserAnimations();
    }
    if (!featuredAnimations) {
      fetchFeaturedAnimations();
    }
  }, [
    userAnimations,
    fetchUserAnimations,
    featuredAnimations,
    fetchFeaturedAnimations,
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
      <TabTitle title="Animation" />

      <FilterButtons
        value={selectedFilter}
        onClick={(buttonIdx) => {
          setSelectedFilter(Number(buttonIdx));
          setCurrentPage(0);
        }}
      />

      <div className="flex w-full flex-col gap-3 px-4">
        <Button
          icon={faCirclePlus}
          variant="action"
          onClick={() => setOpen(true)}
          className="w-full py-3 text-sm font-medium"
        >
          Upload Animation
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
                ? "Search featured animations"
                : "Search my animations"
            }
          />
        )}
      </div>
      <div className="w-full grow overflow-y-auto px-4 pb-4">
        <ItemElements
          busy={isFetching}
          debug="animations tab"
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
      <UploadModal
        onClose={() => setOpen(false)}
        onSuccess={fetchUserAnimations}
        isOpen={open}
        fileTypes={["GLB", "FBX", "VMD"]}
        title="Upload Animation"
        options={{
          fileSubtypes: [
            { Mixamo: MediaFileAnimationType.Mixamo },
            { MikuMikuDance: MediaFileAnimationType.MikuMikuDance },
            { MoveAi: MediaFileAnimationType.MoveAi },
            { Rigify: MediaFileAnimationType.Rigify },
            { Rokoko: MediaFileAnimationType.Rokoko },
          ],
          hasLength: true,
          hasThumbnailUpload: true,
        }}
        type={FilterEngineCategories.ANIMATION}
      />
    </>
  );
};
