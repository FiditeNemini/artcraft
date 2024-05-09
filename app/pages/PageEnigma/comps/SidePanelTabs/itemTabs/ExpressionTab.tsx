import { expressionFilter, expressionItems } from "~/pages/PageEnigma/store";
import {
  AssetFilterOption,
  AssetType,
  MediaItem,
} from "~/pages/PageEnigma/models";
import { useSignals } from "@preact/signals-react/runtime";
import { ItemElements } from "~/pages/PageEnigma/comps/SidePanelTabs/itemTabs/ItemElements";
import { Button, FilterButtons } from "~/components";
import { faCirclePlus } from "@fortawesome/pro-solid-svg-icons";
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
import {
  ListFeaturedMediaFiles,
  ListFeaturedMediaFilesResponse,
} from "~/api/media_files/ListFeaturedMediaFiles";

import { BucketConfig } from "~/api/BucketConfig";

// I know these enums are duplicates, I know they should live elsewhere. They live here for right now -V

export enum Filters {
  Featured,
  Mine,
  Bookmarked,
}

export enum FetchStatus {
  paused,
  // ready triggers a new fetch
  ready,
  in_progress,
  success,
  error,
}

export const ExpressionTab = () => {
  useSignals();
  const [open, setOpen] = useState(false);
  const { authState } = useContext(AuthenticationContext);
  const [selectedFilter, selectedFilterSet] = useState(Filters.Featured);

  const [featured, featuredSet] = useState({ value: [] });
  const [status, statusSet] = useState(FetchStatus.ready);

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

      console.log("HELLO!")
      console.log(res)
      console.log("RESULT")

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
    if (status === FetchStatus.ready) {
      statusSet(FetchStatus.in_progress);
      ListFeaturedMediaFiles(
        "",
        {},
        {
          filter_engine_categories: "expression",
          // page_index: page,
          page_size: 100,
        },
      ).then((res: GetMediaListResponse | ListFeaturedMediaFilesResponse) => {
        if (res.success && res.results) {
          statusSet(FetchStatus.success);
          featuredSet({
            value: res.results.map((item) => {
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
                imageIndex: 0,
              } as MediaItem;
            }),
            // .filter((item,i) => (item.thumbnail)) disabled for testing for now
          });
          // if (res.pagination) {
          //   pageCountSet(res.pagination.total_page_count);
          // }
        }
      });
    }
  }, [authState?.userInfo, refetchExpressions, status]);

  return (
    <>
      <TabTitle title="Expressions" />

      <div>
        <div className="flex gap-2 overflow-x-auto overflow-y-hidden px-4">
          <FilterButtons
            {...{
              value: selectedFilter,
              onClick: (e) => {
                // reFetchList();
                selectedFilterSet(Number(e.target.value));
              },
            }}
          />
        </div>
      </div>

      <div className="w-full px-4">
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
          items={
            selectedFilter === Filters.Featured
              ? featured.value
              : expressionItems.value
          }
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
