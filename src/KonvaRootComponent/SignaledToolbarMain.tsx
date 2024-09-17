import { MouseEventHandler, useCallback, useState } from "react";

import { toolbarMain } from "~/signals/uiAccess/toolbarMain";
import { dispatchers } from "~/signals/uiEvents/toolbarMain";
import { dispatchUiEvents } from "~/signals";

import {
  ToolbarMain,
  DialogAddImage,
  DialogAddVideo,
  DialogAiStylize,
} from "~/components/features";
import { LoadingBar } from "~/components/ui";

import { ToolbarMainButtonNames } from "~/components/features/ToolbarMain/enum";

const initialState = {
  isAddVideoOpen: false,
  isAddImageOpen: false,
  isAiStylizeOpen: false,
};

export const SignaledToolbarMain = () => {
  const [state, setState] = useState(initialState);
  const closeAll = useCallback(() => {
    setState(initialState);
  }, []);
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
        openAddImage={() => {
          setState({
            ...initialState, //this closes all other opened things
            isAddImageOpen: true,
          });
        }}
        openAddVideo={() => {
          setState({
            ...initialState, //this closes all other opened things
            isAddVideoOpen: true,
          });
        }}
        openAIStylize={() => {
          setState({
            ...initialState, //this closes all other opened things
            isAiStylizeOpen: true,
          });
        }}
      />
      <DialogAddImage
        isOpen={state.isAddImageOpen ?? false}
        closeCallback={closeAll}
      />
      <DialogAddVideo
        isOpen={state.isAddVideoOpen ?? false}
        closeCallback={closeAll}
        onUploadedVideo={(response) => {
          if (!response.data) {
            return;
          }
          dispatchUiEvents.addVideoToEngine({
            url: response.data.public_bucket_url,
          });
        }}
      />
      <DialogAiStylize
        isOpen={state.isAiStylizeOpen ?? false}
        closeCallback={closeAll}
      />
    </div>
  );
};
