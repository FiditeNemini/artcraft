import { TrackContext } from "~/pages/PageEnigma/contexts/TrackContext/TrackContext";
import { ReactNode, useCallback, useMemo } from "react";
import { AssetType } from "~/pages/PageEnigma/models";
import useUpdateDragDrop from "~/pages/PageEnigma/contexts/TrackContext/utils/useUpdateDragDrop";
import {
  addCharacterAnimation,
  addCharacterAudio,
  addGlobalAudio,
  addCharacter,
  canDrop,
  dragItem,
  dropId,
  dropOffset,
  addObject,
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
    console.log(`${JSON.stringify(dragItem)}`);

    if (dragItem.value != null && dragItem != null) {
      // should be able to drag into the timeline ... TODO FIX?

      if (dragItem.value.type === AssetType.CHARACTER) {
        addCharacter(dragItem.value);
      }
      // if (dragItem.value.type === AssetType.CAMERA) {
      //   console.log("Dragged In Camera Type")
      // }
      if (dragItem.value.type === AssetType.OBJECT) {
        addObject(dragItem.value);
      }
    }
    // if (dragItem.value.type === AssetType.SHAPE) {
    //   console.log("Dragged In Shape Type")
    // }

    if (canDrop.value && dragItem.value) {
      if (dragItem.value.type === AssetType.ANIMATION) {
        addCharacterAnimation({
          dragItem: dragItem.value!,
          characterId: dropId.value,
          offset: dropOffset.value,
        });
      }
      if (dragItem.value.type === AssetType.AUDIO) {
        console.log("add audio", dropId.value);
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
