import { useEffect, useState } from "react";
import { FetchStatus } from "@storyteller/components/src/api/_common/SharedFetchTypes";

interface Props {
  addQueries?: any;
  addSetters?: any;
  debug?: string,
  fetcher: any;
  list: any;
  listSet: any;
  pagePreset?: number;
  requestList?: boolean;
  urlParam: string;
}

export default function useListContent({ addQueries, addSetters, debug = "", fetcher, list, listSet, pagePreset = 0, requestList = false, urlParam = "" }: Props) {
  const [filter, filterSet] = useState("all");
  const [page, pageSet] = useState(pagePreset);
  const [pageCount, pageCountSet] = useState(0);
  const [sort, sortSet] = useState(false);
  const [status, statusSet] = useState(requestList ? FetchStatus.ready : FetchStatus.paused);
  const isLoading = status === FetchStatus.ready || status === FetchStatus.in_progress;
  const fetchError = status === FetchStatus.error;

  const pageChange = (page: number) => {
    pageSet(page);
    statusSet(FetchStatus.ready);
  };

  const reFetch = () => {
    pageSet(pagePreset); // Reset to first page on filter/sort change
    listSet([]); // Reset list on filter/sort change
    statusSet(FetchStatus.ready);
  }

  const onChange = ({ target }: { target: { name: string; value: any } }) => {
    const todo: { [key: string]: (x: any) => void } = { ...addSetters, filterSet, sortSet };
    todo[target.name + "Set"](target.value);
    reFetch();
  };

  useEffect(() => {
    if (urlParam) {
      if (status === 1) {
        statusSet(FetchStatus.success);
        fetcher(urlParam, {},
          {
            page_index: page,
            ...addQueries, // eventually we should provide a way to type this ... or not. It works
            ...(filter !== "all" ? { filter_media_type: filter } : {}),
            ...(sort ? { sort_ascending: true } : {}),
          }
        ).then((res: any) => {
          if (debug) console.log(`🪲 useListContent success debug at: ${ debug }`, res);
          statusSet(FetchStatus.error);
          if (res.results && res.pagination) {
            pageCountSet(res.pagination.total_page_count);
            listSet(res.results);
          }
        });
      }
    }
  }, [ addQueries, debug, fetcher, filter, listSet, page, sort, status, urlParam ]);

  return {
    fetchError,
    filter,
    filterSet,
    list,
    isLoading,
    onChange,
    page,
    pageChange,
    pageSet,
    pageCount,
    pageCountSet,
    reFetch,
    sort,
    sortSet,
    status,
    statusSet,
  };
}
