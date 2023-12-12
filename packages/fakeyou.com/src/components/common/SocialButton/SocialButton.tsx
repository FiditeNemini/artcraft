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
}

export default function SocialButton({ social }: SocialButtonProps) {
  const socialIcons = {
    x: faTwitter,
    whatsapp: faWhatsapp,
    facebook: faFacebookF,
    reddit: faRedditAlien,
    email: faEnvelope,
  };

  let socialIcon = socialIcons[social] || faXmark;

  return (
    <button className="social-button">
      <div className={`social-button-icon bg-${social}`}>
        <FontAwesomeIcon icon={socialIcon} />
      </div>

      <p className="social-button-text">
        {social.charAt(0).toUpperCase() + social.slice(1)}
      </p>
    </button>
  );
}
