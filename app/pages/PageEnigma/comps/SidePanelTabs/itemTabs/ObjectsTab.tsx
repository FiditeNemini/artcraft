import { useCallback, useEffect, useState } from "react";
import { usePosthogFeatureFlag } from "~/hooks/usePosthogFeatureFlag";
import { useSignals } from "@preact/signals-react/runtime";

import { faCirclePlus } from "@fortawesome/pro-solid-svg-icons";

import {
  AssetFilterOption,
  AssetType,
  FeatureFlags,
  FilterEngineCategories,
  ToastTypes,
} from "~/enums";
import { FetchStatus } from "~/pages/PageEnigma/enums";
import { MediaInfo, MediaItem } from "~/pages/PageEnigma/models";
import { shapeItems } from "~/pages/PageEnigma/signals";

import { BucketConfig } from "~/api/BucketConfig";

import { ItemElements } from "~/pages/PageEnigma/comps/SidePanelTabs/itemTabs/ItemElements";
import {
  Button,
  FileWrapper,
  FilterButtons,
  SearchFilter,
  Pagination,
} from "~/components";
import { TabTitle } from "~/pages/PageEnigma/comps/SidePanelTabs/comps/TabTitle";
import { MediaFilesApi } from "~/Classes/ApiManager";
import { addToast } from "~/signals";

export const ObjectsTab = () => {
  useSignals();

  const showSearchObjectComponent = usePosthogFeatureFlag(
    FeatureFlags.SHOW_SEARCH_OBJECTS,
  );

  const [searchTermFeatured, setSearchTermFeatured] = useState("");
  const [searchTermMine, setSearchTermMine] = useState("");
  const [filteredSearchObjectsFeatured, setFilteredSearchObjectsFeatured] =
    useState<MediaItem[]>([]);
  const [filteredSearchObjectsMine, setFilteredSearchObjectsMine] = useState<
    MediaItem[]
  >([]);
  const [userObjects, setUserObjects] = useState<MediaItem[] | undefined>(
    undefined,
  );
  const [featuredObjects, setFeaturedObjects] = useState<
    MediaItem[] | undefined
  >(undefined);
  const [selectedFilter, setSelectedFilter] = useState(
    AssetFilterOption.FEATURED,
  );
  const [currentPage, setCurrentPage] = useState<number>(0);

  const filteredObjects =
    selectedFilter === AssetFilterOption.FEATURED
      ? [...shapeItems.value, ...(featuredObjects ?? [])]
      : userObjects ?? [];

  const pageSize = 21;
  const totalPages = Math.ceil(filteredObjects.length / pageSize);

  const [fetchStatuses, setFetchStatuses] = useState({
    userObjectsFetch: FetchStatus.READY,
    featuredObjectsFetch: FetchStatus.READY,
    searchFetch: FetchStatus.READY,
  });
  const isFetching =
    fetchStatuses.userObjectsFetch === FetchStatus.READY ||
    fetchStatuses.userObjectsFetch === FetchStatus.IN_PROGRESS ||
    fetchStatuses.featuredObjectsFetch === FetchStatus.READY ||
    fetchStatuses.featuredObjectsFetch === FetchStatus.IN_PROGRESS ||
    fetchStatuses.searchFetch === FetchStatus.READY ||
    fetchStatuses.searchFetch === FetchStatus.IN_PROGRESS;

  const responseMapping = (data: MediaInfo[]) => {
    return data.map((item) => {
      const bucketConfig = new BucketConfig();
      const itemThumb = bucketConfig.getCdnUrl(
        item.cover_image.maybe_cover_image_public_bucket_path ?? "",
        600,
        100,
      );
      return {
        colorIndex: item.cover_image.default_cover.color_index,
        imageIndex: item.cover_image.default_cover.image_index,
        media_id: item.token,
        name: item.maybe_title ?? "Unknown",
        type: AssetType.OBJECT,
        media_type: item.media_type,
        version: 1,
        ...(item.cover_image.maybe_cover_image_public_bucket_path
          ? {
              thumbnail: itemThumb,
            }
          : {}),
      };
    });
  };

  const fetchFeaturedSearchResults = useCallback(async () => {
    setFetchStatuses((curr) => ({
      ...curr,
      searchFetch: FetchStatus.IN_PROGRESS,
    }));
    const searchTerm = searchTermFeatured;
    if (!searchTerm.trim()) {
      setFilteredSearchObjectsFeatured([]);
      setFetchStatuses((curr) => ({
        ...curr,
        searchFetch: FetchStatus.SUCCESS,
      }));
      return;
    }

    const mediaFilesApi = new MediaFilesApi();
    const response = await mediaFilesApi.SearchFeaturedMediaFiles({
      search_term: searchTerm,
      filter_engine_categories: [FilterEngineCategories.OBJECT],
    });

    if (response.success && response.data) {
      const newSearchObjects = responseMapping(response.data);
      setFilteredSearchObjectsFeatured(newSearchObjects);
      setFetchStatuses((curr) => ({
        ...curr,
        searchFetch: FetchStatus.SUCCESS,
      }));
    } else {
      addToast(
        ToastTypes.ERROR,
        response.errorMessage || "Failed to fetch search results",
      );
      setFetchStatuses((curr) => ({
        ...curr,
        searchFetch: FetchStatus.ERROR,
      }));
    }
  }, [searchTermFeatured]);

  const fetchUserSearchResults = useCallback(async () => {
    setFetchStatuses((curr) => ({
      ...curr,
      searchFetch: FetchStatus.IN_PROGRESS,
    }));
    const searchTerm = searchTermMine;
    if (!searchTerm.trim()) {
      setFilteredSearchObjectsMine([]);
      setFetchStatuses((curr) => ({
        ...curr,
        searchFetch: FetchStatus.SUCCESS,
      }));
      return;
    }

    const mediaFilesApi = new MediaFilesApi();
    const response = await mediaFilesApi.SearchUserMediaFiles({
      search_term: searchTerm,
      filter_engine_categories: [FilterEngineCategories.OBJECT],
    });

    if (response.success && response.data) {
      const newSearchObjects = responseMapping(response.data);
      setFilteredSearchObjectsMine(newSearchObjects);
      setFetchStatuses((curr) => ({
        ...curr,
        searchFetch: FetchStatus.SUCCESS,
      }));
    } else {
      addToast(
        ToastTypes.ERROR,
        response.errorMessage || "Failed to fetch search results",
      );
      setFetchStatuses((curr) => ({
        ...curr,
        searchFetch: FetchStatus.ERROR,
      }));
    }
  }, [searchTermMine]);

  const fetchUserObjects = useCallback(async () => {
    setFetchStatuses((curr) => ({
      ...curr,
      userObjectsFetch: FetchStatus.IN_PROGRESS,
    }));
    const mediaFilesApi = new MediaFilesApi();
    const response = await mediaFilesApi.ListUserMediaFiles({
      page_size: 100,
      filter_engine_categories: [
        FilterEngineCategories.OBJECT,
        FilterEngineCategories.IMAGE_PLANE,
      ],
    });

    if (response.success && response.data) {
      const newObjects = responseMapping(response.data);
      setUserObjects(newObjects);
      setFetchStatuses((curr) => ({
        ...curr,
        userObjectsFetch: FetchStatus.SUCCESS,
      }));
      return;
    }
    addToast(
      ToastTypes.ERROR,
      response.errorMessage || "Unknown Error in Fetching User Objects",
    );
    setFetchStatuses((curr) => ({
      ...curr,
      userObjectsFetch: FetchStatus.ERROR,
    }));
  }, []);

  const fetchFeaturedObjects = useCallback(async () => {
    setFetchStatuses((curr) => ({
      ...curr,
      featuredObjectsFetch: FetchStatus.IN_PROGRESS,
    }));
    const mediaFilesApi = new MediaFilesApi();
    const response = await mediaFilesApi.ListFeaturedMediaFiles({
      filter_engine_categories: [FilterEngineCategories.OBJECT],
    });
    if (response.success && response.data) {
      const newObjects = responseMapping(response.data);
      setFeaturedObjects(newObjects);
      setFetchStatuses((curr) => ({
        ...curr,
        featuredObjectsFetch: FetchStatus.SUCCESS,
      }));
      return;
    }
    addToast(
      ToastTypes.ERROR,
      response.errorMessage || "Unknown Error in Fetching Featured Objects",
    );
    setFetchStatuses((curr) => ({
      ...curr,
      featuredObjectsFetch: FetchStatus.ERROR,
    }));
  }, []);

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
      fetchFeaturedSearchResults();
    } else if (selectedFilter === AssetFilterOption.MINE) {
      fetchUserSearchResults();
    }
  }, [
    searchTermFeatured,
    searchTermMine,
    fetchFeaturedSearchResults,
    fetchUserSearchResults,
    selectedFilter,
  ]);

  return (
    <FileWrapper
      onSuccess={fetchUserObjects}
      type={AssetType.OBJECT}
      render={(parentId) => (
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
              className="file-picker-button py-3"
              htmlFor={parentId}
              icon={faCirclePlus}
              variant="action"
            >
              Upload Object
            </Button>
            {showSearchObjectComponent && (
              <SearchFilter
                searchTerm={
                  selectedFilter === AssetFilterOption.FEATURED
                    ? searchTermFeatured
                    : searchTermMine
                }
                onSearchChange={
                  selectedFilter === AssetFilterOption.FEATURED
                    ? setSearchTermFeatured
                    : setSearchTermMine
                }
                key={selectedFilter}
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
                    ? filteredSearchObjectsFeatured
                    : filteredObjects
                  : searchTermMine
                    ? filteredSearchObjectsMine
                    : filteredObjects
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
  );
};
