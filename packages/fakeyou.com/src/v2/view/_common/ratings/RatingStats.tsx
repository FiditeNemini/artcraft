import React from "react";
import { t } from "i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFrown,
  faStar, 
  faStarHalfAlt, 
} from "@fortawesome/free-solid-svg-icons";
import {
  faStarExclamation,
} from "@fortawesome/pro-duotone-svg-icons";
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
        <FontAwesomeIcon icon={faStarExclamation} className="me-2 rating-icon" />
        <p>
          {t("common.RatingStats.voice.notRated")}
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
    scoreTitle = t("common.RatingStats.voice.score5");
    icon = faStar;
  } else if (scoreRounded >= 3.0) {
    scoreTitle = t("common.RatingStats.voice.score4");
    icon = faStar;
  } else if (scoreRounded >= 2.0) {
    scoreTitle = t("common.RatingStats.voice.score3");
    icon = faStarHalfAlt;
  } else {
    scoreTitle = t("common.RatingStats.voice.score2");
    icon = faFrown;
  }

  return (
    <div className="d-flex align-items-center">
      <FontAwesomeIcon icon={icon} className="me-2 rating-icon" />
      <p>
        {t("common.RatingStats.voice.rating")}: <span className="fw-medium">{scoreRounded} — {scoreTitle}</span>
      </p>
    </div>
  )
}

export { RatingStats };
