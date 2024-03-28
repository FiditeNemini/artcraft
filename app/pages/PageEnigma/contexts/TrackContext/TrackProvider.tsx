import { TrackContext } from "~/pages/PageEnigma/contexts/TrackContext/TrackContext";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import useUpdateCharacters from "~/pages/PageEnigma/contexts/TrackContext/utils/useUpdateCharacters";
import useUpdateCamera from "~/pages/PageEnigma/contexts/TrackContext/utils/useUpdateCamera";
import useUpdateAudio from "~/pages/PageEnigma/contexts/TrackContext/utils/useUpdateAudio";
import useUpdateObject from "~/pages/PageEnigma/contexts/TrackContext/utils/useUpdateObject";
import { AnimationClip, AudioClip } from "~/pages/PageEnigma/models/track";
import useUpdateDragDrop from "~/pages/PageEnigma/contexts/TrackContext/utils/useUpdateDragDrop";
import {
  canDrop,
  dragId,
  dragType,
  dropId,
  dropOffset,
} from "~/pages/PageEnigma/store";

interface Props {
  children: ReactNode;
}

export const TrackProvider = ({ children }: Props) => {
  const characters = useUpdateCharacters();
  const camera = useUpdateCamera();
  const audio = useUpdateAudio();
  const objects = useUpdateObject();

  const { endDrag, ...dragDrop } = useUpdateDragDrop();

  const [selectedClip, setSelectedClip] = useState<string | null>(null);
  const selectClip = useCallback((clipId: string | null) => {
    setSelectedClip(clipId);
  }, []);

  const [animationClips, setAnimationClips] = useState<AnimationClip[]>([]);
  const [audioClips, setAudioClips] = useState<AudioClip[]>([]);

  const [scale, setScale] = useState(1);
  const [length, setLength] = useState(1);
  const [time, setTime] = useState(0);
  const updateCurrentTime = useCallback((newTime: number) => {
    setTime(newTime);
    console.log("message", {
      action: "UpdateCurrentTime",
      id: "",
      data: { currentTime: newTime },
    });
  }, []);

  const [timelineHeight, setTimelineHeight] = useState(0);
  useEffect(() => {
    const windowHeight = window.outerHeight;
    setTimelineHeight(windowHeight * 0.25);
  }, []);

  // cross group functions
  const dropClip = useCallback(() => {
    if (canDrop.value) {
      if (dragType.value === "animations") {
        characters.addCharacterAnimation({
          clipId: dragId.value!,
          characterId: dropId.value,
          animationClips,
          offset: dropOffset.value,
        });
      }
    }
    endDrag();
  }, [animationClips, characters, endDrag]);

  const fullWidth = useMemo(() => {
    return length * 60 * 4 * scale;
  }, [length, scale]);

  useEffect(() => {
    setAnimationClips([
      {
        id: "ani-id1",
        offset: 0,
        length: 124,
        name: "ani 11",
      },
    ]);
    setAudioClips([]);
    setScale(1);
    setLength(12);
  }, []);

  const values = useMemo(() => {
    return {
      ...characters,
      ...camera,
      ...audio,
      ...objects,

      selectClip,
      selectedClip,

      ...dragDrop,
      endDrag: dropClip,

      animationClips,
      audioClips,

      scale,
      currentTime: time,
      updateCurrentTime,
      length,
      fullWidth,
      timelineHeight,
      setTimelineHeight,
    };
  }, [
    characters,
    camera,
    audio,
    objects,

    selectClip,
    selectedClip,

    dragDrop,
    dropClip,

    animationClips,
    audioClips,

    updateCurrentTime,
    time,
    fullWidth,
    length,
    scale,
    timelineHeight,
  ]);
  return (
    <TrackContext.Provider value={values}>{children}</TrackContext.Provider>
  );
};
