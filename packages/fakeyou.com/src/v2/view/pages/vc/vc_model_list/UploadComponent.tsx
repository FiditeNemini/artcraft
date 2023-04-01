import { faFileArrowUp } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import { FileUploader } from "react-drag-drop-files";

const fileTypes = ["WAV", "MP3", "FLAC"];

function UploadComponent() {
  const [file, setFile] = useState<any>();
  const handleChange = (file: any) => {
    setFile(file);
  };
  return (
    //Usage refer to https://github.com/KarimMokhtar/react-drag-drop-files
    <FileUploader
      handleChange={handleChange}
      name="file"
      types={fileTypes}
      maxSize={50}
      children={
        <div className="panel panel-inner upload-zone p-4 d-flex align-items-center">
          <div className="me-4">
            <FontAwesomeIcon icon={faFileArrowUp} className="fs-1" />
          </div>
          <div>
            <p>
              {file ? (
                <>Audio_Filename.wav</>
              ) : (
                <>
                  <u>Upload</u> or drop a file right here
                </>
              )}
            </p>
            <div className="d-flex gap-1">
              <div>
                {file ? (
                  <p className="opacity-50">File size: 123KB</p>
                ) : (
                  <p className="opacity-50">No files uploaded yet</p>
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
