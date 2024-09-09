import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

const MILLION : number = 1000000;
const THOUSAND : number = 1000;

interface Props {
  count: number,
  icon?: IconProp,
}

export default function Stat(props: Props) {
  let friendlyCount = toHumanNumber(props.count);

  let icon = <></>;
  if (props.icon !== undefined) {
    icon = <FontAwesomeIcon icon={props.icon} />;
  }

  return (
    <span>
      {friendlyCount} {icon}
    </span>
  )
}

function toHumanNumber(count: number) : string {
  if (count > MILLION) {
    let digits = (count / MILLION).toFixed(2);
    return `${digits}m`;
  } else if (count > THOUSAND) {
    let digits = (count / THOUSAND).toFixed(2);
    return `${digits}k`;
  } else {
    return count.toString();
  }
}
