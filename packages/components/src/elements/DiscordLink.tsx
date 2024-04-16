import React from "react";
import { faDiscord } from "@fortawesome/free-brands-svg-icons";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ThirdPartyLinks } from "../constants/ThirdPartyLinks";
import { GetWebsite, Website } from "../env/GetWebsite";

interface Props {
  text?: string;
  iconAfterText?: boolean;
}

function DiscordLink(props: Props) {
  const website = GetWebsite();
  const discordLink = 
    website.website === Website.FakeYou ? 
      ThirdPartyLinks.FAKEYOU_DISCORD : 
      ThirdPartyLinks.STORYTELLER_DISCORD;

  const linkText = props.text === undefined ? "Discord" : props.text;
  const iconAfterText = props.iconAfterText ? true : false;
  const linkBody = iconAfterText ? (
    <>
      {linkText}{" "}
      <FontAwesomeIcon icon={faDiscord as IconProp} title={linkText} />
    </>
  ) : (
    <>
      <FontAwesomeIcon icon={faDiscord as IconProp} title={linkText} />{" "}
      {linkText}
    </>
  );
  return (
    <a
      href={discordLink}
      target="_blank"
      rel="noopener noreferrer"
    >
      {linkBody}
    </a>
  );
}

export { DiscordLink };
