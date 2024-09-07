import { Transition } from "@headlessui/react";
import { twMerge } from "tailwind-merge";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRotateLeft } from "@fortawesome/pro-solid-svg-icons";

export enum LoadingBarStatus {
  IDLE = "idle",
  LOADING = "loading",
  SUCCESS = "success",
  ERROR = "error",
}
export interface LoadingBarProps {
  width?: number;
  progress: number;
  status: LoadingBarStatus;
  isShowing: boolean;
  position?: {
    x: number;
    y: number;
  };
  message?: string;
  onRetry?: () => void;
}

export const LoadingBar = ({
  width,
  progress = 0,
  position,
  status,
  onRetry,
  isShowing,
  message,
}: LoadingBarProps) => {
  return (
    <Transition show={isShowing}>
      <div
        className={twMerge(
          // default styles
          "flex w-full flex-col gap-2",
          // position styles
          position && `fixed`,
          position && !width && `w-96`,
          // base transition properties
          "transition-opacity ease-in-out",
          // Shared closed styles
          "data-[closed]:opacity-0",
          // Entering styles
          "data-[enter]:duration-100",
          // Leaving styles
          "data-[leave]:duration-300",
        )}
        style={{
          left: position?.x,
          top: position?.y,
          width: width ? `${width}px` : undefined,
        }}
      >
        <div className="h-2.5 w-full rounded-full bg-gray-200">
          <div
            className={twMerge(
              "h-2.5 rounded-full bg-primary-500",
              status === LoadingBarStatus.LOADING && "animate-pulse",
            )}
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex grow items-center justify-center gap-2">
          {message && <label>{message}</label>}

          {status === LoadingBarStatus.ERROR && (
            <button
              onClick={onRetry}
              className="flex items-center gap-2 hover:text-primary"
            >
              <label className="cursor-pointer">Retry</label>
              <FontAwesomeIcon icon={faArrowRotateLeft} />
            </button>
          )}
        </div>
      </div>
    </Transition>
  );
};
