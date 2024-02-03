import React from "react";
import { Link } from "react-router-dom";
import { Badge } from "components/common";
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

const CardBadge = (props: any) => <div className="d-flex align-items-center">
  <div className="d-flex flex-grow-1">
    <Badge {...props} />
  </div>
</div>;

const CardFrame = ({ data, children, preview: Preview }: { data: any, children: any, preview: React.ElementType }) => {
  // const Preview = preview;
  // console.log("🎈",preview);
  return <>
  <Preview />
  <div {...{ className: "JUICY card-img-overlay" }}>
    <div className="card-img-gradient" />
    <CardBadge {...{ className: `abcxyz fy-entity-type${ data.media_type ? "-" + data.media_type : "" }`, label: data.media_type }}/>
  </div>
  { children }
</>};

export default function CardWrapper({ canHover, card: Card, data, onClick, padding, preview, source = "", type, ...rest }: Props) {
  const linkUrl = getCardUrl(data,source,type);
  const cardProps = { data, source, type, ...rest }
  const className = `card ${ padding ? "p-3" : "" }${ onClick || canHover ? " card-clickable" : ""  }`;
console.log("😎",preview);
  return onClick ?
  <div {...{ className, onClick }}>
    <CardFrame {...{ data, preview }}>
      <Card { ...cardProps }/>
    </CardFrame>
  </div> : 
  <Link {...{ className, to: linkUrl }}>
    <CardFrame {...{ data, preview }}>
      <Card {...cardProps}/> 
    </CardFrame>
  </Link>;
};