import { MouseEventHandler } from "react";
import { Transition } from "@headlessui/react";
import { twMerge } from "tailwind-merge";

import { uiAccess } from "~/signals/uiAccess";
import { dispatchUiEvents } from "~/signals/uiEvents";

import { ToolbarNode } from "~/components/features/ToolbarNode";
import { ToolbarNodeButtonNames } from "~/components/features/ToolbarNode/enums";
import { transitionTimingStyles } from "~/components/styles";

export const ContextualToolbarNode = () => {
  const { isShowing, position, ...rest } = uiAccess.toolbarNode.signal.value;
  const buttonsProps = Object.values(ToolbarNodeButtonNames).reduce(
    (acc, buttonName) => {
      acc[buttonName] = {
        onClick: dispatchUiEvents.toolbarNode[buttonName],
        disabled:
          uiAccess.toolbarNode.signal.value.buttonStates[buttonName].disabled,
        active:
          uiAccess.toolbarNode.signal.value.buttonStates[buttonName].active,
      };
      return acc;
    },
    {} as {
      [key in ToolbarNodeButtonNames]: {
        onClick: MouseEventHandler<HTMLButtonElement>;
        disabled: boolean;
        active: boolean;
      };
    },
  );
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
      }}
    >
      <ToolbarNode
        {...rest}
        buttonsProps={buttonsProps}
        locked={uiAccess.toolbarNode.signal.value.locked}
        onLockClicked={(e) => {
          dispatchUiEvents.toolbarNode.lock(e);
        }}
      />
    </Transition>
  );
};
