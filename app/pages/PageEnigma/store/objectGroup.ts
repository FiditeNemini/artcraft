import { signal } from "@preact/signals-core";
import {
  Keyframe,
  ObjectGroup,
  QueueKeyframe,
} from "~/pages/PageEnigma/models/track";
import * as uuid from "uuid";
import Queue from "~/pages/PageEnigma/Queue/Queue";
import { QueueNames } from "~/pages/PageEnigma/Queue/QueueNames";
import { toEngineActions } from "~/pages/PageEnigma/Queue/toEngineActions";

export const objectGroup = signal<ObjectGroup>({
  id: "OB1",
  objects: [],
});

export function updateObject({ id, offset }: { id: string; offset: number }) {
  const oldObject = objectGroup.value;
  objectGroup.value = {
    id: oldObject.id,
    objects: oldObject.objects.map((object) => ({
      object_uuid: object.object_uuid,
      name: object.name,
      keyframes: object.keyframes.map((keyFrame) => ({
        ...keyFrame,
        offset: keyFrame.keyframe_uuid === id ? offset : keyFrame.offset,
      })),
    })),
  };
}

export function addObjectKeyframe(keyframe: QueueKeyframe, offset: number) {
  const oldObjectGroup = objectGroup.value;
  const obj = oldObjectGroup.objects.find(
    (row) => row.object_uuid === keyframe.object_uuid,
  );

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
  console.log(newObject);
  newObject.keyframes.sort(
    (keyframeA, keyframeB) => keyframeA.offset - keyframeB.offset,
  );

  objectGroup.value = {
    ...oldObjectGroup,
    objects: [
      ...oldObjectGroup.objects.filter(
        (object) => object.object_uuid !== keyframe.object_uuid,
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
  console.log("delete", obj);
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
    return {
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
