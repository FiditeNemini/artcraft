import { useContext, useState } from "react";
import { Button, Input } from "~/components";
import { ButtonDialogue } from "~/modules/ButtonDialogue";
import { EngineContext } from "../../contexts/EngineContext";
import { ToasterContext } from "~/pages/PageEnigma/contexts/ToasterContext";
import { APPUI_ACTION_TYPES } from "~/pages/PageEnigma/reducers";

export const ControlsTopButtons = () => {
  const editorEngine = useContext(EngineContext);
  const [sceneName, setSceneName] = useState<string>("");
  const [sceneToken, setSceneToken] = useState<string>("");
  const { addToast } = useContext(ToasterContext);

  // for testing
  const [mediaToken, setMediaToken] = useState<string>("");

  const handleButtonSave = () => {
    console.log(`SceneName is ${sceneName}`);
    editorEngine?.saveScene(sceneName);
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

  const handleButtonTest = () => {};

  const handleTestButton2 = () => {
    console.log("Test Button 2");
  };

  const handleButtonCameraView = () => {
    editorEngine?.switchCameraView();
  };
  // const handleButtonPlayBack = () => {
  //   editorEngine?.startPlayback();
  // };
  const handleButtonTakeFrame = () => {
    // editorEngine?.take_timeline_cam_clip();
  };
  const handleButtonSingleFrame = () => {
    editorEngine?.generateFrame();
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
            label: "Add Scene Object (Test)",
          }}
          confirmButtonProps={{
            label: "Save",
            disabled: mediaToken === "",
            onClick: handleMediaToken,
          }}
          title="Add Scene Object via Media Token"
        >
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
          title="Help"
        >
          <p>Do you need help?</p>
          <p>Ask Michael about this project</p>
          <p>Ask Miles about ThreeJS</p>
          <p>Ask Wil about React</p>
        </ButtonDialogue>
      </div>

      <div className="flex gap-2">
        <Button variant="secondary" onClick={handleButtonCameraView}>
          Toggle Camera View
        </Button>
        <Button
          onClick={handleTestButton2}
          className="hover:bg-brand-teriary-400 bg-brand-tertiary focus-visible:outline-brand-tertiary"
        >
          Test Button 2
        </Button>
      </div>
      <div className="flex gap-2">
        {/* <Button onClick={handleButtonSingleFrame}>Render Single Frame</Button>
        <Button onClick={handleButtonTakeFrame}>Take Frame</Button> */}
        <Button
          onClick={handleButtonTest}
          className="hover:bg-brand-teriary-400 bg-brand-tertiary focus-visible:outline-brand-tertiary"
          style={{ zIndex: 9001 }}
        >
          Test
        </Button>
      </div>
    </div>
  );
};
