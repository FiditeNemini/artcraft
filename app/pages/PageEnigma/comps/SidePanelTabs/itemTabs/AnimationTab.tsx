import { animationFilter, animationItems } from "~/pages/PageEnigma/store";
import {
  AssetFilterOption,
  AssetType,
  MediaItem,
} from "~/pages/PageEnigma/models";
import { useSignals } from "@preact/signals-react/runtime";
import { ItemElements } from "~/pages/PageEnigma/comps/SidePanelTabs/itemTabs/ItemElements";
import { Button } from "~/components";
import { faCirclePlus } from "@fortawesome/pro-solid-svg-icons";
import { twMerge } from "tailwind-merge";
import { TabTitle } from "~/pages/PageEnigma/comps/SidePanelTabs/comps/TabTitle";
import UploadModalMovement from "~/components/UploadModalMovement";
import { MediaFileAnimationType } from "~/api/media_files/UploadNewEngineAsset";
import { MediaFileEngineCategory } from "~/api/media_files/UploadEngineAsset";
import { useCallback, useContext, useEffect, useState } from "react";
import {
  GetMediaByUser,
  GetMediaListResponse,
} from "~/api/media_files/GetMediaByUser";
import { AuthenticationContext } from "~/contexts/Authentication";

export const AnimationTab = () => {
  useSignals();
  const { authState } = useContext(AuthenticationContext);
  const [open, setOpen] = useState(false);
  const [userAnimations, setUserAnimations] = useState<MediaItem[] | null>();

  const refetchAnimations = useCallback(async () => {
    if (!authState?.userInfo) {
      return;
    }
    return GetMediaByUser(
      authState?.userInfo?.username || "",
      {},
      {
        filter_engine_categories: MediaFileEngineCategory.Animation,
        // page_size: 5,
      },
    ).then((res: GetMediaListResponse) => {
      if (res.success && res.results) {
        setUserAnimations(
          res.results.map((item, index: number) => {
            return {
              version: 1,
              type: AssetType.ANIMATION,
              media_id: item.token,
              name: item.maybe_title,
              publicBucketPath: item.public_bucket_path,
              length: ((item.maybe_duration_millis ?? 1000) / 1000) * 60,
              thumbnail: item.cover_image?.maybe_cover_image_public_bucket_path
                ? "https://cdn.fakeyou.com/cdn-cgi/image/width=600,quality=100" +
                  item.cover_image?.maybe_cover_image_public_bucket_path
                : undefined,
              isMine:
                item.maybe_creator_user?.user_token ===
                authState?.userInfo?.user_token,
              imageIndex: index,
            } as MediaItem;
          }),
        );
      }
    });
  }, [authState?.userInfo]);

  useEffect(() => {
    if (authState?.userInfo && !userAnimations) {
      refetchAnimations();
    }
  }, [authState?.userInfo, refetchAnimations, userAnimations]);

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
            onClick={() => (animationFilter.value = AssetFilterOption.ALL)}>
            All
          </button>
          <button
            className={twMerge(
              "filter-tab",
              animationFilter.value === AssetFilterOption.MINE ? "active" : "",
            )}
            onClick={() => (animationFilter.value = AssetFilterOption.MINE)}
            disabled={!animationItems.value.some((item) => item.isMine)}>
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
            disabled={!animationItems.value.some((item) => item.isBookmarked)}>
            Bookmarked
          </button>
        </div>
      </div>

      <div className="w-full px-4">
        <Button
          icon={faCirclePlus}
          variant="action"
          onClick={() => setOpen(true)}
          className="w-full py-3 text-sm font-medium">
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
        closeModal={() => setOpen(false)}
        onClose={() => setOpen(false)}
        onSuccess={refetchAnimations}
        isOpen={open}
        fileTypes={["GLB", "FBX"]}
        title="Upload Animation"
        typeOptions={[
          { Mixamo: MediaFileAnimationType.Mixamo },
          { MikuMikuDance: MediaFileAnimationType.MikuMikuDance },
          { MoveAi: MediaFileAnimationType.MoveAi },
          { Rigify: MediaFileAnimationType.Rigify },
          { Rokoko: MediaFileAnimationType.Rokoko },
        ]}
        type={MediaFileEngineCategory.Animation}
      />
    </>
  );
};
