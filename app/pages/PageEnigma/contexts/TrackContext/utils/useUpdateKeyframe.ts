import { useCallback } from "react";
import {
  ClipGroup,
  QueueKeyframe,
  Keyframe,
} from "~/pages/PageEnigma/models/track";
import useUpdateObject from "~/pages/PageEnigma/contexts/TrackContext/utils/useUpdateObject";
import useUpdateCharacters from "~/pages/PageEnigma/contexts/TrackContext/utils/useUpdateCharacters";

export default function useUpdateKeyframe() {
  const { addObjectKeyframe, deleteObjectKeyframe } = useUpdateObject();
  const { addCharacterKeyframe, deleteCharacterKeyframe } =
    useUpdateCharacters();

  const addKeyframe = useCallback(
    (keyframe: QueueKeyframe, offset: number) => {
      if (keyframe.group === ClipGroup.OBJECT) {
        addObjectKeyframe(keyframe, offset);
      }
      if (keyframe.group === ClipGroup.CHARACTER) {
        addCharacterKeyframe(keyframe, offset);
      }
    },
    [addCharacterKeyframe, addObjectKeyframe],
  );

  const deleteKeyframe = useCallback(
    (keyframe: Keyframe) => {
      if (keyframe.group === ClipGroup.OBJECT) {
        deleteObjectKeyframe(keyframe);
      }
      if (keyframe.group === ClipGroup.CHARACTER) {
        deleteCharacterKeyframe(keyframe);
      }
    },
    [deleteCharacterKeyframe, deleteObjectKeyframe],
  );

  return {
    addKeyframe,
    deleteKeyframe,
  };
}
