import { useCallback, useState } from "react";
import { CameraGroup } from "~/pages/PageEnigma/models/track";
import Queue from "~/pages/PageEnigma/Queue/Queue";
import { QueueNames } from "~/pages/PageEnigma/Queue/QueueNames";
import { toEngineActions } from "~/pages/PageEnigma/Queue/toEngineActions";

export default function useUpdateCamera() {
  const [camera, setCamera] = useState<CameraGroup>({
    id: "CA1",
    clips: [],
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
        const clipIndex = newClips.findIndex((row) => row.clip_uuid === id);
        if (clipIndex === -1) {
          return { ...oldCamera };
        }
        const clip = newClips[clipIndex];
        clip.offset = offset;
        clip.length = length;

        Queue.publish({
          queueName: QueueNames.TO_ENGINE,
          action: toEngineActions.UPDATE_CLIP,
          data: clip,
        });

        return {
          ...oldCamera,
          clips: newClips,
        };
      });
    },
    [],
  );

  const selectCameraClip = useCallback((clipId: string) => {
    setCamera((oldCamera) => {
      return {
        ...oldCamera,
        clips: [
          ...oldCamera.clips.map((clip) => {
            return {
              ...clip,
              selected:
                clip.clip_uuid === clipId ? !clip.selected : clip.selected,
            };
          }),
        ],
      };
    });
  }, []);

  const deleteCameraClip = useCallback((clipId: string) => {
    setCamera((oldCamera) => {
      return {
        ...oldCamera,
        clips: [
          ...oldCamera.clips.filter((clip) => {
            if (clip.clip_uuid === clipId) {
              Queue.publish({
                queueName: QueueNames.TO_ENGINE,
                action: toEngineActions.DELETE_CLIP,
                data: clip!,
              });
              return false;
            }
            return true;
          }),
        ],
      };
    });
  }, []);

  return {
    camera,
    updateCamera,
    selectCameraClip,
    deleteCameraClip,
  };
}
