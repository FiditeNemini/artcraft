import React, { useState } from "react";
import { MediaList } from "components/entities";
import { AcceptTypes, EntityInputMode, EntityFilterOptions, } from "components/entities/EntityTypes";
import { Pagination, TempSelect } from "components/common";
import AudioPlayerProvider from "components/common/AudioPlayer/AudioPlayerContext";
import SkeletonCard from "components/common/Card/SkeletonCard";
import { GetBookmarksByUser } from "@storyteller/components/src/api/bookmarks/GetBookmarksByUser";
import { GetMediaByUser } from "@storyteller/components/src/api/media_files/GetMediaByUser";
import { GetWeightsByUser } from "@storyteller/components/src/api/weights/GetWeightsByUser";
import { SearchWeights } from "@storyteller/components/src/api/weights/SearchWeights";
import { MediaFile } from "@storyteller/components/src/api/media_files/GetMedia";
import { Weight } from "@storyteller/components/src/api/weights/GetWeight";
import { useListContent, 
  // useRatings
} from "hooks";
import { faArrowDownWideShort, faFilter } from "@fortawesome/pro-solid-svg-icons";
import prepFilter from "resources/prepFilter";
import ModalHeader from "../ModalHeader";
import "./MediaBrowser.scss";

interface Props {
  accept?: AcceptTypes[],
  handleClose: any;
  inputMode: EntityInputMode;
  mediaToken: string;
  onSelect?: any;
  owner?: string;
  search?: string;
  username: string;
}

export default function MediaBrowser({
  accept,
  mediaToken,
  handleClose = () => {},
  inputMode,
  onSelect,
  owner,
  search,
  username
}: Props) {
  // const ratings = useRatings();
  const [showMasonryGrid, setShowMasonryGrid] = useState(true);
  const [filterType, filterTypeSet] = useState(accept ? accept[0] : "all");
  const [list, listSet] = useState<MediaFile | Weight[]>([]);
  const fetcher = [GetBookmarksByUser,GetMediaByUser,GetWeightsByUser,SearchWeights][inputMode];

  const entities = useListContent({
    debug: "media browser",
    addQueries: {
      ...(search ? {} : { page_size: 24 }),
      ...prepFilter(
        filterType,
        ["maybe_scoped_weight_type", "filter_media_type", "maybe_scoped_weight_type",""][inputMode]
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
    ...(search ? { request: { search_term: search } } : {}),
    requestList: true,
    // ...(search ? { resultsKey: "weights" } : {}),
    urlParam: owner || username,
    urlUpdate: false,
  });

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

  const onwerTxt = (entityName: string) => `${ owner ? owner + "'s " : "" }${ entityName }`;

  const title = [
    onwerTxt("Bookmarks"),
    onwerTxt("Media"),
    onwerTxt("Weights"),
    "Search"
  ][inputMode];

  const onClick = (data: any) => {
    onSelect(data);
    handleClose();
  };

  const filterOptions = accept ? accept.map((value: string) => ({
      value,
      label: value
    })) : EntityFilterOptions(inputMode);

  return (
    <>
      <ModalHeader {...{ handleClose, title }}>
        <TempSelect
          {...{
            icon: faArrowDownWideShort,
            options: sortOptions,
            name: "sort",
            onChange: entities.onChange,
            value: entities.sort,
          }}
        />
        {(!accept || (accept && accept.length) ) && (
          <TempSelect
            {...{
              icon: faFilter,
              options: filterOptions,
              name: "filterType",
              onChange: entities.onChange,
              value: filterType,
            }}
          />
        )}
        <Pagination {...paginationProps} />
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
                    entityType: 1,
                    list: entities.list,
                    success: entities.status === 3,
                    onClick,
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
        <Pagination {...paginationProps} />
      </footer>
    </>
  );
}
