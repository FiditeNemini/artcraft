import { useContext } from "react";
import { Transition } from "@headlessui/react";
import {
  faArrowRightArrowLeft,
  faCube,
  faTrash,
} from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { AppUiContext } from "../../contexts/AppUiContext";
import { Button, H4, H5, H6, InputVector } from "~/components";

import { XYZ } from "../../datastructures/common";
import { ACTION_TYPES } from "../../reducers/appUiReducer/types";

import { QueueNames } from "../../Queue/QueueNames";
import Queue from "~/pages/PageEnigma/Queue/Queue";
import { toTimelineActions } from "../../Queue/toTimelineActions";
export const ControlPanelSceneObject = () => {
  const [appUiState, dispatchAppUiState] = useContext(AppUiContext);

  const position = appUiState?.currentSceneObject.objectVectors.position;
  const rotation = appUiState?.currentSceneObject.objectVectors.rotation;
  const scalar = appUiState?.currentSceneObject.objectVectors.scale;

  const handlePositionChange = (xyz: XYZ) => {
    if (appUiState)
      dispatchAppUiState({
        type: ACTION_TYPES.UPDATE_CONTROLPANELS_SCENEOBJECT,
        payload: {
          currentSceneObject: {
            objectVectors: {
              position: { ...xyz },
              rotation: appUiState.currentSceneObject.objectVectors.rotation,
              scale: appUiState.currentSceneObject.objectVectors.scale,
            },
          },
        },
      });
  };
  const handleRotationChange = (xyz: XYZ) => {
    if (appUiState)
      dispatchAppUiState({
        type: ACTION_TYPES.UPDATE_CONTROLPANELS_SCENEOBJECT,
        payload: {
          currentSceneObject: {
            objectVectors: {
              position: appUiState.currentSceneObject.objectVectors.position,
              rotation: { ...xyz },
              scale: appUiState.currentSceneObject.objectVectors.scale,
            },
          },
        },
      });
  };
  const handleScalarChange = (xyz: XYZ) => {
    if (appUiState)
      dispatchAppUiState({
        type: ACTION_TYPES.UPDATE_CONTROLPANELS_SCENEOBJECT,
        payload: {
          currentSceneObject: {
            objectVectors: {
              position: appUiState.currentSceneObject.objectVectors.position,
              rotation: appUiState.currentSceneObject.objectVectors.rotation,
              scale: { ...xyz },
            },
          },
        },
      });
  };

  const handleOnAddKeyFrame = () => {
    if (appUiState) {
        console.log(`${appUiState.currentSceneObject.objectVectors.position.x}`)
        console.log(`${appUiState.currentSceneObject.objectVectors.position.y}`)
        console.log(`${appUiState.currentSceneObject.objectVectors.position.z}`)

        console.log(`${appUiState.currentSceneObject.objectVectors.rotation.x}`)
        console.log(`${appUiState.currentSceneObject.objectVectors.rotation.y}`)
        console.log(`${appUiState.currentSceneObject.objectVectors.rotation.z}`)

        console.log(`${appUiState.currentSceneObject.objectVectors.scale.x}`)
        console.log(`${appUiState.currentSceneObject.objectVectors.scale.y}`)
        console.log(`${appUiState.currentSceneObject.objectVectors.scale.z}`)

        Queue.publish({queueName:QueueNames.TO_TIMELINE, action: toTimelineActions.ADD_KEYFRAME, 
          data: {  
            position: appUiState.currentSceneObject.objectVectors.position,
            rotation: appUiState.currentSceneObject.objectVectors.rotation,
            scale:appUiState.currentSceneObject.objectVectors.scale
          }
        })
    }
  }

  return (
    <Transition
      show={appUiState?.currentSceneObject.isShowing}
      className="absolute bottom-0 right-0 m-4 flex h-fit w-fit flex-col gap-2 rounded-lg border border-ui-panel-border bg-ui-panel p-4 text-white"
      enter="transition-opacity duration-100"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity duration-100"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div className="flex justify-between">
        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={faCube} />
          <p className="font-semibold">Object Name</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium opacity-60">
          <FontAwesomeIcon icon={faArrowRightArrowLeft} />
          <p>Swap Object</p>
        </div>
      </div>
      <span className="h-1" />

      <div className="flex flex-col gap-1">
        <H5>Position</H5>
        <InputVector
          x={position?.x || 0}
          y={position?.y || 0}
          z={position?.z || 0}
          onChange={handlePositionChange}
        />
      </div>

      <div className="flex flex-col gap-1">
        <H5>Rotation</H5>
        <InputVector
          x={rotation?.x || 0}
          y={rotation?.y || 0}
          z={rotation?.z || 0}
          onChange={handleRotationChange}
        />
      </div>

      <div className="flex flex-col gap-1">
        <H5>Scale</H5>
        <InputVector
          x={scalar?.x || 0}
          y={scalar?.y || 0}
          z={scalar?.z || 0}
          onChange={handleScalarChange}
        />
      </div>

      <span className="h-2" />
      <div className="flex gap-2">
        <Button variant="secondary" 
        className="grow"
        onClick={handleOnAddKeyFrame}>
          Add Keyframe (K)
        </Button>
        <Button variant="secondary" icon={faTrash} />
      </div>
    </Transition>
  );
};
