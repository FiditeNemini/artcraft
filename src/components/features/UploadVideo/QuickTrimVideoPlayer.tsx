import { useCallback, useState } from "react";

import { VideoControls } from "./VideoControls";
import { TrimmerPlaybar } from "./TrimmerPlaybar";

export const QuickTrimVideoPlayer = ({ file }: { file: File }) => {
  // const [trimData, setTrimData] = useState<{
  //   videoDuration: number | undefined;
  //   trimStartMs: number | undefined;
  //   trimEndMs: number | undefined;
  // }>({
  //   videoDuration: undefined,
  //   trimStartMs: undefined,
  //   trimEndMs: undefined,
  // });
  const [vidEl, setVidEl] = useState<HTMLVideoElement | undefined>(undefined);

  // const videoRef = useRef<HTMLVideoElement | undefined>(undefined);

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
      <div className="flex items-center justify-center">
        <VideoControls vidEl={vidEl} className="w-fit" />
        <TrimmerPlaybar vidEl={vidEl} className="grow" />
      </div>
    </>
  );
};
