import { useCallback, useState } from "react";
import { ObjectGroup } from "~/models/track";

export default function useUpdateObject() {
  const [objects, setObjects] = useState<ObjectGroup>({
    id: "OB1",
    objects: [
      {
        id: "OB1-O1",
        clips: [
          {
            id: "OB1-O1-1",
            length: 200,
            offset: 0,
            name: "obj 1",
          },
        ],
      },
    ],
  });

  const updateObject = useCallback(
    ({
      id,
      offset,
      length,
    }: {
      id: string;
      length: number;
      offset: number;
    }) => {
      setObjects((oldObject) => {
        return {
          id: oldObject.id,
          objects: oldObject.objects.map((object) => ({
            id: object.id,
            clips: object.clips.map((clip) => ({
              ...clip,
              offset: clip.id === id ? offset : clip.offset,
              length: clip.id === id ? length : clip.length,
            })),
          })),
        };
      });
    },
    [],
  );

  return {
    objects,
    updateObject,
  };
}
