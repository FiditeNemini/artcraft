import { useCallback, useState } from "react";
import { ObjectGroup, ObjectTrack } from "~/pages/PageEnigma/models/track";

export default function useUpdateObject() {
  const [objects, setObjects] = useState<ObjectGroup>({
    id: "OB1",
    objects: [
      // {
      //   id: "OB1-O1",
      //   keyFrames: [
      //     {
      //       id: "OB1-O1-1",
      //       offset: 0,
      //       name: "obj 1",
      //     },
      //   ],
      // },
    ],
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
              offset: keyFrame.id === id ? offset : keyFrame.offset,
            })),
          })),
        };
      });
    },
    [],
  );

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
  };
}
