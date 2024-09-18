import { useCallback, useState } from "react";
import { Signal } from "@preact/signals-react";

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
  trimData,
}: {
  file: File | null;
  onFileStaged: (newFile: File | null) => void;
  onTrimChange: (trimData: TrimData) => void;
  trimData?: Signal<TrimData | undefined>;
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
          <div className="flex w-full items-center justify-center bg-gray-100">
            <VideoControls vidEl={vidEl} className="w-fit" />
            <TrimmerPlaybar
              trimData={trimData?.value}
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
