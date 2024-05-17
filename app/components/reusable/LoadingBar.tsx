import { useEffect, useRef, useState } from "react";
import { Transition } from "@headlessui/react";
import { twMerge } from "tailwind-merge";
import { loadingBarData, loadingBarIsShowing } from "~/signals/loadingBar";
import { useSignals } from "@preact/signals-react/runtime";

interface LoadingBarProps {
  id?: string;
  wrapperClassName?: string;
  innerWrapperClassName?: string;
  progressBackgroundClassName?: string;
  progressClassName?: string;
  variant?: string;
}
export const LoadingBar = ({
  wrapperClassName: propsWrapperClassName,
  innerWrapperClassName: propsInnerWrapperClassName,
  progressBackgroundClassName: propsProgressBackgroundClassName,
  progressClassName: propsProgressClassName,
  variant = "primary",
  ...rest
}: LoadingBarProps) => {
  useSignals();
  const [progress, setProgress] = useState<number>(
    loadingBarData.value.progress,
  );
  const [loop, setLoop] = useState<NodeJS.Timeout | null>(null);

  const useFakeTimer = useRef(0);
  if (useFakeTimer.current !== loadingBarData.value.useFakeTimer) {
    useFakeTimer.current = loadingBarData.value.useFakeTimer;
    if (loop) {
      clearInterval(loop);
    }
    if (loadingBarData.value.useFakeTimer > 0) {
      if (loadingBarData.value.useFakeTimer >= 30000) {
        // this math produce 96 cuts so the progress bar updates more
        setLoop(
          setInterval(
            function step() {
              setProgress((curr) => {
                if (curr < 96) {
                  return curr + 3;
                } else {
                  clearInterval(loop!);
                  return curr;
                }
              });
            },
            Math.round(loadingBarData.value.useFakeTimer / 96) * 3,
          ),
        );
      }
      // this math produce less cuts if useFakeTimer predicts
      // a shorter load time, shorter than 30s
      const progressPerInterval = loadingBarData.value.useFakeTimer / 500;
      setLoop(
        setInterval(function step() {
          setProgress((curr) => {
            if (curr + progressPerInterval < 96) {
              return curr + progressPerInterval;
            } else if (curr < 96 && curr + progressPerInterval >= 96) {
              return 96;
            } else {
              clearInterval(loop!);
              return curr;
            }
          });
        }, 300),
      );
    }
  }

  const oldProgress = useRef(loadingBarData.value.progress);
  if (oldProgress.current !== loadingBarData.value.progress) {
    oldProgress.current = loadingBarData.value.progress;
    setProgress(loadingBarData.value.progress);
  }

  function getVariantClassNames(variant: string) {
    switch (variant) {
      case "secondary": {
        return " bg-brand-secondary text-white ";
      }
      case "primary":
      default: {
        return " bg-brand-primary text-white ";
      }
    }
  }

  const wrapperClassName = twMerge(
    "w-full h-full relative bg-ui-background",
    propsWrapperClassName,
  );
  const innerWrapperClassName = twMerge(
    "w-full h-full p-4 gap-4 m-auto flex flex-col justify-center items-center",
    propsInnerWrapperClassName,
  );
  const progressBackgroundClassName = twMerge(
    "w-full bg-gray-500 rounded-full h-2.5",
    propsProgressBackgroundClassName,
  );
  const progressClassName = twMerge(
    "h-2.5 rounded-full transition-all duration-1000",
    getVariantClassNames(variant),
    propsProgressClassName,
  );

  return (
    <Transition
      className={wrapperClassName}
      show={loadingBarIsShowing.value}
      enter="transition-opacity duration-150"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity duration-1000"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
      {...rest}>
      <div className={innerWrapperClassName}>
        {loadingBarData.value.label && (
          <label>{loadingBarData.value.label}</label>
        )}
        <div className={progressBackgroundClassName}>
          <div
            className={progressClassName}
            style={{ width: progress + "%" }}
          />
        </div>
        {loadingBarData.value.message && <p>{loadingBarData.value.message}</p>}
      </div>
    </Transition>
  );
};
