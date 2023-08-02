import React from "react";
import { faCheck, faFileArrowUp, faTrash } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import { InputVcAudioPlayer } from "v2/view/_common/InputVcAudioPlayer";
import { Uploader, UploadLabel } from 'components/common';
import LoadingIcon from "./LoadingIcon";
import './AudioUploader.scss'

const FILE_TYPES = ["MP3", "WAV", "FLAC", "OGG"];

interface Props {
  blob?: string;
  file?: any;
  handleUploadFile?: () => void;
  onChange?: (file?: any) => void;
  onClear?: (file?: any) => void;
  uploading?: boolean;
  uploadDisabled?: boolean;
}

const n = () => {};

export default function AudioUploader({ blob = "", file, handleUploadFile = n, onChange = n, onClear = n, uploading = false, uploadDisabled = false }: Props) {
  console.log("🥶",file);
  const handleClear = () => { onClear(); };
  const fileSize =
    file && file.size >= 1024 * 1024
      ? (file.size / 1024 / 1024).toFixed(2) + " MB"
      : file
      ? `${Math.floor(file.size / 1024)} KB`
      : null;

  const uploadBtnClass = uploadDisabled
    ? "btn btn-uploaded w-100 disabled"
    : "btn btn-primary w-100";

  return <>
    <Uploader {...{ onChange, panelClass: 'p-3' }}>
      <UploadLabel {...{ file }}>
        <div className="d-flex gap-1">
          <div>
            {file ? (
              <p>
                <span className="opacity-50">
                  {file && `${file.name.split(".").pop().toUpperCase()}`}{" "}
                  file size: {fileSize}
                </span>{" "}
                <u className="fw-medium opacity-100 ms-1">Change file</u>
              </p>
            ) : (
              <p className="opacity-50">
                {FILE_TYPES.join(", ").toString()} supported
              </p>
            )}
          </div>
        </div>
      </UploadLabel>
    </Uploader>
      { file && <>
        <div className="panel panel-inner rounded p-3">
          <InputVcAudioPlayer {...{ filename: blob as string }}/>
        </div>
        <div className="d-flex gap-3">
          <button {...{ className: uploadBtnClass, disabled: uploading || uploadDisabled, onClick: () => handleUploadFile(), type: "submit", }}>
            <Icon {...{ className: "me-2", icon: uploadDisabled ? faCheck : faFileArrowUp, }}/>
            { uploading && <LoadingIcon /> }
          </button>
          <button className="btn btn-destructive w-100" onClick={handleClear}>
            <Icon icon={faTrash} className="me-2" />
            Clear
          </button>
        </div>
      </> }
  </>;
};