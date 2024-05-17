import { useCallback } from "react";
import { QueueKeyframe, Keyframe } from "~/pages/PageEnigma/models";
import {
  addCameraKeyframe,
  addCharacterKeyframe,
  addObjectKeyframe,
  deleteCameraKeyframe,
  deleteCharacterKeyframe,
  deleteObjectKeyframe,
} from "~/pages/PageEnigma/signals";
import { ClipGroup } from "~/pages/PageEnigma/enums";

const ADD_KEYFRAME: Record<
  ClipGroup,
  (keyframe: QueueKeyframe, offset: number) => void
> = {
  [ClipGroup.CAMERA]: addCameraKeyframe,
  [ClipGroup.CHARACTER]: addCharacterKeyframe,
  [ClipGroup.OBJECT]: addObjectKeyframe,
  [ClipGroup.GLOBAL_AUDIO]: () => {},
};

const DELETE_KEYFRAME: Record<ClipGroup, (keyframe: Keyframe) => void> = {
  [ClipGroup.CAMERA]: deleteCameraKeyframe,
  [ClipGroup.CHARACTER]: deleteCharacterKeyframe,
  [ClipGroup.OBJECT]: deleteObjectKeyframe,
  [ClipGroup.GLOBAL_AUDIO]: () => {},
};

export default function useUpdateKeyframe() {
  const addKeyframe = useCallback((keyframe: QueueKeyframe, offset: number) => {
    ADD_KEYFRAME[keyframe.group](keyframe, offset);
  }, []);

  const deleteKeyframe = useCallback((keyframe: Keyframe) => {
    DELETE_KEYFRAME[keyframe.group](keyframe);
  }, []);

  return {
    addKeyframe,
    deleteKeyframe,
  };
}
