import { useContext, useState } from "react";
import { Input } from "~/components";
import { ButtonDialogue } from "~/modules/ButtonDialogue";
import { EngineContext } from "../../contexts/EngineContext";

import { TestFeaturesButtons } from "./TestFeaturesButtons";

export const ControlsTopButtons = () => {
  const editorEngine = useContext(EngineContext);

  const [sceneName, setSceneName] = useState<string>("");
  const [sceneToken, setSceneToken] = useState<string>("");

  const handleButtonSave = () => {
    editorEngine?.saveScene(sceneName);
  };

  const handleButtonLoadScene = () => {
    editorEngine?.loadScene(sceneToken);
  };

  return (
    <div className="flex flex-col gap-2 pl-3 pt-3">
      <div className="flex gap-2">
        <ButtonDialogue
          buttonProps={{
            variant: "secondary",
            label: "Load Scene",
          }}
          title="Load Scene"
          confirmButtonProps={{
            label: "Load",
            disabled: sceneToken === "",
            onClick: handleButtonLoadScene,
          }}
        >
          <Input
            label="Please provide the Token of the scene you wished to load:"
            onChange={(e) => {
              setSceneToken(e.target.value);
            }}
          />
        </ButtonDialogue>

        <ButtonDialogue
          buttonProps={{
            variant: "secondary",
            label: "Save Scene",
          }}
          title="Save Scene"
          confirmButtonProps={{
            label: "Save",
            disabled: sceneName === "",
            onClick: handleButtonSave,
          }}
        >
          <Input
            label="Please Enter a name for your scene"
            onChange={(e) => {
              setSceneName(e.target.value);
            }}
          />
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
      <TestFeaturesButtons />
    </div>
  );
};
