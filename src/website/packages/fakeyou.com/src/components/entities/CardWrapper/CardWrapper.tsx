import React from "react";
import { Link } from "react-router-dom";
import getCardUrl from "components/common/Card/getCardUrl";
import "./CardWrapper.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/pro-solid-svg-icons";

interface Props {
  canHover?: boolean;
  card: React.ElementType;

  data: any;
  onClick?: (e: any) => any;
  padding?: boolean;
  preview: React.ElementType;
  source?: string;
  type: "media" | "weights";
  featured?: boolean;
}

export default function CardWrapper({
  canHover,
  card: Card,
  data,
  onClick,
  padding,
  source = "",
  type,
  featured,
  ...rest
}: Props) {
  const linkUrl = getCardUrl(data, source, type);
  const cardProps = { data, source, type, ...rest };
  const className = `card ${padding ? "p-3" : ""} ${
    featured ? "card-featured" : ""
  } ${onClick || canHover ? "card-clickable" : ""}`.trim();

  return onClick ? (
    <div {...{ className, onClick: () => onClick(data) }}>
      <Card {...cardProps} />
      {featured && (
        <div className="card-featured-badge">
          <FontAwesomeIcon icon={faStar} className="me-1" />
          Featured
        </div>
      )}
    </div>
  ) : (
    <Link {...{ className, to: linkUrl }}>
      <Card {...cardProps} />
    </Link>
  );
}
