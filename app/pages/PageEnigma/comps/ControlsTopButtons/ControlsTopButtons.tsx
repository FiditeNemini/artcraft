import { useContext, useState } from "react";
import { sceneTitle } from "~/store";
import { ButtonDropdown, Input } from "~/components";
import { ButtonDialogue } from "~/modules/ButtonDialogue";
import { EngineContext } from "~/contexts/EngineContext";
import { ToasterContext, ToastTypes } from "~/contexts/ToasterContext";
// import { APPUI_ACTION_TYPES } from "app/reducers";
import { TestFeaturesButtons } from "./TestFeaturesButtons";
import { Help } from "./Help";
import { faFile } from "@fortawesome/pro-solid-svg-icons";
import { LoadScene } from "./LoadScene";
import { NewSceneFromTemplate } from "./NewSceneFromTemplate";

export const ControlsTopButtons = () => {
  const editorEngine = useContext(EngineContext);

  const [sceneName, setSceneName] = useState<string>("");
  const [sceneToken, setSceneToken] = useState<string>("");
  const { addToast } = useContext(ToasterContext);

  const handleButtonSave = async () => {
    // console.log(`SceneName is ${sceneName}`);
    // const sceneMediaToken = await editorEngine?.saveScene(sceneName);
    console.log(`SceneName is ${sceneTitle.value}`);
    const sceneMediaToken = await editorEngine?.saveScene(sceneTitle.value);
    if (sceneMediaToken) {
      addToast(ToastTypes.SUCCESS, sceneMediaToken);
    }
  };

  const handleButtonLoadScene = () => {
    console.log(`Scene Token is ${sceneToken}`);
    editorEngine?.loadScene(sceneToken).catch((err) => {
      addToast(ToastTypes.ERROR, err.message);
    });
  };

  const handleSceneSelection = (token: string) => {
    setSceneToken(token);
    console.log(`Selected Scene Token is ${token}`);
  };

  const handleChangeSceneTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    sceneTitle.value = e.target.value;
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
                      setSceneName(e.target.value);
                    }}
                    autoComplete="false"
                  />
                ),
                confirmButtonProps: {
                  label: "Create",
                  disabled: sceneName === "",
                  onClick: () => editorEngine?.newScene(),
                },
                closeButtonProps: {
                  label: "Cancel",
                },
                showClose: true,
                onClose: () => setSceneName(""),
              },
            },
            {
              label: "New scene from template...",
              description: "Ctrl+Shift+N",
              dialogProps: {
                title: "Create a New Scene from Template",
                content: (
                  <NewSceneFromTemplate onSceneSelect={handleSceneSelection} />
                ),
                confirmButtonProps: {
                  label: "Create",
                  disabled: sceneToken === "",
                  onClick: handleButtonLoadScene,
                },
                closeButtonProps: {
                  label: "Cancel",
                },
                showClose: true,
                className: "max-w-5xl",
              },
            },
            {
              label: "Load existing scene",
              description: "Ctrl+O",
              dialogProps: {
                title: "Load a Scene",
                content: <LoadScene onSceneSelect={handleSceneSelection} />,
                confirmButtonProps: {
                  label: "Load",
                  disabled: sceneToken === "",
                  onClick: handleButtonLoadScene,
                },
                closeButtonProps: {
                  label: "Cancel",
                },
                showClose: true,
                className: "max-w-5xl",
              },
            },
            {
              disabled: true, // save scene should be disabled if there are no changes
              label: "Save scene",
              description: "Ctrl+S",
              dialogProps: {
                title: "Save Scene",
                content: (
                  <Input
                    value={sceneTitle.value}
                    label="Please enter a name for your scene"
                    // onChange={(e) => {
                    //   setSceneName(e.target.value);
                    // }}
                    onChange={handleChangeSceneTitle}
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
                    value={sceneTitle.value}
                    label="Please enter a name for your scene"
                    // onChange={(e) => {
                    //   setSceneName(e.target.value);
                    // }}
                    onChange={handleChangeSceneTitle}
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

        {/* <ButtonDialogue
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
        </ButtonDialogue> */}

        <ButtonDialogue
          buttonProps={{
            variant: "secondary",
            label: "Help",
          }}
          dialogProps={{
            className: "max-w-6xl w-auto",
          }}
          title={
            <>
              Help
              <span className="text-sm font-medium opacity-60">
                @CURRENT_STORYTELLER_GIT_VERSION
              </span>
            </>
          }>
          <Help />
        </ButtonDialogue>
      </div>
      <TestFeaturesButtons debug={false} />
    </div>
  );
};
