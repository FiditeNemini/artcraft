import { GetRatings } from "@storyteller/components/src/api/user_ratings/GetRatings";
import { SetRating } from "@storyteller/components/src/api/user_ratings/SetRating";
import { useBatchContent } from "hooks";

export default function useRatings() {
  const fetch = (entity_token: string, entity_type: string, lib: any) => {
    const newRating = {
      entity_token,
      entity_type,
      rating_value: lib[entity_token]?.rating_value !== "positive" ? "positive" : "neutral"
    }
    // console.log("😎",lib[entity_token], newRating);
    return SetRating("", newRating);
  };

  const modLibrary = (res: any, entity_token: string, entity_type: string, lib: any) => {
    return {
      ...lib,
      [entity_token]: {
        entity_type,
        rating_value: lib[entity_token].rating_value === "neutral" ? "positive" : "neutral",
        positive_rating_count: res.new_positive_rating_count_for_entity
      }
    };
  };

  const ratings = useBatchContent({
    fetcher: GetRatings,
    checker: () => true,
    debug: "useRatings",
    modLibrary: (current: any, res: any, entity_token: string, tokenType: string) => {
      console.log("🪼", tokenType, res );
      let { positive_rating_count } = res.results ? res.results.find((item: any, i: number) => 
        item[tokenType] === entity_token
      ).stats : res.stats;

      console.log("🐽",positive_rating_count);

      return { ...current, positive_rating_count };
    },
    onFail: { fetch, modLibrary },
    onPass: { fetch, modLibrary },
    resultsKey: "ratings",
    toggleCheck: (entity: any) => (entity?.rating_value || "") === "positive"
  });

  // console.log("🍎",ratings.busyList);

  return {
    ...ratings,
    makeProps: ({ entityToken, entityType }: { entityToken: string, entityType: string }) => ({
      ...ratings.makeProps({ entityToken, entityType }),
      likeCount: ratings.library[entityToken]?.positive_rating_count || 0,
    })
  }
};