import React from "react";
import { Link } from "react-router-dom";
import getCardUrl from "components/common/Card/getCardUrl";
import "./CardWrapper.scss";

interface Props {
  canHover?: boolean,
  card: React.ElementType,
  data: any,
  onClick?: (e:any) => any,
  padding?: boolean,
  preview: React.ElementType,
  source?: string,
  type: "media" | "weights"
}

export default function CardWrapper({ canHover, card: Card, data, onClick, padding, source = "", type, ...rest }: Props) {
  const linkUrl = getCardUrl(data,source,type);
  const cardProps = { data, source, type, ...rest }
  const className = `card ${ padding ? "p-3" : "" }${ onClick || canHover ? " card-clickable" : ""  }`;

  return onClick ?
  <div {...{ className, onClick: () => onClick(data) }}>
    <Card { ...cardProps }/>
  </div> : 
  <Link {...{ className, to: linkUrl }}>
    <Card { ...cardProps }/>
  </Link>;
};