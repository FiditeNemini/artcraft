import React, { useState, useCallback, useEffect } from "react";
import { GetUserRating, GetUserRatingIsOk } from "@storyteller/components/src/api/user_ratings/GetUserRating";
import { SetUserRating, SetUserRatingIsOk } from "@storyteller/components/src/api/user_ratings/SetUserRating";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faThumbsDown,
  faThumbsUp,
} from "@fortawesome/free-solid-svg-icons";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";

interface Props {
  entity_type: string;
  entity_token: string;
}

function RatingBlock(props: Props) {
  const [userRatingValue, setUserRatingValue] = useState<string|undefined>(undefined);
  const [userRatingIsLoaded, setUserRatingIsLoaded] = useState<boolean>(false);

  const loadRating = useCallback(async () => {
    if (userRatingIsLoaded) {
      return; // Already queried.
    }
    const request = {
      entity_type: props.entity_type,
      entity_token: props.entity_token,
    };
    const rating = await GetUserRating(request);
    if (GetUserRatingIsOk(rating)) {
      let ratingValue = rating.maybe_rating_value || undefined;
      setUserRatingValue(ratingValue);
      setUserRatingIsLoaded(true);
    }
  }, [
    userRatingIsLoaded, 
    setUserRatingValue, 
    setUserRatingIsLoaded, 
    props.entity_type, 
    props.entity_token,
  ]);

  const toggleUpvote = async () => {
    let nextValue = userRatingValue === "positive" ? "neutral" : "positive";
    await setRating(nextValue);
  };

  const toggleDownvote = async () => {
    let nextValue = userRatingValue === "negative" ? "neutral" : "negative";
    await setRating(nextValue);
  };

  const setRating = async (ratingValue: string) => {
    const request = {
      entity_type: props.entity_type,
      entity_token: props.entity_token,
      rating_value: ratingValue,
    };
    const result = await SetUserRating(request);
    if (SetUserRatingIsOk(result)) {
      setUserRatingValue(ratingValue);
      setUserRatingIsLoaded(false);
      loadRating();
    }
  };

  useEffect(() => {
    loadRating();
  }, [loadRating]);

  let upClasses = "btn-rate left";
  let downClasses = "btn-rate right";

  if (userRatingValue === "positive") {
    upClasses += " rated";
  } else if (userRatingValue === "negative") {
    downClasses += " rated";
  }

  return (
    <div className="d-flex">
      <Tippy
        content="This voice sounds good"
        hideOnClick
        placement="bottom"
        theme="fakeyou"
        arrow={false}
      >
        <button 
          className={upClasses} 
          onClick={toggleUpvote}
        >
          <FontAwesomeIcon icon={faThumbsUp} />
        </button>
      </Tippy>

      <div className="vr"></div>

      <Tippy
        content="This voice sounds bad"
        hideOnClick
        placement="bottom"
        theme="fakeyou"
        arrow={false}
      >
        <button 
          className={downClasses} 
          onClick={toggleDownvote}
        >
          <FontAwesomeIcon icon={faThumbsDown} />
        </button>
      </Tippy>
    </div>
  )
}

export { RatingBlock };
