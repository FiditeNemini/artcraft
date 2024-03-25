import { useCallback, useState } from "react";
import { CameraGroup } from "~/models/track";

export default function useUpdateCamera() {
  const [camera, setCamera] = useState<CameraGroup>({
    id: "CA1",
    clips: [
      {
        id: "CA1-1",
        length: 200,
        offset: 0,
        name: "cam 1",
      },
      {
        id: "CA1-2",
        length: 180,
        offset: 300,
        name: "cam 2",
      },
    ],
  });

  const updateCamera = useCallback(
    ({
      id,
      offset,
      length,
    }: {
      id: string;
      length: number;
      offset: number;
    }) => {
      setCamera((oldCamera) => {
        const newClips = [...oldCamera.clips];
        const clipIndex = newClips.findIndex((row) => row.id === id);
        if (clipIndex === -1) {
          return { ...oldCamera };
        }
        const clip = newClips[clipIndex];
        clip.offset = offset;
        clip.length = length;
        return {
          ...oldCamera,
          clips: newClips,
        };
      });
    },
    [],
  );

  return {
    camera,
    updateCamera,
  };
}
