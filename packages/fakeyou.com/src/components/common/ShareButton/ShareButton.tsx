import React, { useState } from "react";
import Tippy from "@tippyjs/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLink } from "@fortawesome/pro-solid-svg-icons";
import Button from "../Button/Button";

interface ShareButtonProps {
  url: string;
}

export default function ShareButton(props: ShareButtonProps) {
  const [tippyContent, setTippyContent] = useState("Share");

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(props.url);
      setTippyContent("Link Copied");
      setTimeout(() => {
        setTippyContent("Share");
      }, 800);
    } catch (error) {
      console.error("Failed to copy link to clipboard:", error);
    }
  };

  return (
    <div className="d-flex">
      <Tippy
        content={tippyContent}
        hideOnClick={false}
        placement="bottom"
        theme="fakeyou"
        arrow={false}
      >
        <div>
          <Button
            label="Share Link"
            icon={faLink}
            secondary
            small
            onClick={copyToClipboard}
          />
        </div>
      </Tippy>
    </div>
  );
}
