import { useEffect, useState } from "react";
import { useSession } from "hooks";

interface Props {
  addQueries?: any;
  fetcher: any;
  list: any;
  listSet: any;
  pagePreset?: number;
  requestList?: boolean;
  isInfiniteScroll?: boolean;
}

export default function useListContent({
  addQueries,
  fetcher,
  list,
  listSet,
  pagePreset = 0,
  requestList = false,
  isInfiniteScroll = false,
}: Props) {
  const { user } = useSession();
  const [filter, filterSet] = useState("all");
  const [page, pageSet] = useState(pagePreset);
  const [pageCount, pageCountSet] = useState(0);
  const [sort, sortSet] = useState("newest");
  const [status, statusSet] = useState(requestList ? 1 : 0);

  const pageChange = (page: number) => {
    pageSet(page);
    if (!isInfiniteScroll || page === 1) {
      listSet([]); // Reset list if not in infinite scroll mode or starting from first page
    }
    statusSet(1);
  };

  const onChange = ({ target }: { target: { name: string; value: any } }) => {
    const todo: { [key: string]: (x: any) => void } = { filterSet, sortSet };
    todo[target.name + "Set"](target.value);
    pageSet(1); // Reset to first page on filter/sort change
    listSet([]); // Reset list on filter/sort change
    statusSet(1);
  };

  useEffect(() => {
    if (user && user.username) {
      if (status === 1) {
        statusSet(2);
        fetcher(
          user.username,
          {},
          {
            page_index: page,
            ...addQueries, // eventually we should provide a way to type this ... or not. It works
            ...(filter !== "all" ? { filter_media_type: filter } : {}),
            ...(sort !== "newest" ? { sort_ascending: true } : {}),
          }
        ).then((res: any) => {
          statusSet(3);
          console.log("🧶", res);
          if (res.results && res.pagination) {
            pageCountSet(res.pagination.total_page_count);
            if (isInfiniteScroll && page !== 1) {
              listSet((prevList: any) => [...prevList, ...res.results]); // Append to list for infinite scroll
            } else {
              listSet(res.results); // Replace list for regular pagination
            }
          }
        });
      }
    }
  }, [
    addQueries,
    fetcher,
    filter,
    listSet,
    page,
    user,
    sort,
    status,
    isInfiniteScroll,
  ]);

  return {
    filter,
    filterSet,
    list,
    onChange,
    page,
    pageChange,
    pageSet,
    pageCount,
    pageCountSet,
    sort,
    sortSet,
    status,
    statusSet,
  };
}
