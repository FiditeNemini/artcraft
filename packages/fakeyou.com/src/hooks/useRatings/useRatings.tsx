import { useState } from 'react';
import { FetchStatus } from "@storyteller/components/src/api/_common/SharedFetchTypes";
import { GetRatings, GetRatingsResponse } from "@storyteller/components/src/api/user_ratings/GetRatings";
import { SetRating, SetRatingResponse } from "@storyteller/components/src/api/user_ratings/SetRating";

// interface Props {
//   value?: any
// }

export default function useRatings() {
  // const [library, librarySet] = useState({});
  const [baseList, baseListSet] = useState<any[]>([]);
  const [toggleStatus, toggleStatusSet] = useState(FetchStatus.ready);

  const library = baseList.reduce((obj: any, current: any) => {
    return { ...obj, [current.entity_token]: current.token }
  },{});

  const gather = (res: any) => {
    let tokens = res.results.map((item: any) => item.token);
    console.log("💧", tokens);
    GetRatings("",{},{ tokens }).then((res: GetRatingsResponse) => {
      if (res.success && res.ratings) {
        console.log("🪙",res);
        baseListSet(res.ratings);
      }
    });
  };

  const toggle = (token: string, entityType: string) => {
    let inLibrary = library[token];

    toggleStatusSet(FetchStatus.in_progress);
    console.log("⏳ toggling bookmark ...",{ token, entityType });
    SetRating("",{
      entity_token: token,
      entity_type: entityType,
      rating_value: !inLibrary || inLibrary.rating_value === "neutral" ? "positive" : "neutral"
    }).then(( res: SetRatingResponse ) => {
      toggleStatusSet(FetchStatus.ready);
      console.log("👍 like toggled",res);
    });
  };

  return { gather, toggleStatus, toggleStatusSet, toggle };
};