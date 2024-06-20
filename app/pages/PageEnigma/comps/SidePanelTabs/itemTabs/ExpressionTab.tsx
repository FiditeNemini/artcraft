import { useCallback, useEffect, useState } from "react";
import { useSignals } from "@preact/signals-react/runtime";
import { faCirclePlus, faMobileNotch } from "@fortawesome/pro-solid-svg-icons";

import { MediaInfo, MediaItem } from "~/pages/PageEnigma/models";
import {
  AssetFilterOption,
  AssetType,
  FilterEngineCategories,
  ToastTypes,
  MediaFileAnimationType,
} from "~/enums";

import { expressionFilter } from "~/pages/PageEnigma/signals";

import { ItemElements } from "~/pages/PageEnigma/comps/SidePanelTabs/itemTabs/ItemElements";
import {
  Button,
  ButtonDialogue,
  FilterButtons,
  UploadModalMovement,
} from "~/components";
import { TabTitle } from "~/pages/PageEnigma/comps/SidePanelTabs/comps/TabTitle";

import { MediaFilesApi } from "~/Classes/ApiManager";
import { addToast } from "~/signals";

export const ExpressionTab = () => {
  useSignals();
  const [userExpressions, setUserExpressions] = useState<MediaItem[] | null>();

  const [open, setOpen] = useState(false);

  const [selectedFilter, setSelectedFilter] = useState(
    AssetFilterOption.FEATURED,
  );

  const [featuredExpressions, setFeaturedExpressions] = useState<
    MediaItem[] | undefined
  >(undefined);

  const responseMapping = (data: MediaInfo[], isMine: boolean) => {
    return data.map((item, index: number) => {
      return {
        version: 1,
        type: AssetType.EXPRESSION,
        media_type: item.media_type,
        media_id: item.token,
        name: item.maybe_title,
        publicBucketPath: item.public_bucket_path,
        length: ((item.maybe_duration_millis ?? 1000) / 1000) * 60,
        thumbnail: item.cover_image?.maybe_cover_image_public_bucket_path
          ? "https://cdn.fakeyou.com/cdn-cgi/image/width=600,quality=100" +
            item.cover_image?.maybe_cover_image_public_bucket_path
          : undefined,
        isMine: isMine,
        imageIndex: index,
      } as MediaItem;
    });
  };

  const fetchUserExpressions = useCallback(async () => {
    const mediaFilesApi = new MediaFilesApi();
    const response = await mediaFilesApi.ListUserMediaFiles({
      filter_engine_categories: [FilterEngineCategories.EXPRESSION],
    });
    if (response.success && response.data) {
      const newExpressions = responseMapping(response.data, true);
      setUserExpressions(newExpressions);
      return;
    }
    addToast(
      ToastTypes.ERROR,
      response.errorMessage || "Unknown Error in Fetching User Expressions",
    );
  }, []);

  const fetchFeaturedExpressions = useCallback(async () => {
    const mediaFilesApi = new MediaFilesApi();
    const response = await mediaFilesApi.ListFeaturedMediaFiles({
      filter_engine_categories: [FilterEngineCategories.EXPRESSION],
    });
    if (response.success && response.data) {
      const newExpressions = responseMapping(response.data, false);
      setFeaturedExpressions(newExpressions);
      return;
    }
    addToast(
      ToastTypes.ERROR,
      response.errorMessage || "Unknown Error in Fetching Featured Expressions",
    );
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
    featuredExpressions,
    fetchUserExpressions,
    fetchFeaturedExpressions,
  ]);

  return (
    <>
      <TabTitle title="Expressions" />

      <div>
        <FilterButtons
          value={selectedFilter}
          onClick={(button) => {
            // reFetchList();
            setSelectedFilter(button);
          }}
        />
      </div>

      <div className="flex w-full flex-col gap-2.5 px-4">
        <Button
          icon={faCirclePlus}
          variant="action"
          onClick={() => setOpen(true)}
          className="w-full py-3 text-sm font-medium"
        >
          Upload Expression
        </Button>
        <ButtonDialogue
          buttonProps={{
            variant: "secondary",
            label:
              "Watch a tutorial on how to create expressions using your iPhone",
            className:
              "justify-center border-2 border-white/30 hover:border-white/40 text-start p-3 gap-3.5 rounded-xl",
            icon: faMobileNotch,
            iconClassName: "text-3xl",
          }}
          dialogProps={{
            className: "max-w-6xl",
          }}
          title={<>Video Tutorial: Creating your own expressions</>}
        >
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video
            className="aspect-video w-full rounded-lg"
            controls
            src="https://storage.googleapis.com/vocodes-public/media/t/p/w/q/6/tpwq6beqn95f1h1q9e88c42r0gdekg7p/storyteller_tpwq6beqn95f1h1q9e88c42r0gdekg7p.mp4"
          ></video>
        </ButtonDialogue>
      </div>
      <div className="h-full w-full overflow-y-auto px-4">
        <ItemElements
          items={
            selectedFilter === AssetFilterOption.FEATURED
              ? featuredExpressions || []
              : userExpressions || []
          }
          assetFilter={expressionFilter.value}
        />
      </div>
      <UploadModalMovement
        closeModal={() => setOpen(false)}
        onClose={() => setOpen(false)}
        onSuccess={fetchUserExpressions}
        isOpen={open}
        fileTypes={["CSV"]}
        title="Upload Expression"
        typeOptions={[{ ARKit: MediaFileAnimationType.ArKit }]}
        type={FilterEngineCategories.EXPRESSION}
      />
    </>
  );
};
