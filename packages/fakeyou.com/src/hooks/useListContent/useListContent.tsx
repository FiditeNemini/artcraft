import { useEffect, useState } from "react";
import { useSession } from "hooks";

interface Props {
  addQueries?: any;
  debug?: string,
  fetcher: any;
  list: any;
  listSet: any;
  pagePreset?: number;
  requestList?: boolean;
}

export default function useListContent({ addQueries, debug = "", fetcher, list, listSet, pagePreset = 0, requestList = false }: Props) {
  const { user } = useSession();
  const [filter, filterSet] = useState("all");
  const [page, pageSet] = useState(pagePreset);
  const [pageCount, pageCountSet] = useState(0);
  const [sort, sortSet] = useState("newest");
  const [status, statusSet] = useState(requestList ? 1 : 0);

  const pageChange = (page: number) => {
    pageSet(pagePreset);
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
        fetcher(user.username, {},
          {
            page_index: page,
            ...addQueries, // eventually we should provide a way to type this ... or not. It works
            ...(filter !== "all" ? { filter_media_type: filter } : {}),
            ...(sort !== "newest" ? { sort_ascending: true } : {}),
          }
        ).then((res: any) => {
          if (debug) console.log(`🪲 useListContent success debug at: ${ debug }`, res);
          statusSet(3);
          if (res.results && res.pagination) {
            pageCountSet(res.pagination.total_page_count);
            listSet(res.results);
          }
        });
      }
    }
  }, [ addQueries, debug, fetcher, filter, listSet, page, user, sort, status ]);

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
