import { useCallback, useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import {
  faBracketCurly,
  faBracketCurlyRight,
} from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { TrimmingPlaybarLoading } from "./TrimmerPlaybarLoading";
import { MAX_TRIM_DURATION } from "./constants";
import { buttonStyles, verticalPositionStyles } from "./utilities";
import { ProgressCursor } from "./ProgressCursor";

export const TrimmerPlaybarCore = ({
  vidEl,
  className,
}: {
  vidEl: HTMLVideoElement;
  className?: string;
}) => {
  const [states, setStates] = useState<{
    duration: number | undefined;
    currentTime: number | undefined;
    trimStartMs: number | undefined;
    trimEndMs: number | undefined;
  }>({
    duration: undefined,
    currentTime: undefined,
    trimStartMs: undefined,
    trimEndMs: undefined,
  });

  const { duration, currentTime, trimStartMs, trimEndMs } = states;

  const setTrimStartMs = useCallback((value: number) => {
    setStates((prev) => {
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
    setStates((prev) => {
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

  useEffect(() => {
    const handleLoadedmetadata = () => {
      setStates((prev) => ({
        ...prev,
        duration: vidEl.duration,
        currentTime: vidEl.currentTime,
        trimStartMs: 0,
        trimEndMs:
          vidEl.duration >= MAX_TRIM_DURATION
            ? MAX_TRIM_DURATION
            : vidEl.duration,
      }));
    };
    const handleTimeupdate = () => {
      setStates((prev) => ({
        ...prev,
        currentTime: vidEl.currentTime,
      }));
    };

    // DOM node referencs has changed and exists
    vidEl.addEventListener("loadedmetadata", handleLoadedmetadata);
    vidEl.addEventListener("timeupdate", handleTimeupdate);
    return () => {
      vidEl.removeEventListener("loadedmetadata", handleLoadedmetadata);
      vidEl.removeEventListener("timeupdate", handleTimeupdate);
    };
  }, [vidEl]);

  if (!duration) {
    return <TrimmingPlaybarLoading className={className} />;
  }
  return (
    <div
      className={twMerge("relative mx-4 h-10 w-full bg-gray-200", className)}
    >
      <ProgressCursor
        vidEl={vidEl}
        progress={((currentTime ?? 0) / (duration ?? 1)) * 100}
      />
      <div
        // trim start scrubber
        className={twMerge(
          verticalPositionStyles,
          buttonStyles,
          "flex h-10 w-4 -translate-x-full items-center justify-center",
        )}
        style={{ left: `${((trimStartMs ?? 0) / (duration ?? 1)) * 100}%` }}
      >
        <FontAwesomeIcon icon={faBracketCurly} />
      </div>
      <div
        // trim end scrubber
        className={twMerge(
          verticalPositionStyles,
          buttonStyles,
          "flex h-10 w-4 items-center justify-center",
        )}
        style={{ left: `${((trimEndMs ?? 0) / (duration ?? 1)) * 100}%` }}
      >
        <FontAwesomeIcon icon={faBracketCurlyRight} />
      </div>
    </div>
  );
};
