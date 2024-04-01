import { useCallback } from "react";
import {
  ClipGroup,
  QueueKeyframe,
  Keyframe,
} from "~/pages/PageEnigma/models/track";
import {
  addCharacterKeyframe,
  addObjectKeyframe,
  deleteCharacterKeyframe,
  deleteObjectKeyframe,
} from "~/pages/PageEnigma/store";

export default function useUpdateKeyframe() {
  const addKeyframe = useCallback((keyframe: QueueKeyframe, offset: number) => {
    console.log(keyframe, offset);
    if (keyframe.group === ClipGroup.OBJECT) {
      console.log(2);
      addObjectKeyframe(keyframe, offset);
    }
    if (keyframe.group === ClipGroup.CHARACTER) {
      addCharacterKeyframe(keyframe, offset);
    }
  }, []);

  const deleteKeyframe = useCallback((keyframe: Keyframe) => {
    if (keyframe.group === ClipGroup.OBJECT) {
      deleteObjectKeyframe(keyframe);
    }
    if (keyframe.group === ClipGroup.CHARACTER) {
      deleteCharacterKeyframe(keyframe);
    }
  }, []);

  return {
    addKeyframe,
    deleteKeyframe,
  };
}
