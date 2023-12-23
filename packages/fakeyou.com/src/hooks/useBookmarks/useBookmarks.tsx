import { useState } from 'react';
import { useListContent } from "hooks";
import { CreateBookmark } from "@storyteller/components/src/api/bookmarks/CreateBookmark";
import { DeleteBookmark } from "@storyteller/components/src/api/bookmarks/DeleteBookmark";
import { GetBookmarksByUser } from "@storyteller/components/src/api/bookmarks/GetBookmarksByUser";
import { useSession } from "hooks";

export default function useBookmarks() {
  const [baseList, baseListSet] = useState<any[]>([]);
  const { user } = useSession();
  const bookmarks = useListContent({ fetcher: GetBookmarksByUser, debug: "useBookmarks", list: baseList, listSet: baseListSet, requestList: true, urlParam: user.username });
  const list = bookmarks.list.reduce((obj: any, current: any) => {
    return { ...obj, [current.details.entity_token]: current.token }
  },{});
  const toggle = (entityToken = "", type = "") => {
    let bookmarkToken = list[entityToken];
    if (bookmarkToken) {
      console.log("⏳ deleting bookmark",);
      return DeleteBookmark(bookmarkToken,{ as_mod: true })
      .then((res: any) => {
        console.log("🔥",res);
        bookmarks.statusSet(1);
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
        bookmarks.statusSet(1);
        return true;
      });
    }
  };

  return {
    list,
    toggle
  };
};