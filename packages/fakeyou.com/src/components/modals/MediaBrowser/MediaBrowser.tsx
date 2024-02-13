import React, { useState } from "react";
import { MediaList } from "components/entities";
import {
  EntityType,
  EntityFilterOptions,
  MediaFilterProp,
  WeightFilterProp,
} from "components/entities/EntityTypes";
import { TempSelect } from "components/common";
import AudioPlayerProvider from "components/common/AudioPlayer/AudioPlayerContext";
import SkeletonCard from "components/common/Card/SkeletonCard";
import Pagination from "components/common/Pagination";
import { GetMediaByUser } from "@storyteller/components/src/api/media_files/GetMediaByUser";
import { GetWeightsByUser } from "@storyteller/components/src/api/weights/GetWeightsByUser";
import { SearchWeights } from "@storyteller/components/src/api/weights/SearchWeights";
import { MediaFile } from "@storyteller/components/src/api/media_files/GetMedia";
import { Weight } from "@storyteller/components/src/api/weights/GetWeight";
import { useListContent, useRatings } from "hooks";
import {
  faArrowDownWideShort,
  faFilter,
} from "@fortawesome/pro-solid-svg-icons";
import prepFilter from "resources/prepFilter";
import ModalHeader from "../ModalHeader";
import "./MediaBrowser.scss";

interface Props {
  entityType: EntityType;
  filterType?: MediaFilterProp | WeightFilterProp;
  handleClose: any;
  mediaToken: string;
  onSelect?: any;
  owner?: string;
  search?: string;
  username: string;
}

export default function MediaBrowser({
  entityType,
  filterType: inputFilter,
  mediaToken,
  handleClose = () => {},
  onSelect,
  owner,
  search,
  username,
}: Props) {
  const ratings = useRatings();
  const [showMasonryGrid, setShowMasonryGrid] = useState(true);
  const [filterType, filterTypeSet] = useState(inputFilter || "all");
  const [list, listSet] = useState<MediaFile | Weight[]>([]);
  const fetcher = search
    ? SearchWeights
    : [() => {}, GetMediaByUser, GetWeightsByUser][entityType] ||
      GetMediaByUser;
  const entities = useListContent({
    debug: "media browser",
    addQueries: {
      ...(search ? {} : { page_size: 24 }),
      ...prepFilter(
        filterType,
        ["", "filter_media_type", "maybe_scoped_weight_type"][entityType]
      ),
    },
    addSetters: { filterTypeSet },
    fetcher,
    list,
    listSet,
    onInputChange: () => setShowMasonryGrid(false),
    onSuccess: res => {
      // bookmarks.gather({ res, key: "token" });
      ratings.gather({ res, key: "token" });
      setShowMasonryGrid(true);
    },
    ...(search ? { request: { search_term: search } } : {}),
    requestList: true,
    ...(search ? { resultsKey: "weights" } : {}),
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

  const title = ["", `${owner ? owner + "'s " : ""}Media`, "Weights"][
    entityType
  ];

  const onClick = (data: any) => {
    console.log("🩵", data);
    onSelect(data);
    handleClose();
  };

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
        {(!inputFilter || inputFilter === "all") && (
          <TempSelect
            {...{
              icon: faFilter,
              options: EntityFilterOptions(entityType),
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
                    entityType,
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
