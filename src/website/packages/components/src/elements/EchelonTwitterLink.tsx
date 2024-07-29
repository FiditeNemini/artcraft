import React from "react";
import { faTwitter } from "@fortawesome/free-brands-svg-icons";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ThirdPartyLinks } from "../constants/ThirdPartyLinks";

interface Props {
  hideIcon?: boolean;
  iconBeforeText?: boolean;
  title?: string;
  children?: string | Element | Array<any>; // Optional link text, child elements, etc.
}

function EchelonTwitterLink(props: Props) {
  let linkBody =
    props.children === undefined ? <>echelon</> : <>{props.children}</>;

  const showIcon = !(props.hideIcon ? true : false);
  const iconBeforeText = props.iconBeforeText ? true : false;

  const linkTitle = props.title ? props.title : "echelon's Twitter";

  if (showIcon) {
    linkBody = iconBeforeText ? (
      <>
        <FontAwesomeIcon icon={faTwitter as IconProp} title={linkTitle} />{" "}
        {linkBody}
      </>
    ) : (
      <>
        {linkBody}{" "}
        <FontAwesomeIcon icon={faTwitter as IconProp} title={linkTitle} />
      </>
    );
  }

  return (
    <a
      href={ThirdPartyLinks.ECHELON_TWITTER_WITH_FOLLOW_INTENT}
      target="_blank"
      rel="noopener noreferrer"
    >
      {linkBody}
    </a>
  );
}

export { EchelonTwitterLink };
