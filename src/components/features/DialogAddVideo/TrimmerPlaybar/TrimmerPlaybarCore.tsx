import { useCallback, useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import {
  faBracketCurly,
  faBracketCurlyRight,
} from "@fortawesome/pro-solid-svg-icons";

import { MAX_TRIM_DURATION } from "./utilities";

import { TrimmingPlaybarLoading } from "./TrimmerPlaybarLoading";
import { PlayProgressCursor } from "./PlayProgressCursor";
import { TrimScrubber } from "./TrimScrubber";
import { TrimData } from "./utilities";

export const TrimmerPlaybarCore = ({
  vidEl,
  className,
  onTrimChange,
}: {
  vidEl: HTMLVideoElement;
  className?: string;
  onTrimChange: (trimData: TrimData) => void;
}) => {
  const [states, setStates] = useState<{
    durationMs: number | undefined;
    currentTimeMs: number | undefined;
    trimStartMs: number | undefined;
    trimEndMs: number | undefined;
  }>({
    durationMs: undefined,
    currentTimeMs: undefined,
    trimStartMs: undefined,
    trimEndMs: undefined,
  });

  const { durationMs, currentTimeMs, trimStartMs, trimEndMs } = states;

  const setTrimStartMs = useCallback((newTrimMs: number) => {
    setStates((prev) => {
      if (prev.trimEndMs === undefined) {
        if (import.meta.env.DEV) {
          console.warn("Logical Error in Trim Start Setting");
        }
        return prev;
      }
      return {
        ...prev,
        trimStartMs: newTrimMs,
        trimEndMs:
          prev.trimEndMs - newTrimMs >= MAX_TRIM_DURATION
            ? newTrimMs + MAX_TRIM_DURATION
            : prev.trimEndMs,
      };
    });
  }, []);
  const setTrimEndMs = useCallback((newTrimMs: number) => {
    setStates((prev) => {
      if (prev.trimStartMs === undefined) {
        if (import.meta.env.DEV) {
          console.warn("Logical Error in Trim End Setting");
        }
        return prev;
      }
      return {
        ...prev,
        trimEndMs: newTrimMs,
        trimStartMs:
          newTrimMs - prev.trimStartMs >= MAX_TRIM_DURATION
            ? newTrimMs - MAX_TRIM_DURATION
            : prev.trimStartMs,
      };
    });
  }, []);

  useEffect(() => {
    if (trimStartMs !== undefined && trimEndMs !== undefined) {
      onTrimChange({ trimStartMs, trimEndMs });
    }
  }, [trimStartMs, trimEndMs]);

  useEffect(() => {
    const handleLoadedmetadata = () => {
      setStates((prev) => ({
        ...prev,
        durationMs: vidEl.duration * 1000,
        currentTimeMs: vidEl.currentTime * 1000,
        trimStartMs: 0,
        trimEndMs:
          vidEl.duration * 1000 >= MAX_TRIM_DURATION
            ? MAX_TRIM_DURATION
            : vidEl.duration * 1000,
      }));
    };
    const handleTimeupdate = () => {
      setStates((prev) => ({
        ...prev,
        currentTimeMs: vidEl.currentTime * 1000,
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

  if (
    durationMs === undefined ||
    currentTimeMs === undefined ||
    trimEndMs === undefined ||
    trimStartMs === undefined
  ) {
    return <TrimmingPlaybarLoading className={className} />;
  }

  return (
    <div
      className={twMerge(
        "relative mx-4 h-10 w-full border-l border-r border-dotted border-l-ui-border border-r-ui-border",
        className,
      )}
    >
      <div className="mt-3 h-4 w-full bg-secondary-300" />
      <PlayProgressCursor
        vidEl={vidEl}
        currentTimePercent={(currentTimeMs / durationMs) * 100}
      />
      <TrimScrubber
        // trim start scrubber
        icon={faBracketCurly}
        className="-translate-x-full"
        trimPosMs={trimStartMs}
        maxTrimPosMs={trimEndMs}
        minTrimPosMs={0}
        totalDurationMs={durationMs}
        onChange={setTrimStartMs}
      />
      <TrimScrubber
        // trim end scrubber
        icon={faBracketCurlyRight}
        trimPosMs={trimEndMs}
        maxTrimPosMs={durationMs}
        minTrimPosMs={trimStartMs}
        totalDurationMs={durationMs}
        onChange={setTrimEndMs}
      />
    </div>
  );
};
