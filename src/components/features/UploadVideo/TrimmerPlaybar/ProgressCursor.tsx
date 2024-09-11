import { useCallback, useState } from "react";
import { twMerge } from "tailwind-merge";

import {
  makePositionCalculator,
  buttonStyles,
  verticalPositionStyles,
} from "./utilities";

export const ProgressCursor = ({
  progress,
  vidEl,
}: {
  progress: number;
  vidEl: HTMLVideoElement;
}) => {
  const [state, setState] = useState<{
    isScrubbing: boolean;
    scrubbingPosition: number;
  }>({
    isScrubbing: false,
    scrubbingPosition: 0,
  });

  const { isScrubbing, scrubbingPosition } = state;

  const handleScrubbingCurrentTime = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      e.preventDefault();

      const calcPosition = makePositionCalculator(e);
      const wasPlaying = !vidEl.paused;
      if (wasPlaying) {
        vidEl.pause();
      }

      setState({
        isScrubbing: true,
        scrubbingPosition: calcPosition(e),
      });

      const handleMouseMove = (e: MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        const newPosition = calcPosition(e);
        vidEl.currentTime = (newPosition / 100) * vidEl.duration;
        setState({
          isScrubbing: true,
          scrubbingPosition: newPosition,
        });
      };
      const handleMouseUp = () => {
        setState((prev) => {
          if (wasPlaying) {
            vidEl.play();
          }
          return {
            ...prev,
            isScrubbing: false,
          };
        });

        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    },
    [vidEl],
  );

  return (
    <>
      <div
        // play progress bar
        className="mt-3 h-4 bg-primary-500"
        style={{
          width: isScrubbing ? `${scrubbingPosition}%` : `${progress}%`,
        }}
      />
      <div
        // current time scrubber
        className={twMerge(
          verticalPositionStyles,
          buttonStyles,
          "size-5 -translate-x-1/2 rounded-full",
          isScrubbing && "cursor-grabbing",
        )}
        onMouseDown={handleScrubbingCurrentTime}
        style={{ left: isScrubbing ? `${scrubbingPosition}%` : `${progress}%` }}
      />
    </>
  );
};
