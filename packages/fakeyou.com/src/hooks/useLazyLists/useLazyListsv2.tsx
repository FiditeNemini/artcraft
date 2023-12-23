import { useEffect, useState } from "react";

interface Props {
  addQueries?: any;
  fetcher: any;
  list: any;
  listSet: any;
  requestList?: boolean;
}

export default function useLazyListsv2({
  addQueries,
  fetcher,
  list = [],
  listSet,
  requestList = false,
}: Props) {
  const [filter, filterSet] = useState("all");
  const [next, nextSet] = useState("");
  const [sort, sortSet] = useState("newest");
  const [isLoading, setLoading] = useState(requestList);
  const [isEnd, setEnd] = useState(false);

  useEffect(() => {
    if (isLoading) {
      fetcher(
        "",
        {},
        {
          ...(next ? { cursor: next } : {}),
          ...addQueries,
          ...(filter !== "all" ? { filter_media_type: filter } : {}),
          ...(sort !== "newest" ? { sort_ascending: true } : {}),
        }
      ).then((res: any) => {
        if (res.results && res.pagination) {
          listSet((prev: any) => [...prev, ...res.results]);
          const hasMoreItems = res.pagination.maybe_next;
          nextSet(hasMoreItems || "");
          setEnd(!hasMoreItems);
        } else {
          setEnd(true);
        }
        setLoading(false);
      });
    }
  }, [isLoading, fetcher, next, filter, sort, addQueries, listSet]);

  const getMore = () => {
    if (next && !isLoading && !isEnd) {
      setLoading(true);
    }
  };

  const onChange = (event: { target: { name: string; value: any } }) => {
    const { name, value } = event.target;
    if (name === "filter") {
      filterSet(value);
    } else if (name === "sort") {
      sortSet(value);
    }
    listSet([]);
    nextSet("");
    setLoading(true);
    setEnd(false);
  };

  return {
    filter,
    getMore,
    list,
    onChange,
    isLoading,
    isEnd,
  };
}
