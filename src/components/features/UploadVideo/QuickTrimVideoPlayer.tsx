import { useCallback, useMemo, useRef, useState } from "react";

import { VIDEO_STATE_STATUSES } from "./VideoPlaybar/enum";
import { VideoPlaybar } from "./VideoPlaybar";

const MAX_TRIM_DURATION = 6000;

export const QuickTrimVideoPlayer = ({ file }: { file: File }) => {
  const [trimData, setTrimData] = useState<{
    videoDuration: number | undefined;
    trimStartMs: number | undefined;
    trimEndMs: number | undefined;
  }>({
    videoDuration: undefined,
    trimStartMs: undefined,
    trimEndMs: undefined,
  });

  const videoState = useMemo(() => {
    if (trimData.videoDuration) {
      return VIDEO_STATE_STATUSES.METADATA_LOADED;
    }
    return VIDEO_STATE_STATUSES.INIT;
  }, [trimData.videoDuration]);
  // const { trimStartMs, trimEndMs } = trimData;

  const setTrimStartMs = useCallback((value: number) => {
    setTrimData((prev) => {
      if (!prev.trimEndMs || value > prev.trimEndMs) {
        return prev;
      }
      if (value > prev.trimEndMs) {
        return { ...prev, trimStartMs: prev.trimEndMs - 1 };
      }
      if (prev.trimEndMs - value >= MAX_TRIM_DURATION) {
        return { ...prev, trimStartMs: prev.trimEndMs - MAX_TRIM_DURATION };
      }
      return { ...prev, trimStartMs: value };
    });
  }, []);
  const setTrimEndMs = useCallback((value: number) => {
    setTrimData((prev) => {
      if (!prev.trimStartMs) {
        return prev;
      }
      if (value < prev.trimStartMs) {
        return { ...prev, trimEndMs: prev.trimStartMs + 1 };
      }
      if (value - prev.trimStartMs >= MAX_TRIM_DURATION) {
        return { ...prev, trimEndMs: prev.trimStartMs + MAX_TRIM_DURATION };
      }
      return { ...prev, trimEndMs: value };
    });
  }, []);

  const videoRef = useRef<HTMLVideoElement | undefined>(undefined);

  const videoRefCallback = useCallback(
    (node: HTMLVideoElement) => {
      const handleLoadedmetadata = () => {
        node.removeEventListener("loadedmetadata", handleLoadedmetadata);
        setTrimData({
          trimStartMs: 0,
          trimEndMs: (node.duration ?? 0 >= 6000) ? 6000 : node.duration,
          videoDuration: node.duration ?? 0,
        });
      };
      if (node !== null) {
        // DOM node referenced by ref has changed and exists
        videoRef.current = node;
        node.addEventListener("loadedmetadata", handleLoadedmetadata);
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
          // className="border border-dashed border-white"
        />
      </div>
      <VideoPlaybar status={videoState} vidEl={videoRef.current} />
    </>
  );
};
