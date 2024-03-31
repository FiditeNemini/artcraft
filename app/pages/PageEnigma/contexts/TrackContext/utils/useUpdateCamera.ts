import { useCallback, useState } from "react";
import {
  CameraGroup,
  Keyframe,
  QueueKeyframe,
} from "~/pages/PageEnigma/models/track";
import Queue from "~/pages/PageEnigma/Queue/Queue";
import { QueueNames } from "~/pages/PageEnigma/Queue/QueueNames";
import { toEngineActions } from "~/pages/PageEnigma/Queue/toEngineActions";
import * as uuid from "uuid";

export default function useUpdateCamera() {
  const [camera, setCamera] = useState<CameraGroup>({
    id: "CA1",
    keyframes: [],
  });

  const updateCamera = useCallback(
    ({ id, offset }: { id: string; offset: number }) => {
      setCamera((oldCamera) => {
        const newKeyframes = [...oldCamera.keyframes];
        const keyframe = newKeyframes.find((row) => row.keyframe_uuid === id);
        if (!keyframe) {
          return { ...oldCamera };
        }
        keyframe.offset = offset;

        Queue.publish({
          queueName: QueueNames.TO_ENGINE,
          action: toEngineActions.UPDATE_KEYFRAME,
          data: keyframe,
        });

        return {
          ...oldCamera,
          clips: newKeyframes,
        };
      });
    },
    [],
  );

  const addCameraKeyframe = useCallback(
    (keyframe: QueueKeyframe, offset: number) => {
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

      setCamera((oldCamera) => {
        return {
          ...oldCamera,
          keyframes: [...oldCamera.keyframes, newKeyframe].sort(
            (keyFrameA, keyframeB) => keyFrameA.offset - keyframeB.offset,
          ),
        };
      });

      Queue.publish({
        queueName: QueueNames.TO_ENGINE,
        action: toEngineActions.ADD_KEYFRAME,
        data: newKeyframe,
      });
    },
    [],
  );

  const selectCameraKeyframe = useCallback((keyframeId: string) => {
    setCamera((oldCamera) => {
      return {
        ...oldCamera,
        clips: [
          ...oldCamera.keyframes.map((keyframe) => {
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
    });
  }, []);

  const deleteCameraKeyframe = useCallback((keyframeId: string) => {
    setCamera((oldCamera) => {
      return {
        ...oldCamera,
        keyframes: [
          ...oldCamera.keyframes.filter((keyframe) => {
            if (keyframe.keyframe_uuid === keyframeId) {
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
    });
  }, []);

  return {
    camera,
    updateCamera,
    selectCameraKeyframe,
    addCameraKeyframe,
    deleteCameraKeyframe,
  };
}
