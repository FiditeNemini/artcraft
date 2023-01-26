import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFrown,
  faStar, 
  faStarHalfAlt, 
} from "@fortawesome/free-solid-svg-icons";
import { prettyNum, ROUNDING_MODE } from "pretty-num";

interface Props {
  positive_votes: number,
  negative_votes: number,
  // Total votes should equal (positive_votes + negative_votes).
  // It does not include "neutral" votes, where the user revokes their vote.
  total_votes: number,
}

function RatingStats(props: Props) {
  if (props.total_votes === 0 
    || (props.positive_votes === 0 && props.negative_votes === 0)
  ) {
    return (
      <div className="d-flex align-items-center">
        <FontAwesomeIcon icon={faStar} className="me-2 rating-icon" />
        <p>
          Voice Not Yet Rated
        </p>
      </div>
    );
  }

  // Rating scale: 0 to 5, with one decimal digit.
  let score = (props.positive_votes / props.total_votes) * 5.0;
  let scoreRounded = prettyNum(score, {precision: 1, roundingMode: ROUNDING_MODE.CEIL});

  let scoreTitle;
  let icon;

  if (scoreRounded >= 4.0) {
    scoreTitle = "Voice Sounds Great";
    icon = faStar;
  } else if (scoreRounded >= 3.0) {
    scoreTitle = "Voice Sounds Good";
    icon = faStar;
  } else if (scoreRounded >= 2.0) {
    scoreTitle = "Voice Sounds Okay";
    icon = faStarHalfAlt;
  } else {
    scoreTitle = "Voice Sounds Meh";
    icon = faFrown;
  }

  return (
    <div className="d-flex align-items-center">
      <FontAwesomeIcon icon={icon} className="me-2 rating-icon" />
      <p>
        Rating: <span className="fw-medium">{scoreRounded} — {scoreTitle}</span>
      </p>
    </div>
  )
}

export { RatingStats };
