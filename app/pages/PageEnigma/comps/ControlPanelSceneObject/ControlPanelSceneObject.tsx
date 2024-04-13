import { useContext, useEffect, useRef } from "react";
import { Transition } from "@headlessui/react";
import {
  faArrowRightArrowLeft,
  faCube,
  faTrash,
} from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { AppUiContext } from "../../../../contexts/AppUiContext";
import { EngineContext } from "../../../../contexts/EngineContext";
import { Button, H5, InputVector } from "~/components";

import { XYZ } from "../../datastructures/common";
import { ACTION_TYPES } from "~/reducers/appUiReducer/types";

import { QueueNames } from "../../Queue/QueueNames";
import Queue from "~/pages/PageEnigma/Queue/Queue";
import { toTimelineActions } from "../../Queue/toTimelineActions";
import { QueueKeyframe } from "~/pages/PageEnigma/models";

export const ControlPanelSceneObject = () => {
  const editorEngine = useContext(EngineContext);
  const [appUiState, dispatchAppUiState] = useContext(AppUiContext);

  const position =
    appUiState.controlPanel.currentSceneObject?.objectVectors?.position;
  const rotation =
    appUiState.controlPanel.currentSceneObject?.objectVectors?.rotation;
  const scale =
    appUiState.controlPanel.currentSceneObject?.objectVectors?.scale;
  const currentSceneObject = appUiState.controlPanel.currentSceneObject;

  const r1 = useRef(appUiState.controlPanel.currentSceneObject);
  if (r1.current !== appUiState.controlPanel.currentSceneObject) {
    console.log("current");
    r1.current = appUiState.controlPanel.currentSceneObject;
  }
  useEffect(() => {
    // TODO this causes a subtle bug because it renders way too many times.
    if (!appUiState.controlPanel.currentSceneObject) {
      return;
    }
    const vectors = appUiState.controlPanel.currentSceneObject.objectVectors;

    editorEngine?.setSelectedObject(
      vectors.position,
      vectors.rotation,
      vectors.scale,
    );
  }, [appUiState.controlPanel.currentSceneObject, editorEngine]);

  if (!appUiState.controlPanel.currentSceneObject) {
    return null;
  }

  const handlePositionChange = (xyz: XYZ) => {
    if (!currentSceneObject) {
      console.log("Missing Scene Object Position");
      return;
    }

    console.log(1);
    dispatchAppUiState({
      type: ACTION_TYPES.UPDATE_CONTROLPANELS_SCENEOBJECT,
      payload: {
        group: currentSceneObject.group,
        object_uuid: currentSceneObject.object_uuid,
        object_name: currentSceneObject.object_name,
        version: currentSceneObject.version,
        objectVectors: {
          position: { ...xyz },
          rotation: appUiState?.controlPanel.currentSceneObject?.objectVectors
            ?.rotation ?? { x: 0, y: 0, z: 0 },
          scale: appUiState?.controlPanel.currentSceneObject?.objectVectors
            ?.scale ?? { x: 0, y: 0, z: 0 },
        },
      },
    });
  };

  const handleRotationChange = (xyz: XYZ) => {
    if (appUiState) {
      if (currentSceneObject == null) {
        console.log("Missing Scene Object Rotation");
        return;
      }

      console.log(3);
      dispatchAppUiState({
        type: ACTION_TYPES.UPDATE_CONTROLPANELS_SCENEOBJECT,
        payload: {
          group: currentSceneObject.group,
          object_uuid: currentSceneObject.object_uuid,
          object_name: currentSceneObject.object_name,
          version: currentSceneObject.version,
          objectVectors: {
            position:
              appUiState.controlPanel.currentSceneObject.objectVectors.position,
            rotation: { ...xyz },
            scale:
              appUiState.controlPanel.currentSceneObject.objectVectors.scale,
          },
        },
      });
    }
  };

  const handleScaleChange = (xyz: XYZ) => {
    if (appUiState) {
      if (currentSceneObject == null) {
        console.log("Missing Scene Object Scale");
        return;
      }
      console.log(4);
      dispatchAppUiState({
        type: ACTION_TYPES.UPDATE_CONTROLPANELS_SCENEOBJECT,
        payload: {
          group: currentSceneObject.group,
          object_uuid: currentSceneObject.object_uuid,
          object_name: currentSceneObject.object_name,
          version: currentSceneObject.version,
          objectVectors: {
            position:
              appUiState.controlPanel.currentSceneObject.objectVectors.position,
            rotation:
              appUiState.controlPanel.currentSceneObject.objectVectors.rotation,
            scale: { ...xyz },
          },
        },
      });
    }
  };

  const handleOnAddKeyFrame = () => {
    if (appUiState) {
      if (
        position == null ||
        rotation == null ||
        scale == null ||
        currentSceneObject == null
      ) {
        return;
      }

      for (const key in editorEngine?.timeline.characters) {
        const element = editorEngine?.timeline.characters[key];
        if (key == currentSceneObject.object_uuid) {
          currentSceneObject.group = element;
          break;
        }
      }

      Queue.publish({
        queueName: QueueNames.TO_TIMELINE,
        action: toTimelineActions.ADD_KEYFRAME,
        data: {
          group: currentSceneObject.group,
          object_uuid: currentSceneObject.object_uuid,
          object_name: currentSceneObject.object_name,
          version: 1,

          position: currentSceneObject.objectVectors.position,
          rotation: currentSceneObject.objectVectors.rotation,
          scale: currentSceneObject.objectVectors.scale,
        } as QueueKeyframe,
      });
    }
  };

  const handleDeleteObject = () => {
    editorEngine?.deleteObject(currentSceneObject.object_uuid);
  };

  return (
    <Transition
      show={appUiState?.controlPanel.isShowing}
      className={[
        "absolute bottom-0 right-0",
        "m-4 flex h-fit w-fit flex-col gap-2",
        "rounded-lg",
        "border border-ui-panel-border",
        "bg-ui-panel p-4 text-white",
      ].join(" ")}
      enter="transition-opacity duration-100"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity duration-100"
      leaveFrom="opacity-100"
      leaveTo="opacity-0">
      <div className="flex justify-between">
        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={faCube} />
          <p className="font-semibold">
            {appUiState.controlPanel.currentSceneObject.object_name}
          </p>
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
          x={scale?.x || 0}
          y={scale?.y || 0}
          z={scale?.z || 0}
          onChange={handleScaleChange}
        />
      </div>

      <span className="h-2" />
      <div className="flex gap-2">
        <Button
          variant="secondary"
          className="grow"
          onClick={handleOnAddKeyFrame}>
          Add Keyframe (K)
        </Button>
        <Button
          variant="secondary"
          icon={faTrash}
          onClick={handleDeleteObject}
        />
      </div>
    </Transition>
  );
};
