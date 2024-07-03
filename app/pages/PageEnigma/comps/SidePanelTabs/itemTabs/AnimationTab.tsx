import { useCallback, useEffect, useState } from "react";
import { useSignals } from "@preact/signals-react/runtime";
import { faCirclePlus } from "@fortawesome/pro-solid-svg-icons";

import { MediaInfo, MediaItem } from "~/pages/PageEnigma/models";
import {
  AssetFilterOption,
  AssetType,
  FilterEngineCategories,
  MediaFileAnimationType,
  ToastTypes,
} from "~/enums";

import { animationItems } from "~/pages/PageEnigma/signals";
import { addToast } from "~/signals";

import { ItemElements } from "~/pages/PageEnigma/comps/SidePanelTabs/itemTabs/ItemElements";
import {
  Button,
  FilterButtons,
  Pagination,
  UploadModalMovement,
} from "~/components";
import { TabTitle } from "~/pages/PageEnigma/comps/SidePanelTabs/comps/TabTitle";

import { MediaFilesApi } from "~/Classes/ApiManager";
import { FetchStatus } from "~/pages/PageEnigma/enums";
import { BucketConfig } from "~/api/BucketConfig";

export const AnimationTab = () => {
  useSignals();

  const [open, setOpen] = useState(false);

  const [userAnimations, setUserAnimations] = useState<MediaItem[] | null>();
  const [featuredAnimations, setFeaturedAnimations] = useState<
    MediaItem[] | undefined
  >(undefined);
  const [selectedFilter, setSelectedFilter] = useState(
    AssetFilterOption.FEATURED,
  );
  const filteredAnimations =
    selectedFilter === AssetFilterOption.FEATURED
      ? [...(featuredAnimations || []), ...animationItems.value]
      : userAnimations ?? [];

  const [currentPage, setCurrentPage] = useState<number>(0);

  const pageSize = 21;
  const totalPages = Math.ceil(filteredAnimations.length / pageSize);

  const [fetchStatuses, setFetchStatuses] = useState({
    userObjectsFetch: FetchStatus.READY,
    featuredObjectsFetch: FetchStatus.READY,
  });
  const isFetching =
    fetchStatuses.userObjectsFetch === FetchStatus.READY ||
    fetchStatuses.userObjectsFetch === FetchStatus.IN_PROGRESS ||
    fetchStatuses.featuredObjectsFetch === FetchStatus.READY ||
    fetchStatuses.featuredObjectsFetch === FetchStatus.IN_PROGRESS;

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
        type: AssetType.ANIMATION,
        media_type: item.media_type,
        length: ((item.maybe_duration_millis ?? 1000) / 1000) * 60,
        version: 1,
        ...(item.cover_image.maybe_cover_image_public_bucket_path
          ? {
              thumbnail: itemThumb,
            }
          : {}),
      };
    });
  };

  const fetchUserAnimations = useCallback(async () => {
    setFetchStatuses((curr) => ({
      ...curr,
      userObjectsFetch: FetchStatus.IN_PROGRESS,
    }));
    const mediaFilesApi = new MediaFilesApi();

    const response = await mediaFilesApi.ListUserMediaFiles({
      page_size: 100,
      filter_engine_categories: [FilterEngineCategories.ANIMATION],
    });

    if (response.success && response.data) {
      setFetchStatuses((curr) => ({
        ...curr,
        userObjectsFetch: FetchStatus.SUCCESS,
      }));
      const newAnimations = responseMapping(response.data);
      setUserAnimations(newAnimations);
      return;
    }
    addToast(
      ToastTypes.ERROR,
      response.errorMessage || "Unknown Error in Fetching User Animations",
    );
    setFetchStatuses((curr) => ({
      ...curr,
      userObjectsFetch: FetchStatus.ERROR,
    }));
  }, []);

  const fetchFeaturedAnimations = useCallback(async () => {
    setFetchStatuses((curr) => ({
      ...curr,
      featuredObjectsFetch: FetchStatus.IN_PROGRESS,
    }));
    const mediaFilesApi = new MediaFilesApi();

    const response = await mediaFilesApi.ListFeaturedMediaFiles({
      filter_engine_categories: [FilterEngineCategories.ANIMATION],
    });

    if (response.success && response.data) {
      setFetchStatuses((curr) => ({
        ...curr,
        featuredObjectsFetch: FetchStatus.SUCCESS,
      }));
      const newAnimations = responseMapping(response.data);
      setFeaturedAnimations(newAnimations);
      return;
    }
    addToast(
      ToastTypes.ERROR,
      response.errorMessage || "Unknown Error in Fetching Featured Animations",
    );
    setFetchStatuses((curr) => ({
      ...curr,
      featuredObjectsFetch: FetchStatus.ERROR,
    }));
  }, []);

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

      <div className="w-full px-4">
        <Button
          icon={faCirclePlus}
          variant="action"
          onClick={() => setOpen(true)}
          className="w-full py-3 text-sm font-medium"
        >
          Upload Animation
        </Button>
      </div>
      <div className="w-full grow overflow-y-auto px-4 pb-4">
        <ItemElements
          busy={isFetching}
          debug="animations tab"
          currentPage={currentPage}
          pageSize={pageSize}
          items={filteredAnimations}
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
      <UploadModalMovement
        onClose={() => setOpen(false)}
        onSuccess={fetchUserAnimations}
        isOpen={open}
        fileTypes={["GLB", "FBX", "VMD"]}
        title="Upload Animation"
        typeOptions={[
          { Mixamo: MediaFileAnimationType.Mixamo },
          { MikuMikuDance: MediaFileAnimationType.MikuMikuDance },
          { MoveAi: MediaFileAnimationType.MoveAi },
          { Rigify: MediaFileAnimationType.Rigify },
          { Rokoko: MediaFileAnimationType.Rokoko },
        ]}
        type={FilterEngineCategories.ANIMATION}
      />
    </>
  );
};
