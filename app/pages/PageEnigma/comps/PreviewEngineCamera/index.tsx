import { useEffect, useState } from "react";
import { Button, LoadingDotsTyping } from "~/components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCameraViewfinder } from "@fortawesome/pro-solid-svg-icons";
import Queue from "~/pages/PageEnigma/Queue/Queue";
import { QueueNames } from "~/pages/PageEnigma/Queue/QueueNames";
import { toEngineActions } from "~/pages/PageEnigma/Queue/toEngineActions";
import { editorState, EditorStates } from "~/pages/PageEnigma/store/engine";
import { useSignals } from "@preact/signals-react/runtime";

export const PreviewEngineCamera = () => {
  useSignals();
  const [showLoader, setShowLoader] = useState<boolean>(true);

  useEffect(() => {
    setTimeout(() => setShowLoader(false), 1000);
  }, []);

  console.log("state", editorState.value);

  const handleButtonCameraView = () => {
    Queue.publish({
      queueName: QueueNames.TO_ENGINE,
      action: toEngineActions.TOGGLE_CAMERA_STATE,
      data: null,
    });
  };

  return (
    <div id="preview-engine-camera" className="w-30 absolute bottom-0 m-4">
      <div className="relative">
        <div className="-z-10 flex w-full items-center justify-between rounded-t-lg bg-ui-controls p-2 text-white">
          <div className="ms-1 flex items-center gap-2">
            <FontAwesomeIcon icon={faCameraViewfinder} />
            <p className="mt-[2px] text-sm font-medium">Camera View</p>
          </div>

          {editorState.value !== EditorStates.PREVIEW && (
            <Button
              variant="action"
              onClick={handleButtonCameraView}
              className="px-2.5 py-1 text-sm">
              {editorState.value === EditorStates.EDIT
                ? "Enter Camera View"
                : "Exit Camera View"}
            </Button>
          )}
        </div>
        <div className="box relative overflow-hidden rounded-b-lg border border-gray-600">
          <canvas className="aspect-video max-h-40" id="camera-view"></canvas>
          <div className="absolute left-0 top-0 h-full w-full">
            <LoadingDotsTyping isShowing={showLoader} />
          </div>
        </div>
      </div>
    </div>
  );
};
