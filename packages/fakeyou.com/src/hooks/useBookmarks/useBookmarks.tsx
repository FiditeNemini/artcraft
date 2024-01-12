import { GetBookmarks } from "@storyteller/components/src/api/bookmarks/GetBookmarks";
import { CreateBookmark } from "@storyteller/components/src/api/bookmarks/CreateBookmark";
import { DeleteBookmark } from "@storyteller/components/src/api/bookmarks/DeleteBookmark";
// import { FetchStatus } from "@storyteller/components/src/api/_common/SharedFetchTypes";
import { useBatchContent } from "hooks";
// import { useSession } from "hooks";

// interface BookmarkLibrary {
//   [key: string]: any
// }

export default function useBookmarks() {

  const toggleList = (toBookmark: boolean) => (res: any, entity_token: string, entity_type: string, lib: any) => {
    return {
      ...lib,
      [entity_token]: { 
        entity_type,
        is_bookmarked: toBookmark,
        maybe_bookmark_token: toBookmark ? res.user_bookmark_token : null
      }
    }
  };

  const bookmarks = useBatchContent({
    checker: ({ maybe_bookmark_token }: any) => !!maybe_bookmark_token,
    fetcher: GetBookmarks,
    onPass: {
      fetch: (entity_token: string, entity_type: string, lib: any) => {
        let bookmarkToken = lib[entity_token].maybe_bookmark_token;
        return DeleteBookmark(bookmarkToken,{ as_mod: false });
      },
      modLibrary: toggleList(false)
    },
    onFail: {
      fetch: (entity_token: string, entity_type: string) => CreateBookmark("",{
        entity_token,
        entity_type
      }),
      modLibrary: toggleList(true)
    },
    resultsKey: "bookmarks",
    toggleCheck: (entity: any) => !!entity?.maybe_bookmark_token
  });

  return bookmarks;
};