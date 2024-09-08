import { MouseEventHandler } from "react";
import { Transition } from "@headlessui/react";
import { twMerge } from "tailwind-merge";

import { ToolbarImage } from "~/components/features/ToolbarImage";
import { uiAccess } from "~/signals/uiAccess";
import { dispatchUiEvents } from "~/signals/uiEvents";

import { ToolbarImageButtonNames } from "~/components/features/ToolbarImage/enums";
import { transitionTimingStyles } from "~/components/styles";

export const ContextualToolbarImage = () => {
  const { isShowing, position, ...rest } = uiAccess.imageToolbar.signal.value;
  const buttonsProps = Object.values(ToolbarImageButtonNames).reduce(
    (acc, buttonName) => {
      acc[buttonName] = {
        onClick: dispatchUiEvents.imageToolbar[buttonName],
        disabled:
          uiAccess.imageToolbar.signal.value.buttonStates[buttonName].disabled,
        active:
          uiAccess.imageToolbar.signal.value.buttonStates[buttonName].active,
      };
      return acc;
    },
    {} as {
      [key in ToolbarImageButtonNames]: {
        onClick: MouseEventHandler<HTMLButtonElement>;
        disabled: boolean;
        active: boolean;
      };
    },
  );
  return (
    <Transition show={isShowing}>
      <div
        className={twMerge(
          transitionTimingStyles,
          "fixed data-[closed]:opacity-0",
        )}
        style={{
          top: position.y,
          left: position.x,
        }}
      >
        <ToolbarImage {...rest} buttonsProps={buttonsProps} />
      </div>
    </Transition>
  );
};
