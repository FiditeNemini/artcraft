import { TrackContext } from "~/contexts/TrackContext/TrackContext";
import { ReactNode, useCallback, useMemo, useState } from "react";
import useUpdateCharacters from "~/contexts/TrackContext/utils/useUpdateCharacters";
import useUpdateCamera from "~/contexts/TrackContext/utils/useUpdateCamera";
import useUpdateAudio from "~/contexts/TrackContext/utils/useUpdateAudio";
import useUpdateObject from "~/contexts/TrackContext/utils/useUpdateObject";

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
  ]);
  return (
    <TrackContext.Provider value={values}>{children}</TrackContext.Provider>
  );
};
