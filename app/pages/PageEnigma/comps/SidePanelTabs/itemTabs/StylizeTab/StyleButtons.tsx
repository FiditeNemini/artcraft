import { Button, Label } from "~/components";
import {
  faArrowsRotate,
  faChevronLeft,
} from "@fortawesome/pro-solid-svg-icons";
import { editorState, previewSrc } from "~/pages/PageEnigma/signals/engine";
import { EditorStates } from "~/pages/PageEnigma/enums";
import { useSignals } from "@preact/signals-react/runtime";
import Queue from "~/pages/PageEnigma/Queue/Queue";
import { QueueNames } from "~/pages/PageEnigma/Queue/QueueNames";
import { toEngineActions } from "~/pages/PageEnigma/Queue/toEngineActions";
import { Switch } from "@headlessui/react";
import PremiumLock from "~/components/PremiumLock";
import {
  upscale,
  faceDetail,
  styleStrength,
} from "~/pages/PageEnigma/signals/stylizeTab";

export function StyleButtons() {
  useSignals();

  const sliderChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    styleStrength.value = parseFloat(event.target.value);
  };

  const switchPreview = async () => {
    Queue.publish({
      queueName: QueueNames.TO_ENGINE,
      action: toEngineActions.ENTER_PREVIEW_STATE,
      data: null,
    });
  };

  const switchEdit = async () => {
    Queue.publish({
      queueName: QueueNames.TO_ENGINE,
      action: toEngineActions.ENTER_EDIT_STATE,
      data: null,
    });
  };

  const refreshPreview = async () => {
    Queue.publish({
      queueName: QueueNames.TO_ENGINE,
      action: toEngineActions.REFRESH_PREVIEW,
      data: null,
    });
  };

  return (
    <div className="flex w-full flex-col justify-center gap-4 rounded-b-lg bg-ui-panel">
      <div className="w-full">
        <div className="w-full">
          <Label>Render the camera view with AI</Label>
          <div className="mb-2 text-xs text-white/70">
            (This helps you test and re-test your scene)
          </div>
          {editorState.value === EditorStates.EDIT && (
            <>
              <Button
                icon={faArrowsRotate}
                variant="primary"
                className="mt-1.5 w-full"
                onClick={switchPreview}
              >
                Preview Frame
              </Button>
            </>
          )}
          {editorState.value === EditorStates.PREVIEW && (
            <div className="flex gap-2">
              <Button
                icon={faChevronLeft}
                variant="action"
                onClick={switchEdit}
              >
                Back
              </Button>
              <Button
                icon={faArrowsRotate}
                variant="primary"
                onClick={refreshPreview}
                className="grow"
                loading={previewSrc.value === ""}
              >
                {previewSrc.value === "" ? "Rendering..." : "Re-render Preview"}
              </Button>
            </div>
          )}
        </div>

        <PremiumLock requiredPlan="any" plural={true}>
          <Switch.Group>
            <div className="mb-4 mt-4 flex gap-6">
              <div className="flex items-center">
                <Switch.Label className="mr-3 text-sm font-medium">
                  Upscale
                </Switch.Label>
                <Switch
                  checked={upscale.value}
                  onChange={() => (upscale.value = !upscale.value)}
                  className={`${
                    upscale.value
                      ? "bg-brand-primary"
                      : "bg-gray-500 hover:bg-gray-400"
                  } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-0 focus:ring-offset-0`}
                >
                  <span
                    className={`${
                      upscale.value ? "translate-x-6" : "translate-x-1"
                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                  />
                </Switch>
              </div>
              <div className="flex items-center">
                <Switch.Label className="mr-3 text-sm font-medium">
                  Face Detail
                </Switch.Label>
                <Switch
                  checked={faceDetail.value}
                  onChange={() => (faceDetail.value = !faceDetail.value)}
                  className={`${
                    faceDetail.value
                      ? "bg-brand-primary"
                      : "bg-gray-500 hover:bg-gray-400"
                  } focus:ring-indigo-500 relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-0 focus:ring-offset-0`}
                >
                  <span
                    className={`${
                      faceDetail.value ? "translate-x-6" : "translate-x-1"
                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                  />
                </Switch>
              </div>
            </div>
          </Switch.Group>
        </PremiumLock>

        <div>
          <Label>
            <div className="mb-1 leading-tight">Set the Style Strength</div>
          </Label>
          <div className="mb-2 text-xs text-white/70">
            (The higher the value the more the style will be applied, the lower
            the value the closer to source.)
          </div>

          <div className="flex gap-2">
            <div className="rounde w-8 py-0.5 text-center font-medium">
              {styleStrength.value}
            </div>
            <input
              className="
             active:accent-red-700 
             w-full 
             cursor-pointer 
             accent-brand-primary 
             outline-none 
             transition-all 
             duration-150 
             hover:accent-brand-primary-400
             focus:outline-none
           "
              type="range"
              value={styleStrength.value}
              min="0"
              max="1.0"
              step="0.1"
              onChange={sliderChanged}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
