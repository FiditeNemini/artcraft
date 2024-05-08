import { useContext, useEffect, useId, useState } from "react";
import { Transition } from "@headlessui/react";
import {
  faChevronDown,
  faChevronUp,
  faCube,
  faLock,
  faLockOpen,
  faTrash,
} from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { AppUiContext } from "~/contexts/AppUiContext";
import { EngineContext } from "~/contexts/EngineContext";
import { Button, H5, InputVector } from "~/components";

import { XYZ } from "../../datastructures/common";

import { QueueNames } from "../../Queue/QueueNames";
import Queue from "~/pages/PageEnigma/Queue/Queue";
import { toTimelineActions } from "../../Queue/toTimelineActions";
import { QueueKeyframe } from "~/pages/PageEnigma/models";
import { editorState, EditorStates } from "~/pages/PageEnigma/store/engine";
import { sidePanelHeight } from "../../store";
import { twMerge } from "tailwind-merge";
// import { current } from "tailwindcss/colors";

// TODO this will be useful later to fix the bug on leading zeros
// const formatNumber = (input: string): number => {
//   // Convert the input string to a number to remove leading zeros
//   const num = parseFloat(input);
//   // Convert the number back to a string with at least two decimal places
//   const str = num.toFixed(2);
//   return parseFloat(str);
// };

const defaultAxises = {
  x: "0",
  y: "0",
  z: "0",
};

// interface Axises {
//   x: number | string;
//   y: number | string;
//   z: number | string;
// }

// console.log(formatNumber("000123.4567"));  // Outputs: "123.46"
// console.log(formatNumber("000123.4"));     // Outputs: "123.40"
// console.log(formatNumber("000123"));       // Outputs: "123.00"
// console.log(formatNumber("0000.00"));      // Outputs: "0.00"
// console.log(formatNumber("0000.000001"));  // Outputs: "0.00"

export const ControlPanelSceneObject = () => {
  const editorEngine = useContext(EngineContext);

  const [appUiState, dispatchAppUiState] = useContext(AppUiContext);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // obj token to track what is selected
  const [initializedObj, initializedObjSet] = useState("");

  // local translation axises to allow for validation before handing them to the engine
  const [localPosition, localPositionSet] = useState(defaultAxises);
  const [localRotation, localRotationSet] = useState(defaultAxises);
  const [localScale, localScaleSet] = useState(defaultAxises);

  // used to update engine object
  const [inputsUpdated, inputsUpdatedSet] = useState(false);
  const [inputsFocused, inputsFocusedSet] = useState(false);

  const [locked, lockedSet] = useState(false);

  const [color, colorSet] = useState("#ffffff");

  const colorInputId = useId();

  // clears leading and trailing zeros
  const sanitizeNumericInput = (input: string): number => {
    const regex = /(\-?\d+)(\.\d+)?/;
    const matches = input.match(regex) || [];
    const integerPart = matches[1];
    const decimalPart = matches[2];

    const decimal = decimalPart !== undefined ? parseFloat(decimalPart) : 0.0;

    if (integerPart === undefined) {
      return decimal;
    }

    const integer = parseInt(integerPart);

    if (decimalPart === undefined) {
      return integer;
    }

    if (Number(input) > 0) {
      return integer + decimal;
    } else {
      return integer - decimal;
    }
  };

  // runs sanitizeNumericInput on each axis, creating a new object of sanitized values

  const sanitize = (xyz: { [i: string]: string }) => {
    return Object.keys(xyz).reduce((obj, currentKey) => {
      return {
        ...obj,
        [currentKey]: sanitizeNumericInput(xyz[currentKey].toString()),
      };
    }, {});
  };

  // checks if *ANY* number within a translation object is NaN and therefore will not be sent to the engine

  const isValid = (xyz: { [i: string]: string }) =>
    !Object.values(xyz).some((n) => {
      return isNaN(n);
    });

  const positionSanitized = sanitize(localPosition);
  const rotationSanitized = sanitize(localRotation);
  const scaleSanitized = sanitize(localScale);

  const positionValid = isValid(positionSanitized);
  const rotationValid = isValid(rotationSanitized);
  const scaleValid = isValid(scaleSanitized);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const position =
    appUiState.controlPanel.currentSceneObject?.objectVectors?.position;
  const rotation =
    appUiState.controlPanel.currentSceneObject?.objectVectors?.rotation;
  const scale =
    appUiState.controlPanel.currentSceneObject?.objectVectors?.scale;
  const currentSceneObject = appUiState.controlPanel.currentSceneObject;

  useEffect(() => {
    const isCurrentObj =
      (editorEngine?.selected?.uuid || "") === initializedObj;
    // TODO this causes a subtle bug because it renders way too many times.
    if (!appUiState.controlPanel.currentSceneObject) {
      return;
    }
    const vectors = appUiState.controlPanel.currentSceneObject.objectVectors;

    const numsToStrings = (inputObj: { [i: string]: number }) =>
      Object.keys(inputObj).reduce(
        (obj, currentKey) => ({
          ...obj,
          [currentKey]: Number(inputObj[currentKey]).toString(),
        }),
        defaultAxises,
      );

    const objMatch = (
      inputObj: { [i: string]: number },
      refObj: { [i: string]: number },
    ) =>
      Object.keys(inputObj).some(
        (currentKey: string) => inputObj[currentKey] !== refObj[currentKey],
      );

    const positionMismatch = objMatch(vectors.position, positionSanitized);
    const rotationMismatch = objMatch(vectors.rotation, rotationSanitized);
    const scaleMismatch = objMatch(vectors.scale, scaleSanitized);

    if (
      (editorEngine?.switchPreviewToggle === false &&
        appUiState.controlPanel.isShowing &&
        // if the current object isn't the cached object: update local
        !isCurrentObj) ||
      // if the inputs are not in focus, and local state does not match the selected engine object values: update local
      (!inputsFocused &&
        (positionMismatch || rotationMismatch || scaleMismatch))
    ) {
      // update cached object
      initializedObjSet(appUiState.controlPanel.currentSceneObject.object_uuid);

      // local state relies on strings
      localPositionSet(numsToStrings(vectors.position));
      localRotationSet(numsToStrings(vectors.rotation));
      localScaleSet(numsToStrings(vectors.scale));

      lockedSet(
        editorEngine.isObjectLocked(editorEngine?.selected?.uuid || ""),
      );
      colorSet(editorEngine?.selected?.userData.color);
    } else if (!appUiState.controlPanel.isShowing && isCurrentObj) {
      initializedObjSet("");
      localPositionSet(defaultAxises);
      localRotationSet(defaultAxises);
      localScaleSet(defaultAxises);

      lockedSet(false);
      colorSet("#ffffff");
    }

    // updating engine if values originate from the inputs and are valid

    if (inputsUpdated && positionValid && rotationValid && scaleValid) {
      inputsUpdatedSet(false);
      editorEngine?.setSelectedObject(
        positionSanitized,
        rotationSanitized,
        scaleSanitized,
      );
    }
  }, [
    appUiState.controlPanel,
    editorEngine,
    initializedObj,
    inputsFocused,
    inputsUpdated,
    positionSanitized,
    positionValid,
    rotationSanitized,
    rotationValid,
    scaleSanitized,
    scaleValid,
  ]);

  if (
    !appUiState.controlPanel.currentSceneObject ||
    editorState.value === EditorStates.PREVIEW
  ) {
    return null;
  }

  const toggleLock = () => {
    lockedSet((lockState: boolean) => !lockState);
    editorEngine.lockUnlockObject(editorEngine?.selected?.uuid || "");
  };

  const handlePositionChange = (xyz: XYZ) => {
    localPositionSet(xyz);
    inputsUpdatedSet(true);

    // onChange functions no longer update the engine directly. Commented out for future reference.

    // if (!currentSceneObject) {
    //   console.log("Missing Scene Object Position");
    //   return;
    // }

    // dispatchAppUiState({
    //   type: ACTION_TYPES.UPDATE_CONTROLPANELS_SCENEOBJECT,
    //   payload: {
    //     group: currentSceneObject.group,
    //     object_uuid: currentSceneObject.object_uuid,
    //     object_name: currentSceneObject.object_name,
    //     version: currentSceneObject.version,
    //     objectVectors: {
    //       ...appUiState.controlPanel.currentSceneObject.objectVectors,
    //       position: {
    //         ...stringsToNums(xyz),
    //       },
    //     },
    //   },
    // });
  };

  const handleRotationChange = (xyz: XYZ) => {
    localRotationSet(xyz);
    inputsUpdatedSet(true);
    // if (appUiState) {
    //   if (currentSceneObject == null) {
    //     console.log("Missing Scene Object Rotation");
    //     return;
    //   }

    //   dispatchAppUiState({
    //     type: ACTION_TYPES.UPDATE_CONTROLPANELS_SCENEOBJECT,
    //     payload: {
    //       group: currentSceneObject.group,
    //       object_uuid: currentSceneObject.object_uuid,
    //       object_name: currentSceneObject.object_name,
    //       version: currentSceneObject.version,
    //       objectVectors: {
    //         ...appUiState.controlPanel.currentSceneObject.objectVectors,
    //         rotation: {
    //           ...stringsToNums(xyz),
    //         },
    //       },
    //     },
    //   });
    // }
  };

  const handleScaleChange = (xyz: XYZ) => {
    localScaleSet(xyz);
    inputsUpdatedSet(true);
    // if (appUiState) {
    //   if (currentSceneObject == null) {
    //     console.log("Missing Scene Object Scale");
    //     return;
    //   }
    //   dispatchAppUiState({
    //     type: ACTION_TYPES.UPDATE_CONTROLPANELS_SCENEOBJECT,
    //     payload: {
    //       group: currentSceneObject.group,
    //       object_uuid: currentSceneObject.object_uuid,
    //       object_name: currentSceneObject.object_name,
    //       version: currentSceneObject.version,
    //       objectVectors: {
    //         ...appUiState.controlPanel.currentSceneObject.objectVectors,
    //         scale: {
    //           ...stringsToNums(xyz),
    //         },
    //       },
    //     },
    //   });
    // }
  };

  const onFocus = () => {
    inputsFocusedSet(true);
  };

  const onPositionBlur = () => {
    inputsFocusedSet(false);
    if (positionValid) {
      localPositionSet(positionSanitized);
    }
  };

  const onRotationBlur = () => {
    inputsFocusedSet(false);
    if (rotationValid) {
      localRotationSet(rotationSanitized);
    }
  };

  const onScaleBlur = () => {
    inputsFocusedSet(false);
    if (scaleValid) {
      localScaleSet(scaleSanitized);
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

  const getScale = () => {
    const height = sidePanelHeight.value; // Ensure this is the correct way to get the height
    return height < 603 ? height / 603 : 1;
  };

  return (
    <Transition
      show={appUiState?.controlPanel.isShowing}
      className={twMerge(
        "absolute bottom-0 right-0 m-3 flex h-fit w-56 origin-bottom-right flex-col gap-2 rounded-lg border border-ui-panel-border bg-ui-panel p-3.5 text-white shadow-lg",
      )}
      enter="transition-opacity duration-150"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity duration-150"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
      style={{ transform: `scale(${getScale()})` }}>
      <div className="mb-1 flex justify-between">
        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={faCube} />
          <p className="max-w-36 truncate font-semibold">
            {appUiState.controlPanel.currentSceneObject.object_name}
          </p>
        </div>
        <FontAwesomeIcon
          icon={isCollapsed ? faChevronUp : faChevronDown}
          onClick={toggleCollapse}
          className="cursor-pointer opacity-75 transition-opacity duration-100 ease-in-out hover:opacity-50"
        />
      </div>

      <Transition
        show={!isCollapsed}
        enter="transition-all duration-200 ease-in-out"
        enterFrom="opacity-0 max-h-0"
        enterTo="opacity-100 max-h-96"
        leave="transition-all duration-200 ease-in-out"
        leaveFrom="opacity-100 max-h-96"
        leaveTo="opacity-0 max-h-0"
        className={"flex flex-col gap-2 overflow-y-auto"}>
        <Button
          variant="secondary"
          icon={locked ? faLock : faLockOpen}
          onClick={toggleLock}
          className={
            locked ? "bg-brand-primary/20 hover:bg-brand-primary/40" : ""
          }>
          {locked ? "Unlock" : "Lock"} object
        </Button>

        <div className="flex flex-col gap-1">
          <H5>Color</H5>
          <input
            className="h-0 w-0 cursor-pointer opacity-0"
            id={colorInputId}
            onChange={(e: React.ChangeEvent) => {
              editorEngine.setColor(
                editorEngine?.selected?.uuid || "",
                e.target.value,
              );
              colorSet(e.target.value);
            }}
            type="color"
            value={color}
          />
          <Button
            className="cursor-pointer p-3.5"
            htmlFor={colorInputId}
            style={{
              backgroundColor: color,
            }}></Button>
        </div>
        <div className="flex flex-col gap-1">
          <H5>Location</H5>
          <InputVector
            {...{ ...localPosition, onBlur: onPositionBlur, onFocus }}
            onChange={handlePositionChange}
          />
        </div>

        <div className="flex flex-col gap-1">
          <H5>Rotation</H5>
          <InputVector
            {...{ ...localRotation, onBlur: onRotationBlur, onFocus }}
            onChange={handleRotationChange}
            increment={1}
          />
        </div>

        <div className="flex flex-col gap-1">
          <H5>Scale</H5>
          <InputVector
            {...{ ...localScale, onBlur: onScaleBlur, onFocus }}
            onChange={handleScaleChange}
          />
        </div>
      </Transition>

      <div className="mt-2 flex gap-1.5">
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
