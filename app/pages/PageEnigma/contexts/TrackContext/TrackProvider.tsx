import { TrackContext } from "~/pages/PageEnigma/contexts/TrackContext/TrackContext";
import { ReactNode, useCallback, useMemo } from "react";
import { AssetType } from "~/pages/PageEnigma/models";
import useUpdateDragDrop from "~/pages/PageEnigma/contexts/TrackContext/utils/useUpdateDragDrop";
import {
  addCharacterAnimation,
  addCharacterAudio,
  addGlobalAudio,
  canDrop,
  dragItem,
  dropId,
  dropOffset,
} from "~/pages/PageEnigma/store";
import useUpdateKeyframe from "~/pages/PageEnigma/contexts/TrackContext/utils/useUpdateKeyframe";

interface Props {
  children: ReactNode;
}

export const TrackProvider = ({ children }: Props) => {
  const keyframes = useUpdateKeyframe();

  const { endDrag, ...dragDrop } = useUpdateDragDrop();

  // cross group functions
  const dropClip = useCallback(() => {

    console.log(`${canDrop.value} ${dragItem.value} ${dragItem.value.type}`)
    if (canDrop.value && dragItem.value) {
      if (dragItem.value.type === AssetType.ANIMATION) {
        addCharacterAnimation({
          dragItem: dragItem.value!,
          characterId: dropId.value,
          offset: dropOffset.value,
        });
      }
      if (dragItem.value.type === AssetType.AUDIO) {
        addCharacterAudio({
          dragItem: dragItem.value!,
          characterId: dropId.value,
          offset: dropOffset.value,
        });
        addGlobalAudio({
          dragItem: dragItem.value!,
          audioId: dropId.value,
          offset: dropOffset.value,
        });
      }
      if (dragItem.value.type === AssetType.CHARACTER) {
        console.log("Dragged In Character Type")
      }
      if (dragItem.value.type === AssetType.CAMERA) {
        console.log("Dragged In Camera Type")
      }
      if (dragItem.value.type === AssetType.OBJECT) {
        console.log("Dragged In Object Type")
      }
      if (dragItem.value.type === AssetType.SHAPE) {
        console.log("Dragged In Shape Type")
      }
    }
    endDrag();
  }, [endDrag]);

  const values = useMemo(() => {
    return {
      ...keyframes,

      ...dragDrop,
      endDrag: dropClip,
    };
  }, [keyframes, dragDrop, dropClip]);
  return (
    <TrackContext.Provider value={values}>{children}</TrackContext.Provider>
  );
};
