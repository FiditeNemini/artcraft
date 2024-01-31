import React from "react";
import { Link } from "react-router-dom";
import getCardUrl from "components/common/Card/getCardUrl";

interface Props {
  card: any,
  data: any,
  onClick?: (e:any) => any,
  source?: string,
  type: "media" | "weights"
}

export default function CardWrapper({ card: Card, data, onClick, source = "", type, ...rest }: Props) {
  const linkUrl = getCardUrl(data,source,type);
  const cardProps = { data, source, type, ...rest }
  return onClick ? <Card {...{ onClick, ...cardProps }}/> : <Link {...{ to: linkUrl }}>
      <Card {...cardProps}/> 
    </Link>;
};