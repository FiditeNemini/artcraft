import { TrackContext } from "~/pages/PageEnigma/contexts/TrackContext/TrackContext";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { ClipType, MediaClip } from "~/pages/PageEnigma/models/track";
import useUpdateDragDrop from "~/pages/PageEnigma/contexts/TrackContext/utils/useUpdateDragDrop";
import {
  addCharacterAnimation,
  addCharacterAudio,
  addGlobalAudio,
  canDrop,
  dragId,
  dragType,
  dropId,
  dropOffset,
} from "~/pages/PageEnigma/store";
import * as uuid from "uuid";
import useUpdateKeyframe from "~/pages/PageEnigma/contexts/TrackContext/utils/useUpdateKeyframe";

interface Props {
  children: ReactNode;
}

export const TrackProvider = ({ children }: Props) => {
  const keyframes = useUpdateKeyframe();

  const { endDrag, ...dragDrop } = useUpdateDragDrop();

  const [animationClips, setAnimationClips] = useState<MediaClip[]>([]);
  const [audioClips, setAudioClips] = useState<MediaClip[]>([]);

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
      if (dragType.value === ClipType.ANIMATION) {
        addCharacterAnimation({
          clipId: dragId.value!,
          characterId: dropId.value,
          animationClips,
          offset: dropOffset.value,
        });
      }
      if (dragType.value === ClipType.AUDIO) {
        addCharacterAudio({
          clipId: dragId.value!,
          characterId: dropId.value,
          audioClips,
          offset: dropOffset.value,
        });
        addGlobalAudio({
          clipId: dragId.value!,
          audioId: dropId.value,
          audioClips,
          offset: dropOffset.value,
        });
      }
    }
    endDrag();
  }, [animationClips, endDrag, audioClips]);

  const fullWidth = useMemo(() => {
    return length * 60 * 4 * scale;
  }, [length, scale]);

  useEffect(() => {
    setAnimationClips([
      {
        version: 1,
        media_id: "m_5q9s6esz8ymjqz0bheh8nf4crtj2kx",
        type: ClipType.ANIMATION,
        length: 25,
        name: "Sit",
      },
      {
        version: 1,
        media_id: uuid.v4(),
        type: ClipType.ANIMATION,
        length: 25,
        name: "Idle",
      },
      {
        version: 1,
        media_id: uuid.v4(),
        type: ClipType.ANIMATION,
        length: 25,
        name: "Stand",
      },
      {
        version: 1,
        media_id: uuid.v4(),
        type: ClipType.ANIMATION,
        length: 25,
        name: "Walk",
      },
    ]);
    setAudioClips([
      {
        version: 1,
        media_id: uuid.v4(),
        type: ClipType.ANIMATION,
        length: 25,
        name: "Sing",
      },
      {
        version: 1,
        media_id: uuid.v4(),
        type: ClipType.AUDIO,
        length: 25,
        name: "Chatter",
      },
      {
        version: 1,
        media_id: uuid.v4(),
        type: ClipType.AUDIO,
        length: 25,
        name: "Talk",
      },
      {
        version: 1,
        media_id: uuid.v4(),
        type: ClipType.AUDIO,
        length: 25,
        name: "Yell",
      },
    ]);
    setScale(1);
    setLength(12);
  }, []);

  const values = useMemo(() => {
    return {
      ...keyframes,

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
    keyframes,

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
