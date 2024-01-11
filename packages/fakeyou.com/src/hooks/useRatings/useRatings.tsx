import { useState } from 'react';
import { FetchStatus } from "@storyteller/components/src/api/_common/SharedFetchTypes";
import { GetRatings } from "@storyteller/components/src/api/user_ratings/GetRatings";
import { SetRating } from "@storyteller/components/src/api/user_ratings/SetRating";
import { useBatchContent } from "hooks";

// interface Props {
//   value?: any
// }

export default function useRatings() {
  // const [library, librarySet] = useState({});
  // const [baseList, baseListSet] = useState<any[]>([]);
  const [toggleStatus, toggleStatusSet] = useState(FetchStatus.ready);

  const fetch = (entity_token: string, entity_type: string, lib: any) => {
    // console.log("🔔",lib[entity_token].rating_value);
    return SetRating("",{
      entity_token,
      entity_type,
      rating_value: lib[entity_token].rating_value === "neutral" ? "positive" : "neutral"
    });
  };

  const { busyList, gather, list, status, toggle } = useBatchContent({
    fetcher: GetRatings,
    checker: () => true,
    onPass: {
      fetch,
      modLibrary: (res: any, entity_token: string, entity_type: string, lib: any) => {
        
        let jam = {
          ...lib,
          [entity_token]: {
            entity_type,
            rating_value: lib[entity_token].rating_value === "neutral" ? "positive" : "neutral",
            positive_rating_count: res.new_positive_rating_count_for_entity
          }
        };

        console.log("💯",res, jam);

          return jam;
      }
    },
    resultsKey: "ratings"
  });

  console.log("🔮",list);

  return { busyList, gather, list, status, toggleStatus, toggleStatusSet, toggle };
};