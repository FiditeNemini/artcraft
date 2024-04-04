import { useCallback } from "react";
import {
  canDrop,
  clipLength,
  dragId,
  dragType,
} from "~/pages/PageEnigma/store";
import { ClipType } from "~/pages/PageEnigma/models/track";

export default function useUpdateDragDrop() {
  const startDrag = useCallback(
    (type: ClipType, id: string, length: number) => {
      dragId.value = id;
      dragType.value = type;
      clipLength.value = length;
    },
    [],
  );

  const endDrag = useCallback(() => {
    dragId.value = null;
    dragType.value = null;
    canDrop.value = false;
  }, []);

  return {
    startDrag,
    endDrag,
  };
}
