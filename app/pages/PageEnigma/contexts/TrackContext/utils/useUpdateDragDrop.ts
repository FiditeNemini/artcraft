import { useCallback } from "react";
import { canDrop, dragItem } from "~/pages/PageEnigma/store";
import { MediaItem } from "~/pages/PageEnigma/models";

export default function useUpdateDragDrop() {
  const startDrag = useCallback((item: MediaItem) => {
    dragItem.value = item;
  }, []);

  const endDrag = useCallback(() => {
    dragItem.value = null;
    canDrop.value = false;
  }, []);

  return {
    startDrag,
    endDrag,
  };
}
