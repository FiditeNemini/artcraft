import { useCallback, useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import {
  faBracketCurly,
  faBracketCurlyRight,
} from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const MAX_TRIM_DURATION = 6000;

export const TrimmerPlaybar = ({
  vidEl,
  className,
}: {
  vidEl: HTMLVideoElement | undefined;
  className?: string;
}) => {
  if (!vidEl) {
    return <TrimmingPlaybarLoading />;
  }
  return <TrimmerPlaybarCore vidEl={vidEl} className={className} />;
};
const TrimmingPlaybarLoading = ({ className }: { className?: string }) => {
  return (
    <div className={twMerge("relative h-10 w-full bg-gray-200", className)}>
      <div
        // dummy play progress bar
        className="mt-3 h-4 w-full animate-pulse bg-secondary-500"
      />
    </div>
  );
};

const TrimmerPlaybarCore = ({
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

  const handleScrubbingCurrentTime = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      e.preventDefault();
      const wasPlaying = !vidEl.paused;
      if (wasPlaying) {
        vidEl.pause();
      }

      const startX = e.clientX;
      const handleMouseMove = (e: MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        // const width = (e.target as HTMLDivElement).getBoundingClientRect()
        //   .width;
        // const deltaX = e.clientX - startX;
        // const newCurrentTime =
        //   (currentTime ?? 0) + (deltaX / width) * (duration ?? 1);
        // vidEl.currentTime = newCurrentTime;
      };
      const handleMouseUp = () => {
        if (wasPlaying) {
          vidEl.play();
        }
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    },
    [vidEl],
  );

  const buttonStyles = "border border-ui-border bg-ui-panel cursor-grab";
  const verticalPositionStyles = "absolute top-1/2 -translate-y-1/2";

  if (!duration) {
    return <TrimmingPlaybarLoading className={className} />;
  }
  return (
    <div
      className={twMerge("relative mx-4 h-10 w-full bg-gray-200", className)}
    >
      <div
        // play progress bar
        className="mt-3 h-4 bg-primary-500"
        style={{ width: `${((currentTime ?? 0) / (duration ?? 1)) * 100}%` }}
      />
      <div
        // current time scrubber
        className={twMerge(
          verticalPositionStyles,
          buttonStyles,
          "size-5 -translate-x-1/2 rounded-full",
        )}
        onMouseDown={handleScrubbingCurrentTime}
        style={{ left: `${((currentTime ?? 0) / (duration ?? 1)) * 100}%` }}
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
