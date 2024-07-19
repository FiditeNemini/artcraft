import { useCallback, useEffect, useState } from "react";
import { faCirclePlus } from "@fortawesome/pro-solid-svg-icons";
import {
  AssetFilterOption,
  FilterEngineCategories,
  MediaFileAnimationType,
  FeatureFlags,
} from "~/enums";
import {
  Button,
  FilterButtons,
  Pagination,
  SearchFilter,
  UploadModal,
} from "~/components";
import {
  ItemElements,
  // TabTitle,
} from "~/pages/PageEnigma/comps/SidePanelTabs/sharedComps";
import { usePosthogFeatureFlag } from "~/hooks/usePosthogFeatureFlag";
import {
  fetchFeaturedMediaItems,
  fetchFeaturedMediaItemsSearchResults,
  FetchMediaItemStates,
  fetchUserMediaItems,
  fetchUserMediaItemsSearchResults,
  isAnyStatusFetching,
} from "../../utilities";
import { FetchStatus } from "~/pages/PageEnigma/enums";

export const ExpressionTab = () => {
  const showSearchObjectComponent = usePosthogFeatureFlag(
    FeatureFlags.SHOW_SEARCH_OBJECTS,
  );

  const showUploadButton = usePosthogFeatureFlag(FeatureFlags.DEV_ONLY);

  const [open, setOpen] = useState(false);
  const [searchTermFeatured, setSearchTermFeatured] = useState("");
  const [searchTermUser, setSearchTermUser] = useState("");

  const [
    { mediaItems: userExpressions, status: userFetchStatus },
    setUserFetch,
  ] = useState<FetchMediaItemStates>({
    mediaItems: undefined,
    status: FetchStatus.READY,
  });
  const [
    { mediaItems: featuredExpressions, status: featuredFetchStatus },
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
      ? featuredExpressions ?? []
      : userExpressions ?? [];

  const [currentPage, setCurrentPage] = useState<number>(0);
  const pageSize = 21;
  const totalPages = Math.ceil(displayedItems.length / pageSize);

  const isFetching = isAnyStatusFetching([
    userFetchStatus,
    featuredFetchStatus,
    featuredSearchFetchStatus,
    userSearchFetchStatus,
  ]);

  const fetchUserExpressions = useCallback(
    () =>
      fetchUserMediaItems({
        filterEngineCategories: [FilterEngineCategories.EXPRESSION],
        setState: (newState: FetchMediaItemStates) => {
          setUserFetch((curr) => ({
            status: newState.status,
            mediaItems: newState.mediaItems
              ? newState.mediaItems
              : curr.mediaItems,
          }));
        },
        defaultErrorMessage: "Unknown Error in Fetching User Expressions",
      }),
    [],
  );

  const fetchFeaturedExpressions = useCallback(
    () =>
      fetchFeaturedMediaItems({
        filterEngineCategories: [FilterEngineCategories.EXPRESSION],
        setState: (newState: FetchMediaItemStates) => {
          setFeaturedFetch((curr) => ({
            status: newState.status,
            mediaItems: newState.mediaItems
              ? newState.mediaItems
              : curr.mediaItems,
          }));
        },
        defaultErrorMessage: "Unknown Error in Fetching Featured Expressions",
      }),
    [],
  );

  const fetchFeaturedSearchResults = useCallback(async (searchTerm: string) => {
    fetchFeaturedMediaItemsSearchResults({
      filterEngineCategories: [FilterEngineCategories.EXPRESSION],
      setState: (newState: FetchMediaItemStates) => {
        setFeaturedSearchFetch((curr) => ({
          status: newState.status,
          mediaItems: newState.mediaItems
            ? newState.mediaItems
            : curr.mediaItems,
        }));
      },
      defaultErrorMessage:
        "Unknown Error in Fetching Featured Expressions Search Results",
      searchTerm: searchTerm,
    });
  }, []);

  const fetchUserSearchResults = useCallback(async (searchTerm: string) => {
    fetchUserMediaItemsSearchResults({
      filterEngineCategories: [FilterEngineCategories.EXPRESSION],
      setState: (newState: FetchMediaItemStates) => {
        setUserSearchFetch((curr) => ({
          status: newState.status,
          mediaItems: newState.mediaItems
            ? newState.mediaItems
            : curr.mediaItems,
        }));
      },
      defaultErrorMessage:
        "Unknown Error in Fetching User Expressions Search Results",
      searchTerm: searchTerm,
    });
  }, []);

  useEffect(() => {
    if (!userExpressions) {
      fetchUserExpressions();
    }
    if (!featuredExpressions) {
      fetchFeaturedExpressions();
    }
  }, [
    userExpressions,
    fetchUserExpressions,
    featuredExpressions,
    fetchFeaturedExpressions,
  ]);

  useEffect(() => {
    if (selectedFilter === AssetFilterOption.FEATURED) {
      setCurrentPage(0);
      fetchFeaturedSearchResults(searchTermFeatured);
    } else if (selectedFilter === AssetFilterOption.MINE) {
      setCurrentPage(0);
      fetchUserSearchResults(searchTermUser);
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
      {/* <TabTitle title="Face Expression" /> */}
      <FilterButtons
        value={selectedFilter}
        onClick={(button) => {
          setSelectedFilter(button);
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
            Upload Expression (Dev Only)
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
                ? "Search featured expressions"
                : "Search my expressions"
            }
          />
        )}
      </div>
      <div className="h-full w-full overflow-y-auto px-4 pb-4">
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
      <UploadModal
        onClose={() => setOpen(false)}
        onSuccess={fetchUserExpressions}
        isOpen={open}
        fileTypes={["CSV"]}
        title="Upload Expression"
        options={{
          fileSubtypes: [{ ARKit: MediaFileAnimationType.ArKit }],
          hasLength: true,
          hasThumbnailUpload: true,
        }}
        type={FilterEngineCategories.EXPRESSION}
      />
    </>
  );
};
