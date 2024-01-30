import React, { useState } from "react";
import { MediaList } from "components/entities";
import { MediaFilterOptions, MediaFilterProp } from "components/entities/EntityTypes";
import { TempSelect } from "components/common";
import AudioPlayerProvider from "components/common/AudioPlayer/AudioPlayerContext";
import SkeletonCard from "components/common/Card/SkeletonCard";
import Pagination from "components/common/Pagination";
import { GetMediaByUser } from "@storyteller/components/src/api/media_files/GetMediaByUser";
import { MediaFile } from "@storyteller/components/src/api/media_files/GetMedia";
import { useListContent, useRatings } from "hooks";
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import { faArrowDownWideShort, faFilter, faXmark } from "@fortawesome/pro-solid-svg-icons";
import prepFilter from "resources/prepFilter";
import "./MediaBrowser.scss";

interface Props {
  handleClose: any,
  mediaToken: string,
  onSelect?: any,
  type?: MediaFilterProp,
  username: string,
}

export default function MediaBrowser({ mediaToken, handleClose = () => {}, onSelect, type, username }: Props) {
  const ratings = useRatings();
  const [showMasonryGrid, setShowMasonryGrid] = useState(true);
  const [mediaType, mediaTypeSet] = useState(type || "all");
  const [list, listSet] = useState<MediaFile[]>([]);
  const media = useListContent({
    addQueries: {
      page_size: 24,
      ...prepFilter(mediaType, "filter_media_type"),
    },
    addSetters: { mediaTypeSet },
    // debug: "profile media",
    fetcher: GetMediaByUser,
    list,
    listSet,
    onInputChange: () => setShowMasonryGrid(false),
    onSuccess: (res) => {
      // bookmarks.gather({ res, key: "token" });
      ratings.gather({ res, key: "token" });
      setShowMasonryGrid(true);
    },
    requestList: true,
    urlParam: username,
    urlUpdate: false
  });

  const handlePageClick = (selectedItem: { selected: number }) => {
    media.pageChange(selectedItem.selected);
  };

  const paginationProps = {
    onPageChange: handlePageClick,
    pageCount: media.pageCount,
    currentPage: media.page,
  };

  const sortOptions = [
    { value: false, label: "Newest" },
    { value: true, label: "Oldest" },
    // { value: "mostliked", label: "Most Liked" },
  ];

  const onClick = (data: any) => {
    onSelect(data);
    handleClose();
  };

  return <>
    <header {...{ className: "fy-media-browser-header" }}>
      <div {...{ className: "fy-media-browser-tools" }}>
        <h3>Media</h3>
        <Icon {...{ className: "icon-close-button", icon: faXmark, onClick: () => handleClose() }}/>
      </div>
      <div {...{ className: "fy-media-browser-tools" }}>
        <TempSelect
          {...{
            icon: faArrowDownWideShort,
            options: sortOptions,
            name: "sort",
            onChange: media.onChange,
            value: media.sort,
          }}
        />
        { (!type || type === "all") && <TempSelect {...{
              icon: faFilter,
              options: MediaFilterOptions(),
              name: "mediaType",
              onChange: media.onChange,
              value: mediaType,
            }}/> }
        <Pagination {...paginationProps} />
      </div>
    </header>
    <AudioPlayerProvider>
      { media.isLoading ? (
        <div {...{ className: "row gx-3 gy-3" }}>
          {Array.from({ length: 12 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      ) : (
        <>
          { showMasonryGrid && (
            <div {...{ className: "fy-media-browser-list" }}>
              <MediaList {...{ list: media.list, success: media.status === 3, onClick }}/>
            </div>
          ) }
        </>
      )}
    </AudioPlayerProvider>

    <footer {...{ className: "fy-media-browser-footer fy-media-browser-tools" }}>
      <Pagination {...paginationProps} />
    </footer>
  </>;
};