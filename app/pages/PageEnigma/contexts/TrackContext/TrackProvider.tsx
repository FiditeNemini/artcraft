import { TrackContext } from "~/pages/PageEnigma/contexts/TrackContext/TrackContext";
import { ReactNode, useCallback, useMemo } from "react";
import { AssetType, MediaItem } from "~/pages/PageEnigma/models";
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
  characterGroup,
  cameraGroup,
  audioGroup,
  objectGroup,
  deleteCharacter,
  addShape,
} from "~/pages/PageEnigma/store";
import useUpdateKeyframe from "~/pages/PageEnigma/contexts/TrackContext/utils/useUpdateKeyframe";
import { deleteObject } from "~/pages/PageEnigma/store/objectGroup/deleteObject";

interface Props {
  children: ReactNode;
}

export const TrackProvider = ({ children }: Props) => {
  const keyframes = useUpdateKeyframe();

  const { endDrag, ...dragDrop } = useUpdateDragDrop();

  // cross group functions
  const dropClip = useCallback(() => {
    if (dragItem.value) {
      const mediaItem = dragItem.value;
      if (mediaItem.type === AssetType.CHARACTER) {
        addCharacter(dragItem.value);
      }
      // if (dragItem.value.type === AssetType.CAMERA) {
      //   console.log("Dragged In Camera Type")
      // }
      if (dragItem.value.type === AssetType.OBJECT) {
        addObject(dragItem.value);
      }
      if (dragItem.value.type === AssetType.SHAPE) {
        addShape(dragItem.value);
      }
    }

    if (canDrop.value && dragItem.value) {
      if (dragItem.value.type === AssetType.ANIMATION) {
        addCharacterAnimation({
          dragItem: dragItem.value,
          characterId: dropId.value,
          offset: dropOffset.value,
        });
      }
      if (dragItem.value.type === AssetType.AUDIO) {
        console.log("add audio", dropId.value);
        addCharacterAudio({
          dragItem: dragItem.value,
          characterId: dropId.value,
          offset: dropOffset.value,
        });
        addGlobalAudio({
          dragItem: dragItem.value,
          audioId: dropId.value,
          offset: dropOffset.value,
        });
      }
    }
    endDrag();
  }, [endDrag]);

  const clearExistingData = useCallback(() => {
    characterGroup.value = {
      id: "ChG1",
      characters: [],
    };
    cameraGroup.value = {
      id: "CG1",
      keyframes: [],
    };
    audioGroup.value = {
      id: "AG-1",
      clips: [],
      muted: false,
    };
    objectGroup.value = {
      id: "OG1",
      objects: [],
    };
  }, []);

  const deleteObjectOrCharacter = useCallback((item: MediaItem) => {
    deleteCharacter(item);
    deleteObject(item);
  }, []);

  const values = useMemo(() => {
    return {
      ...keyframes,

      clearExistingData,
      deleteObjectOrCharacter,

      ...dragDrop,
      endDrag: dropClip,
    };
  }, [
    keyframes,
    dragDrop,
    dropClip,
    clearExistingData,
    deleteObjectOrCharacter,
  ]);

  return (
    <TrackContext.Provider value={values}>{children}</TrackContext.Provider>
  );
};
