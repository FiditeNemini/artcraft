import { TrackContext } from "~/pages/PageEnigma/contexts/TrackContext/TrackContext";
import { ReactNode, useCallback, useMemo } from "react";
import { MediaItem } from "~/pages/PageEnigma/models";
import useUpdateDragDrop from "~/pages/PageEnigma/contexts/TrackContext/utils/useUpdateDragDrop";
import {
  characterGroup,
  cameraGroup,
  audioGroup,
  objectGroup,
  deleteCharacter,
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
