import { TrackContext } from "~/pages/PageEnigma/contexts/TrackContext/TrackContext";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import {
  AssetType,
  ClipType,
  MediaClip,
  ObjectItem,
} from "~/pages/PageEnigma/models";
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
  const [characterItems, setCharacterItems] = useState<ObjectItem[]>([]);

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
      if (dragType.value === AssetType.ANIMATION) {
        addCharacterAnimation({
          clipId: dragId.value!,
          characterId: dropId.value,
          animationClips,
          offset: dropOffset.value,
        });
      }
      if (dragType.value === AssetType.AUDIO) {
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
        media_id: "m_w5t517krrf63f3tj2288vsffmj87zw",
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
        media_id: "m_403phjvjkbbaxxbz8y7r6qjay07mfd",
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
    setCharacterItems([
      {
        version: 1,
        media_id: uuid.v4(),
        name: "Block Stance",
        thumbnail: "resources/characters/img01.png",
      },
      {
        version: 1,
        media_id: uuid.v4(),
        name: "Elbow",
        thumbnail: "resources/characters/img02.png",
      },
      {
        version: 1,
        media_id: uuid.v4(),
        name: "Stand Up",
        thumbnail: "resources/characters/img03.png",
      },
      {
        version: 1,
        media_id: uuid.v4(),
        name: "Wave Sitting",
        thumbnail: "resources/characters/img04.png",
      },
      {
        version: 1,
        media_id: uuid.v4(),
        name: "Idle",
        thumbnail: "resources/characters/img05.png",
      },
      {
        version: 1,
        media_id: uuid.v4(),
        name: "Dancing",
        thumbnail: "resources/characters/img06.png",
      },
      {
        version: 1,
        media_id: uuid.v4(),
        name: "Start Walking",
        thumbnail: "resources/characters/img07.png",
      },
      {
        version: 1,
        media_id: uuid.v4(),
        name: "Start Fight",
        thumbnail: "resources/characters/img08.png",
      },
      {
        version: 1,
        media_id: uuid.v4(),
        name: "",
        thumbnail: "resources/characters/img09.png",
      },
      {
        version: 1,
        media_id: uuid.v4(),
        name: "Dancing 2",
        thumbnail: "resources/characters/img10.png",
      },
      {
        version: 1,
        media_id: uuid.v4(),
        name: "Start Fight 2",
        thumbnail: "resources/characters/img11.png",
      },
      {
        version: 1,
        media_id: uuid.v4(),
        name: "Dancing 3",
        thumbnail: "resources/characters/img12.png",
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
      characterItems,

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
    characterItems,

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
