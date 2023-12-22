import { useEffect, useState } from "react";

interface Props {
  addQueries?: any;
  fetcher: any;
  list: any;
  listSet: any;
  requestList?: boolean;
}

export default function useLazyLists({ addQueries, fetcher, list, listSet, requestList = false } : Props) {
  const [filter, filterSet] = useState("all");
  const [next,nextSet] = useState("");
  const [previous, previousSet] = useState(""); // I am not used for anything yet :)
  const [sort, sortSet] = useState("newest");
  const [status, statusSet] = useState(requestList ? 1 : 0);
  const listKeys = Object.keys(list);
  const totalKeys = listKeys.length;

  const getMore = () => {
    if (next) statusSet(1);
  };

  const onChange = ({ target }: { target: { name: string; value: any } }) => {
    const todo: { [key: string]: (x: any) => void } = { filterSet, sortSet };
    todo[target.name + "Set"](target.value);
    listSet([]); // Reset list on filter/sort change
    nextSet("");
    previousSet("");
    statusSet(1);
  };

  useEffect(() => {
    if (status === 1) {
      statusSet(2);
      fetcher("",{},
        {
          ...next ? { cursor: next } : {},
          ...addQueries, // eventually we should provide a way to type this ... or not. It works
          ...filter !== "all" ? { filter_media_type: filter } : {},
          ...sort !== "newest" ? { sort_ascending: true } : {},
        }
      ).then((res: any) => {
        statusSet(3);
        console.log("🎆", res);
        if (res.results && res.pagination) {
          listSet((prevObj: any) => {
            let keyExists = listKeys.find((key) => key.split("#")[1] === res.pagination.maybe_next);
            if (!next && !totalKeys) {
              return { [0 + "#initial"]: res.results }; // save as object so we can track what has been loaded
            } else if (!keyExists) {
              return {
                ...prevObj,
                [`${totalKeys}#${ next }`]: res.results
              }
            }
          });
          nextSet(res.pagination.maybe_next || "");
          previousSet(res.pagination.maybe_next);
        }
      });
    }
  }, [ addQueries, fetcher, filter, list, listKeys, listSet, next, sort, status, totalKeys ]);

  return {
    filter,
    filterSet,
    getMore,
    list: Object.values(list).flat(), // format as an array, eventually the input list will live within this hook. Eventually
    listKeys,
    next,
    onChange,
    previous,
    sort,
    sortSet,
    status,
    statusSet,
    totalKeys
  };
}
