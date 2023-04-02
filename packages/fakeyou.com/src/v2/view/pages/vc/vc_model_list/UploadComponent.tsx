import { faFileArrowUp, faFileAudio } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import { FileUploader } from "react-drag-drop-files";

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

  return (
    //Usage refer to https://github.com/KarimMokhtar/react-drag-drop-files
    <FileUploader
      handleChange={handleChange}
      name="file"
      types={fileTypes}
      maxSize={50}
      children={
        <div
          className="panel panel-inner upload-zone d-flex align-items-center"
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
                  <u className="fw-medium">Upload a file</u> or drop it here...
                </>
              )}
            </div>
            <div className="d-flex gap-1">
              <div>
                {file ? (
                  <p className="opacity-50">
                    {file && `${file.name.split(".").pop().toUpperCase()}`} file
                    size: {fileSize}
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
  );
}

export default UploadComponent;
