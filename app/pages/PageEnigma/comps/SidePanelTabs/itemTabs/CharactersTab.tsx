import { useEffect, useState } from "react";
import { useSignals } from "@preact/signals-react/runtime";
import { faCirclePlus } from "@fortawesome/pro-solid-svg-icons";

import { AssetFilterOption, AssetType } from "~/enums";
import { FetchStatus } from "~/pages/PageEnigma/enums";
import { MediaItem } from "~/pages/PageEnigma/models";
import { characterFilter, characterItems } from "~/pages/PageEnigma/signals";
import { authentication } from "~/signals";

import {
  GetMediaByUser,
  GetMediaListResponse,
} from "~/api/media_files/GetMediaByUser";
import {
  ListFeaturedMediaFiles,
  ListFeaturedMediaFilesResponse,
} from "~/api/media_files/ListFeaturedMediaFiles";
import { BucketConfig } from "~/api/BucketConfig";

import { ItemElements } from "~/pages/PageEnigma/comps/SidePanelTabs/itemTabs/ItemElements";
import { Button, FileWrapper, FilterButtons, Pagination } from "~/components";
import { TabTitle } from "~/pages/PageEnigma/comps/SidePanelTabs/comps/TabTitle";

import { usePagination } from "~/pages/PageEnigma/comps/SidePanelTabs/itemTabs/hooks/usePagination";

export const CharactersTab = () => {
  useSignals();
  const { userInfo } = authentication;
  const [characters, setCharacters] = useState<{ value: MediaItem[] }>({
    value: [],
  });
  const [pageCount, setPageCount] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState(
    AssetFilterOption.FEATURED,
  );
  const [status, setStatus] = useState(FetchStatus.READY);

  const { page, pageChange } = usePagination(setStatus);

  const reFetchList = () => {
    setStatus(FetchStatus.READY);
  };

  const selectedFetcher =
    selectedFilter === AssetFilterOption.FEATURED
      ? ListFeaturedMediaFiles
      : GetMediaByUser;

  useEffect(() => {
    // we need to cache the current tab because we don't unmount components
    if (status === FetchStatus.READY) {
      setStatus(FetchStatus.IN_PROGRESS);
      selectedFetcher(
        userInfo.value?.username || "",
        {},
        {
          filter_engine_categories: "character",
          page_index: page,
          page_size: 200,
        },
      ).then((res: GetMediaListResponse | ListFeaturedMediaFilesResponse) => {
        if (res.success && res.results) {
          setStatus(FetchStatus.SUCCESS);
          setCharacters({
            value: res.results.map((item) => {
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
                version: 1,
                ...(item.cover_image.maybe_cover_image_public_bucket_path
                  ? {
                      thumbnail: itemThumb,
                    }
                  : {}),
              };
            }),
            // .filter((item,i) => (item.thumbnail)) disabled for testing for now
          });
          if (res.pagination) {
            setPageCount(res.pagination?.total_page_count);
          }
        }
      });
    }
  }, [userInfo.value, status, page, selectedFetcher]);

  const assetFilter = characterFilter;
  const items = characters;

  return (
    <>
      <FileWrapper
        onSuccess={reFetchList}
        render={(parentId) => (
          <>
            <TabTitle title="Characters" />
            <div>
              <FilterButtons
                value={selectedFilter}
                onClick={(button) => {
                  reFetchList();
                  setSelectedFilter(Number(button));
                }}
              />
            </div>
            <div {...{ className: "w-full px-4" }}>
              <Button
                {...{
                  className: "file-picker-button py-3",
                  htmlFor: parentId,
                  icon: faCirclePlus,
                  variant: "action",
                }}
              >
                Upload Character
              </Button>
            </div>
            <div className="w-full grow overflow-y-auto rounded px-4 pb-4">
              <ItemElements
                busy={
                  status === FetchStatus.READY ||
                  status === FetchStatus.IN_PROGRESS
                }
                debug="characters tab"
                items={[
                  ...(selectedFilter === AssetFilterOption.FEATURED
                    ? characterItems.value
                    : []),
                  ...items.value,
                ]}
                assetFilter={assetFilter.value}
              />
            </div>
            {pageCount ? (
              <Pagination
                {...{
                  className: "-mt-4 mb-3.5 px-4",
                  currentPage: page,
                  onPageChange: pageChange,
                  totalPages: pageCount,
                }}
              />
            ) : null}
          </>
        )}
        type={AssetType.CHARACTER}
      />
    </>
  );
};
