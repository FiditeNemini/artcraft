import { useContext, useState, useEffect } from "react";
import { useSignals } from "@preact/signals-react/runtime";
import {
  characterFilter,
  characterItems,
  objectFilter,
  shapeItems,
} from "~/pages/PageEnigma/store";
import { ItemElements } from "~/pages/PageEnigma/comps/SidePanelTabs/itemTabs/ItemElements";
import { Button, FileWrapper, Pagination } from "~/components";
import { faCirclePlus } from "@fortawesome/pro-solid-svg-icons";
import { twMerge } from "tailwind-merge";
// TODO : add in
import { TabTitle } from "~/pages/PageEnigma/comps/SidePanelTabs/comps/TabTitle";

import {
  GetMediaByUser,
  GetMediaListResponse,
} from "~/api/media_files/GetMediaByUser";
import {
  ListFeaturedMediaFiles,
  ListFeaturedMediaFilesResponse,
} from "~/api/media_files/ListFeaturedMediaFiles";
import {
  AssetFilterOption,
  AssetType,
  MediaItem,
} from "~/pages/PageEnigma/models";
import { BucketConfig } from "~/api/BucketConfig";
import { AuthenticationContext } from "~/contexts/Authentication";
// import { UploadModal } from "~/components/UploadModal";

import { selectedTab } from "~/pages/PageEnigma/store/sidePanel";

interface Props {
  type: AssetType;
}

export enum FetchStatus {
  paused,
  // ready triggers a new fetch
  ready,
  in_progress,
  success,
  error,
}

export enum Filters {
  Featured,
  Mine,
  Bookmarked,
}

export const ObjectsTab = ({ type }: Props) => {
  useSignals();
  const currentTab = selectedTab?.value?.value || "";
  const [cachedTab, cachedTabSet] = useState(currentTab);
  const [objects, objectsSet] = useState<{ value: MediaItem[] }>({
    value: [
      {
        media_id: "",
        name: "",
        type: AssetType.OBJECT,
        version: 1,
      },
    ],
  });
  const [page, pageSet] = useState(0);
  const [pageCount, pageCountSet] = useState(0);
  const [selectedFilter, selectedFilterSet] = useState(Filters.Featured);

  const { authState } = useContext(AuthenticationContext);

  const [status, statusSet] = useState(FetchStatus.ready);

  const pageChange = (page: number) => {
    pageSet(page);
    statusSet(FetchStatus.ready);
  };

  const reFetchList = () => {
    statusSet(FetchStatus.ready);
  };

  const selectedFetcher = [ListFeaturedMediaFiles, GetMediaByUser][
    selectedFilter
  ];

  useEffect(() => {
    // we need to cache the current tab because we don't unmount components
    if (cachedTab !== currentTab) {
      pageSet(0);
      cachedTabSet(currentTab);
      statusSet(FetchStatus.ready);
    }
    if (status === FetchStatus.ready) {
      statusSet(FetchStatus.in_progress);
      selectedFetcher(
        authState?.userInfo?.username || "",
        {},
        {
          filter_engine_categories:
            type === AssetType.CHARACTER ? "character" : "object",
          page_index: page,
          // page_size: 5,
        },
      ).then((res: GetMediaListResponse | ListFeaturedMediaFilesResponse) => {
        if (res.success && res.results) {
          statusSet(FetchStatus.success);
          objectsSet({
            value: res.results.map((item) => {
              const bucketConfig = new BucketConfig();
              const itemThumb = bucketConfig.getCdnUrl(
                item.cover_image.maybe_cover_image_public_bucket_path,
                600,
                100,
              );
              return {
                colorIndex: item.cover_image.default_cover.color_index,
                imageIndex: item.cover_image.default_cover.image_index,
                media_id: item.token,
                name: item.maybe_title,
                type: AssetType.OBJECT,
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
            pageCountSet(res.pagination.total_page_count);
          }
        }
      });
    }
  }, [authState, cachedTab, currentTab, status, type]);

  const assetFilter =
    type === AssetType.CHARACTER ? characterFilter : objectFilter;
  const items = objects;

  return (
    <>
      <FileWrapper
        {...{
          onSuccess: reFetchList,
          render: ({ parentId }: { parentId: string }) => (
            <>
              <TabTitle
                title={`${type === AssetType.CHARACTER ? "Characters" : "Objects"}`}
              />
              <div>
                <div className="flex gap-2 overflow-x-auto overflow-y-hidden px-4">
                  {Object.keys(Filters)
                    .filter((filterKey) => isNaN(Number(filterKey)))
                    .map((filterKey, key) => {
                      const isBookmarks = key === Filters.Bookmarked;
                      return (
                        <button
                          key={key}
                          {...{
                            className: `filter-tab${selectedFilter === key ? " active" : ""}`,
                            ...(isBookmarks ? { disabled: true } : {}),
                            onClick: () => {
                              reFetchList();
                              selectedFilterSet(key);
                            },
                          }}>
                          {filterKey}
                        </button>
                      );
                    })}
                </div>
              </div>
              <div {...{ className: "w-full px-4" }}>
                <Button
                  {...{
                    className: "file-picker-button py-3",
                    htmlFor: parentId,
                    icon: faCirclePlus,
                    variant: "action",
                  }}>
                  Upload {type === AssetType.CHARACTER ? "Character" : "Object"}
                </Button>
              </div>
              <div className="w-full grow overflow-y-auto rounded px-4 pb-4">
                <ItemElements
                  {...{
                    busy:
                      status === FetchStatus.ready ||
                      status === FetchStatus.in_progress ||
                      cachedTab !== currentTab,
                    ...(type !== AssetType.CHARACTER
                      ? { debug: "objects tab" }
                      : {}),
                  }}
                  debug="objects tab"
                  items={[
                    ...(selectedFilter === Filters.Featured
                      ? type !== AssetType.CHARACTER
                        ? shapeItems.value
                        : characterItems.value
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
          ),
          type,
        }}
      />
    </>
  );
};
