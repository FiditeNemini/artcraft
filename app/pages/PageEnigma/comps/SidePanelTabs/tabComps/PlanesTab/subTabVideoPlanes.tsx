import { useCallback, useEffect, useState } from "react";
import { faCirclePlus } from "@fortawesome/pro-solid-svg-icons";
import {
  AssetFilterOption,
  FeatureFlags,
  FilterEngineCategories,
  VIDEOPLANE_FILE_TYPE,
} from "~/enums";
import { FetchStatus } from "~/pages/PageEnigma/enums";
import {
  Button,
  Pagination,
  SearchFilter,
  UploadModalMedia,
} from "~/components";
import { ItemElements } from "~/pages/PageEnigma/comps/SidePanelTabs/sharedComps";
import {
  fetchFeaturedMediaItems,
  fetchUserMediaItems,
  FetchMediaItemStates,
  isAnyStatusFetching,
  fetchFeaturedMediaItemsSearchResults,
  fetchUserMediaItemsSearchResults,
} from "../../utilities";
import { usePosthogFeatureFlag } from "~/hooks/usePosthogFeatureFlag";

const filterEngineCategories = [FilterEngineCategories.VIDEO_PLANE];

export const VideoPlanesTab = () => {
  const showSearchObjectComponent = usePosthogFeatureFlag(
    FeatureFlags.SHOW_SEARCH_OBJECTS,
  );

  const [openUploadModal, setOpenUploadModal] = useState(false);
  const [searchTermFeatured, setSearchTermFeatured] = useState("");
  const [searchTermUser, setSearchTermUser] = useState("");

  const [{ mediaItems: userImages, status: userFetchStatus }, setUserFetch] =
    useState<FetchMediaItemStates>({
      mediaItems: undefined,
      status: FetchStatus.READY,
    });
  const [
    { mediaItems: featuredImages, status: featuredFetchStatus },
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

  const [
    selectedFilter,
    //setSelectedFilter
  ] = useState(AssetFilterOption.MINE);
  const displayedItems =
    selectedFilter === AssetFilterOption.FEATURED
      ? featuredImages ?? []
      : userImages ?? [];

  const [currentPage, setCurrentPage] = useState<number>(0);

  const pageSize = 21;
  const totalPages = Math.ceil(displayedItems.length / pageSize);

  const isFetching = isAnyStatusFetching([
    userFetchStatus,
    featuredFetchStatus,
    featuredSearchFetchStatus,
    userSearchFetchStatus,
  ]);

  const fetchUserImages = useCallback(
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
        defaultErrorMessage: "Unknown Error in Fetching User Images",
      }),
    [],
  );

  const fetchFeaturedImages = useCallback(
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
        defaultErrorMessage: "Unknown Error in Fetching Featured Images",
      }),
    [],
  );

  const fetchFeaturedSearchResults = useCallback(async () => {
    fetchFeaturedMediaItemsSearchResults({
      filterEngineCategories: filterEngineCategories,
      setState: (newState: FetchMediaItemStates) => {
        setFeaturedSearchFetch((curr) => ({
          status: newState.status,
          mediaItems: newState.mediaItems
            ? newState.mediaItems
            : curr.mediaItems,
        }));
      },
      defaultErrorMessage:
        "Unknown Error in Fetching Featured Images Search Results",
      searchTerm: searchTermFeatured,
    });
  }, [searchTermFeatured]);

  const fetchUserSearchResults = useCallback(async () => {
    fetchUserMediaItemsSearchResults({
      filterEngineCategories: filterEngineCategories,
      setState: (newState: FetchMediaItemStates) => {
        setUserSearchFetch((curr) => ({
          status: newState.status,
          mediaItems: newState.mediaItems
            ? newState.mediaItems
            : curr.mediaItems,
        }));
      },
      defaultErrorMessage:
        "Unknown Error in Fetching User Images Search Results",
      searchTerm: searchTermUser,
    });
  }, [searchTermUser]);

  useEffect(() => {
    if (!userImages) {
      fetchUserImages();
    }
    if (!featuredImages) {
      fetchFeaturedImages();
    }
  }, [userImages, fetchUserImages, featuredImages, fetchFeaturedImages]);

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
      {/* <TabTitle title="Image Panels" /> */}

      {/* <FilterButtons
        value={selectedFilter}
        onClick={(buttonIdx) => {
          setSelectedFilter(Number(buttonIdx));
        }}
      /> */}

      <div className="flex w-full flex-col gap-3 px-4">
        <Button
          icon={faCirclePlus}
          variant="action"
          onClick={() => setOpenUploadModal(true)}
          className="w-full py-3 text-sm font-medium"
        >
          Upload Video Panels
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
                ? "Search featured video panels"
                : "Search my video panels"
            }
          />
        )}
      </div>
      <div className="w-full grow overflow-y-auto px-4 pb-4">
        <ItemElements
          busy={isFetching}
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
      <UploadModalMedia
        onClose={() => setOpenUploadModal(false)}
        onSuccess={fetchUserImages}
        isOpen={openUploadModal}
        fileTypes={Object.values(VIDEOPLANE_FILE_TYPE)}
        title="Upload Video Panels"
      />
    </>
  );
};
