import { useCallback, useState } from "react";
import {
  ObjectGroup,
  QueueKeyframe,
  Keyframe,
} from "~/pages/PageEnigma/models/track";
import * as uuid from "uuid";

export default function useUpdateObject() {
  const [objects, setObjects] = useState<ObjectGroup>({
    id: "OB1",
    objects: [],
  });

  const updateObject = useCallback(
    ({ id, offset }: { id: string; offset: number }) => {
      setObjects((oldObject) => {
        return {
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
      });
    },
    [],
  );

  const addObjectKeyframe = useCallback(
    (keyframe: QueueKeyframe, offset: number) => {
      setObjects((oldObjectGroup) => {
        const obj = objects.objects.find(
          (row) => row.object_uuid === keyframe.object_uuid,
        );

        const newObject = obj ?? {
          object_uuid: keyframe.object_uuid,
          name: keyframe.object_name ?? "unknown",
          keyframes: [] as Keyframe[],
        };
        newObject.keyframes.push({
          version: keyframe.version,
          keyframe_uuid: uuid.v4(),
          group: keyframe.group,
          object_uuid: keyframe.object_uuid,
          offset,
          position: keyframe.position,
          rotation: keyframe.rotation,
          scale: keyframe.scale,
          selected: false,
        } as Keyframe);
        newObject.keyframes.sort(
          (keyframeA, keyframeB) => keyframeA.offset - keyframeB.offset,
        );

        return {
          ...oldObjectGroup,
          objects: [
            ...oldObjectGroup.objects.filter(
              (object) => object.object_uuid !== keyframe.object_uuid,
            ),
            newObject,
          ].sort((objA, objB) =>
            objA.object_uuid < objB.object_uuid ? -1 : 1,
          ),
        };
      });
    },
    [objects],
  );

  const deleteObjectKeyframe = useCallback((keyframe: Keyframe) => {
    setObjects((oldObjectGroup) => {
      const obj = oldObjectGroup.objects.find(
        (row) => row.object_uuid === keyframe.object_uuid,
      );
      if (!obj) {
        return oldObjectGroup;
      }

      const newKeyframes = [
        ...obj.keyframes.filter(
          (row) => row.keyframe_uuid !== keyframe.keyframe_uuid,
        ),
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
      return {
        ...oldObjectGroup,
        objects: [
          ...oldObjectGroup.objects.filter(
            (object) => object.object_uuid !== keyframe.object_uuid,
          ),
        ],
      };
    });
  }, []);

  return {
    objects,
    updateObject,
    addObjectKeyframe,
    deleteObjectKeyframe,
  };
}
