import { useSignals } from "@preact/signals-react/runtime";
import { Transition } from "@headlessui/react";
import { twMerge } from "tailwind-merge";

import { ToolbarImage } from "../ToolbarImage";
import { imageToolbar } from "~/signals/konvaContextuals";
import { transitionTimingStyles } from "~/components/styles";

export const ContextualToolbarImage = () => {
  useSignals();

  const { isShowing, ...rest } = imageToolbar.signal.value;

  return (
    <Transition show={isShowing}>
      <div
        className={twMerge(transitionTimingStyles, "data-[closed]:opacity-0")}
      >
        <ToolbarImage {...rest} />
      </div>
    </Transition>
  );
};
