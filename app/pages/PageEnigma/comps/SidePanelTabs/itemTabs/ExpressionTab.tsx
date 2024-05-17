import { useCallback, useEffect, useState } from "react";
import { useSignals } from "@preact/signals-react/runtime";
import { faCirclePlus } from "@fortawesome/pro-solid-svg-icons";

import { MediaItem } from "~/pages/PageEnigma/models";
import { AssetFilterOption, AssetType } from "~/enums";

import { expressionFilter, expressionItems } from "~/pages/PageEnigma/signals";
import { authentication } from "~/signals";

import { MediaFileEngineCategory } from "~/api/media_files/UploadEngineAsset";
import {
  GetMediaByUser,
  GetMediaListResponse,
} from "~/api/media_files/GetMediaByUser";
import { MediaFileAnimationType } from "~/api/media_files/UploadNewEngineAsset";
import {
  ListFeaturedMediaFiles,
  ListFeaturedMediaFilesResponse,
} from "~/api/media_files/ListFeaturedMediaFiles";

import { ItemElements } from "~/pages/PageEnigma/comps/SidePanelTabs/itemTabs/ItemElements";
import { Button, FilterButtons, UploadModalMovement } from "~/components";
import { TabTitle } from "~/pages/PageEnigma/comps/SidePanelTabs/comps/TabTitle";

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
  const { userInfo } = authentication;

  const [open, setOpen] = useState(false);

  const [selectedFilter, setSelectedFilter] = useState(
    AssetFilterOption.FEATURED,
  );

  const [featured, setFeatured] = useState<{ value: MediaItem[] }>({
    value: [],
  });
  const [status, setStatus] = useState(FetchStatus.ready);

  const refetchExpressions = useCallback(async () => {
    if (!userInfo.value) {
      return;
    }
    const { username, user_token } = userInfo.value;
    return GetMediaByUser(
      username,
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
            isMine: item.maybe_creator_user?.user_token === user_token,
            imageIndex: index,
          } as MediaItem;
        });
      }
    });
  }, [userInfo.value]);

  useEffect(() => {
    if (userInfo.value && !expressionItems.value.length) {
      refetchExpressions();
    }
    if (status === FetchStatus.ready) {
      setStatus(FetchStatus.in_progress);
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
          setStatus(FetchStatus.success);
          setFeatured({
            value: res.results.map((item) => {
              return {
                version: 1,
                type: AssetType.EXPRESSION,
                media_id: item.token,
                name: item.maybe_title,
                publicBucketPath: item.public_bucket_path,
                length: ((item.maybe_duration_millis ?? 1000) / 1000) * 60,
                thumbnail: item.cover_image
                  ?.maybe_cover_image_public_bucket_path
                  ? "https://cdn.fakeyou.com/cdn-cgi/image/width=600,quality=100" +
                    item.cover_image?.maybe_cover_image_public_bucket_path
                  : undefined,
                isMine:
                  item.maybe_creator_user?.user_token ===
                  userInfo.value?.user_token,
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
  }, [userInfo.value, refetchExpressions, status]);

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

      <div className="w-full px-4">
        <Button
          icon={faCirclePlus}
          variant="action"
          onClick={() => setOpen(true)}
          className="w-full py-3 text-sm font-medium"
        >
          Upload Expression
        </Button>
      </div>
      <div className="h-full w-full overflow-y-auto px-4">
        <ItemElements
          items={
            selectedFilter === AssetFilterOption.FEATURED
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
