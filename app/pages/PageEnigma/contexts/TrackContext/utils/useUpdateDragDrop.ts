import { useCallback } from "react";
import {
  canDrop,
  clipLength,
  dragId,
  dragType,
} from "~/pages/PageEnigma/store";

export default function useUpdateDragDrop() {
  const startDrag = useCallback(
    (type: "animations" | "audio", id: string, length: number) => {
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
