import React from 'react';
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/pro-solid-svg-icons";
import "./UploadDetails.scss";

interface Props {
  file?: any;
  handleClear?: (x?: any) => void;
  icon?: any;
}

export default function UploadDetails({ file, handleClear = () => {}, icon }: Props) {
  const fileSize =
    file && file.size >= 1024 * 1024
      ? (file.size / 1024 / 1024).toFixed(2) + " MB"
      : file
      ? `${Math.floor(file.size / 1024)} KB`
      : null;

  return <div {...{ className: "fy-uploader-layout upload-details" }}>
    <Icon {...{ className: "fy-uploader-layout-icon", icon }}/>
    <div>
      <div {...{ className: "filename" }}>
        { file.name.slice(0, file.name.lastIndexOf(".")) }
      </div>
      <span className="opacity-50">
        {`${ file.name.split(".").pop().toUpperCase() } file size: ${ fileSize }`}
      </span>
      <u className="fw-medium opacity-100 ms-1">Change file</u>
    </div>
    <button {...{ className: "upload-details-clear btn btn-destructive align-items-center justify-content-center", onClick: e => { e.preventDefault(); handleClear() } }}>
      <Icon {...{ icon: faTrash }}/>
    </button>
  </div>;
};
