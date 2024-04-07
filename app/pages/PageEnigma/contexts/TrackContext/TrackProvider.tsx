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
    setAnimationClips([{
        version: 1,
        media_id: "m_s7d4ems68sb2vqj4pdje1rc15q3ycp",
        type: ClipType.ANIMATION,
        length: 25,
        name: "Walk",
      },
      {
        version: 1,
        media_id: "m_yzreg1494d08aepezj74607d2ascep",
        type: ClipType.ANIMATION,
        length: 100,
        name: "Sitting",
      },
      {
        version: 1,
        media_id: "m_qepzjytd4ahd5askdt2ngrwzj2aa3f",
        type: ClipType.ANIMATION,
        length: 100,
        name: "Idle",
      },
      {
        version: 1,
        media_id: "m_v06h821hj4dvst0mzm575jdka31f41",
        type: ClipType.ANIMATION,
        length: 100,
        name: "Punch",
      },
      {
        version: 1,
        media_id: "m_q92keqa05gds69zyd8mkep7z9338t8",
        type: ClipType.ANIMATION,
        length: 100,
        name: "Jump",
      },
      {
        version: 1,
        media_id: "m_0qmgsyxh5ng9c9ac3m0snzdqqs5q60",
        type: ClipType.ANIMATION,
        length: 100,
        name: "Dance",
      },
    ]);
    setAudioClips([
      {
        version: 1,
        media_id: "m_403phjvjkbbaxxbz8y7r6qjay07mfd",
        type: ClipType.AUDIO,
        length: 25,
        name: "Talk",
      },
      {
        version: 1,
        media_id: "m_w5nn3kjh1fbkmjrdac5b2qaba0pmyt",
        type: ClipType.AUDIO,
        length: 25,
        name: "NCS Song",
      }
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
