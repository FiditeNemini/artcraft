import { TrackContext } from "~/pages/PageEnigma/contexts/TrackContext/TrackContext";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { AssetType, MediaItem } from "~/pages/PageEnigma/models";
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
import * as uuid from "uuid";
import useUpdateKeyframe from "~/pages/PageEnigma/contexts/TrackContext/utils/useUpdateKeyframe";

interface Props {
  children: ReactNode;
}

export const TrackProvider = ({ children }: Props) => {
  const keyframes = useUpdateKeyframe();

  const { endDrag, ...dragDrop } = useUpdateDragDrop();

  const [animationClips, setAnimationClips] = useState<MediaItem[]>([]);
  const [audioClips, setAudioClips] = useState<MediaItem[]>([]);
  const [characterItems, setCharacterItems] = useState<MediaItem[]>([]);
  const [objectItems, setObjectItems] = useState<MediaItem[]>([]);

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
    if (canDrop.value && dragItem.value) {
      if (dragItem.value.type === AssetType.ANIMATION) {
        addCharacterAnimation({
          dragItem: dragItem.value!,
          characterId: dropId.value,
          animationClips,
          offset: dropOffset.value,
        });
      }
      if (dragItem.value.type === AssetType.AUDIO) {
        addCharacterAudio({
          dragItem: dragItem.value!,
          characterId: dropId.value,
          audioClips,
          offset: dropOffset.value,
        });
        addGlobalAudio({
          dragItem: dragItem.value!,
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
        type: AssetType.ANIMATION,
        length: 25,
        name: "Sit",
        thumbnail: "resources/characters/img01.png",
      },
      {
        version: 1,
        media_id: uuid.v4(),
        type: AssetType.ANIMATION,
        length: 25,
        name: "Idle",
        thumbnail: "resources/characters/img01.png",
      },
      {
        version: 1,
        media_id: uuid.v4(),
        type: AssetType.ANIMATION,
        length: 25,
        name: "Stand",
        thumbnail: "resources/characters/img01.png",
      },
      {
        version: 1,
        media_id: "m_w5t517krrf63f3tj2288vsffmj87zw",
        type: AssetType.ANIMATION,
        length: 25,
        name: "Walk",
        thumbnail: "resources/characters/img01.png",
      },
    ]);
    setAudioClips([
      {
        version: 1,
        media_id: uuid.v4(),
        type: AssetType.AUDIO,
        length: 25,
        name: "Sing",
        thumbnail: "resources/characters/img01.png",
      },
      {
        version: 1,
        media_id: uuid.v4(),
        type: AssetType.AUDIO,
        length: 25,
        name: "Chatter",
        thumbnail: "resources/characters/img01.png",
      },
      {
        version: 1,
        media_id: "m_403phjvjkbbaxxbz8y7r6qjay07mfd",
        type: AssetType.AUDIO,
        length: 25,
        name: "Talk",
        thumbnail: "resources/characters/img01.png",
      },
      {
        version: 1,
        media_id: uuid.v4(),
        type: AssetType.AUDIO,
        length: 25,
        name: "Yell",
        thumbnail: "resources/characters/img01.png",
      },
    ]);
    setCharacterItems([
      {
        version: 1,
        media_id: uuid.v4(),
        type: AssetType.CHARACTER,
        name: "Block Stance",
        thumbnail: "resources/characters/img01.png",
      },
      {
        version: 1,
        media_id: uuid.v4(),
        type: AssetType.CHARACTER,
        name: "Elbow",
        thumbnail: "resources/characters/img02.png",
      },
      {
        version: 1,
        media_id: uuid.v4(),
        type: AssetType.CHARACTER,
        name: "Stand Up",
        thumbnail: "resources/characters/img03.png",
      },
      {
        version: 1,
        media_id: uuid.v4(),
        type: AssetType.CHARACTER,
        name: "Wave Sitting",
        thumbnail: "resources/characters/img04.png",
      },
      {
        version: 1,
        media_id: uuid.v4(),
        type: AssetType.CHARACTER,
        name: "Idle",
        thumbnail: "resources/characters/img05.png",
      },
      {
        version: 1,
        media_id: uuid.v4(),
        type: AssetType.CHARACTER,
        name: "Dancing",
        thumbnail: "resources/characters/img06.png",
      },
      {
        version: 1,
        media_id: uuid.v4(),
        type: AssetType.CHARACTER,
        name: "Start Walking",
        thumbnail: "resources/characters/img07.png",
      },
      {
        version: 1,
        media_id: uuid.v4(),
        type: AssetType.CHARACTER,
        name: "Start Fight",
        thumbnail: "resources/characters/img08.png",
      },
      {
        version: 1,
        media_id: uuid.v4(),
        type: AssetType.CHARACTER,
        name: "",
        thumbnail: "resources/characters/img09.png",
      },
      {
        version: 1,
        media_id: uuid.v4(),
        type: AssetType.CHARACTER,
        name: "Dancing 2",
        thumbnail: "resources/characters/img10.png",
      },
      {
        version: 1,
        media_id: uuid.v4(),
        type: AssetType.CHARACTER,
        name: "Start Fight 2",
        thumbnail: "resources/characters/img11.png",
      },
      {
        version: 1,
        media_id: uuid.v4(),
        type: AssetType.CHARACTER,
        name: "Dancing 3",
        thumbnail: "resources/characters/img12.png",
      },
    ]);
    setObjectItems([
      {
        version: 1,
        media_id: uuid.v4(),
        type: AssetType.OBJECT,
        name: "Block Stance",
        thumbnail: "resources/characters/img01.png",
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
      objectItems,

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
    objectItems,

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
