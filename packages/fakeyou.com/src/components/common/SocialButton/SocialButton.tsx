import {
  faFacebookF,
  faRedditAlien,
  faWhatsapp,
  faTwitter,
} from "@fortawesome/free-brands-svg-icons";
import { faXmark, faEnvelope } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import "./SocialButton.scss";

interface SocialButtonProps {
  social: "x" | "whatsapp" | "facebook" | "reddit" | "email";
  shareUrl: string;
  shareText: string;
}

export default function SocialButton({
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
      default:
        return "#";
    }
  };

  const handleClick = () => {
    const shareLink = getShareLink(social, shareUrl, shareText);
    window.open(shareLink, "_blank");
  };

  return (
    <button className="social-button" onClick={handleClick}>
      <div className={`social-button-icon bg-${social}`}>
        <FontAwesomeIcon icon={socialIcon} />
      </div>

      <p className="social-button-text">
        {social.charAt(0).toUpperCase() + social.slice(1)}
      </p>
    </button>
  );
}
