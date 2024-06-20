import {
  faFacebookF,
  faRedditAlien,
  faWhatsapp,
  faTwitter,
} from "@fortawesome/free-brands-svg-icons";
import {
  faArrowDownToLine,
  faXmark,
  faEnvelope,
} from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import "./SocialButton.scss";

export type Socials =
  | "x"
  | "whatsapp"
  | "facebook"
  | "reddit"
  | "email"
  | "download";

interface SocialButtonProps {
  downloadLink?: string;
  hideLabel?: boolean;
  social: Socials;
  shareUrl?: string;
  shareText: string;
}

export default function SocialButton({
  downloadLink,
  hideLabel,
  social,
  shareUrl,
  shareText,
}: SocialButtonProps) {
  const socialIcons = {
    x: faTwitter,
    whatsapp: faWhatsapp,
    facebook: faFacebookF,
    reddit: faRedditAlien,
    email: faEnvelope,
    download: faArrowDownToLine,
  };

  let socialIcon = socialIcons[social] || faXmark;

  const getShareLink = (social: string, url: string, text: string) => {
    switch (social) {
      case "x":
        return `https://twitter.com/intent/tweet?url=${encodeURIComponent(
          url
        )}&text=${encodeURIComponent(text)}`;
      case "facebook":
        return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          url
        )}`;
      case "whatsapp":
        return `https://wa.me/?text=${encodeURIComponent(
          text
        )} ${encodeURIComponent(url)}`;
      case "reddit":
        return `https://www.reddit.com/submit?url=${encodeURIComponent(
          url
        )}&title=${encodeURIComponent(text)}`;
      case "email":
        return `mailto:?subject=${encodeURIComponent(
          text
        )}&body=${encodeURIComponent(url)}`;
      case "download":
        return downloadLink;
      default:
        return "#";
    }
  };

  return (
    <a
      {...{
        className: "social-button",
        href: getShareLink(social, shareUrl || "", shareText),
        target: "_blank",
        ...(social === "download" ? { download: true } : {}),
      }}
    >
      <div
        className={`${
          !hideLabel ? "social-button-icon" : "social-button-icon-no-style"
        } bg-${social}`}
      >
        <FontAwesomeIcon icon={socialIcon} />
      </div>
      {!hideLabel ? (
        <p className="social-button-text">
          {social.charAt(0).toUpperCase() + social.slice(1)}
        </p>
      ) : null}
    </a>
  );
}
