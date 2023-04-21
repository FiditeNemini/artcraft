import { faFileArrowUp, faFileAudio } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import { FileUploader } from "react-drag-drop-files";
import { InputVcAudioPlayer } from "../../../../_common/InputVcAudioPlayer";
import { v4 as uuidv4 } from "uuid";
import { UploadMedia, UploadMediaIsOk, UploadMediaRequest } from "@storyteller/components/src/api/upload/UploadMedia";

const fileTypes = ["MP3", "WAV", "FLAC"];

function UploadComponent() {
  const [file, setFile] = useState<any>(undefined);
  const [audioLink, setAudioLink] = useState<string>();
  const [isUploadDisabled, setIsUploadDisabled] = useState<boolean>(false);

  // Auto generated
  const [idempotencyToken, setIdempotencyToken] = useState(uuidv4());

  const handleChange = (file: any) => {
    setFile(file);
    setIdempotencyToken(uuidv4());
    const audioUrl = URL.createObjectURL(file);
    setAudioLink(audioUrl ?? "");
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

  const handleUploadFile = async () => {
    if (file === undefined) {
      return false;
    }

    const request : UploadMediaRequest = {
      uuid_idempotency_token: idempotencyToken,
      file: file,
    }

    let result = await UploadMedia(request);

    if (UploadMediaIsOk(result)) {
      setIsUploadDisabled(true);
    }
  };

  const fileSize =
    file && file.size >= 1024 * 1024
      ? (file.size / 1024 / 1024).toFixed(2) + " MB"
      : file
      ? `${Math.floor(file.size / 1024)} KB`
      : null;

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
          <InputVcAudioPlayer filename={audioLink as string} />
        </div>
      ) : (
        <></>
      )}
      {/*file ? (
        <div className="d-flex mb-4 mb-lg-3">
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
      )*/}

      {file ? (
        <div className="d-flex gap-3">
          <button
            className="btn btn-primary w-100"
            onClick={() => { handleUploadFile(); }}
            type="submit"
            disabled={isUploadDisabled}
          >
            <FontAwesomeIcon
              icon={faFileArrowUp}
              className="me-2"
            />
            Upload Audio
          </button>
        </div>
      ) : (
        <></>
      )}

    </div>
  );
}

export default UploadComponent;
