import { useContext, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  faCirclePlus,
  faFileArrowUp,
  faFileAudio,
  faSpinnerThird,
} from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FileUploader } from "react-drag-drop-files";

import { TransitionDialogue } from "../TransitionDialogue"

import { Button } from "../Button";
import { H2, P } from "../Typography";
import { WaveformPlayer } from "../WaveformPlayer";

import { AuthenticationContext } from "~/contexts/Authentication";
import { UploadMedia, UploadMediaResponse } from "./utilities";

// import { ListDropdown } from "../ListDropdown";
// const visiblityOpts = [
//   {
//     name: "private",
//     value: "private",
//   },
//   {
//     name: "public",
//     value: "public",
//   },
// ];
const FILE_TYPES = ["MP3", "WAV", "FLAC", "OGG"];

type ComponentState = {
  isOpen: boolean;
  file: File | undefined;
  audioUrl: string;
  uploadState: "init" | "staged" | "uploading" | "uploaded" | "error";
  visibility: string|undefined;
  fileToken: string|undefined;
}
const initialValues:ComponentState = {
  isOpen: false,
  file: undefined,
  audioUrl: "",
  uploadState: "init",
  visibility: undefined,
  fileToken: undefined,
}
export const UploadAudioButtonDiagloue = ({
  onUploaded,
}:{
  onUploaded: (fileToken:string)=>void;
}) => {
  const { authState } = useContext(AuthenticationContext);
  const [{isOpen, file, audioUrl, uploadState, fileToken}, setState] = useState<ComponentState>(initialValues);

  const closeModal = () => setState(initialValues);
  const openModal = () => setState((curr)=>({...curr, isOpen:true}));
  const selectVisibility = (value:string) => {
    setState((curr)=>({...curr, visibility:value}))
  };
  const handleFileChange = (file: File) => {
    setState((curr) => ({
      ...curr,
      file: file,
      audioUrl: URL.createObjectURL(file),
      uploadState: "staged",
    }));
  };
  const handleClear = ()=>{
    setState({
      ...initialValues,
      isOpen: true,
    });
  }
  const submitUpload = ()=>{
    if(file && authState && authState.sessionToken){
      setState((curr)=>({
        ...curr,
        uploadState: "uploading"
      }))
      UploadMedia({
        uuid_idempotency_token: uuidv4(),
        file: file,
        source: "file",
      }, authState.sessionToken)
      .then((res: UploadMediaResponse) => {
        // console.log(res);
        if ("media_file_token" in res) {
          setState((curr)=>({
            ...curr,
            uploadState: "uploaded",
            fileToken: res.media_file_token,
          }));
        }else{
          setState((curr)=>({
            ...curr,
            uploadState: "error"
          }));
        }
      });
    }
  };
  useEffect(()=>{
    if(fileToken){
      onUploaded(fileToken);
    }
  },[fileToken])
  return(
    <>
      <Button
        className="grow py-3 text-sm font-medium"
        variant="action"
        icon={faCirclePlus}
        type="button"
        onClick={openModal}
      >
        Upload Audio
      </Button>
      <TransitionDialogue
        isOpen={isOpen}
        onClose={closeModal}
        title={<H2>Upload Audio</H2>}
      >
        <div className="w-full flex flex-col gap-3">
          <FileUploader
            handleChange={handleFileChange}
            name="file"
            types={FILE_TYPES}
            maxSize={50}
            children={<DragAndDropZone file={file}/>}
          />
          {file && (
            <div className="flex items-center gap-3 rounded-lg bg-brand-secondary p-3">
              <div className="grow">
                <WaveformPlayer audio={audioUrl} hasPlayButton/>
              </div>
            </div>
          )}
          {/* <ListDropdown list={visiblityOpts} onSelect={selectVisibility}/> */}
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            {uploadState !== "uploaded" &&
              <Button
                onClick={submitUpload}
                disabled={uploadState!=="staged"}
              >
                Upload
                {uploadState === "uploading" && (
                  <FontAwesomeIcon icon={faSpinnerThird} spin />
                )}
              </Button>
            }
            {uploadState === "uploaded" && 
              <Button onClick={handleClear}>
                Upload Another
              </Button>
            }
          </div>
        </div>
      </TransitionDialogue>
    </>
  );
}

const DragAndDropZone = ({
  file,
}: {
  file: File | undefined;
}) => {
  const fileSize =
    file && file.size >= 1024 * 1024
      ? (file.size / 1024 / 1024).toFixed(2) + " MB"
      : file
        ? `${Math.floor(file.size / 1024)} KB`
        : null;

  const fileName = 
    file && file.name
    ? file.name.split(".")[0].toUpperCase()
    : "";

  if (!file) {
    return (
      <div className="flex cursor-pointer items-center gap-3.5 rounded-lg border-2 border-dashed border-ui-controls-button/50 bg-brand-secondary p-3">
        <FontAwesomeIcon icon={faFileArrowUp} className="text-4xl" />
        <div className="flex flex-col gap-0">
          <P className="font-medium">
            <u>Upload a file</u> or drop it here
          </P>
          <P className="flex items-center gap-2 text-sm font-normal opacity-50">
            {FILE_TYPES.join(", ").toString()} supported
          </P>
        </div>
      </div>
    );
  } else {
    return (
      <div className="flex cursor-pointer items-center gap-3.5 rounded-lg border-2 border-dashed border-ui-controls-button/50 bg-brand-secondary p-3 justify-between">
        <FontAwesomeIcon icon={faFileAudio} className="text-4xl" />
        <div className="grow flex flex-col gap-0">
          <P className="font-medium">
            {file.name.slice(0, file.name.lastIndexOf("."))}
          </P>
          <P className="flex items-center gap-2 text-sm font-normal">
            <span className="opacity-50">
              {`${fileName} file size: ${fileSize} `}
            </span>
            <u className="transition-all hover:text-white/80">Change File</u>
          </P>
        </div>
      </div>
    );
  }
};