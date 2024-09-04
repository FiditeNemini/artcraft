import { Transition } from "@headlessui/react";
import { twMerge } from "tailwind-merge";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faArrowRotateLeft } from "@fortawesome/pro-thin-svg-icons";

import { Spinner } from "./Spinner";

export enum LoadingBarStatus {
  LOADING = "loading",
  SUCCESS = "success",
  ERROR = "error",
}

export const LoadingBar = ({
  progress = 0,
  status = LoadingBarStatus.SUCCESS,
  onRetry,
  isShowing,
  message,
}: {
  progress: number;
  status: LoadingBarStatus;
  isShowing: boolean;
  message?: string;
  onRetry?: () => void;
}) => {
  return (
    <Transition show={isShowing}>
      <div
        className={twMerge(
          // default styles
          "flex flex-col items-center gap-2",
          // base transition properties
          "transition-opacity ease-in-out",
          // Shared closed styles
          "data-[closed]:opacity-0",
          // Entering styles
          "data-[enter]:duration-100",
          // Leaving styles
          "data-[leave]:duration-300",
        )}
      >
        <div className="flex w-full items-center gap-2">
          <div className="bg-gray-200 h-2.5 flex-grow rounded-full">
            <div
              className="h-2.5 rounded-full bg-primary-500"
              style={{ width: `${progress}%` }}
            />
          </div>
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
        {message && <label>{message}</label>}
      </div>
    </Transition>
  );
};
