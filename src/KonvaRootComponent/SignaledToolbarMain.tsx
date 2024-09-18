import { MouseEventHandler } from "react";
import { toolbarMain } from "~/signals/uiAccess/toolbarMain";
import { dispatchers } from "~/signals/uiEvents/toolbarMain";

import { ToolbarMain } from "~/components/features";
import { LoadingBar } from "~/components/ui";

import { ToolbarMainButtonNames } from "~/components/features/ToolbarMain/enum";

export const SignaledToolbarMain = ({
  openAddImage,
  openAddVideo,
  openAIStylize,
}: {
  openAddImage: () => void;
  openAddVideo: () => void;
  openAIStylize: () => void;
}) => {
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
    <div className="relative col-span-12 col-start-1 row-span-1 row-start-12">
      <div className="absolute left-0 right-0 mx-auto w-96 -translate-y-full items-end pb-4">
        <LoadingBar
          isShowing={loadingBar.isShowing}
          progress={loadingBar.progress}
          message={loadingBar.message}
          status={loadingBar.status}
          onRetry={handleOnClickRetry}
          colReverse
        />
      </div>
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
