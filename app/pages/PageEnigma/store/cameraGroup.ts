import {
  CameraGroup,
  Keyframe,
  QueueKeyframe,
} from "~/pages/PageEnigma/models/track";
import Queue from "~/pages/PageEnigma/Queue/Queue";
import { QueueNames } from "~/pages/PageEnigma/Queue/QueueNames";
import { toEngineActions } from "~/pages/PageEnigma/Queue/toEngineActions";
import * as uuid from "uuid";
import { signal } from "@preact/signals-core";

export const cameraGroup = signal<CameraGroup>({ id: "CG1", keyframes: [] });

export function updateCamera({ id, offset }: { id: string; offset: number }) {
  const oldCameraGroup = cameraGroup.value;
  const newKeyframes = [...oldCameraGroup.keyframes];
  const keyframe = newKeyframes.find((row) => row.keyframe_uuid === id);
  if (!keyframe) {
    return;
  }
  keyframe.offset = offset;

  Queue.publish({
    queueName: QueueNames.TO_ENGINE,
    action: toEngineActions.UPDATE_KEYFRAME,
    data: keyframe,
  });

  cameraGroup.value = {
    ...oldCameraGroup,
    keyframes: newKeyframes,
  };
}

export function addCameraKeyframe(keyframe: QueueKeyframe, offset: number) {
  console.log("cam", keyframe);
  const newKeyframe = {
    version: keyframe.version,
    keyframe_uuid: uuid.v4(),
    group: keyframe.group,
    object_uuid: keyframe.object_uuid,
    offset,
    position: keyframe.position,
    rotation: keyframe.rotation,
    scale: keyframe.scale,
    selected: false,
  } as Keyframe;

  const oldCameraGroup = cameraGroup.value;
  cameraGroup.value = {
    ...oldCameraGroup,
    keyframes: [...oldCameraGroup.keyframes, newKeyframe].sort(
      (keyFrameA, keyframeB) => keyFrameA.offset - keyframeB.offset,
    ),
  };

  Queue.publish({
    queueName: QueueNames.TO_ENGINE,
    action: toEngineActions.ADD_KEYFRAME,
    data: newKeyframe,
  });
}

export function selectCameraKeyframe(keyframeId: string) {
  const oldCameraGroup = cameraGroup.value;
  cameraGroup.value = {
    ...oldCameraGroup,
    keyframes: [
      ...oldCameraGroup.keyframes.map((keyframe) => {
        return {
          ...keyframe,
          selected:
            keyframe.keyframe_uuid === keyframeId
              ? !keyframe.selected
              : keyframe.selected,
        };
      }),
    ],
  };
}

export function deleteCameraKeyframe(deleteKeyframe: Keyframe) {
  const oldCameraGroup = cameraGroup.value;
  cameraGroup.value = {
    ...oldCameraGroup,
    keyframes: [
      ...oldCameraGroup.keyframes.filter((keyframe) => {
        if (keyframe.keyframe_uuid === deleteKeyframe.keyframe_uuid) {
          Queue.publish({
            queueName: QueueNames.TO_ENGINE,
            action: toEngineActions.DELETE_KEYFRAME,
            data: keyframe,
          });
          return false;
        }
        return true;
      }),
    ],
  };
}
