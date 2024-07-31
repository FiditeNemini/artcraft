import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  // faFacebook,
  faInstagram,
  // faLinkedin,
  faTiktok,
  faTwitter,
} from "@fortawesome/free-brands-svg-icons";

const socialMedia = [
  { name: "Twitter", icon: faTwitter, link: "https://twitter.com" },
  { name: "Instagram", icon: faInstagram, link: "https://instagram.com" },
  { name: "Tiktok", icon: faTiktok, link: "https://tiktok.com" },
];

const SocialIcons = () => {
  return (
    <div className="flex gap-2">
      {socialMedia.map((social, index) => (
        <a
          key={index}
          href={social.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-md flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:bg-white/20"
        >
          <FontAwesomeIcon icon={social.icon} title={social.name}/>
        </a>
      ))}
    </div>
  );
};

export default SocialIcons;
