import { useCallback, useEffect, useMemo, useState } from "react";
import { faCirclePlus } from "@fortawesome/pro-solid-svg-icons";
import {
  ANIMATION_MIXAMO_FILE_TYPE,
  ANIMATION_MMD_FILE_TYPE,
  AssetFilterOption,
  FeatureFlags,
  FilterEngineCategories,
  MediaFileAnimationType,
} from "~/enums";
import {
  Button,
  FilterButtons,
  Pagination,
  SearchFilter,
  UploadModal,
} from "~/components";
import { ItemElements } from "~/pages/PageEnigma/comps/SidePanelTabs/sharedComps";
import { FetchStatus } from "~/pages/PageEnigma/enums";
import {
  fetchFeaturedMediaItems,
  fetchFeaturedMediaItemsSearchResults,
  FetchMediaItemStates,
  fetchUserMediaItems,
  fetchUserMediaItemsSearchResults,
  isAnyStatusFetching,
} from "../../utilities";
import { usePosthogFeatureFlag } from "~/hooks/usePosthogFeatureFlag";
import {
  filterMixamoAnimations,
  filterMMDAnimations,
} from "./filterCharacterTypes";
import { MediaItem } from "~/pages/PageEnigma/models";

export const AnimationTab = ({
  animationType,
  demoAnimationItems = [],
}: {
  animationType: MediaFileAnimationType;
  demoAnimationItems?: MediaItem[];
}) => {
  const showSearchObjectComponent = usePosthogFeatureFlag(
    FeatureFlags.SHOW_SEARCH_OBJECTS,
  );
  const showUploadButton = usePosthogFeatureFlag(FeatureFlags.DEV_ONLY);
  const filterAnimationType = useMemo(
    () =>
      animationType === MediaFileAnimationType.Mixamo
        ? filterMixamoAnimations
        : filterMMDAnimations,
    [animationType],
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
      ? [...(featuredAnimations || []), ...demoAnimationItems]
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
          const filterNewMediaItems = newState.mediaItems
            ? newState.mediaItems.filter(filterAnimationType)
            : undefined;
          setUserFetch((curr) => ({
            status: newState.status,
            mediaItems: filterNewMediaItems
              ? filterNewMediaItems
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
          const filterNewMediaItems = newState.mediaItems
            ? newState.mediaItems.filter(filterAnimationType)
            : undefined;
          setFeaturedFetch((curr) => ({
            status: newState.status,
            mediaItems: filterNewMediaItems
              ? filterNewMediaItems
              : curr.mediaItems,
          }));
        },
        defaultErrorMessage: "Unknown Error in Fetching Featured Set Objects",
      }),
    [],
  );

  const filterAnimationItems = (searchTerm: string) =>
    demoAnimationItems.filter((item) =>
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
      {/* <TabTitle title="Animation" /> */}

      <FilterButtons
        value={selectedFilter}
        onClick={(buttonIdx) => {
          setSelectedFilter(Number(buttonIdx));
          setCurrentPage(0);
        }}
      />

      <div className="flex w-full flex-col gap-3 px-4">
        {showUploadButton && (
          <Button
            icon={faCirclePlus}
            variant="action"
            onClick={() => setOpen(true)}
            className="w-full py-3 text-sm font-medium"
          >
            Upload Animation (Dev Only)
          </Button>
        )}
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
        type={FilterEngineCategories.ANIMATION}
        fileTypes={Object.values(
          animationType === MediaFileAnimationType.Mixamo
            ? ANIMATION_MIXAMO_FILE_TYPE
            : ANIMATION_MMD_FILE_TYPE,
        )}
        title="Upload Animation"
        options={{
          fileSubtypes: [
            { [animationType]: animationType },
            // { Mixamo: MediaFileAnimationType.Mixamo },
            // { MikuMikuDance: MediaFileAnimationType.MikuMikuDance },
            // { MoveAi: MediaFileAnimationType.MoveAi },
            // { Rigify: MediaFileAnimationType.Rigify },
            // { Rokoko: MediaFileAnimationType.Rokoko },
          ],
          hasLength: true,
          hasThumbnailUpload: true,
        }}
      />
    </>
  );
};
