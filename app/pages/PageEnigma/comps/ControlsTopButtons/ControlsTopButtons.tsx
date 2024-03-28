import { useContext, useState } from "react";
import { Button, Input } from "~/components";
import { ButtonDialogue } from "~/modules/ButtonDialogue";
import { AppUiContext } from "../../contexts/AppUiContext";
import { EngineContext } from "../../contexts/EngineContext";
import { APPUI_ACTION_TYPES } from "../../reducers";

export const ControlsTopButtons = () => {
  const editorEngine = useContext(EngineContext);
  const [ appUiState, dispatchAppUiState ] = useContext(AppUiContext);
  const [sceneName, setSceneName] = useState<string>("");
  const [sceneToken, setSceneToken] = useState<string>("");

  const handleButtonSave = () => {
    console.log(`SceneName is ${sceneName}`);
    editorEngine?.saveScene(sceneName);
  };

  const handleButtonLoadScene = () => {
    console.log(`Scene Token is ${sceneToken}`);
    editorEngine?.loadScene(sceneToken);
  };


  const handleButtonCameraView = () => {
    editorEngine?.switchCameraView();
  };

  const handleButtonPlayBack = () => {
    editorEngine?.start_playback();
  };

  const handleButtonTest = () => {
    if(appUiState?.showEditorLoadingBar.isShowing){
      //TO GO TO A HUNDRED AND DISAPPER
      dispatchAppUiState({
        type: APPUI_ACTION_TYPES.UPDATE_EDITOR_LOADINGBAR,
        payload:{
          showEditorLoadingBar: {
            progress: 100,
          }
        }
      });
      setTimeout(() => {
        dispatchAppUiState({
          type: APPUI_ACTION_TYPES.HIDE_EDITOR_LOADINGBAR,
        });
      }, 1000);
       //END :TO GO TO A HUNDRED AND DISAPPER

       //EAMPLE OF CHANING LOADING MESSAGE
      //  dispatchAppUiState({
      //   type: APPUI_ACTION_TYPES.UPDATE_EDITOR_LOADINGBAR,
      //   payload:{
      //     showEditorLoadingBar: {
      //       message: "new message",
      //     }
      //   }
      // });
    }else{
      dispatchAppUiState({
        type: APPUI_ACTION_TYPES.SHOW_EDITOR_LOADINGBAR,
        payload:{
          showEditorLoadingBar: {
            message: 'display of LoadingBar triggered by Test Button',
            progress: 10,
          }
        }
        
      });
    }
  };

  const handleButtonRender = () => {
    editorEngine?.take_timeline_cam_clip();
  };
  const handleButtonPlay = () => {
    editorEngine?.start_playback();
  };


  // const handleButtonCameraView = () => {
  //   editorEngine?.change_camera_view();
  // };

  const handleButtonLoad = () => {};
  // const handleButtonRender = () => {};

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
              disabled: sceneToken === "" ? true : false,
              onClick: handleButtonLoadScene,
            }}
          >
          <Input
            label="Please provide the Token of the scene you wished to load:"
            onChange={(e)=>{setSceneToken(e.target.value)}}
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
          disabled: sceneName === "" ? true : false,
          onClick: handleButtonSave,
        }}
      >
        <Input
          label="Please Enter a name for your scene"
          onChange={(e)=>{setSceneName(e.target.value)}}
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
      </div>
      <div className="flex gap-2">

        <Button onClick={handleButtonLoad}>Load</Button>
        <Button onClick={handleButtonRender}>Take Frame</Button>
        <Button onClick={handleButtonPlay}>Play</Button>
        {/* <Button onClick={handleButtonLoad}>Load</Button>
        <Button onClick={handleButtonRender}>Render</Button> */}
        <Button
          onClick={handleButtonTest}
          className="bg-brand-tertiary hover:bg-brand-tertiary-400"
          style={{zIndex:9001}}
        >
          Test
        </Button>
      </div>
    </div>
  );
};
