import { TrackContext } from "~/contexts/TrackContext/TrackContext";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import useUpdateCharacters from "~/contexts/TrackContext/utils/useUpdateCharacters";
import useUpdateCamera from "~/contexts/TrackContext/utils/useUpdateCamera";
import useUpdateAudio from "~/contexts/TrackContext/utils/useUpdateAudio";
import useUpdateObject from "~/contexts/TrackContext/utils/useUpdateObject";
import { AnimationClip, AudioClip } from "~/models/track";

interface Props {
  children: ReactNode;
}

export const TrackProvider = ({ children }: Props) => {
  const { characters, updateCharacters, toggleLipSyncMute } =
    useUpdateCharacters();
  const { camera, updateCamera } = useUpdateCamera();
  const { audio, updateAudio, toggleAudioMute } = useUpdateAudio();
  const { objects, updateObject } = useUpdateObject();
  const [selectedClip, setSelectedClip] = useState<string | null>(null);

  const selectClip = useCallback((clipId: string | null) => {
    setSelectedClip(clipId);
  }, []);

  const [state, setState] = useState<{
    dragType: "animations" | "lipSync" | null;
    dragId: string | null;
  }>({ dragType: null, dragId: null });
  const [animationClips, setAnimationClips] = useState<AnimationClip[]>([]);
  const [audioClips, setAudioClips] = useState<AudioClip[]>([]);

  const startDrag = useCallback(
    (type: "animations" | "lipSync", id: string) => {
      setState({ dragId: id, dragType: type });
    },
    [],
  );

  const endDrag = useCallback(() => {
    setState({ dragId: null, dragType: null });
  }, []);

  const [time, setTime] = useState(0);
  const updateCurrentTime = useCallback((newTime: number) => {
    setTime(newTime);
  }, []);

  const [canDrop, setCanDrop] = useState(false);
  const [scale, setScale] = useState(1);
  const [length, setLength] = useState(1);

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
      characters,
      camera,
      audio,
      objects,
      updateCharacters,
      updateCamera,
      updateAudio,
      updateObject,
      selectClip,
      selectedClip,
      toggleLipSyncMute,
      toggleAudioMute,
      dragType: state.dragType,
      dragId: state.dragId,
      animationClips,
      audioClips,
      startDrag,
      endDrag,
      scale,
      currentTime: time,
      length,
      updateCurrentTime,
      canDrop,
      setCanDrop,
      fullWidth,
    };
  }, [
    characters,
    updateCharacters,
    selectClip,
    selectedClip,
    camera,
    updateCamera,
    audio,
    updateAudio,
    objects,
    updateObject,
    toggleLipSyncMute,
    toggleAudioMute,
    state.dragId,
    state.dragType,
    animationClips,
    audioClips,
    startDrag,
    endDrag,
    canDrop,
    updateCurrentTime,
    setCanDrop,
    time,
    fullWidth,
    length,
    scale,
  ]);
  return (
    <TrackContext.Provider value={values}>{children}</TrackContext.Provider>
  );
};
