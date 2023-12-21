import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faStarHalfAlt } from "@fortawesome/pro-solid-svg-icons";
import { faStar as faStarOutline } from "@fortawesome/pro-regular-svg-icons";
import "./RatingStars.scss";

type StarRatingProps = {
  rating: number;
};

const RatingStars: React.FC<StarRatingProps> = ({ rating }) => {
  const roundToNearestHalf = (num: number) => Math.round(num * 2) / 2;

  const roundedRating = roundToNearestHalf(rating);
  const fullStars = Math.floor(roundedRating);
  const hasHalfStar = roundedRating % 1 !== 0;

  const stars = [];

  for (let i = 0; i < fullStars; i++) {
    stars.push(<FontAwesomeIcon key={`full-${i}`} icon={faStar} />);
  }

  if (hasHalfStar) {
    stars.push(<FontAwesomeIcon key="half" icon={faStarHalfAlt} />);
  }

  while (stars.length < 5) {
    stars.push(
      <FontAwesomeIcon
        key={`empty-${stars.length}`}
        icon={faStarOutline}
        className="empty-star"
      />
    );
  }

  return (
    <div className="d-flex gap-2 p-1 align-items-center rating-stars">
      <div className="d-flex">{stars}</div>
      <p className="fw-medium">{rating}</p>
    </div>
  );
};

export default RatingStars;
