import { FileUploader } from "react-drag-drop-files";
import { Button } from "~/components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinnerThird } from "@fortawesome/pro-solid-svg-icons";
import { DragAndDropZone } from "./DragAndDropZone";
import { UploadMediaResponse } from "~/components/signaled/UploadAudioButtonDialogue/utilities";
import { useState } from "react";

enum UploadState {
  "init",
  "staged",
  "uploading",
  "uploaded",
  "error",
}

interface Props {
  title: string;
  fileTypes: string[];
  setToken?: (token: string) => void;
  uploadFile?: (file: File) => Promise<UploadMediaResponse>;
  file: File | null;
  setFile: (file: File | null) => void;
}

export const UploadFile = ({
  fileTypes,
  title,
  setToken,
  uploadFile,
  file,
  setFile,
}: Props) => {
  const [uploadState, setUploadState] = useState<UploadState>(UploadState.init);

  const submitUpload = (file: File | null) => {
    if (file && uploadFile) {
      setUploadState(UploadState.uploading);
      uploadFile(file).then((res: UploadMediaResponse) => {
        if ("media_file_token" in res) {
          setUploadState(UploadState.uploaded);
          setToken && setToken(res.media_file_token);
        } else {
          setUploadState(UploadState.error);
        }
      });
    }
  };

  return (
    <div className="flex w-full flex-col gap-3">
      {title}
      <FileUploader
        handleChange={(file: File | null) => {
          setFile(file);
          setUploadState(file ? UploadState.staged : UploadState.init);
        }}
        name="file"
        types={fileTypes}
        maxSize={50}
      >
        <DragAndDropZone file={file} fileTypes={fileTypes} />
      </FileUploader>
      {!!uploadFile && (
        <div className="flex justify-end gap-3">
          <Button
            onClick={() => submitUpload(file)}
            disabled={uploadState !== UploadState.staged}
          >
            Upload
            {uploadState === UploadState.uploading && (
              <FontAwesomeIcon icon={faSpinnerThird} spin />
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
