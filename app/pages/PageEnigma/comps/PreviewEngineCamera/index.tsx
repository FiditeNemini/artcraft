import { useEffect, useState } from "react";
import { Button, LoadingDotsTyping } from "~/components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCameraViewfinder } from "@fortawesome/pro-solid-svg-icons";
import Queue from "~/pages/PageEnigma/Queue/Queue";
import { QueueNames } from "~/pages/PageEnigma/Queue/QueueNames";
import { toEngineActions } from "~/pages/PageEnigma/Queue/toEngineActions";
import { editorState } from "~/pages/PageEnigma/signals/engine";
import { useSignals } from "@preact/signals-react/runtime";
import { sidePanelHeight } from "../../signals";
import { EditorStates } from "~/pages/PageEnigma/enums";

export const PreviewEngineCamera = () => {
  useSignals();
  const [showLoader, setShowLoader] = useState<boolean>(true);

  useEffect(() => {
    setTimeout(() => setShowLoader(false), 1000);
  }, []);

  if (editorState.value === EditorStates.PREVIEW) {
    return null;
  }

  const handleButtonCameraView = () => {
    Queue.publish({
      queueName: QueueNames.TO_ENGINE,
      action: toEngineActions.TOGGLE_CAMERA_STATE,
      data: null,
    });
  };

  const getScale = () => {
    const height = sidePanelHeight.value;
    const scaleHeight = height < 480 ? height / 480 : 1;
    return scaleHeight;
  };

  return (
    <div
      id="preview-engine-camera"
      className="absolute bottom-0 m-3 origin-bottom-left shadow-lg"
      style={{ transform: `scale(${getScale()})` }}
    >
      <div className="relative">
        <div className="-z-10 flex w-full items-center justify-between rounded-t-lg bg-ui-controls p-1.5 text-white">
          <div className="ms-1 flex grow items-center gap-2">
            <FontAwesomeIcon icon={faCameraViewfinder} className="text-sm" />
            <p className="mt-[2px] text-sm font-medium">Camera View</p>
          </div>

          <Button
            variant="action"
            onClick={handleButtonCameraView}
            className="rounded-md px-2 py-1 text-sm"
          >
            {editorState.value === EditorStates.EDIT
              ? "Enter Camera View"
              : "Exit Camera View"}
          </Button>
        </div>
        <div className="box relative overflow-hidden rounded-b-lg border border-gray-600">
          <canvas className="aspect-video" id="camera-view"></canvas>
          <div className="absolute left-0 top-0 h-full w-full">
            <LoadingDotsTyping isShowing={showLoader} />
          </div>
        </div>
      </div>
    </div>
  );
};
