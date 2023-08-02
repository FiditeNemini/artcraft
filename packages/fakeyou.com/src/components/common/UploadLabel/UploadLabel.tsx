import React from 'react';
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import { faFileArrowUp, faFileAudio } from "@fortawesome/pro-solid-svg-icons";

interface Props {
  children?: JSX.Element|JSX.Element[];
  file?: any;
}

export default function UploadLabel({ children, file }: Props) {
  return <>
    <div className="me-4">
      <Icon {...{ className: "upload-icon", icon: file ? faFileAudio : faFileArrowUp }}/>
    </div>
    <div>
      <div className="pb-0">
        { file ? <span className="filename" title={file.name}>
          { file.name.slice(0, file.name.lastIndexOf(".")) }
        </span> : <>
          <u className="fw-medium">Upload a file</u> or drop it
          here...
        </> }
      </div>
      { children }
    </div>
  </>;
};
