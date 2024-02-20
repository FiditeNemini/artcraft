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
  const gridContainerRef = useRef<HTMLDivElement | null>(null);
  const bookmarks = useBookmarks();
  const ratings = useRatings();
  const [list, listSet] = useState<WeightI[]>([]);
  const [pageCount, setPageCount] = useState(0);
  
  const weights = useLazyLists({
    addQueries: {
      page_size: 9,
      ...prepFilter(weightType, "weight_type"),
    },
    fetcher: ListWeights,
    onSuccess: (res)=>{
      setPageCount((curr)=>{
        if (curr==0) return res.pagination.maybe_next ? 2 : 0
        else return curr+res.pagination.maybe_next ? 1 : 0
      })
    },
    list,
    listSet,
    requestList: true,
    urlUpdate: false,
  });


  const handlePageClick = (selectedItem: { selected: number }) => {
    console.log("PAGECLICK")
    weights.getMore();
  };

  const paginationProps = {
    onPageChange: handlePageClick,
    pageCount: pageCount,
    currentPage: 0,
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
          onLayoutComplete={() => console.log("Layout complete!")}
        >
          {weights.list.map((data: any, key: number) => {
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