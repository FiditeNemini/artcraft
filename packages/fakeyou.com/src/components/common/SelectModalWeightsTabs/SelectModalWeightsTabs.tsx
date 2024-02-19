import React, { memo, useRef, useState } from "react";

import {
  useBookmarks,
  useListContent,
  useRatings,
  useSession
} from "hooks";

import {
  Weight as WeightType,
  ListWeights,
  GetBookmarksByUser
} from "@storyteller/components/src/api";

import { 
  MasonryGrid,
  WeightsCards,
  Pagination,
  SkeletonCard,
  NonRouteTabs
} from "components/common";

import { SelectModalData, SelectModalV2} from "../SelectModal";

import prepFilter from "resources/prepFilter";

export default memo(function SelectModalWrapper({
  debug = false,
  value = {title:"",token:""},
  modalTitle,
  inputLabel,
  onSelect
}: {
  debug?: boolean;
  value?: SelectModalData;
  modalTitle: string;
  inputLabel: string;
  onSelect: (data:SelectModalData) => void;
}) {
  const tabs = [{
    label: "All Weights",
    content: (
      <div className="searcher-container in-modal" id="allWeights">
        <WeightsTabsContent debug={debug} onSelect={onSelect}/>
      </div>
    )
  },
  // {
  //   label: "Bookmarked",
  //   content: (
  //     <div className="searcher-container in-modal" id="allWeights">
  //       <WeightsTabsContent debug={debug} onSelect={onSelect}/>
  //     </div>
  //   )
  // }
  ]
  return (
    <SelectModalV2
      modalTitle={modalTitle}
      label={inputLabel}
      value={value.title || value.token}
      onClear={()=>{onSelect({title:"",token:""})}}
    >
      <NonRouteTabs tabs={tabs} />
    </SelectModalV2>
  );
});

function WeightsTabsContent({
  debug=false,
  onSelect
}:{
  debug?: boolean
  onSelect: (data:SelectModalData) => void;
}){
  const gridContainerRef = useRef<HTMLDivElement | null>(null);
  const bookmarks = useBookmarks();
  const ratings = useRatings();
  const [list, listSet] = useState<WeightType[]>([]);
  const { user } = useSession();
  const weights = useListContent({
    addQueries: {
      page_size: 9,
      ...prepFilter("sd_1.5", "weight_type"),
    },
    urlUpdate: false,
    debug: debug ? "Weight List" : undefined,
    fetcher: ListWeights,
    list,
    listSet,
    requestList: true,
    urlParam: user?.username || ""
  });
  const handlePageClick = (selectedItem: { selected: number }) => {
    weights.pageChange(selectedItem.selected);
  };

  // const { isLoading, page, pageChange, pageCount, status } = useListContent({
  //   addQueries: {
  //     page_size: 9,
  //     ...prepFilter("sd_1.5", "maybe_scoped_weight_type"),
  //   },
  //   fetcher: GetBookmarksByUser,
  //   // onSuccess: res => {
  //   //   setShowBookmarksMasonryGrid(true);
  //   // },
  //   list: list,
  //   debug: "",
  //   listSet: listSet,
  //   requestList: true,
  //   urlParam: user.username,
  //   urlUpdate: false,
  // });

  const paginationProps = {
    onPageChange: handlePageClick,
    pageCount: weights.pageCount,
    currentPage: weights.page,
  };
  if (weights.isLoading){
    return (
      <div className="row gx-3 gy-3">
        {Array.from({ length: 12 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    );
  }else if (weights.list.length === 0 && weights.status === 3){
    return(
      <div className="text-center m-4 opacity-75">
        No weights created yet.
      </div>
    );
  }else {
    return(
      <>
        <Pagination {...paginationProps} />
        <MasonryGrid
          gridRef={gridContainerRef}
          onLayoutComplete={() => console.log("Layout complete!")}
        >
          {weights.list.map((data: WeightType, key: number) => {
            let props = {
              data,
              ratings,
              bookmarks,
              showCreator: true,
              type: "weights",
              inSelectModal: true,
              onResultSelect: onSelect,
            };
            return (
              <div
                {...{
                  className: "col-12 col-sm-6 col-xl-4 grid-item",
                  key,
                }}
              >
                <WeightsCards {...{ type: data.weight_category, props }} />
              </div>
            );
          })}
        </MasonryGrid>
        <div className="d-flex justify-content-end mt-4">
          <Pagination {...paginationProps} />
        </div> 
      </>
    );
  }
}