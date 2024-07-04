import { useCallback, useEffect, useState } from "react";
import { useSignals } from "@preact/signals-react/runtime";
import { faCirclePlus } from "@fortawesome/pro-solid-svg-icons";

import {
  AssetFilterOption,
  AssetType,
  FilterEngineCategories,
  ToastTypes,
} from "~/enums";
import { FetchStatus } from "~/pages/PageEnigma/enums";
import { MediaInfo, MediaItem } from "~/pages/PageEnigma/models";
import { characterItems as demoCharacterItems } from "~/pages/PageEnigma/signals";
import { addToast } from "~/signals";

import { BucketConfig } from "~/api/BucketConfig";

import { ItemElements } from "~/pages/PageEnigma/comps/SidePanelTabs/itemTabs/ItemElements";
import { Button, FileWrapper, FilterButtons, Pagination } from "~/components";
import { TabTitle } from "~/pages/PageEnigma/comps/SidePanelTabs/comps/TabTitle";

import { MediaFilesApi } from "~/Classes/ApiManager";

export const CharactersTab = () => {
  useSignals();

  const [userCharacters, setUserCharacters] = useState<MediaItem[] | undefined>(
    undefined,
  );
  const [featuredCharacters, setFeaturedCharacters] = useState<
    MediaItem[] | undefined
  >(undefined);
  const [selectedFilter, setSelectedFilter] = useState(
    AssetFilterOption.FEATURED,
  );
  const allFeaturedCharacters = [
    ...demoCharacterItems.value,
    ...(featuredCharacters ?? []),
  ];
  const filteredCharacters =
    selectedFilter === AssetFilterOption.FEATURED
      ? allFeaturedCharacters ?? []
      : userCharacters ?? [];

  const [currentPage, setCurrentPage] = useState<number>(0);

  const pageSize = 21;
  const totalPages = Math.ceil(filteredCharacters.length / pageSize);

  const [fetchStatuses, setFetchStatuses] = useState({
    userObjectsFetch: FetchStatus.READY,
    featuredObjectsFetch: FetchStatus.READY,
  });
  const isFetching =
    fetchStatuses.userObjectsFetch === FetchStatus.READY ||
    fetchStatuses.userObjectsFetch === FetchStatus.IN_PROGRESS ||
    fetchStatuses.featuredObjectsFetch === FetchStatus.READY ||
    fetchStatuses.featuredObjectsFetch === FetchStatus.IN_PROGRESS;

  const responseMapping = (data: MediaInfo[]): MediaItem[] => {
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
        type: AssetType.CHARACTER,
        media_type: item.media_type,
        maybe_animation_type: item.maybe_animation_type || undefined,
        version: 1,
        ...(item.cover_image.maybe_cover_image_public_bucket_path
          ? {
              thumbnail: itemThumb,
            }
          : {}),
      };
    });
  };
  const fetchUserCharacters = useCallback(async () => {
    setFetchStatuses((curr) => ({
      ...curr,
      userObjectsFetch: FetchStatus.IN_PROGRESS,
    }));
    const mediaFilesApi = new MediaFilesApi();

    const response = await mediaFilesApi.ListUserMediaFiles({
      page_size: 100,
      filter_engine_categories: [FilterEngineCategories.CHARACTER],
    });

    if (response.success && response.data) {
      setFetchStatuses((curr) => ({
        ...curr,
        userObjectsFetch: FetchStatus.SUCCESS,
      }));
      const newCharacters = responseMapping(response.data);
      setUserCharacters(newCharacters);
      return;
    }
    addToast(
      ToastTypes.ERROR,
      response.errorMessage || "Unknown Error in Fetching User Characters",
    );
    setFetchStatuses((curr) => ({
      ...curr,
      userObjectsFetch: FetchStatus.ERROR,
    }));
  }, []);

  const fetchFeaturedCharacters = useCallback(async () => {
    setFetchStatuses((curr) => ({
      ...curr,
      featuredObjectsFetch: FetchStatus.IN_PROGRESS,
    }));
    const mediaFilesApi = new MediaFilesApi();

    const response = await mediaFilesApi.ListFeaturedMediaFiles({
      filter_engine_categories: [FilterEngineCategories.CHARACTER],
    });

    if (response.success && response.data) {
      setFetchStatuses((curr) => ({
        ...curr,
        featuredObjectsFetch: FetchStatus.SUCCESS,
      }));
      const newCharacters = responseMapping(response.data);

      setFeaturedCharacters(newCharacters);
      return;
    }
    addToast(
      ToastTypes.ERROR,
      response.errorMessage || "Unknown Error in Fetching Featured Characters",
    );
    setFetchStatuses((curr) => ({
      ...curr,
      featuredObjectsFetch: FetchStatus.ERROR,
    }));
  }, []);

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
            <div className="w-full px-4">
              <Button
                className="file-picker-button py-3"
                htmlFor={parentId}
                icon={faCirclePlus}
                variant="action"
              >
                Upload Character
              </Button>
            </div>
            <div className="w-full grow overflow-y-auto rounded px-4 pb-4">
              <ItemElements
                busy={isFetching}
                debug="characters tab"
                items={filteredCharacters}
                currentPage={currentPage}
                pageSize={pageSize}
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
        )} // End FileWrapper Render
      />
    </>
  );
};
