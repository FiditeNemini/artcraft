import { Button, Label } from "~/components";
import { faArrowsRotate, faFilm } from "@fortawesome/pro-solid-svg-icons";
import { editorState, EditorStates } from "~/pages/PageEnigma/store/engine";
import { useSignals } from "@preact/signals-react/runtime";
import Queue from "~/pages/PageEnigma/Queue/Queue";
import { QueueNames } from "~/pages/PageEnigma/Queue/QueueNames";
import { toEngineActions } from "~/pages/PageEnigma/Queue/toEngineActions";

export function StyleButtons() {
  useSignals();

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
    Queue.publish({
      queueName: QueueNames.TO_ENGINE,
      action: toEngineActions.GENERATE_VIDEO,
      data: null,
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
          When you&apos;re done, render your entire animation with AI
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
