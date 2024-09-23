import { twMerge } from "tailwind-merge";
import { Transition } from "@headlessui/react";
import { LoadingBar } from "~/components/ui";
import { uiAccess } from "~/signals/uiAccess";

import { transitionTimingStyles } from "~/components/styles";

export const ContextualLoadingBar = () => {
  const { isShowing, position, width, ...rest } =
    uiAccess.loadingBar.signal.value;

  return (
    <Transition
      as="div"
      show={isShowing}
      className={twMerge(
        transitionTimingStyles,
        "fixed -translate-x-1/2 translate-y-5 data-[closed]:opacity-0",
      )}
      style={{
        top: position.y,
        left: position.x,
        width: width ? `${width}px` : undefined,
      }}
    >
      <LoadingBar {...rest} />
    </Transition>
  );
};
