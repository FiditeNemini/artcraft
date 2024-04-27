import { useState, useEffect } from "react";
import { FileUploader } from "react-drag-drop-files";
import { v4 as uuidv4 } from "uuid";
import {
  faCheck,
  faCircleXmark,
  faFileArrowUp,
  faFileAudio,
  faSpinnerThird,
  faTrash,
} from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { UploadAudio, UploadAudioIsOk, UploadAudioRequest } from "./utilities";

import { Button } from "../Button";
import { P, WaveformPlayer } from "~/components";

const FILE_TYPES = ["MP3", "WAV", "FLAC", "OGG"];

interface Props {
  sessionToken: string;
  file?: File;
  onFileStaged?: (file:File)=>void;
  onClear?: ()=>void;
  onFileUploaded: (token:string)=>void
}

function UploadComponent({
  sessionToken,
  file: propsFile,
  onFileStaged,
  onClear,
  onFileUploaded,
}: Props) {

  const [{file, uploadState, uploadToken}, setState] = useState<{
    file: File | undefined;
    uploadState: "init"|"none"|"uploading"|"uploaded"|"error";
    uploadToken ?: string;
  }>({
    file: propsFile,
    uploadState: propsFile ? "none" : "init",
  });
  const audioUrl = file ? URL.createObjectURL(file) : "";

  const handleChange = (file:File) => {
    setState((curr)=>({
      ...curr,
      file: file,
      uploadState: "none",
    }));
  };

  const handleClear = () => {
    setState((curr) => ({
      ...curr,
      file: undefined,
      uploadState: "none",
      uploadToken: undefined,
    }));
  };

  const handleUploadFile = () => {
    if (file === undefined) return false;

    setState((curr) => ({ ...curr, uploadState: "uploading" }));
    const request: UploadAudioRequest = {
      uuid_idempotency_token: uuidv4(),
      file: file,
      source: "file",
    };

    UploadAudio(request, sessionToken).then((res) => {
      if (UploadAudioIsOk(res)) {
        setState((curr) => ({
          ...curr,
          uploadState: "uploaded",
          uploadToken: res.upload_token,
        }));
      } else {
        setState((curr) => ({
          ...curr,
          uploadState: "error",
          uploadToken: undefined,
        }));
      }
    });
  };

  useEffect(()=>{
    if(file && uploadState === "none" && onFileStaged) onFileStaged(file);
    if(!file && uploadState === "none" && onClear) onClear();
  }, [file, uploadState]);
  useEffect(() => {
    if (uploadState === "uploaded" && uploadToken) onFileUploaded(uploadToken);
  }, [uploadToken, uploadState]);

  return (
    <div className="flex flex-col gap-3">
      {/* Usage refer to https://github.com/KarimMokhtar/react-drag-drop-files */}
      <FileUploader
        handleChange={handleChange}
        name="file"
        types={FILE_TYPES}
        maxSize={50}
        children={<DragAndDropZone file={file} />}
      />

      {file && (
        <>
          <div className="rounded-lg border border-brand-secondary-700 p-3">
            <WaveformPlayer audio={audioUrl} />
          </div>
          <div className="flex justify-evenly gap-3">
            <Button
              className="grow"
              onClick={handleUploadFile}
              disabled={uploadState !== "none" && uploadState !== "error"}
              icon={
                uploadState === "uploaded"
                  ? faCheck
                  : uploadState === "error"
                    ? faCircleXmark
                    : faFileArrowUp
              }>
              {uploadState === "uploaded"
                ? "Uploaded"
                : uploadState === "error"
                  ? "Upload Error"
                  : "Upload Audio"}
              {uploadState === "uploading" && (
                <FontAwesomeIcon icon={faSpinnerThird} spin />
              )}
            </Button>

            <Button className="grow" onClick={handleClear} icon={faTrash}>
              Clear
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

const DragAndDropZone = ({ file }: { file: any }) => {
  const fileSize =
    file && file.size >= 1024 * 1024
      ? (file.size / 1024 / 1024).toFixed(2) + " MB"
      : file
        ? `${Math.floor(file.size / 1024)} KB`
        : null;

  if (!file) {
    return (
      <div className="flex cursor-pointer items-center gap-4 rounded-lg border-2 border-dashed border-brand-secondary-700 bg-brand-secondary p-3">
        <FontAwesomeIcon icon={faFileArrowUp} size="3x" />
        <div className="flex flex-col gap-1">
          <P className="font-medium">
            <u>Upload a file</u> or drop it here
          </P>
          <P className="opacity-50">
            {FILE_TYPES.join(", ").toString()} supported
          </P>
        </div>
      </div>
    );
  } else {
    return (
      <div className="flex cursor-pointer items-center gap-4 rounded-lg border-2 border-dashed border-brand-secondary-700 bg-brand-secondary p-3">
        <FontAwesomeIcon icon={faFileAudio} size="3x" />
        <div className="flex flex-col gap-1">
          <P className="font-medium">
            {file.name.slice(0, file.name.lastIndexOf("."))}
          </P>
          <P>
            <span className="opacity-50">
              {`${file.name.split(".").pop().toUpperCase()} file size: ${fileSize} `}
            </span>
            <u>Change File</u>
          </P>
        </div>
      </div>
    );
  }
};

export default UploadComponent;
