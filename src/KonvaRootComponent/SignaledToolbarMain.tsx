import { MouseEventHandler } from "react";

import { ToolbarMain } from "~/components/features";
import { toolbarMain } from "~/signals/uiAccess/toolbarMain";
import { dispatchers } from "~/signals/uiEvents/toolbarMain";
import { ToolbarMainButtonNames } from "~/components/features/ToolbarMain/enum";

export const SignaledToolbarMain = () => {
  const buttonProps = Object.values(ToolbarMainButtonNames).reduce(
    (acc, buttonName) => {
      acc[buttonName] = {
        disabled: toolbarMain.signal.value.buttonStates[buttonName].disabled,
        active: toolbarMain.signal.value.buttonStates[buttonName].active,
        onClick: dispatchers[buttonName],
      };
      return acc;
    },
    {} as {
      [key in ToolbarMainButtonNames]: {
        disabled: boolean;
        active: boolean;
        onClick: MouseEventHandler<HTMLButtonElement>;
      };
    },
  );
  return (
    <ToolbarMain
      disabled={toolbarMain.signal.value.disabled}
      buttonProps={buttonProps}
    />
  );
};
