import { useCallback } from "react";
import { ObjectTrack } from "~/pages/PageEnigma/models/track";

export default function useUpdateKeyframe() {
  const addKeyframe = useCallback((obj: ObjectTrack) => {
    setObjects((oldObjectGroup) => {
      return {
        ...oldObjectGroup,
        objects: [...oldObjectGroup.objects, obj],
      };
    });
  }, []);

  return {
    addKeyframe,
  };
}
