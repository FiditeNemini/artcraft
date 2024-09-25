import { MouseEventHandler } from "react";
import { useSignalEffect } from "@preact/signals-react";
import { Transition } from "@headlessui/react";
import { toolbarMain } from "~/signals/uiAccess/toolbarMain";
import { dispatchers } from "~/signals/uiEvents/toolbarMain";

import { ToolbarMain } from "~/components/features";
import { LoadingBar } from "~/components/ui";

import { ToolbarMainButtonNames } from "~/components/features/ToolbarMain/enum";
import { LayoutSignalType } from "./contextSignals/layout";

export const SignaledToolbarMain = ({
  layoutSignal,
  openAddImage,
  openAddVideo,
  openAIStylize,
}: {
  layoutSignal: LayoutSignalType;
  openAddImage: () => void;
  openAddVideo: () => void;
  openAIStylize: () => void;
}) => {
  //// for testing
  const { isMobile } = layoutSignal;
  useSignalEffect(() => {
    if (import.meta.env.DEV) {
      console.log(
        "Orientation Changed >> ",
        `current orientation: ${isMobile.value ? "mobile" : "desktop"}`,
      );
    }
  });
  /// end for testing

  const loadingBar = toolbarMain.loadingBar.signal.value;
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

  const handleOnClickRetry = (e: React.MouseEvent<HTMLButtonElement>) => {
    dispatchers.loadingBarRetry(e);
  };
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2">
      <Transition
        as="div"
        className="absolute left-0 right-0 mx-auto w-96 -translate-y-full items-end pb-4"
        show={loadingBar.isShowing}
      >
        <LoadingBar
          progress={loadingBar.progress}
          message={loadingBar.message}
          status={loadingBar.status}
          onRetry={handleOnClickRetry}
          colReverse
        />
      </Transition>

      <ToolbarMain
        disabled={toolbarMain.signal.value.disabled}
        buttonProps={buttonProps}
        openAddImage={() => openAddImage()}
        openAddVideo={() => openAddVideo()}
        openAIStylize={() => openAIStylize()}
      />
    </div>
  );
};
