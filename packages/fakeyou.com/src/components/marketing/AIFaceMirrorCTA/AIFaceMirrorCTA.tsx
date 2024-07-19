import React from "react";
import { Link } from "react-router-dom";
import { Button } from "components/common";
import "./AIFaceMirrorCTA.scss";

interface Props {
  className?: string;
}

export default function AIFaceMirrorCTA({ className }: Props) {
  return (
    <div
      {...{
        className: `cta-ai-face-mirror${className ? " " + className : ""}`,
      }}
    >
      <Link
        {...{ className: "cta-ai-face-mirror-body", to: "/ai-face-mirror" }}
      >
        <video autoPlay muted loop>
          <source src="/videos/motion_mirror_bg_04.mp4" type="video/mp4" />
        </video>
        <div {...{ className: "cta-ai-face-mirror-tint" }}></div>
        <div {...{ className: "cta-ai-face-mirror-overlay" }}>
          <div {...{ className: "cta-ai-face-mirror-copy" }}>
            <h2>AI Face Mirror</h2>
            <p>Reflect motion from one portrait to another</p>
          </div>

          <Button
            {...{
              className: "cta-ai-face-mirror-button",
              label: "Create now",
              to: "/ai-face-mirror",
            }}
          />
        </div>
      </Link>
    </div>
  );
}
