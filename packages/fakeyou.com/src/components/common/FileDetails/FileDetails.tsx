import React from 'react';
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/pro-solid-svg-icons";
import "./FileDetails.scss";

interface Props {
  clear?: (file?: any) => void;
  file?: any;
  hideClearDetails?: boolean;
  icon?: any;
  className?: string
}

export default function FileDetails({
  clear = () => {}, 
  file,
  hideClearDetails,
  icon,
  className
}: Props) {
  const fileSize =
    file && file.size >= 1024 * 1024
      ? (file.size / 1024 / 1024).toFixed(2) + " MB"
      : file
      ? `${Math.floor(file.size / 1024)} KB`
      : null;

  return <div className={"fy-uploader-layout upload-details " + className} >
    { icon && <Icon {...{ className: "fy-uploader-layout-icon", icon }}/> }
    <div>
      <div {...{ className: "filename" }}>
        { file.name.slice(0, file.name.lastIndexOf(".")) }
      </div>
      <span className="opacity-50">
        {`${ file.name.split(".").pop().toUpperCase() } file size: ${ fileSize }`}
      </span>
      <u className="fw-medium opacity-100 ms-1">Change file</u>
    </div>
    { !hideClearDetails && <button {...{ className: "upload-details-clear btn btn-destructive align-items-center justify-content-center", onClick: e => { e.preventDefault(); clear() } }}>
          <Icon {...{ icon: faTrash }}/>
    </button> }
  </div>;
};
