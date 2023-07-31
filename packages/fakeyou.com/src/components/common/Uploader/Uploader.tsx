import React from "react";
import { faCheck, faFileArrowUp, faFileAudio, faTrash } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import { InputVcAudioPlayer } from "v2/view/_common/InputVcAudioPlayer";
import LoadingIcon from "./LoadingIcon";
import './Uploader.scss'

const FILE_TYPES = ["MP3", "WAV", "FLAC", "OGG"];

interface Props {
  audioLink?: string;
  file?: any;
  handleUploadFile?: () => void;
  onChange?: (file?: any) => void;
  onClear?: (file?: any) => void;
  uploading?: boolean;
  uploadDisabled?: boolean;
}

const n = () => {};

export default function Uploader({ audioLink = "", file, handleUploadFile = n, onChange = n, onClear = n, uploading = false, uploadDisabled = false }: Props) {

  const fileChange = ({ target }: { target: any }) => {
    onChange({ target: { name: 'uploader', value: target.files[0] }});
  };

  const handleClear = () => { onClear(); };
  const onDragDrop = (e: any) => { e.preventDefault(); e.stopPropagation(); };

  const onDragEvent = (onOff: number) => (e: React.DragEvent<HTMLDivElement>): void => {
    onDragDrop(e);
    e.currentTarget.classList[onOff ? "add" : "remove" ]("upload-zone-drag");
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>): void =>  {
    onDragDrop(e);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onChange({ target: { name: 'uploader', value: e.dataTransfer.files[0] }});
    }
  };

  const fileSize =
    file && file.size >= 1024 * 1024
      ? (file.size / 1024 / 1024).toFixed(2) + " MB"
      : file
      ? `${Math.floor(file.size / 1024)} KB`
      : null;

  const uploadBtnClass = uploadDisabled
    ? "btn btn-uploaded w-100 disabled"
    : "btn btn-primary w-100";

  return (
    <div {...{ className: "fy-uploader d-flex flex-column gap-3", onDragLeave: onDragEvent(1), onDragOver: onDragEvent(0), onDrop }}>
      <input { ...{ name: 'file', onChange: fileChange, type: 'file', id: 'file' }} />
      <label {...{ className: "panel panel-inner upload-zone d-flex align-items-center p-3", htmlFor: "file"}} >
          <div className="me-4">
            <Icon {...{ className: "upload-icon", icon: file ? faFileAudio : faFileArrowUp }}/>
            </div>
            <div>
              <div className="pb-0">
                {file ? (
                  <span className="filename" title={file.name}>
                    {file.name.slice(0, file.name.lastIndexOf("."))}
                  </span>
                ) : (
                  <>
                    <u className="fw-medium">Upload a file</u> or drop it
                    here...
                  </>
                )}
              </div>
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
            </div>
      </label>
      { file && <>
        <div className="panel panel-inner rounded p-3">
          <InputVcAudioPlayer {...{ filename: audioLink as string }}/>
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
    </div>
  );
};
