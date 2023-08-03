import React from 'react';
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import { faFileArrowUp, faFileAudio } from "@fortawesome/pro-solid-svg-icons";
import "./UploadLabel.scss"

interface Props {
  children?: JSX.Element|JSX.Element[];
  file?: any;
  fileTypes?: string[];
}

export default function UploadLabel({ children, file, fileTypes = [] }: Props) {
  return <>
    <div {...{ className: "me-4 "}}>
      <Icon {...{ className: "fy-upload-label-icon", icon: file ? faFileAudio : faFileArrowUp }}/>
    </div>
    <div>
      <div className="pb-0">
        { file ? <span className="filename" title={file.name}>
          { file.name.slice(0, file.name.lastIndexOf(".")) }
        </span> : <>
          <u className="fw-medium">Upload a file</u> or drop it
          here...
          { fileTypes.length ? <p className="opacity-50">
            { fileTypes.join(", ").toString() } supported
          </p> : null }
        </> }
      </div>
      { children }
    </div>
  </>;
};
