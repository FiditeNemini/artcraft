import { signal } from "@preact/signals-core";
import {
  Keyframe,
  MediaItem,
  ObjectGroup,
  QueueKeyframe,
} from "~/pages/PageEnigma/models";
import * as uuid from "uuid";
import Queue from "~/pages/PageEnigma/Queue/Queue";
import { QueueNames } from "~/pages/PageEnigma/Queue/QueueNames";
import { toEngineActions } from "~/pages/PageEnigma/Queue/toEngineActions";

export const objectGroup = signal<ObjectGroup>({
  id: "OB1",
  objects: [],
});

export function addObjectKeyframe(
  keyframe: QueueKeyframe,
  offset: number,
  addToast: (type: "error" | "warning" | "success", message: string) => void,
) {
  const oldObjectGroup = objectGroup.value;
  const obj = oldObjectGroup.objects.find(
    (row) => row.object_uuid === keyframe.object_uuid,
  );

  if (obj && obj.keyframes.some((row) => row.offset === offset)) {
    addToast("warning", "There can only be one keyframe at this offset.");
    return;
  }

  const newObject = obj ?? {
    object_uuid: keyframe.object_uuid,
    name: keyframe.object_name ?? "unknown",
    keyframes: [] as Keyframe[],
  };
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
  newObject.keyframes.push(newKeyframe);

  newObject.keyframes.sort(
    (keyframeA, keyframeB) => keyframeA.offset - keyframeB.offset,
  );

  objectGroup.value = {
    ...oldObjectGroup,
    objects: [
      ...oldObjectGroup.objects.filter(
        (row) => row.object_uuid !== obj?.object_uuid,
      ),
      newObject,
    ].sort((objA, objB) => (objA.object_uuid < objB.object_uuid ? -1 : 1)),
  };
  Queue.publish({
    queueName: QueueNames.TO_ENGINE,
    action: toEngineActions.ADD_KEYFRAME,
    data: newKeyframe,
  });
}

export function deleteObjectKeyframe(keyframe: Keyframe) {
  const oldObjectGroup = objectGroup.value;
  const obj = oldObjectGroup.objects.find(
    (row) => row.object_uuid === keyframe.object_uuid,
  );

  if (!obj) {
    return oldObjectGroup;
  }

  const newKeyframes = [
    ...obj.keyframes.filter((row) => {
      if (row.keyframe_uuid === keyframe.keyframe_uuid) {
        Queue.publish({
          queueName: QueueNames.TO_ENGINE,
          action: toEngineActions.DELETE_KEYFRAME,
          data: row,
        });
        return false;
      }
      return true;
    }),
  ];

  if (newKeyframes.length) {
    objectGroup.value = {
      ...oldObjectGroup,
      objects: [
        ...oldObjectGroup.objects.map((object) => ({
          ...object,
          ...(object.object_uuid === keyframe.object_uuid
            ? { keyframes: newKeyframes }
            : {}),
        })),
      ],
    };
    return;
  }
  objectGroup.value = {
    ...oldObjectGroup,
    objects: [
      ...oldObjectGroup.objects.filter(
        (object) => object.object_uuid !== keyframe.object_uuid,
      ),
    ],
  };
}
