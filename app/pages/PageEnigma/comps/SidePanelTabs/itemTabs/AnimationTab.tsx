import { useCallback, useEffect, useState } from "react";
import { useSignals } from "@preact/signals-react/runtime";
import { twMerge } from "tailwind-merge";
import { faCirclePlus } from "@fortawesome/pro-solid-svg-icons";

import { MediaItem } from "~/pages/PageEnigma/models";
import {
  AssetFilterOption,
  AssetType,
  FilterEngineCategories,
  MediaFileAnimationType,
  ToastTypes,
} from "~/enums";

import { animationFilter, animationItems } from "~/pages/PageEnigma/signals";
import { addToast } from "~/signals";

import { ItemElements } from "~/pages/PageEnigma/comps/SidePanelTabs/itemTabs/ItemElements";
import { Button, UploadModalMovement } from "~/components";
import { TabTitle } from "~/pages/PageEnigma/comps/SidePanelTabs/comps/TabTitle";

import { MediaFilesApi } from "~/Classes/ApiManager";

export const AnimationTab = () => {
  useSignals();

  const [open, setOpen] = useState(false);
  const [userAnimations, setUserAnimations] = useState<MediaItem[] | null>();

  const refetchAnimations = useCallback(async () => {
    const mediaFilesApi = new MediaFilesApi();
    const response = await mediaFilesApi.ListUserMediaFiles({
      filter_engine_categories: [FilterEngineCategories.ANIMATION],
    });
    if (response.success && response.data) {
      setUserAnimations(
        response.data.map((item, index: number) => {
          return {
            version: 1,
            type: AssetType.ANIMATION,
            media_type: item.media_type,
            media_id: item.token,
            name: item.maybe_title,
            publicBucketPath: item.public_bucket_path,
            length: ((item.maybe_duration_millis ?? 1000) / 1000) * 60,
            thumbnail: item.cover_image?.maybe_cover_image_public_bucket_path
              ? "https://cdn.fakeyou.com/cdn-cgi/image/width=600,quality=100" +
                item.cover_image?.maybe_cover_image_public_bucket_path
              : undefined,
            isMine: true,
            imageIndex: index,
          } as MediaItem;
        }),
      );
      return;
    }
    addToast(
      ToastTypes.ERROR,
      response.errorMessage || "Unknown Error in Getting User Animations",
    );
    setUserAnimations([]); // set it to empty to avoid looping;
  }, []);

  useEffect(() => {
    if (!userAnimations) {
      refetchAnimations();
    }
  }, [refetchAnimations, userAnimations]);

  return (
    <>
      <TabTitle title="Animation" />

      <div>
        <div className="flex gap-2 overflow-x-auto overflow-y-hidden px-4">
          <button
            className={twMerge(
              "filter-tab",
              animationFilter.value === AssetFilterOption.ALL ? "active" : "",
            )}
            onClick={() => (animationFilter.value = AssetFilterOption.ALL)}
          >
            All
          </button>
          <button
            className={twMerge(
              "filter-tab",
              animationFilter.value === AssetFilterOption.MINE ? "active" : "",
            )}
            onClick={() => (animationFilter.value = AssetFilterOption.MINE)}
            disabled={!animationItems.value.some((item) => item.isMine)}
          >
            My Animations
          </button>
          <button
            className={twMerge(
              "filter-tab",
              animationFilter.value === AssetFilterOption.BOOKMARKED
                ? "active"
                : "",
            )}
            onClick={() =>
              (animationFilter.value = AssetFilterOption.BOOKMARKED)
            }
            disabled={!animationItems.value.some((item) => item.isBookmarked)}
          >
            Bookmarked
          </button>
        </div>
      </div>

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
          items={[...(userAnimations ?? []), ...animationItems.value]}
          assetFilter={animationFilter.value}
        />
      </div>
      <UploadModalMovement
        onClose={() => setOpen(false)}
        onSuccess={refetchAnimations}
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
