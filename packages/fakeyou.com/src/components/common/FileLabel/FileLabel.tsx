import React from "react";
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import { faFileArrowUp } from "@fortawesome/pro-solid-svg-icons";
import "./FileLabel.scss";

interface Props {
  fileTypes?: string[];
}

export default function FileLabel({ fileTypes = [] }: Props) {
  return <div {...{ className: "fy-uploader-layout fy-upload-label" }}>
    <Icon {...{ className: "fy-uploader-layout-icon", icon: faFileArrowUp }}/>
    <div className="pb-0">
      <u className="fw-medium">Upload a file</u> or drop it here...
      <p className="opacity-50">
            { fileTypes.join(", ").toString() } supported
        </p>
    </div>
  </div>;
};