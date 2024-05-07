import { useContext, useState, useCallback } from "react";
import { useParams, useLocation, useNavigate, } from "@remix-run/react";

import { useSignalEffect } from "@preact/signals-react/runtime";
import { scene, signalScene } from "~/store";

import { EngineContext } from "~/contexts/EngineContext";
import { AuthenticationContext } from "~/contexts/Authentication";
import {ToasterContext, ToastTypes } from "~/contexts/ToasterContext";

import { faFile } from "@fortawesome/pro-solid-svg-icons";
import { 
  ButtonDropdown,
  Input,
  H4,
} from "~/components";
import { ButtonDialogue } from "~/modules/ButtonDialogue";
import { TestFeaturesButtons } from "./TestFeaturesButtons";
import { Help } from "./Help";
import { LoadScene } from "./LoadScene";
import { NewSceneFromTemplate } from "./NewSceneFromTemplate";

import { getCurrentLocationWithoutParams } from "~/utilities";

export const ControlsTopButtons = () => {
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const editorEngine = useContext(EngineContext);
  const {authState} = useContext(AuthenticationContext);

  const [sceneTitleInput, setSceneTitleInput] = useState<string>("");
  const [sceneTokenSelected, setSceneTokenSelected] = useState<string>("");
  const { addToast } = useContext(ToasterContext);

  const handleChangeSceneTitleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSceneTitleInput(e.target.value);
  }
  const clearSceneTitleInput = ()=>{
    setSceneTitleInput("");
  }

  const handleButtonNew = ()=>{
    editorEngine?.newScene(sceneTitleInput);
  };

  const handleButtonSave = async () => {
    // console.log(`SceneName is ${scene.value.title}`);
    const retSceneMediaToken = await editorEngine?.saveScene({
      sceneTitle : scene.value.title || "",
      sceneToken : scene.value.token
    });
    if (retSceneMediaToken) {
      addToast(ToastTypes.SUCCESS, retSceneMediaToken);
      if(!scene.value.token){
        signalScene({
          ...scene.value,
          token: retSceneMediaToken
        });
      }
    }
  };

  const handleButtonSaveAsCopy =  useCallback(async() => {
    const retSceneMediaToken = await editorEngine?.saveScene({
      sceneTitle : sceneTitleInput,
      sceneToken : undefined
    });
    if (retSceneMediaToken) {
      addToast(ToastTypes.SUCCESS, retSceneMediaToken);
      signalScene({
        ...scene.value,
        token: retSceneMediaToken,
        ownerToken: authState.userInfo?.user_token,
        title: sceneTitleInput,
      });
    }
  }, [sceneTitleInput]);

  const handleButtonNewFromTemplate = () => {
    handleButtonLoadScene();
  };

  const handleButtonLoadScene = () => {
    editorEngine?.loadScene(sceneTokenSelected)
      .catch((err) => {
        addToast(ToastTypes.ERROR, err.message);
      });
  };

  const handleSceneSelection = (token: string) => {
    setSceneTokenSelected(token);
  };

  useSignalEffect(()=>{
    if (!scene.value.isInitializing){
      setSceneTitleInput(scene.value.title || "");
      const currentLocation = getCurrentLocationWithoutParams(location.pathname, params);
      if(scene.value.token === undefined){
        if(params.sceneToken){
          //case of create new scene from existing scene
          history.pushState({}, "",currentLocation);
        }
        //case of create new scene from unsaved scene
        navigate(currentLocation, {replace:true});
      }else if (scene.value.token){
        if(params.sceneToken && scene.value.token !== params.sceneToken){
          //case of loading existing scene from existing scene
          history.pushState({}, "",currentLocation+scene.value.token);
        }
        //case of loading existing scene from unsaved new scene
        //or case of updating existing scene
        navigate(currentLocation+scene.value.token, {replace:true});
      }
    }
  });

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
              onDialogOpen: ()=>{
                setSceneTitleInput("Untitled New Scene");
              },
              dialogProps: {
                title: "Create a New Scene",
                content: (
                  <Input
                    value={sceneTitleInput}
                    label="Please enter a name for your new scene"
                    onChange={handleChangeSceneTitleInput}
                    autoComplete="false"
                  />
                ),
                confirmButtonProps: {
                  label: "Create",
                  disabled: sceneTitleInput === "",
                  onClick: handleButtonNew,
                },
                closeButtonProps: {
                  label: "Cancel",
                },
                showClose: true,
                onClose: clearSceneTitleInput,
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
                  disabled: sceneTokenSelected === "",
                  onClick: handleButtonNewFromTemplate,
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
                  disabled: sceneTokenSelected === "",
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
              disabled: !scene.value.isModified || (scene.value.ownerToken !== authState.userInfo?.user_token),
              // save scene should be disabled if there are no changes
              label: "Save scene",
              description: "Ctrl+S",
              dialogProps: {
                title: "Save Scene",
                content: (
                  <H4>Save scene to <b>{scene.value.title}</b>?</H4>
                ),
                confirmButtonProps: {
                  label: "Save",
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
              disabled: !scene.value.isModified || !scene.value.token,
              label: "Save scene as copy",
              description: "Ctrl+Shift+S",
              onDialogOpen: ()=>{
                setSceneTitleInput("Copy of " + sceneTitleInput);
              },
              dialogProps: {
                title: "Save Scene as Copy",
                content: (
                  <Input
                    value={sceneTitleInput}
                    label="Please enter a name for your scene"
                    onChange={handleChangeSceneTitleInput}
                  />
                ),
                confirmButtonProps: {
                  label: "Save",
                  disabled: sceneTitleInput === "",
                  onClick: handleButtonSaveAsCopy,
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
            label: "Help",
          }}
          dialogProps={{
            className: "max-w-6xl w-auto",
          }}
          title={
            <>
              Help
              <span className="text-sm font-medium opacity-60">
                @%CURRENT_STORYTELLER_GIT_VERSION%
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
