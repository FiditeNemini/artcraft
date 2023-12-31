import { useEffect, useState } from "react";
import { FetchStatus } from "@storyteller/components/src/api/_common/SharedFetchTypes";
import { useHistory, useLocation } from "react-router-dom";

interface Props {
  addQueries?: any;
  addSetters?: any;
  debug?: string;
  fetcher: any;
  list: any;
  listSet: any;
  onInputChange?: (x?: any) => any;
  onSuccess?: (x?: any) => any;
  pagePreset?: number;
  requestList?: boolean;
  urlParam: string;
}

const n = () => {};

export default function useListContent({
  addQueries,
  addSetters,
  debug = "",
  fetcher,
  list,
  listSet,
  onInputChange = n,
  onSuccess = n,
  pagePreset = 0,
  requestList = false,
  urlParam = "",
}: Props) {
  const { pathname, search } = useLocation();
  const urlQueries = new URLSearchParams(search);
  const [page, pageSet] = useState(parseInt(urlQueries.get("page_index") || "") || pagePreset);
  const [pageCount, pageCountSet] = useState(0);
  const [sort, sortSet] = useState(urlQueries.get("sort_ascending") === "true");
  const [status, statusSet] = useState(
    requestList ? FetchStatus.ready : FetchStatus.paused
  );
  const isLoading =
    status === FetchStatus.ready || status === FetchStatus.in_progress;
  const fetchError = status === FetchStatus.error;
  const history = useHistory();

  const pageChange = (page: number) => {
    pageSet(page);
    statusSet(FetchStatus.ready);
  };

  const reFetch = () => {
    pageSet(pagePreset); // Reset to first page on filter/sort change
    listSet([]); // Reset list on filter/sort change
    statusSet(FetchStatus.ready);
  };

  const onChange = ({ target }: { target: { name: string; value: any } }) => {
    const todo: { [key: string]: (x: any) => void } = {
      ...addSetters,
      sortSet,
    };
    todo[target.name + "Set"](target.value);
    onInputChange({ target });
    reFetch();
  };

  useEffect(() => {
    const queries = {
      page_index: page,
      ...addQueries, // eventually we should provide a way to type this ... or not. It works
      ...(sort ? { sort_ascending: true } : {}),
    };

    if (urlParam) {
      if (status === FetchStatus.ready) {
        let search = new URLSearchParams(queries).toString();
        statusSet(FetchStatus.in_progress);
        history.replace({ pathname, search });
        fetcher(urlParam,{},queries).then((res: any) => {
          if (debug)
            console.log(`🪲 useListContent success debug at: ${debug}`, res);
          statusSet(FetchStatus.success);
          onSuccess(res);
          if (res.results && res.pagination) {
            pageCountSet(res.pagination.total_page_count);
            listSet(res.results);
          }
        });
      }
    }
  }, [
    addQueries,
    debug,
    fetcher,
    history,
    listSet,
    onSuccess,
    pathname,
    page,
    sort,
    status,
    urlParam,
  ]);

  return {
    fetchError,
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
