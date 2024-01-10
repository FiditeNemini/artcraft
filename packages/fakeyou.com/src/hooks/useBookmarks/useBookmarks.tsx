import { useState } from 'react';
import { GetBookmarks, GetBookmarksResponse } from "@storyteller/components/src/api/bookmarks/GetBookmarks";
import { CreateBookmark } from "@storyteller/components/src/api/bookmarks/CreateBookmark";
import { DeleteBookmark } from "@storyteller/components/src/api/bookmarks/DeleteBookmark";
import { FetchStatus } from "@storyteller/components/src/api/_common/SharedFetchTypes";
// import { useSession } from "hooks";

interface BookmarkLibrary {
  [key: string]: any
}

export default function useBookmarks() {
  const [list, listSet] = useState<BookmarkLibrary>({});
  const [busyList, busyListSet] = useState<BookmarkLibrary>({});
  const [status, statusSet] = useState(FetchStatus.ready);

  const getBookmarks = (tokens = [], expand = false) => {
    busyListSet(tokens.reduce((obj,token) => ({ ...obj, [token]: true }),{}));
    GetBookmarks("",{},{ tokens }).then((res: GetBookmarksResponse) => {
      if (res.success && res.bookmarks) {
        let newBatch = res.bookmarks.reduce((obj, { entity_token, ...bookmark }) => ({
          ...obj,
          [entity_token]: bookmark
        }),{});
        busyListSet({}); // this should be a for each key in tokens delete from busyList, but this is fine for now
        listSet(list => expand ? { ...list, ...newBatch } : newBatch);
      }
    })
  };

  const gather = ({ res, expand }: { res: any, expand?: boolean }) => {
    let tokens = res.results.map((item: any) => item.weight_token);
    getBookmarks(tokens, expand);
  };

  const toggleList = (entity_type = "", entityToken = "", maybe_bookmark_token = null) => (list: BookmarkLibrary) => ({
    ...list,
    [entityToken]: { 
      entity_type,
      is_bookmarked: !!maybe_bookmark_token,
      maybe_bookmark_token
    }
  });

  // console.log("😎",list);

  const toggle = (entityToken: string, type: string) => {
    statusSet(FetchStatus.in_progress);
    busyListSet(state => ({ ...state, [entityToken]: true }));
    let bookmarkToken = list[entityToken].maybe_bookmark_token;
    if (bookmarkToken) {
      console.log(`⏳ deleting bookmark: ${ entityToken }`,bookmarkToken);
      return DeleteBookmark(bookmarkToken,{ as_mod: true })
      .then((res: any) => {
        console.log("🔥",res);
        busyListSet(state => {
          let newState = { ...state };
          delete newState[entityToken];
          return newState;
        });
        listSet(toggleList(type,entityToken));
        statusSet(FetchStatus.ready);
        return false;
      });

    } else {
      console.log(`⏳ creating bookmark: ${ entityToken }`,bookmarkToken);
      return CreateBookmark("",{
        entity_token: entityToken,
        entity_type: type
      })
      .then((res: any) => {
        console.log("🔖",res);
        busyListSet(state => {
          let newState = { ...state };
          delete newState[entityToken];
          return newState;
        });
        listSet(toggleList(type,entityToken,res.user_bookmark_token));
        statusSet(FetchStatus.ready);
        return true;
      });
    }
  };

  return {
    busyList,
    gather,
    list,
    status,
    toggle
  };
};