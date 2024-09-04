import { Transition } from "@headlessui/react";
import { twMerge } from "tailwind-merge";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faArrowRotateLeft,
  faStop,
} from "@fortawesome/pro-thin-svg-icons";

import { Spinner } from "./Spinner";

export enum LoadingBarStatus {
  IDLE = "idle",
  LOADING = "loading",
  SUCCESS = "success",
  ERROR = "error",
}
export type LoadingBarProps = {
  progress: number;
  status: LoadingBarStatus;
  isShowing: boolean;
  position?: {
    x: number;
    y: number;
  };
  message?: string;
  onRetry?: () => void;
};

export const LoadingBar = ({
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
          "flex w-full gap-2",
          // position styles
          position && `fixed w-96`,
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
        }}
      >
        <div className="relative flex-grow">
          <div className="h-2.5 w-full rounded-full bg-gray-200">
            <div
              className="h-2.5 rounded-full bg-primary-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          {message && (
            <label className="mt-2 block w-full text-center">{message}</label>
          )}
        </div>
        <div className="-mt-1.5">
          {status === LoadingBarStatus.IDLE && (
            <FontAwesomeIcon icon={faStop} />
          )}
          {status === LoadingBarStatus.LOADING && (
            <Spinner className="size-5" />
          )}
          {status === LoadingBarStatus.SUCCESS && (
            <FontAwesomeIcon icon={faCheck} />
          )}
          {status === LoadingBarStatus.ERROR && (
            <button onClick={onRetry}>
              <FontAwesomeIcon icon={faArrowRotateLeft} />
            </button>
          )}
        </div>
      </div>
    </Transition>
  );
};
