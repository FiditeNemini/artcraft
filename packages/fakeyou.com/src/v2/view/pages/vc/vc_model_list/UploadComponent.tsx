import { faFileArrowUp, faFileAudio } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import { FileUploader } from "react-drag-drop-files";
import { InputVcAudioPlayer } from "../../../_common/InputVcAudioPlayer";

const fileTypes = ["MP3", "WAV", "FLAC"];

function UploadComponent() {
  const [file, setFile] = useState<any>();
  const handleChange = (file: any) => {
    setFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add("upload-zone-drag");
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove("upload-zone-drag");
  };

  const fileSize =
    file && file.size >= 1024 * 1024
      ? (file.size / 1024 / 1024).toFixed(2) + " MB"
      : file
      ? `${Math.floor(file.size / 1024)} KB`
      : null;

  let audioLink =
    "https://storage.googleapis.com/vocodes-public/tts_inference_output/c/7/2/vocodes_c721a29c-c8e0-4499-9ddd-dac471269a5d.wav";

  return (
    <div className="d-flex flex-column gap-3">
      {/* Usage refer to https://github.com/KarimMokhtar/react-drag-drop-files */}
      <FileUploader
        handleChange={handleChange}
        name="file"
        types={fileTypes}
        maxSize={50}
        children={
          <div
            className="panel panel-inner upload-zone d-flex align-items-center p-3"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="me-4">
              {file ? (
                <FontAwesomeIcon icon={faFileAudio} className="upload-icon" />
              ) : (
                <FontAwesomeIcon icon={faFileArrowUp} className="upload-icon" />
              )}
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
                      {fileTypes.join(", ").toString()} supported
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        }
      />
      {file ? (
        <div className="panel panel-inner rounded p-3">
          <InputVcAudioPlayer filename={audioLink} />
        </div>
      ) : (
        <></>
      )}
      {file ? (
        <div className="d-flex justify-content-lg-end mb-4 mb-lg-2">
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              value=""
              id="checkSave"
            />
            <label className="form-check-label opacity-75" htmlFor="checkSave">
              Save audio to collection
            </label>
          </div>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}

export default UploadComponent;
