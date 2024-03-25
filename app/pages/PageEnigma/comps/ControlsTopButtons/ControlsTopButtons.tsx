import { 
  useContext,
  useState
} from "react";
import { Button, H4 } from "~/components";
import { ButtonDialogue } from "~/modules/ButtonDialogue";
import { EngineContext } from "~/contexts/EngineContext";


export const ControlsTopButtons = () => {
  const editorEngine = useContext(EngineContext);
  const [sceneName, setSceneName] = useState<string>("");

  const handleButtonSave = () => {
    console.log(`SceneName is ${sceneName}`)
    // editorEngine?.save();
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

      <ButtonDialogue
        buttonProps={{
          variant: "secondary",
          label: "Save Scene",
        }}
        title="Save Scene"
        confirmButtonProps={{
          label: "Save",
          disabled:(sceneName === "" ? true : false),
          onClick:(handleButtonSave)
        }}
      >
        <H4 className="text-black">Please Enter a name for your scene</H4>
        <input type="text" onChange={(e)=>{
          setSceneName(e.target.value)
        }}/>
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
    </div>
  );
};