import {
  faFileArrowUp,
  faTrash,
  faWaveform,
} from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import { FileUploader } from "react-drag-drop-files";
import { InputVcAudioPlayer } from "v2/view/_common/InputVcAudioPlayer";
import { v4 as uuidv4 } from "uuid";
// import {
//   UploadAudio,
//   UploadAudioIsOk,
//   UploadAudioRequest,
// } from "@storyteller/components/src/api/upload/UploadAudio";
import useUploadedFiles from "hooks/useUploadedFiles";

import { UploadSample } from "@storyteller/components/src/api/voice_designer/voice_dataset_samples/UploadSample";

// import { DeleteSample } from "@storyteller/components/src/api/voice_designer/voice_dataset_samples/DeleteSample";

const FILE_TYPES = ["MP3", "WAV", "FLAC", "OGG"];

interface Props {
  datasetToken?: string,
  setMediaUploadToken: (token?: string) => void;
  formIsCleared: boolean;
  setFormIsCleared: (cleared: boolean) => void;
  setCanConvert: (canConvert: boolean) => void;
  setAudioSamplesReady: (ready: boolean) => void;
  changeConvertIdempotencyToken: () => void;
}

function VoiceDesignerUploadComponent({ changeConvertIdempotencyToken, datasetToken, setCanConvert, setFormIsCleared, setAudioSamplesReady }: Props) {
  const [isUploadDisabled, setIsUploadDisabled] = useState<boolean>(false);

  const files = useUploadedFiles((state: any) => state.files);
  const setFiles = useUploadedFiles((state: any) => state.setFiles);
  const audioLinks = useUploadedFiles((state: any) => state.audioLinks);
  const setAudioLinks = useUploadedFiles((state: any) => state.setAudioLinks);


  // Auto generated
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // const [idempotencyToken, setIdempotencyToken] = useState(uuidv4());

  const handleChange = (file: any) => {
    if (files.length < 20) {
      setFiles([...files, file]);
      const audioUrl = URL.createObjectURL(file);
      setAudioLinks([...audioLinks, audioUrl ?? ""]);

      UploadSample("",{
        dataset_token: datasetToken || "",
        file: file,
        uuid_idempotency_token: uuidv4(),
      })
      .then(res => {
        setAudioSamplesReady(true);
      });

      setFormIsCleared(false);
      setCanConvert(false);
      changeConvertIdempotencyToken();
      setIsUploadDisabled(false);
    }
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

  const getFileSize = (file: any) =>
    file && file.size >= 1024 * 1024
      ? (file.size / 1024 / 1024).toFixed(2) + " MB"
      : file
      ? `${Math.floor(file.size / 1024)} KB`
      : null;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const uploadBtnClass = isUploadDisabled
    ? "btn btn-uploaded w-100 disabled"
    : "btn btn-primary w-100";

  const handleRemoveFile = (index: number) => {
    const updatedFiles = [...files];
    updatedFiles.splice(index, 1);
    setFiles(updatedFiles);

    const updatedAudioLinks = [...audioLinks];
    updatedAudioLinks.splice(index, 1);
    setAudioLinks(updatedAudioLinks);
  };

  return (
    <div className="d-flex flex-column gap-3">
      {/* Usage refer to https://github.com/KarimMokhtar/react-drag-drop-files */}
      <FileUploader
        key={datasetToken || uuidv4()}
        handleChange={handleChange}
        name="file"
        types={FILE_TYPES}
        maxSize={50}
        children={
          <div
            className="panel panel-inner upload-zone d-flex align-items-center justify-content-center p-4"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="me-4">
              <FontAwesomeIcon icon={faFileArrowUp} className="upload-icon" />
            </div>
            <div>
              <div className="pb-0">
                <u className="fw-medium">Upload files</u> or drop them here...
              </div>
              <div className="d-flex gap-1">
                <div>
                  <p className="opacity-50">
                    {FILE_TYPES.join(", ").toString()} supported
                  </p>
                </div>
              </div>
            </div>
          </div>
        }
      />

      <h4 className="m-0 mt-3">
        Voice Samples <span className="opacity-75">({files.length}/20)</span>
      </h4>
      {files.length > 0 ? (
        <div className="d-flex flex-column gap-3">
          {files.map((file: any, index: any) => (
            <div key={index} className="panel panel-inner rounded p-3">
              <div className="d-flex flex-column gap-2">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1 mb-1">
                    {file.name}
                    <span className="file-size ms-2">{getFileSize(file)}</span>
                  </div>
                  <button
                    className="btn btn-link p-0"
                    onClick={() => handleRemoveFile(index)}
                  >
                    <FontAwesomeIcon icon={faTrash} className="me-2" />
                    Remove
                  </button>
                </div>

                <InputVcAudioPlayer filename={audioLinks[index]} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="panel panel-inner text-center p-5 rounded-5 h-100">
          <div className="d-flex flex-column opacity-75 h-100 justify-content-center">
            <FontAwesomeIcon icon={faWaveform} className="fs-3 mb-3" />
            <h5>No voice samples yet</h5>
            <p>Uploaded samples will appear here.</p>
          </div>
        </div>
      )}
    </div>
  );
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LoadingIcon: React.FC = () => {
  return (
    <>
      <span
        className="spinner-border spinner-border-sm ms-3"
        role="status"
        aria-hidden="true"
      ></span>
      <span className="visually-hidden">Loading...</span>
    </>
  );
};

export default VoiceDesignerUploadComponent;
