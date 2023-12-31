import { useEffect, useState } from 'react';
import { CreateBookmark } from "@storyteller/components/src/api/bookmarks/CreateBookmark";
import { DeleteBookmark } from "@storyteller/components/src/api/bookmarks/DeleteBookmark";
import { GetBookmarksByUser } from "@storyteller/components/src/api/bookmarks/GetBookmarksByUser";
import { FetchStatus } from "@storyteller/components/src/api/_common/SharedFetchTypes";
import { useSession } from "hooks";

export default function useBookmarks() {
  const { user } = useSession();
  const [baseList, baseListSet] = useState<any[]>([]);
  const [status, statusSet] = useState(FetchStatus.ready);

  const list = baseList.reduce((obj: any, current: any) => {
    return { ...obj, [current.details.entity_token]: current.token }
  },{});

  const toggle = (entityToken = "", type = "") => {
    let bookmarkToken = list[entityToken];
    if (bookmarkToken) {
      console.log("⏳ deleting bookmark",);
      return DeleteBookmark(bookmarkToken,{ as_mod: true })
      .then((res: any) => {
        console.log("🔥",res);
        statusSet(FetchStatus.ready);
        return false;
      });

    } else {
      console.log("⏳ creating bookmark",);
      return CreateBookmark("",{
        entity_token: entityToken,
        entity_type: type
      })
      .then((res: any) => {
        console.log("🔖",res);
        statusSet(FetchStatus.ready);
        return true;
      });
    }
  };

  useEffect(() => {
    if (user && status === FetchStatus.ready) {
      statusSet(FetchStatus.in_progress);
      GetBookmarksByUser(user?.username || "",{},{ page_size: 999 }) // high number because we want all bookmarks
        .then((res: any) => {
          statusSet(FetchStatus.success);
          if (res.results) {
            baseListSet(res.results);
          }
        });
    }
  },[status, user]);

  return {
    list,
    toggle
  };
};