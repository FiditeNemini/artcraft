import { useCallback, useState } from "react";
import { ObjectGroup, ObjectTrack } from "~/pages/PageEnigma/models/track";
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
            id: object.id,
            keyFrames: object.keyFrames.map((keyFrame) => ({
              ...keyFrame,
              offset: keyFrame.keyframe_uuid === id ? offset : keyFrame.offset,
            })),
          })),
        };
      });
    },
    [],
  );

  const addObject = useCallback((name: string) => {
    setObjects((oldObjectGroup) => {
      return {
        ...oldObjectGroup,
        objects: [
          ...oldObjectGroup.objects,
          { object_uuid: uuid.v4(), name: name, keyframes: [] },
        ],
      };
    });
  }, []);

  const addObject = useCallback((obj: ObjectTrack) => {
    setObjects((oldObjectGroup) => {
      return {
        ...oldObjectGroup,
        objects: [...oldObjectGroup.objects, obj],
      };
    });
  }, []);

  return {
    objects,
    updateObject,
    addObject,
    addKeyframe,
  };
}
