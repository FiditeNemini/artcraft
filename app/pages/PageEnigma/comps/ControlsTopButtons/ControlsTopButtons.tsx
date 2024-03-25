import { useContext } from "react";
import { Button } from "~/components";
import { ButtonDialogue } from "~/modules/ButtonDialogue";
import { EngineContext } from "~/contexts/EngineContext";


export const ControlsTopButtons = () => {
  const editorEngine = useContext(EngineContext);

  const handleButtonSave = () => {
    editorEngine?.save();
  };

  const handleButtonCameraView = () => {
    editorEngine?.change_camera_view();
  };

  const handleButtonPlayBack = () => {
    editorEngine?.start_playback();
  };
  return(
    <div className="flex gap-2 pl-3 pt-3">
      <Button variant="secondary" onClick={handleButtonPlayBack}>
        Toggle Camera View
      </Button>
      <Button variant="secondary" onClick={handleButtonSave}>
        Save Scene
      </Button>
      <ButtonDialogue
        buttonProps={{
          variant: "secondary",
          label: "Help",
        }}
        title="Help"
      >
        <p>Do you need help?</p>
        <p>Ask Michael about this project</p>
        <p>Ask Miles about ThreeJS</p>
        <p>Ask Wil about React</p>
      </ButtonDialogue>
    </div>
  );
};