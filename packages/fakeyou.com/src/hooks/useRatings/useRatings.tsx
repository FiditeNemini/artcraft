import { GetRatings } from "@storyteller/components/src/api/user_ratings/GetRatings";
import { SetRating } from "@storyteller/components/src/api/user_ratings/SetRating";
import { useBatchContent } from "hooks";

export default function useRatings() {
  const fetch = (entity_token: string, entity_type: string, lib: any) => {
    return SetRating("",{
      entity_token,
      entity_type,
      rating_value: lib[entity_token].rating_value === "neutral" ? "positive" : "neutral"
    });
  };

  const ratings = useBatchContent({
    fetcher: GetRatings,
    checker: () => true,
    modLibrary: (current: any, res: any, entity_token: string) => {
      let { positive_rating_count } = res.results ? res.results.find((item: any, i: number) => 
        item.weight_token === entity_token
      ).stats : res.stats;

      return { ...current, positive_rating_count };
    },
    onPass: {
      fetch,
      modLibrary: (res: any, entity_token: string, entity_type: string, lib: any) => {
        return {
          ...lib,
          [entity_token]: {
            entity_type,
            rating_value: lib[entity_token].rating_value === "neutral" ? "positive" : "neutral",
            positive_rating_count: res.new_positive_rating_count_for_entity
          }
        };
      }
    },
    resultsKey: "ratings",
    toggleCheck: (entity: any) => (entity?.rating_value || "") === "positive"
  });

  return {
    ...ratings,
    makeProps: ({ entityToken, entityType }: { entityToken: string, entityType: string }) => ({
      ...ratings.makeProps({ entityToken, entityType }),
      likeCount: ratings.library[entityToken]?.positive_rating_count || 0,
    })
  }
};