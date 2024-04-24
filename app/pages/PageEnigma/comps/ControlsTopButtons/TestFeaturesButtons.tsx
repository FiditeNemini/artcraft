import { useContext } from "react";
import { Button } from "~/components";
import { ClipGroup } from "~/pages/PageEnigma/models/track";
import { APPUI_ACTION_TYPES } from "~/reducers";
import { AppUiContext } from "~/contexts/AppUiContext";
import { EngineContext } from "~/contexts/EngineContext";

export const TestFeaturesButtons = ({ debug }: { debug: boolean }) => {
  if (!debug) return null;

  const [appUiState, dispatchAppUiState] = useContext(AppUiContext);
  const editorEngine = useContext(EngineContext);

  const testObjectPanel = () => {
    if (appUiState?.controlPanel.isShowing) {
      dispatchAppUiState({
        type: APPUI_ACTION_TYPES.HIDE_CONTROLPANELS_SCENEOBJECT,
      });
    } else {
      dispatchAppUiState({
        type: APPUI_ACTION_TYPES.SHOW_CONTROLPANELS_SCENEOBJECT,
        payload: {
          group: ClipGroup.OBJECT,
          object_name: "TEST BUTTON",
          object_uuid: "",
          version: "1",
          objectVectors: {
            position: { x: 1, y: 2, z: 3 },
            rotation: { x: 4, y: 5, z: 6 },
            scale: { x: 7, y: 8, z: 9 },
          },
        },
      });
    }
  };

  const testTTSPanel = () => {
    dispatchAppUiState({
      type: APPUI_ACTION_TYPES.OPEN_DIALOGUE_TTS,
    });
  };

  const handleButtonCameraView = () => {
    editorEngine?.switchCameraView();
  };
  const testStylizeRequest = () => {
    // editorEngine?.testStylizeRequest();
    console.log("editorEnging does not have testStylizeRequest");
  };
  const handleButtonRender = () => {
    editorEngine?.generateVideo();
  };

  const handleButtonTakeFrame = () => {
    // editorEngine?.take_timeline_cam_clip();
    console.log("editorEnging does not have take_timeline_cam_clip");
  };

  const handleButtonSingleFrame = () => {
    editorEngine?.generateFrame();
  };
  const handleButtonPlayBack = () => {
    editorEngine?.startPlayback();
  };

  const smallButtons = "text-xs p-2 h-6 ";
  const tertiaryColor =
    "bg-brand-tertiary hover:bg-brand-teriary-400 focus-visible:outline-brand-tertiary ";

  return (
    <>
      <div className="flex gap-1">
        <Button
          variant="secondary"
          onClick={handleButtonCameraView}
          className={smallButtons}>
          Toggle Camera View
        </Button>
        <Button onClick={testObjectPanel} className={smallButtons}>
          Object Panel
        </Button>
        <Button onClick={testTTSPanel} className={tertiaryColor + smallButtons}>
          TTS Panel
        </Button>
      </div>
      <div className="flex gap-1">
        <Button onClick={handleButtonSingleFrame} className={smallButtons}>
          Render Single Frame
        </Button>
        <Button onClick={handleButtonTakeFrame} className={smallButtons}>
          Take Frame
        </Button>
        <Button onClick={handleButtonRender} className={smallButtons}>
          Render
        </Button>
        <Button
          onClick={testStylizeRequest}
          className={
            "hover:bg-brand-teriary-400 bg-brand-tertiary focus-visible:outline-brand-tertiary " +
            smallButtons
          }
          style={{ zIndex: 9001 }}>
          Test Stylize
        </Button>
      </div>
    </>
  );
};
