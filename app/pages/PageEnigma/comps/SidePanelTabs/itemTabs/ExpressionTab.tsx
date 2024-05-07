import { expressionFilter, expressionItems } from "~/pages/PageEnigma/store";
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
import UploadModalMovement from "~/components/UploadModalMovement";
import { useCallback, useContext, useEffect, useState } from "react";
import { MediaFileEngineCategory } from "~/api/media_files/UploadEngineAsset";
import {
  GetMediaByUser,
  GetMediaListResponse,
} from "~/api/media_files/GetMediaByUser";
import { AuthenticationContext } from "~/contexts/Authentication";
import { TabTitle } from "~/pages/PageEnigma/comps/SidePanelTabs/comps/TabTitle";
import { MediaFileAnimationType } from "~/api/media_files/UploadNewEngineAsset";

export const ExpressionTab = () => {
  useSignals();
  const [open, setOpen] = useState(false);
  const { authState } = useContext(AuthenticationContext);

  const refetchExpressions = useCallback(async () => {
    if (!authState?.userInfo) {
      return;
    }
    return GetMediaByUser(
      authState?.userInfo?.username || "",
      {},
      {
        filter_engine_categories: MediaFileEngineCategory.Expression,
        // page_size: 5,
      },
    ).then((res: GetMediaListResponse) => {
      if (res.success && res.results) {
        expressionItems.value = res.results.map((item, index: number) => {
          return {
            version: 1,
            type: AssetType.EXPRESSION,
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
        });
      }
    });
  }, [authState?.userInfo]);

  useEffect(() => {
    if (authState?.userInfo && !expressionItems.value.length) {
      refetchExpressions();
    }
  }, [authState?.userInfo, refetchExpressions]);

  return (
    <>
      <TabTitle title="Expressions" />
      <div className="w-full overflow-x-auto overflow-y-hidden">
        <div className="mb-4 flex justify-start gap-2 px-4">
          <button
            className={twMerge(
              "filter-tab",
              expressionFilter.value === AssetFilterOption.ALL ? "active" : "",
              "disabled",
            )}
            onClick={() => (expressionFilter.value = AssetFilterOption.ALL)}>
            All
          </button>
          <button
            className={twMerge(
              "filter-tab",
              expressionFilter.value === AssetFilterOption.MINE ? "active" : "",
              "disabled",
            )}
            onClick={() => (expressionFilter.value = AssetFilterOption.MINE)}
            disabled={!expressionItems.value.some((item) => item.isMine)}>
            My Expressions
          </button>
          <button
            className={twMerge(
              "filter-tab",
              expressionFilter.value === AssetFilterOption.BOOKMARKED
                ? "active"
                : "",
              "disabled",
            )}
            onClick={() =>
              (expressionFilter.value = AssetFilterOption.BOOKMARKED)
            }
            disabled={!expressionItems.value.some((item) => item.isBookmarked)}>
            Bookmarked
          </button>
        </div>
      </div>
      <div className="w-full px-4 pb-4">
        <Button
          icon={faCirclePlus}
          variant="action"
          onClick={() => setOpen(true)}
          className="w-full py-3 text-sm font-medium">
          Upload Expression
        </Button>
      </div>
      <div className="h-full w-full overflow-y-auto px-4">
        <ItemElements
          items={expressionItems.value}
          assetFilter={expressionFilter.value}
        />
      </div>
      <UploadModalMovement
        closeModal={() => setOpen(false)}
        onClose={() => setOpen(false)}
        onSuccess={refetchExpressions}
        isOpen={open}
        fileTypes={["CSV"]}
        title="Upload Expression"
        typeOptions={[{ ARKit: MediaFileAnimationType.ArKit }]}
        type={MediaFileEngineCategory.Expression}
      />
    </>
  );
};
