import React from "react";
import { FileUploader } from "react-drag-drop-files";
import { faCheck, faFileArrowUp, faFileAudio, faTrash } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { InputVcAudioPlayer } from "v2/view/_common/InputVcAudioPlayer";
import LoadingIcon from "./LoadingIcon";

const FILE_TYPES = ["MP3", "WAV", "FLAC", "OGG"];

interface Idempotency { token: any; set: (file?: any) => void; }

interface Props {
  audioLink?: string;
  file?: any;
  fileSet?: (file?: any) => void;
  canConvertSet?: (canConvert: boolean) => void;
  handleUploadFile?: () => void;
  idempotency?: Idempotency;
  onChange?: (file?: any) => void;
  onClear?: (file?: any) => void;
  uploading?: boolean;
  uploadDisabled?: boolean;
}

const n = () => {};

export default function Uploader({ audioLink = "", file, fileSet = n, canConvertSet = n, handleUploadFile = n, idempotency = { token: '', set: n }, onChange = n, onClear = n, uploading = false, uploadDisabled = false }: Props) {

  const handleChange = (file: any) => {
    onChange({ target: { name: 'uploader', value: file }});
  };

  const handleClear = () => { onClear(); };

  const onDragEvent = (onOff: number) => (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList[onOff ? "add" : "remove" ]("upload-zone-drag");
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
    <div className="d-flex flex-column gap-3">
      {/* Usage refer to https://github.com/KarimMokhtar/react-drag-drop-files */}
      <FileUploader {...{ handleChange, maxSize: 50, name: "file", types: FILE_TYPES }}
        children={
          <div {...{ className: "panel panel-inner upload-zone d-flex align-items-center p-3",
          onDragLeave: onDragEvent(1), onDragOver: onDragEvent(0) }}>
            <div className="me-4">
            <FontAwesomeIcon {...{ className: "upload-icon", icon: file ? faFileAudio : faFileArrowUp }}/>
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
          </div>
        }
      />
      { file && <>
        <div className="panel panel-inner rounded p-3">
          <InputVcAudioPlayer {...{ filename: audioLink as string }}/>
        </div>
        <div className="d-flex gap-3">
          <button {...{ className: uploadBtnClass, disabled: uploading || uploadDisabled, onClick: () => handleUploadFile(), type: "submit", }}>
            <FontAwesomeIcon {...{ className: "me-2", icon: uploadDisabled ? faCheck : faFileArrowUp, }}/>
            { uploading && <LoadingIcon /> }
          </button>
          <button className="btn btn-destructive w-100" onClick={handleClear}>
            <FontAwesomeIcon icon={faTrash} className="me-2" />
            Clear
          </button>
        </div>
      </> }
    </div>
  );
};
