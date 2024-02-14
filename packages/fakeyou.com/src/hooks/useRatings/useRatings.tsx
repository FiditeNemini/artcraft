import { GetRatings } from "@storyteller/components/src/api/user_ratings/GetRatings";
import { SetRating } from "@storyteller/components/src/api/user_ratings/SetRating";
import useBatchContent, { BatchInputProps, MakePropsParams } from "hooks/useBatchContent";

export interface RatingsProps extends BatchInputProps {
  likeCount: 0
}

export type MakeRatingsProps = (x: MakePropsParams) => RatingsProps;

export default function useRatings() {
  const fetch = (entity_token: string, entity_type: string, lib: any) => {
    const newRating = {
      entity_token,
      entity_type,
      rating_value: lib[entity_token]?.rating_value !== "positive" ? "positive" : "neutral"
    }
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
    // debug: "useRatings",
    modLibrary: (current: any, res: any, entity_token: string, tokenType: string) => {
      
      let result = res.results ? res.results.find((item: any, i: number) => 
        {
          return item.details[tokenType] === entity_token || item[tokenType] === entity_token
        }
      ) : res;

      let { positive_rating_count } = result.details.stats || result.stats;

      // let { positive_rating_count } = res.results ? itemMatch.details.stats || itemMatch.details.stats 

      return { ...current, positive_rating_count };
    },
    onFail: { fetch, modLibrary },
    onPass: { fetch, modLibrary },
    resultsKey: "ratings",
    toggleCheck: (entity: any) => (entity?.rating_value || "") === "positive"
  });

  const makeProps: MakeRatingsProps = ({ entityToken, entityType }: MakePropsParams) => ({
    ...ratings.makeProps({ entityToken, entityType }),
    likeCount: ratings.library[entityToken]?.positive_rating_count || 0,
  });

  return {
    ...ratings,
    makeProps
  }
};