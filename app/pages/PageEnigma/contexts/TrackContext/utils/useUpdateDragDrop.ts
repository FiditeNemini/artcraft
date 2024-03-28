import { useCallback } from "react";
import { canDrop, dragId, dragType } from "~/pages/PageEnigma/store";

export default function useUpdateDragDrop() {
  const startDrag = useCallback(
    (type: "animations" | "lipSync", id: string) => {
      dragId.value = id;
      dragType.value = type;
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
