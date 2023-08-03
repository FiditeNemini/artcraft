import React from 'react';
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import { faCheck, faFileArrowUp, faTrash } from "@fortawesome/pro-solid-svg-icons";
import LoadingIcon from "./LoadingIcon";

interface Props {
  disabled?: boolean;
  handleClear?: (x?: any) => void;
  handleUpload?: (x?: any) => void;
  uploading?: boolean;
}

const n = () => {};

export default function UploadActions({ disabled, handleClear = n, handleUpload = n, uploading }: Props) {
  const uploadBtnClass = disabled ? "btn btn-uploaded w-100 disabled" : "btn btn-primary w-100";

  return <div className="d-flex gap-3">
    <button {...{ className: uploadBtnClass, disabled: uploading || disabled, onClick: () => handleUpload(), type: "submit", }}>
      <Icon {...{ className: "me-2", icon: disabled ? faCheck : faFileArrowUp, }}/>
      { uploading && <LoadingIcon /> }
    </button>
    <button {...{ className: "btn btn-destructive w-100", onClick: handleClear }}>
      <Icon icon={faTrash} className="me-2" />
      Clear
    </button>
  </div>;
};