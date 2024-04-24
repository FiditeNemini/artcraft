import { useContext, useState } from "react";
import { Input } from "~/components";
import { ButtonDialogue } from "~/modules/ButtonDialogue";
import { EngineContext } from "../../../../contexts/EngineContext";
import { ToasterContext } from "~/contexts/ToasterContext";
// import { APPUI_ACTION_TYPES } from "app/reducers";

import { TestFeaturesButtons } from "./TestFeaturesButtons";
import { Help } from "./Help";

export const ControlsTopButtons = () => {
  const editorEngine = useContext(EngineContext);

  const [sceneName, setSceneName] = useState<string>("");
  const [sceneToken, setSceneToken] = useState<string>("");
  const { addToast } = useContext(ToasterContext);

  // for testing
  const [mediaToken, setMediaToken] = useState<string>("");

  const handleButtonSave = async () => {
    console.log(`SceneName is ${sceneName}`);
    const sceneMediaToken = await editorEngine?.saveScene(sceneName);
    if (sceneMediaToken) {
      addToast("success", sceneMediaToken);
    }
  };

  const handleMediaToken = async () => {
    await editorEngine?.loadMediaToken(mediaToken);
  };

  const handleButtonLoadScene = () => {
    console.log(`Scene Token is ${sceneToken}`);
    editorEngine?.loadScene(sceneToken).catch((err) => {
      addToast("error", err.message);
    });
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
          }}>
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
          }}>
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
            label: "Add Scene Object (Test)",
          }}
          confirmButtonProps={{
            label: "Save",
            disabled: mediaToken === "",
            onClick: handleMediaToken,
          }}
          title="Add Scene Object via Media Token">
          <Input
            label="Please Enter a Media Token"
            onChange={(e) => {
              setMediaToken(e.target.value);
            }}
          />
        </ButtonDialogue>

        <ButtonDialogue
          buttonProps={{
            variant: "secondary",
            label: "Help",
          }}
          dialogProps={{
            className: "max-w-6xl w-auto",
          }}
          title="Help">
          <Help />
        </ButtonDialogue>
      </div>
      <TestFeaturesButtons debug={false} />
    </div>
  );
};
