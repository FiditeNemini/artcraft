import { twMerge } from "tailwind-merge";
import { Button, ButtonIcon, Tooltip } from "~/components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBlinds,
  faBlindsRaised,
  faCameraViewfinder,
  faSpinnerThird,
} from "@fortawesome/pro-solid-svg-icons";
import Queue from "~/pages/PageEnigma/Queue/Queue";
import { QueueNames } from "~/pages/PageEnigma/Queue/QueueNames";
import { toEngineActions } from "~/pages/PageEnigma/Queue/toEngineActions";
import {
  cameraAspectRatio,
  editorState,
} from "~/pages/PageEnigma/signals/engine";
import { useSignals } from "@preact/signals-react/runtime";
import {
  editorLetterBox,
  sidePanelHeight,
  toggleEditorLetterBox,
} from "../../signals";
import { CameraAspectRatio, EditorStates } from "~/pages/PageEnigma/enums";
import { CameraViewCanvas } from "../EngineCanvases";

export const PreviewEngineCamera = () => {
  useSignals();

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
        <div
          className={twMerge(
            "-z-10 flex w-full flex-wrap items-center rounded-t-lg bg-ui-controls p-1.5 text-white",
            cameraAspectRatio.value !== CameraAspectRatio.VERTICAL_9_16
              ? "h-11 w-72 justify-between"
              : "h-20 w-44 justify-center",
          )}
        >
          <div
            className={twMerge(
              "ms-1 flex grow items-center gap-2",
              cameraAspectRatio.value === CameraAspectRatio.VERTICAL_9_16 &&
                "-ms-1 justify-center",
            )}
          >
            <FontAwesomeIcon icon={faCameraViewfinder} className="text-sm" />
            <p className="mt-[2px] text-sm font-medium">Camera View</p>
          </div>

          <div className="flex gap-1.5">
            {editorState.value === EditorStates.CAMERA_VIEW && (
              <Tooltip content="Toggle Letterbox" position={"top"}>
                <ButtonIcon
                  icon={editorLetterBox.value ? faBlinds : faBlindsRaised}
                  onClick={() => toggleEditorLetterBox()}
                />
              </Tooltip>
            )}

            <Button
              variant="action"
              onClick={handleButtonCameraView}
              className="rounded-md px-2 py-1 text-sm"
            >
              {editorState.value === EditorStates.EDIT
                ? "Enter Camera View"
                : "Exit View"}
            </Button>
          </div>
        </div>
        <div
          className={twMerge(
            "relative overflow-hidden rounded-b-lg border border-gray-600",
            cameraAspectRatio.value === CameraAspectRatio.HORIZONTAL_16_9
              ? "aspect-[16/9]"
              : cameraAspectRatio.value === CameraAspectRatio.VERTICAL_9_16
                ? "aspect-[9/16]"
                : cameraAspectRatio.value === CameraAspectRatio.SQUARE_1_1
                  ? "aspect-[1/1]"
                  : "aspect-video",
          )}
        >
          <div className="flex h-full w-full items-center justify-center bg-ui-panel">
            <FontAwesomeIcon icon={faSpinnerThird} size={"3x"} spin />
          </div>
          <div className="absolute left-0 top-0 h-full w-full">
            <CameraViewCanvas className="h-full w-full" />
          </div>
        </div>
      </div>
    </div>
  );
};
