import { useCallback, useState } from "react";

import { VideoControls } from "./VideoControls";
import { TrimmerPlaybar, TrimData } from "./TrimmerPlaybar";
export type { TrimData };
export const QuickTrimVideoPlayer = ({
  file,
  onTrimChange,
}: {
  file: File;
  onTrimChange: (trimData: TrimData) => void;
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
      <div className="flex items-center justify-center bg-gray-100">
        <VideoControls vidEl={vidEl} className="w-fit" />
        <TrimmerPlaybar
          vidEl={vidEl}
          className="grow"
          onTrimChange={onTrimChange}
        />
      </div>
    </>
  );
};
