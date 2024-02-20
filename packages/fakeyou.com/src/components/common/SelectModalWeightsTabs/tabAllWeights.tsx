import React, {useRef, useState} from 'react';
import {
  useBookmarks,
  useLazyLists,
  useRatings,
  // useSession
} from "hooks";
import {
  Weight as WeightI,
  ListWeights
} from "@storyteller/components/src/api";
import { SelectModalData } from "../SelectModal";
import prepFilter from "resources/prepFilter";
import { 
  MasonryGrid,
  WeightsCards,
  Pagination,
  SkeletonCard,
} from "components/common";

export default function WeightsTabsContent({
  debug=false,
  weightType,
  onSelect
}:{
  debug?: boolean
  weightType: "sd_1.5" | "loRA";
  onSelect: (data:SelectModalData) => void;
}){
  const pageSize = 9;
  const gridContainerRef = useRef<HTMLDivElement | null>(null);
  const bookmarks = useBookmarks();
  const ratings = useRatings();
  const [list, listSet] = useState<WeightI[]>([]);
  const [pages, setPages] = useState<{
    currPageWeights: any[],
    currPageIndex: number,
    lookup: string[],
    hasNext: 0|1
  }>({
    currPageWeights: [],
    currPageIndex: 0,
    lookup: [],
    hasNext: 0
  });
  
  const weights = useLazyLists({
    addQueries: {
      page_size: pageSize,
      ...prepFilter(weightType, "weight_type"),
    },
    fetcher: ListWeights,
    onSuccess: (res)=>{
      if (res.results.length>0
         && res.pagination.maybe_next !== pages.lookup[pages.lookup.length -1]){
        setPages((curr)=>({
          currPageWeights: [...res.results],
          currPageIndex: curr.lookup.length,
          hasNext: 1,
          lookup: [...curr.lookup, res.pagination.maybe_next]
        }));
      }else if (res.results.length === 0) {
        setPages((curr)=>({
          ...curr,
          hasNext: 0,
        }));
      }
    },
    list,
    listSet,
    requestList: true,
    urlUpdate: false,
  });

  const handlePageClick = (selectedItem: { selected: number }) => {
    if(selectedItem.selected * 9 + 9 > weights.list.length)
      weights.getMore();
    else{
      //TODO:
      console.log('dealing with slicing list here');
    }
  };

  const paginationProps = {
    onPageChange: handlePageClick,
    pageCount: pages.lookup.length+pages.hasNext,
    currentPage: pages.currPageIndex,
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
        <div className="d-flex justify-content-end mb-4">
          <Pagination {...paginationProps} />
        </div>
        <MasonryGrid
          gridRef={gridContainerRef}
          // onLayoutComplete={() => console.log("Layout complete!")}
        >
          {pages.currPageWeights.map((data: any, key: number) => {
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