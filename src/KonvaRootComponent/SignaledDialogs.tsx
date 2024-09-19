import { useCallback } from "react";
import { Signal } from "@preact/signals-react";
import { dispatchUiEvents } from "~/signals";
import {
  DialogAddImage,
  DialogAddVideo,
  DialogAiStylize,
  DialogError,
} from "~/components/features";

import { AppUiSignalType } from "./contextSignals/appUi";
import { dialogueError } from "~/signals/uiAccess/dialogueError";

export const SignaledDialogs = ({
  appUiSignal,
  resetAll,
}: {
  appUiSignal: Signal<AppUiSignalType>;
  resetAll: () => void;
}) => {
  return (
    <>
      <DialogAddImage
        isOpen={appUiSignal.value.isAddImageOpen ?? false}
        stagedImage={appUiSignal.value.stagedImage}
        closeCallback={resetAll}
        onAddImage={(file) => {
          dispatchUiEvents.addImageToEngine(file);
        }}
      />
      <DialogAddVideo
        isOpen={appUiSignal.value.isAddVideoOpen ?? false}
        stagedVideo={appUiSignal.value.stagedVideo}
        closeCallback={resetAll}
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
        isOpen={appUiSignal.value.isAiStylizeOpen ?? false}
        onRequestAIStylize={(data) => {
          const { selectedArtStyle: artstyle, ...rest } = data;
          dispatchUiEvents.aiStylize.dispatchRequest({
            artstyle,
            ...rest,
          });
        }}
        closeCallback={resetAll}
      />
      <SignaledDialogError />
    </>
  );
};

export const SignaledDialogError = () => {
  const props = dialogueError.signal.value;
  const { isShowing, title, message } = props;
  const onClose = useCallback(() => {
    dialogueError.hide();
  }, []);
  return (
    <DialogError
      isShowing={isShowing}
      title={title}
      message={message}
      onClose={onClose}
    />
  );
};
