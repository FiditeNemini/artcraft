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
  faceDetail,
  styleStrength,
  upscale,
  lipSync,
} from "~/pages/PageEnigma/signals/stylizeTab";

export function StyleButtons() {
  useSignals();

  const sliderChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    styleStrength.value = parseFloat(event.target.value);
  };

  const switchPreview = async () => {
    if (editorState.value === EditorStates.EDIT) {
      Queue.publish({
        queueName: QueueNames.TO_ENGINE,
        action: toEngineActions.ENTER_EDIT_STATE,
        data: null,
      });
    }
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
          {editorState.value !== EditorStates.PREVIEW && (
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

        <div className="mb-4 mt-4">
          <div>
            <div className="flex items-center py-[6px]">
              <Switch.Group>
                <Switch.Label className="mr-3 grow text-sm font-medium">
                  Preserve Lip Movement
                </Switch.Label>
                <Switch
                  checked={lipSync.value}
                  onChange={() => (lipSync.value = !lipSync.value)}
                  className={`${
                    lipSync.value
                      ? "bg-brand-primary hover:bg-brand-primary-400"
                      : "bg-gray-500 hover:bg-gray-400"
                  } focus:ring-indigo-500 relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-0 focus:ring-offset-0`}
                >
                  <span
                    className={`${
                      lipSync.value ? "translate-x-6" : "translate-x-1"
                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                  />
                </Switch>
              </Switch.Group>
            </div>
          </div>
          <PremiumLock requiredPlan="any" plural={true} className="mt-2">
            <Switch.Group>
              <div className="flex flex-col gap-[6px]">
                <hr className="opacity-[5%]" />
                <div className="flex w-full items-center">
                  <Switch.Label className="mr-3 grow text-sm font-medium">
                    Upscale
                  </Switch.Label>
                  <Switch
                    checked={upscale.value}
                    onChange={() => (upscale.value = !upscale.value)}
                    className={`${
                      upscale.value
                        ? "bg-brand-primary hover:bg-brand-primary-400"
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
                <hr className="opacity-[5%]" />
                <div className="flex w-full items-center">
                  <Switch.Label className="mr-3 grow text-sm font-medium">
                    Face Detailer
                  </Switch.Label>
                  <Switch
                    checked={faceDetail.value}
                    onChange={() => (faceDetail.value = !faceDetail.value)}
                    className={`${
                      faceDetail.value
                        ? "bg-brand-primary hover:bg-brand-primary-400"
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
                <hr className="opacity-[5%]" />
              </div>
            </Switch.Group>
          </PremiumLock>
        </div>

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
