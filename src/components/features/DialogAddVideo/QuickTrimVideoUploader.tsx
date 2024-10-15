import { useCallback, useState, useRef } from "react";
import { signal, Signal } from "@preact/signals-react";

import { FileUploader } from "../FileUploader";
import { VideoControls } from "./VideoControls";
import { TrimmerPlaybar, TrimData } from "./TrimmerPlaybar";

import { VIDEO_FILE_TYPE } from "~/constants/fileTypeEnums";
import { twMerge } from "tailwind-merge";

export type { TrimData };

export const QuickTrimVideoUploader = ({
  file,
  onFileStaged,
  onTrimChange,
  trimDataSignal,
}: {
  file: File | null;
  onFileStaged: (newFile: File | null) => void;
  onTrimChange: (trimData: TrimData) => void;
  trimDataSignal: Signal<TrimData | undefined>;
}) => {
  const [vidEl, setVidEl] = useState<HTMLVideoElement | undefined>(undefined);
  const videoRefCallback = useCallback(
    (node: HTMLVideoElement) => {
      if (node !== null) {
        // DOM node referenced by ref has changed and exists
        setVidEl(node);
      }
    },
    [
      // No Dependency !
    ],
  ); //END videoRefCallback\

  return (
    <div
      className={twMerge(
        "flex flex-col rounded-lg border-2 border-dashed border-ui-border bg-gray-100",
        file ? "h-fit" : "h-full items-center justify-center",
      )}
    >
      <FileUploader
        title=""
        fileTypes={Object.values(VIDEO_FILE_TYPE)}
        file={file}
        setFile={async (file: File | null) => {
          onFileStaged(file);
        }}
      />
      {file && (
        <>
          <div
            className="relative w-full bg-black"
            style={{ height: "calc(100vh - 500px)" }}
          >
            <video
              className="max-w-8/12 mx-auto max-h-full w-full"
              ref={videoRefCallback}
              src={URL.createObjectURL(file)}
            />
          </div>
          <div className="my-1 flex w-full items-center justify-center gap-2 bg-gray-100">
            <VideoControls
              className="w-fit"
              vidEl={vidEl}
              trimDataSignal={trimDataSignal}
            />
            <TrimmerPlaybar
              trimDataSignal={trimDataSignal}
              vidEl={vidEl}
              className="grow"
              onTrimChange={onTrimChange}
            />
          </div>
        </>
      )}
    </div>
  );
};
