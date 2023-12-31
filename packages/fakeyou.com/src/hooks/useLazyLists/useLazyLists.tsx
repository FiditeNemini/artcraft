import { useEffect, useState } from "react";
import { FetchStatus } from "@storyteller/components/src/api/_common/SharedFetchTypes";

interface Props {
  addQueries?: any;
  debug?: string,
  fetcher: any;
  filterKey?: string;
  list: any;
  listSet: any;
  onInputChange?: (x?: any) => any;
  onSuccess?: (x?: any) => any;
  requestList?: boolean;
}

const n = () => {};

export default function useLazyLists({ addQueries, debug = "", fetcher, filterKey = "filter_media_type", list = [], listSet, onInputChange = n, onSuccess = n, requestList = false }: Props) {
  const [filter, filterSet] = useState("all");
  const [next, nextSet] = useState("");
  const [previous, previousSet] = useState(""); // I am not used for anything yet :)
  const [sort, sortSet] = useState(false);
  const [status, statusSet] = useState(requestList ? FetchStatus.ready : FetchStatus.paused);
  const listKeys = Object.keys(list);
  const totalKeys = listKeys.length;
  const isLoading = status === FetchStatus.ready || status === FetchStatus.in_progress;
  const fetchError = status === FetchStatus.error;

  const getMore = () => {
    if (next) statusSet(1);
  };

  const onChange = ({ target }: { target: { name: string; value: any } }) => {
    const todo: { [key: string]: (x: any) => void } = { filterSet, sortSet };
    todo[target.name + "Set"](target.value);
    onInputChange({ target });
    listSet([]); // Reset list on filter/sort change
    nextSet("");
    previousSet("");
    statusSet(FetchStatus.ready);
  };

  useEffect(() => {
    if (status === FetchStatus.ready) {
      statusSet(FetchStatus.in_progress);
      fetcher(
        "",
        {},
        {
          ...(next ? { cursor: next } : {}),
          ...addQueries, // eventually we should provide a way to type this ... or not. It works
          ...(filter !== "all" ? { [filterKey]: filter } : {}),
          ...(sort ? { sort_ascending: true } : {}),
        }
      ).then((res: any) => {
        if (debug) console.log(`🐞 useLazyLists success debug at: ${ debug }`, res);
        statusSet(FetchStatus.success);
        onSuccess(res);
        if (res.results && res.pagination) {
          listSet((prevObj: any) => {
            let keyExists = listKeys.find(key => key.split("#")[1] === res.pagination.maybe_next);
            if (!next && !totalKeys) {
              return { [0 + "#initial"]: res.results }; // save as object so we can track what has been loaded
            } else if (!keyExists) {
              return {
                ...prevObj,
                [`${totalKeys}#${next}`]: res.results,
              };
            } else {
              // Key exists, just update the existing data
              const updatedObj = { ...prevObj };
              updatedObj[keyExists] = res.results;
              return updatedObj;
            }
          });
          nextSet(res.pagination.maybe_next || "");
          previousSet(res.pagination.maybe_next);
        }
      });
    }
  }, [ addQueries, debug, fetcher, filter, filterKey, listKeys, listSet, next, onSuccess, sort, status, totalKeys ]);

  return {
    fetchError,
    filter,
    filterSet,
    getMore,
    isLoading,
    list: Object.values(list).flat(), // format as an array, eventually the input list will live within this hook. Eventually
    listKeys,
    next,
    onChange,
    previous,
    sort,
    sortSet,
    status,
    statusSet,
    totalKeys,
  };
}
