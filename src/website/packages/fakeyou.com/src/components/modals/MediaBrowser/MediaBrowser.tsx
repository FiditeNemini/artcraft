import React, { useState } from "react";
import { MediaList } from "components/entities";
import {
  AcceptTypes,
  EntityInputMode,
  EntityFilterOptions,
} from "components/entities/EntityTypes";
import {
  Checkbox,
  ModalUtilities,
  Pagination,
  TempSelect as Select,
} from "components/common";
import AudioPlayerProvider from "components/common/AudioPlayer/AudioPlayerContext";
import SkeletonCard from "components/common/Card/SkeletonCard";
import { GetBookmarksByUser } from "@storyteller/components/src/api/bookmarks/GetBookmarksByUser";
import { GetMediaByUser } from "@storyteller/components/src/api/media_files/GetMediaByUser";
import { GetWeightsByUser } from "@storyteller/components/src/api/weights/GetWeightsByUser";
import { SearchWeight } from "@storyteller/components/src/api/weights/Search";
import { MediaFile } from "@storyteller/components/src/api/media_files/GetMedia";
import { Weight } from "@storyteller/components/src/api/weights/GetWeight";
import {
  useDebounce,
  useListContent,
  // useRatings
} from "hooks";
import {
  faArrowDownWideShort,
  faFilter,
} from "@fortawesome/pro-solid-svg-icons";
import prepFilter from "resources/prepFilter";
import ModalHeader from "../ModalHeader";
import "./MediaBrowser.scss";

const n = () => {};

export interface MediaBrowserProps {
  accept?: AcceptTypes[];
  inputMode: EntityInputMode;
  onSearchChange?: (e: any) => void;
  onSelect?: any;
  owner?: string;
  search?: string;
  username: string;
  emptyContent?: React.ReactNode;
  showFilters?: boolean;
  showPagination?: boolean;
  searchFilter?: string;
}

interface MediaBrowserInternal extends ModalUtilities, MediaBrowserProps {}

export default function MediaBrowser({
  accept,
  handleClose = n,
  inputMode,
  onSearchChange = n,
  onSelect,
  owner,
  search,
  username,
  emptyContent,
  showFilters = true,
  showPagination = true,
  searchFilter,
}: MediaBrowserInternal) {
  // const ratings = useRatings();
  const [showMasonryGrid, setShowMasonryGrid] = useState(true);
  const [filterType, filterTypeSet] = useState(accept ? accept[0] : "all");
  const [list, listSet] = useState<MediaFile | Weight[]>([]);
  const [localSearch, localSearchSet] = useState(search);
  const [searchUpdated, searchUpdatedSet] = useState(false);
  const [showUserUploads, showUserUploadsSet] = useState(true);

  const fetcher = [
    GetBookmarksByUser,
    GetMediaByUser,
    GetWeightsByUser,
    SearchWeight,
  ][inputMode];

  const entities = useListContent({
    // debug: "media browser",
    addQueries: {
      include_user_uploads: showUserUploads,
      ...(localSearch ? {} : { page_size: 24 }),
      ...prepFilter(
        filterType,
        [
          "maybe_scoped_weight_type",
          "filter_media_type",
          "maybe_scoped_weight_type",
          "weight_category",
        ][inputMode]
      ),
    },
    addSetters: { filterTypeSet },
    fetcher,
    list,
    listSet,
    onInputChange: () => setShowMasonryGrid(false),
    onSuccess: res => {
      // bookmarks.gather({ res, key: "token" });
      // ratings.gather({ res, key: "token" });
      setShowMasonryGrid(true);
    },
    ...(localSearch
      ? {
          request: {
            search_term: localSearch,
            weight_category: searchFilter ? searchFilter : "text_to_speech",
          },
        }
      : {}),
    requestList: true,
    ...(localSearch ? { resultsKey: "weights" } : {}),
    urlParam: owner || username || "",
    urlUpdate: false,
  });

  useDebounce({
    blocked: !searchUpdated,
    onTimeout: () => {
      searchUpdatedSet(false);
      entities.reFetch();
    },
  });

  const localSearchChange = ({ target }: { target: any }) => {
    searchUpdatedSet(true);
    // entities.reFetch();
    onSearchChange({ target });
    localSearchSet(target.value);
  };

  const handlePageClick = (selectedItem: { selected: number }) => {
    entities.pageChange(selectedItem.selected);
  };

  const paginationProps = {
    onPageChange: handlePageClick,
    pageCount: entities.pageCount,
    currentPage: entities.page,
  };

  const sortOptions = [
    { value: false, label: "Newest" },
    { value: true, label: "Oldest" },
    // { value: "mostliked", label: "Most Liked" },
  ];

  const onwerTxt = (entityName: string) =>
    `${owner ? owner + "'s " : ""}${entityName}`;

  const title = [
    onwerTxt("Bookmarks"),
    onwerTxt("Media"),
    onwerTxt("Weights"),
    "Search",
  ][inputMode];

  const onClick = (data: any) => {
    onSelect(data);
    handleClose();
  };

  const filterOptions = accept
    ? accept.map((value: string) => ({
        value,
        label: value,
      }))
    : EntityFilterOptions(inputMode);

  return (
    <>
      <ModalHeader
        {...{
          onSearchChange: localSearchChange,
          handleClose,
          search: localSearch,
          title,
        }}
      >
        {showFilters || showPagination ? (
          <>
            {showFilters && (
              <>
                <Checkbox
                  {...{
                    className: "mb-0",
                    checked: showUserUploads,
                    label: "Show my uploads",
                    onChange: ({ target }: any) => {
                      entities.reFetch();
                      showUserUploadsSet(target.checked);
                    },
                    variant: "secondary",
                  }}
                />
                <Select
                  {...{
                    icon: faArrowDownWideShort,
                    options: sortOptions,
                    name: "sort",
                    onChange: entities.onChange,
                    value: entities.sort,
                  }}
                />
                {(!accept || (accept && accept.length)) && (
                  <Select
                    {...{
                      icon: faFilter,
                      options: filterOptions,
                      name: "filterType",
                      onChange: entities.onChange,
                      value: filterType,
                    }}
                  />
                )}
              </>
            )}
            {showPagination && <Pagination {...paginationProps} />}
          </>
        ) : null}
      </ModalHeader>
      <AudioPlayerProvider>
        {entities.isLoading ? (
          <div {...{ className: "row gx-3 gy-3" }}>
            {Array.from({ length: 12 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        ) : (
          <>
            {showMasonryGrid && (
              <div {...{ className: "fy-media-browser-list" }}>
                <MediaList
                  {...{
                    entityType: 2,
                    list: entities.list,
                    success: entities.status === 3,
                    onClick,
                    emptyContent: emptyContent,
                  }}
                />
              </div>
            )}
          </>
        )}
      </AudioPlayerProvider>

      <footer
        {...{ className: "fy-media-browser-footer fy-media-browser-tools" }}
      >
        {showPagination && <Pagination {...paginationProps} />}
      </footer>
    </>
  );
}
