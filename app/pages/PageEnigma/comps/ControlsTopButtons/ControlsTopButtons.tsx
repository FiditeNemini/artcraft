import { useContext, useState } from "react";
import { ButtonDropdown, Input } from "~/components";
import { ButtonDialogue } from "~/modules/ButtonDialogue";
import { EngineContext } from "../../../../contexts/EngineContext";
import { ToasterContext } from "~/contexts/ToasterContext";
// import { APPUI_ACTION_TYPES } from "app/reducers";

import { TestFeaturesButtons } from "./TestFeaturesButtons";
import { Help } from "./Help";
import { faFile } from "@fortawesome/pro-solid-svg-icons";

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
      <div className="flex gap-1.5">
        <ButtonDropdown
          label="File"
          icon={faFile}
          options={[
            {
              label: "New scene",
              description: "Ctrl+N",
              dialogProps: {
                title: "Create a New Scene",
                content: (
                  <Input
                    label="Please enter a name for your new scene"
                    onChange={(e) => {
                      setSceneToken(e.target.value);
                    }}
                  />
                ),
                confirmButtonProps: {
                  label: "Create",
                  disabled: sceneName === "",
                  onClick: () => console.log("NEW SCENE"),
                },
                closeButtonProps: {
                  label: "Cancel",
                },
                showClose: true,
              },
            },
            {
              label: "Load existing scene",
              description: "Ctrl+O",
              dialogProps: {
                title: "Load a Scene",
                content: (
                  <Input
                    label="Please provide the token of the scene you want to load"
                    onChange={(e) => {
                      setSceneToken(e.target.value);
                    }}
                  />
                ),
                confirmButtonProps: {
                  label: "Load",
                  disabled: sceneToken === "",
                  onClick: handleButtonLoadScene,
                },
                closeButtonProps: {
                  label: "Cancel",
                },
                showClose: true,
              },
            },

            {
              label: "Save scene",
              description: "Ctrl+S",
              dialogProps: {
                title: "Save Scene",
                content: (
                  <Input
                    label="Please enter a name for your scene"
                    onChange={(e) => {
                      setSceneName(e.target.value);
                    }}
                  />
                ),
                confirmButtonProps: {
                  label: "Save",
                  disabled: sceneName === "",
                  onClick: handleButtonSave,
                },
                closeButtonProps: {
                  label: "Cancel",
                },
                showClose: true,
              },
              divider: true,
            },

            {
              label: "Save scene as copy",
              description: "Ctrl+Shift+S",
              dialogProps: {
                title: "Save Scene as Copy",
                content: (
                  <Input
                    label="Please enter a name for your scene"
                    onChange={(e) => {
                      setSceneName(e.target.value);
                    }}
                  />
                ),
                confirmButtonProps: {
                  label: "Save",
                  disabled: sceneName === "",
                  onClick: handleButtonSave,
                },
                closeButtonProps: {
                  label: "Cancel",
                },
                showClose: true,
              },
            },
          ]}
        />

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
