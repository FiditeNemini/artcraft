import { useContext, useState } from "react";
import { Button, H4, Input } from "~/components";
import { ButtonDialogue } from "~/modules/ButtonDialogue";
import { EngineContext } from "../../contexts/EngineContext";

export const ControlsTopButtons = () => {
  const editorEngine = useContext(EngineContext);
  const [sceneName, setSceneName] = useState<string>("");

  const handleButtonSave = () => {
    console.log(`SceneName is ${sceneName}`);
    // editorEngine?.save();
    
  };

  const handleButtonCameraView = () => {
    editorEngine?.change_camera_view();
  };

  const handleButtonPlayBack = () => {
    editorEngine?.start_playback();
  };
  const handleButtonLoad = () => {
    //document.getElementById("load-upload")?.click();
    if(editorEngine == null) {return;}
    editorEngine._load_for_testing();
  };
  const handleButtonRender = () => {
    console.log("Saving GLB to server for reference");
    editorEngine?._upload_for_testing();
    //editorEngine?.togglePlayback();
  };
  const handleButtonPlay = () => {};

  return (
    <div className="flex gap-2 pl-3 pt-3">
      <Button variant="secondary" onClick={handleButtonPlayBack}>
        Toggle Camera View
      </Button>

      <ButtonDialogue
        buttonProps={{
          variant: "secondary",
          label: "Save Scene",
        }}
        title="Save Scene"
        confirmButtonProps={{
          label: "Save",
          disabled: sceneName === "" ? true : false,
          onClick: handleButtonSave,
        }}
      >
        <Input label="Please Enter a name for your scene" />
      </ButtonDialogue>

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

      <div className="fixed flex gap-2" style={{ top: 124, left: 12 }}>
        <Button onClick={handleButtonLoad}>Load</Button>
        <Button onClick={handleButtonRender}>Render</Button>
        <Button onClick={handleButtonPlay}>Play</Button>
      </div>
    </div>
  );
};
