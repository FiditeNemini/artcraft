import { Panel } from "components/common";
import React from "react";
import "./SdCoverImagePanel.scss";

interface SdCoverImagePanelProps {
  src: string;
  alt?: string;
}

export default function SdCoverImagePanel({
  src,
  alt,
}: SdCoverImagePanelProps) {
  return (
    <Panel>
      <div className="sd-cover-img-container d-flex align-items-center justify-content-center px-3 py-3">
        <img src={src} alt={alt} />
      </div>
    </Panel>
  );
}
