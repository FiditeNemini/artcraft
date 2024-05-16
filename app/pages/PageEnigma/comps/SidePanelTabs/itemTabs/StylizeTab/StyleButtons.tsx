import { Button, Label } from "~/components";
import { faArrowsRotate, faFilm } from "@fortawesome/pro-solid-svg-icons";
import { editorState, EditorStates } from "~/pages/PageEnigma/store/engine";
import { useSignals } from "@preact/signals-react/runtime";
import Queue from "~/pages/PageEnigma/Queue/Queue";
import { QueueNames } from "~/pages/PageEnigma/Queue/QueueNames";
import { toEngineActions } from "~/pages/PageEnigma/Queue/toEngineActions";
import { Switch } from "@headlessui/react";
import { useState } from "react";
import { GenerationOptions } from "~/pages/PageEnigma/models/generationOptions";
import PremiumLock from "~/components/PremiumLock";
export function StyleButtons() {
  useSignals();

  const [upscale, setUpscale] = useState(false);
  const [faceDetail, setFaceDetail] = useState(false);

  const [strength, setStyleStrength] = useState(1.0);

  const sliderChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStyleStrength(parseFloat(event.target.value));
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

  const generateMovie = async () => {
    const options = new GenerationOptions(upscale, faceDetail, strength);
    Queue.publish({
      queueName: QueueNames.TO_ENGINE,
      action: toEngineActions.GENERATE_VIDEO,
      data: options,
    });
  };

  return (
    <div className="flex w-full flex-col justify-center gap-4 rounded-b-lg bg-ui-panel px-4">
      <div className="w-full">
        {editorState.value === EditorStates.EDIT && (
          <>
            <Label>Render the current camera view with AI</Label>
            <div className="mb-2 text-xs text-white/70">
              (This helps you test and re-test your scene)
            </div>
            <Button
              icon={faArrowsRotate}
              variant="primary"
              className="mt-1.5 w-full"
              onClick={switchPreview}>
              Preview Frame
            </Button>
          </>
        )}
        {editorState.value === EditorStates.PREVIEW && (
          <Button
            icon={faArrowsRotate}
            variant="action"
            className="w-full"
            onClick={switchEdit}>
            Return to Edit
          </Button>
        )}
      </div>
      <div className="w-full">
        <Label>
          <div className="mb-1 leading-tight">Set the Style Strength</div>
        </Label>
        <div className="mb-2 text-xs text-white/70">
          (The higher the value the more the style will be applied, the lower
          the value the closer to source.)
        </div>

        <div className="mb-3.5 flex gap-2">
          <div className="rounde w-8 py-0.5 text-center font-medium">
            {value}
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
            value={value}
            min="0"
            max="1.0"
            step="0.1"
            onChange={sliderChanged}
          />
        </div>

        <PremiumLock requiredPlan="any" plural={true}>
          <Switch.Group>
            <div className="mt-1 flex gap-6">
              <div className="flex items-center">
                <Switch.Label className="mr-3 text-sm font-medium">
                  Upscale
                </Switch.Label>
                <Switch
                  checked={upscale}
                  onChange={setUpscale}
                  className={`${
                    upscale
                      ? "bg-brand-primary"
                      : "bg-gray-500 hover:bg-gray-400"
                  } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-0 focus:ring-offset-0`}>
                  <span
                    className={`${
                      upscale ? "translate-x-6" : "translate-x-1"
                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                  />
                </Switch>
              </div>
              <div className="flex items-center">
                <Switch.Label className="mr-3 text-sm font-medium">
                  Face Detail
                </Switch.Label>
                <Switch
                  checked={faceDetail}
                  onChange={setFaceDetail}
                  className={`${
                    faceDetail
                      ? "bg-brand-primary"
                      : "bg-gray-500 hover:bg-gray-400"
                  } focus:ring-indigo-500 relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-0 focus:ring-offset-0`}>
                  <span
                    className={`${
                      faceDetail ? "translate-x-6" : "translate-x-1"
                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                  />
                </Switch>
              </div>
            </div>
          </Switch.Group>
        </PremiumLock>

        <hr className="my-3 opacity-10" />

        <Label>
          <div className="mb-1 leading-tight">
            When you&apos;re done, render your entire animation with AI
          </div>
        </Label>
        <div className="mb-2 text-xs text-white/70">
          (This may take several minutes)
        </div>
        <Button
          icon={faFilm}
          variant="primary"
          className="w-full"
          onClick={generateMovie}>
          Generate Movie
        </Button>
      </div>
    </div>
  );
}
