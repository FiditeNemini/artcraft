import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { ClipContext } from "./ClipContext";
import { AnimationClip, AudioClip } from "~/models/track";

interface Props {
  children: ReactNode;
}

export const ClipProvider = ({ children }: Props) => {
  const [state, setState] = useState<{
    dragType: "animation" | "audio" | null;
    dragId: string | null;
  }>({ dragType: null, dragId: null });
  const [animationClips, setAnimationClips] = useState<AnimationClip[]>([]);
  const [audioClips, setAudioClips] = useState<AudioClip[]>([]);

  useEffect(() => {
    setAnimationClips([]);
    setAudioClips([]);
  }, []);

  const startDrag = useCallback((type: "animation" | "audio", id: string) => {
    setState({ dragId: id, dragType: type });
  }, []);

  const endDrag = useCallback(() => {
    setState({ dragId: null, dragType: null });
  }, []);

  const values = useMemo(() => {
    return {
      dragType: state.dragType,
      dragId: state.dragId,
      animationClips,
      audioClips,
      startDrag,
      endDrag,
    };
  }, [state, animationClips, audioClips, startDrag, endDrag]);

  return <ClipContext.Provider value={values}>{children}</ClipContext.Provider>;
};
