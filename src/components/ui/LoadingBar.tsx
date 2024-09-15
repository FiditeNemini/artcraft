import { MouseEventHandler } from "react";
import { Transition } from "@headlessui/react";
import { twMerge } from "tailwind-merge";

import { faArrowRightRotate } from "@fortawesome/pro-solid-svg-icons";

import { Button } from "./Button";

export enum LoadingBarStatus {
  IDLE = "idle",
  LOADING = "loading",
  SUCCESS = "success",
  ERROR = "error",
}
export interface LoadingBarProps {
  width?: number;
  colReverse?: boolean;
  progress: number;
  status: LoadingBarStatus;
  isShowing: boolean;
  position?: {
    x: number;
    y: number;
  };
  message?: string;
  onRetry?: MouseEventHandler<HTMLButtonElement>;
}

export const LoadingBar = ({
  colReverse,
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
          colReverse && "flex-col-reverse",
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
            <Button
              icon={faArrowRightRotate}
              onClick={onRetry}
              className="flex items-center gap-2 hover:text-primary"
            >
              <label className="cursor-pointer">Retry</label>
            </Button>
          )}
        </div>
      </div>
    </Transition>
  );
};
